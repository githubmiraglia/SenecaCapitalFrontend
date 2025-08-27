import React, { useEffect, useRef, useState } from "react";
import { Spreadsheet, Worksheet, jspreadsheet } from "@jspreadsheet/react";
import "jsuites/dist/jsuites.css";
import "jspreadsheet/dist/jspreadsheet.css";
import { api } from "../api";

// JSpreadsheet license
jspreadsheet.setLicense(
  "NmNkMWU2YWMwOTM0MDZmMGU5M2NiMjUxNTNiMjFkNzc2MDE3MDcyMTM0YWE4NDA2MmU3N2RlZjEwNjYwMmE1MzdiNGM1MzZhNTk2ODMxMzQyMWE1Nzc3YmI2NTU1OTk1MzhmODAzZGE5OGY5ZDQ5MWFjMDNiMjU2MjIxYTY5MDUsZXlKamJHbGxiblJKWkNJNklqUTJZVEEwWVdOaFpqQTVPVGhsTVdKbE16aGlZMlV4TmpVMU9UVXdaV0ZoWmpjMU9HTmlNV1FpTENKdVlXMWxJam9pVEhWcGN5Qk5hWEpoWjJ4cFlTSXNJbVJoZEdVaU9qRTNPRFl4TkRNMk1EQXNJbVJ2YldGcGJpSTZXeUozWldJaUxDSnNiMk5oYkdodmMzUWlYU3dpY0d4aGJpSTZNekFzSW5OamIzQmxJanBiSW5ZM0lpd2lkamdpTENKMk9TSXNJbll4TUNJc0luWXhNU0pkZlE9PQ=="
);

type Props = {
  data?: (string | number | null)[][];
  defaultName?: string;
  /** NEW: needed to hit /api/tabelas/<identificador>/ */
  identificadorCnab?: string;
};

const SpreadsheetLinhasSaltadas: React.FC<Props> = ({ data, defaultName, identificadorCnab }) => {
  const spreadsheetRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);

  // ---------- data prep ----------
  const header7 = [
    "ID_Administrador",
    "Administradora",
    "IDENTIFICADOR_CNAB",
    "ID_IDENTIFICADOR_CNAB",
    "Nome do Campo",
    "Início",
    "Fim",
  ];
  const safe = data?.length ? data : [header7];

  const maxCols = 100;
  const maxRows = 60;

  const padded = safe.map((r) => {
    const x = [...r];
    while (x.length < maxCols) x.push("");
    return x;
  });
  const normalized = padded;

  const columns = Array.from({ length: maxCols }, (_, i) => ({
    width: i === 4 ? 380 : 160,
    type: "text" as const,
    filter: true,
    readOnly: false,
  }));

  // ---------- capture helpers ----------
  const capture = (inst?: any) => {
    if (!inst) return;
    if (typeof inst.getData !== "function") return;
    wsRef.current = inst;
    (window as any).__sheet = inst;
  };
  const resolveWorksheet = (): any => {
    if (wsRef.current?.getData) return wsRef.current;
    const refAny = spreadsheetRef.current as any;
    const viaRef = refAny?.current?.jspreadsheet ?? refAny?.jspreadsheet ?? refAny;
    if (viaRef?.getData) return (capture(viaRef), viaRef);
    if (viaRef?.getWorksheetActive?.()) {
      const w = viaRef.getWorksheetActive();
      if (w?.getData) return (capture(w), w);
    }
    const g: any = (window as any).jspreadsheet;
    const fromGlobal =
      g?.current?.getData ? g.current :
      g?.instances?.[0]?.getData ? g.instances[0] :
      null;
    if (fromGlobal) return (capture(fromGlobal), fromGlobal);
    return null;
  };

  // ---------- zebra styling ----------
  const updateTable = (_inst: any, cell: HTMLElement, _x: number, y: number) => {
    cell.style.color = "#111";
    if (y === 0) {
      cell.style.backgroundColor = "#f2f2f2";
      cell.style.fontWeight = "600";
    } else {
      cell.style.backgroundColor = y % 2 ? "#e6f0ff" : "#ffffff";
    }
  };
  const onload = (inst: any) => capture(inst);
  const onchange = (inst: any) => capture(inst);

  // ---------- helpers ----------
  function matrixToRows(m: (string | number | null)[][]) {
    if (!m?.length) return [];
    const rows: any[] = [];
    for (let i = 1; i < m.length; i++) {
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
  }

  // ---------- save to /api/tabelas/<identificador>/ ----------
  const handleSave = async () => {
    if (saving) return;
    const ws = resolveWorksheet();
    if (!ws) return alert("Planilha ainda não carregou.");
    if (!identificadorCnab) return alert("IDENTIFICADOR_CNAB não informado.");

    const raw: (string | number | null)[][] = ws.getData?.() || [];
    if (!raw.length) return alert("Sem dados para salvar.");

    // keep only the first 7 columns we care about
    const trimmed = raw.map((row) => row.slice(0, 7));
    const rows = matrixToRows(trimmed);
    if (!rows.length) return alert("Não há linhas válidas para salvar.");

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/api/tabelas/${identificadorCnab}/`,
        { rows },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Tabela salva com sucesso no Admin!");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.status
        ? `status code ${err.response.status}`
        : err?.message || "Erro ao salvar.";
      alert(`Erro ao salvar: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ---------- inject toolbar button ----------
  useEffect(() => {
    const inject = () => {
      const toolbar = document.querySelector<HTMLElement>(
        ".jss_toolbar, .jss-toolbar, .jexcel_toolbar, .jexcel-toolbar"
      );
      if (!toolbar) return false;
      if (!toolbar.querySelector(".btn-cloud-save")) {
        const btn = document.createElement("button");
        btn.className = "btn-cloud-save";
        btn.type = "button";
        btn.title = "Salvar no Django (Postgres)";
        btn.textContent = "☁";
        btn.onclick = handleSave;
        btn.style.border = "none";
        btn.style.background = "transparent";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "20px";
        btn.style.lineHeight = "1";
        btn.style.padding = "4px 6px";
        btn.style.marginRight = "6px";
        btn.style.color = "#111";
        toolbar.prepend(btn);
      }
      return true;
    };
    let tries = 0;
    const tick = () => { if (inject()) return; if (tries++ < 20) setTimeout(tick, 120); };
    tick();
    const mo = new MutationObserver(() => inject());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return (
    <div
      className="zebraSheet"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}
    >
      <style>{`
        .zebraSheet .jss tbody tr:nth-child(1) td { background:#f2f2f2 !important; font-weight:600 !important; }
        .zebraSheet .jss tbody tr:nth-child(2n) td { background:#e6f0ff !important; }
        .zebraSheet .jss tbody tr:nth-child(2n+1) td { background:#ffffff !important; }
        .btn-cloud-save:hover { background:#f3f4f6; border-radius:6px; }
        .btn-cloud-save[disabled] { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{ width: "95%", height: "600px", overflow: "auto" }}>
        <Spreadsheet ref={spreadsheetRef} toolbar>
          <Worksheet
            data={normalized}
            columns={columns}
            minDimensions={[maxCols, maxRows]}
            allowSearch
            allowSorting
            allowFiltering
            allowEdit
            updateTable={updateTable}
            onload={onload as any}
            onchange={onchange as any}
          />
        </Spreadsheet>

        {/* Fallback visible button */}
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: saving ? "#e5e7eb" : "#111",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {saving ? "Salvando..." : "☁ Salvar no Django"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetLinhasSaltadas;
