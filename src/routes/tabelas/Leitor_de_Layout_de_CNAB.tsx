import React, { useMemo, useState } from "react";
import { api } from "../../api";
import Spreadsheet from "../../components/spreadsheetLinhasSaltadas";
import "./Leitor_de_Layout_de_CNAB.css";

interface LinhasSaltadas {
  categoria: string;
  linhas: (string | number | null)[];
}

interface UserIds {
  administrador: string;       // ID_Administrador
  administradora: string;      // Administradora
  identificadorCnab: string;   // IDENTIFICADOR_CNAB
  idIdentificadorCnab: string; // ID_IDENTIFICADOR_CNAB
}

/* ---------------- Heuristics for detecting columns ---------------- */
// Picks “Nome do Campo” as the textiest column,
// and “Início” / “Fim” as the two most numeric columns (smaller median = Início).
function detectNomeInicioFim(cols: (string | number | null)[][]) {
  const stats = cols.map((col, idx) => {
    let textCount = 0, numCount = 0;
    const nums: number[] = [];
    for (const v of col) {
      const s = String(v ?? "").trim();
      if (s === "") continue;
      const n = Number(s.replace(",", "."));
      if (!isNaN(n) && /^-?\d+(?:[.,]\d+)?$/.test(s)) {
        numCount++;
        nums.push(n);
      } else {
        textCount++;
      }
    }
    const median =
      nums.length === 0
        ? Number.POSITIVE_INFINITY
        : nums.slice().sort((a, b) => a - b)[Math.floor(nums.length / 2)];
    return { idx, textCount, numCount, median };
  });

  const nomeIdx = stats.slice().sort((a, b) => b.textCount - a.textCount)[0]?.idx ?? 0;

  const numericTop2 = stats
    .filter(s => s.idx !== nomeIdx)
    .slice()
    .sort((a, b) => b.numCount - a.numCount)
    .slice(0, 2);

  const [i1, i2] = numericTop2.sort((a, b) => a.median - b.median);
  const inicioIdx = i1?.idx ?? 1;
  const fimIdx = i2?.idx ?? 2;

  return { nomeIdx, inicioIdx, fimIdx };
}
/* ------------------------------------------------------------------ */

const Leitor_de_Layout_de_CNAB: React.FC = () => {
  // Step 1: IDs form
  const [ids, setIds] = useState<UserIds | null>(null);
  const [idsSubmitted, setIdsSubmitted] = useState(false);

  // Step 2: upload + data from API
  const [data, setData] = useState<LinhasSaltadas[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("Nenhum arquivo");

  const handleIdsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement & {
      administrador: { value: string };
      administradora: { value: string };
      identificadorCnab: { value: string };
      idIdentificadorCnab: { value: string };
    };

    const next: UserIds = {
      administrador: form.administrador.value.trim(),
      administradora: form.administradora.value.trim(),
      identificadorCnab: form.identificadorCnab.value.trim(),
      idIdentificadorCnab: form.idIdentificadorCnab.value.trim(),
    };

    if (!next.administrador || !next.administradora || !next.identificadorCnab || !next.idIdentificadorCnab) {
      alert("Por favor, preencha todos os 4 campos.");
      return;
    }

    setIds(next);
    setIdsSubmitted(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem("token");

    setFileName(file?.name ?? "Nenhum arquivo");

    if (!file) return alert("Por favor, selecione um arquivo PDF.");
    if (!token) return alert("Usuário não autenticado.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      // 1) Upload para S3 via backend
      const uploadRes = await api.post("/api/ler-layout-cnab/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { bucket, s3_key } = uploadRes.data ?? {};
      if (!bucket || !s3_key) throw new Error("Resposta inválida da API de upload.");

      // 2) Extrai o layout
      const layoutRes = await api.post(
        "/api/extrair-layout-cnab-textract/",
        { bucket, s3_key },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const layout: LinhasSaltadas[] = layoutRes.data;
      if (!Array.isArray(layout)) {
        console.error("Formato de layout inválido:", layoutRes.data);
        return alert("Erro: resposta inválida da API.");
      }

      setData(layout);
    } catch (error: any) {
      console.error("Erro ao processar o PDF:", error);
      if (error?.response) {
        alert(
          `Erro ${error.response.status} - ${
            error.response.data.detail || "Erro ao processar o layout."
          }`
        );
      } else {
        alert("Erro inesperado ao enviar ou ler o arquivo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Build final matrix: 4 fixed IDs + detected Nome/Início/Fim (with a visible header row)
  const matrix = useMemo<(string | number | null)[][]>(() => {
    if (!data.length || !ids) return [];

    // Convert API result (array of columns) -> raw columns array
    const cols: (string | number | null)[][] = data.map(c => c.linhas || []);
    if (!cols.length) return [];

    const { nomeIdx, inicioIdx, fimIdx } = detectNomeInicioFim(cols);

    const nome = cols[nomeIdx] || [];
    const inicio = cols[inicioIdx] || [];
    const fim = cols[fimIdx] || [];

    const rows = Math.max(nome.length, inicio.length, fim.length, 0);
    const out: (string | number | null)[][] = [];

    // Header row
    out.push([
      "ID_Administrador",
      "Administradora",
      "IDENTIFICADOR_CNAB",
      "ID_IDENTIFICADOR_CNAB",
      "Nome do Campo",
      "Início",
      "Fim",
    ]);

    for (let i = 0; i < rows; i++) {
      out.push([
        ids.administrador,
        ids.administradora,
        ids.identificadorCnab,
        ids.idIdentificadorCnab,
        nome[i] ?? "",
        inicio[i] ?? "",
        fim[i] ?? "",
      ]);
    }

    return out;
  }, [data, ids]);

  // --- helpers to save current matrix to /api/tabelas/<IDENTIFICADOR_CNAB>/ ---
  const matrixToRows = (m: (string | number | null)[][]) => {
    if (!m?.length) return [];
    const rows: any[] = [];
    for (let i = 1; i < m.length; i++) { // skip header row
      const r = m[i] || [];
      rows.push({
        ID_Administrador: r[0] ?? "",
        Administradora: r[1] ?? "",
        IDENTIFICADOR_CNAB: r[2] ?? "",
        ID_IDENTIFICADOR_CNAB: r[3] ?? "",
        "Nome do Campo": r[4] ?? "",
        "Início": r[5] ?? "",
        Fim: r[6] ?? "",
      });
    }
    return rows;
  };

  const handleSaveTabela = async () => {
    if (!ids?.identificadorCnab) {
      alert("Preencha o campo IDENTIFICADOR_CNAB no passo 1.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado.");
      return;
    }
    const rows = matrixToRows(matrix);
    if (!rows.length) {
      alert("Não há linhas para salvar.");
      return;
    }
    try {
      await api.post(`/api/tabelas/${ids.identificadorCnab}/`, { rows }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Tabela salva! Veja no Admin: "Linhas — ${ids.identificadorCnab}".`);
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.detail || e?.message || "Erro ao salvar.";
      alert(msg);
    }
  };
  // --- /helpers ---

  // Sheet-only once ready
  const showSheetOnly = matrix.length > 0;

  return (
    <div className={showSheetOnly ? "page-full" : "leitor-layout-cnab-page"}>
      {showSheetOnly ? (
        <>
          <div className="sheet-full">
            <Spreadsheet
              data={matrix}
              defaultName={fileName}
              identificadorCnab={ids?.identificadorCnab}   // <-- needed by the toolbar save
            />
          </div>

          <div className="sheet-actions">
            <button className="btnPrimary" onClick={handleSaveTabela}>
              Salvar tabela no Admin
            </button>
          </div>
        </>
      ) : (
        <div className="card">
          {/* Step 1: IDs form */}
          <div className="stepHeader">
            <div className="badge">1</div>
            <h2>Identificadores</h2>
            <p>Preencha os dados abaixo para associar o layout ao seu contexto.</p>
          </div>

          <form className="idsForm" onSubmit={handleIdsSubmit}>
            <label>
              <span>ID_Administrador</span>
              <input name="administrador" placeholder="Ex: 1" />
            </label>

            <label>
              <span>Administradora</span>
              <input name="administradora" placeholder="Ex: ITAU" />
            </label>

            <label className="wide">
              <span>IDENTIFICADOR_CNAB</span>
              <input name="identificadorCnab" placeholder="Ex: CNAB_TABELA_DE_REMESSA" />
            </label>

            <label className="wide">
              <span>ID_IDENTIFICADOR_CNAB</span>
              <input name="idIdentificadorCnab" placeholder="Ex: 1" />
            </label>

            <div className="formActions">
              <button type="submit" className="btnPrimary">
                Confirmar identificadores
              </button>
            </div>
          </form>

          {/* Step 2: Upload (disabled until IDs submitted) */}
          <div className={`stepHeader ${idsSubmitted ? "" : "muted"}`}>
            <div className="badge">2</div>
            <h2>Upload do PDF</h2>
            <p>Envie o arquivo para extrair o layout do CNAB.</p>
          </div>

          <div className="uploadWrap">
            <input
              id="cnab-pdf"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="srOnly"
              disabled={!idsSubmitted}
            />
            <label htmlFor="cnab-pdf" className={`btnPrimary ${!idsSubmitted ? "btnDisabled" : ""}`}>
              Escolher PDF
            </label>
            <span className="fileName" title={fileName}>{fileName}</span>
          </div>

          {loading && <p className="loading">Carregando e lendo PDF…</p>}
        </div>
      )}
    </div>
  );
};

export default Leitor_de_Layout_de_CNAB;
