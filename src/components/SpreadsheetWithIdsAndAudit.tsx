import React, { useEffect, useRef, useState } from "react";
import jspreadsheet, { JSpreadsheet } from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";

/**
 * SpreadsheetWithIdsAndAudit
 * What it does:
 * 1) Blocks editing until the user fills the 4 required IDs:
 *    - administrador
 *    - administradora
 *    - IDENTIFICADOR_CNAB
 *    - ID_IDENTIFICADOR_CNAB
 *
 * 2) Every time the user edits any cell, we log an entry to the "changes" table below,
 *    joining the 4 IDs with the CNAB layout fields: "Nome do campo", "Início", "Fim" of that row.
 *
 * 3) You can export the changes as JSON.
 *
 * How to use:
 * <SpreadsheetWithIdsAndAudit
 *    data={rows} // array of row arrays (strings/numbers)
 *    columns={[ { title: "Número" }, { title: "Nome do campo" }, { title: "Início" }, { title: "Fim" }, { title: "Tamanho" } ]}
 * />
 */

// --- Types ---
interface SpreadsheetWithIdsAndAuditProps {
  data: (string | number | null)[][];
  columns?: { title?: string; width?: number; type?: string; readOnly?: boolean; filter?: boolean }[];
  height?: number;
  width?: string;
}

interface UserIds {
  administrador: string;
  administradora: string;
  identificadorCnab: string;
  idIdentificadorCnab: string;
}

interface ChangeLogRow {
  administrador: string;
  administradora: string;
  identificadorCnab: string;
  idIdentificadorCnab: string;
  nomeDoCampo: string | number | null;
  inicio: string | number | null;
  fim: string | number | null;
  colunaAlterada: string; // header name
  valorAntigo: string | number | null;
  valorNovo: string | number | null;
  linha: number; // 0-based
  timestamp: string; // ISO
}

const findHeaderIndex = (headers: string[], name: string) => {
  const idx = headers.findIndex((h) => h.trim().toLowerCase() === name.trim().toLowerCase());
  return idx >= 0 ? idx : -1;
};

const SpreadsheetWithIdsAndAudit: React.FC<SpreadsheetWithIdsAndAuditProps> = ({ data, columns, height = 520, width = "100%" }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<JSpreadsheet | null>(null);

  const [ids, setIds] = useState<UserIds | null>(null);
  const [showIdsModal, setShowIdsModal] = useState<boolean>(true);
  const [changeLog, setChangeLog] = useState<ChangeLogRow[]>([]);

  // Resolve headers (from columns) and fallback to indices
  const headerTitles = (columns || []).map((c) => c.title || "");
  const nomeIdx = findHeaderIndex(headerTitles, "Nome do campo");
  const inicioIdx = findHeaderIndex(headerTitles, "Início");
  const fimIdx = findHeaderIndex(headerTitles, "Fim");

  // Fallback positions if no headers were provided
  const safeNomeIdx = nomeIdx !== -1 ? nomeIdx : 1;
  const safeInicioIdx = inicioIdx !== -1 ? inicioIdx : 2;
  const safeFimIdx = fimIdx !== -1 ? fimIdx : 3;

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Destroy previous instance if exists
    if (sheetRef.current && (sheetRef.current as any).jexcel) {
      (sheetRef.current as any).jexcel.destroy();
      sheetRef.current = null as any;
    }

    const instance = jspreadsheet(wrapperRef.current, {
      data,
      columns: (columns || []).map((c) => ({
        type: c.type || "text",
        title: c.title,
        width: c.width || 220,
        filter: true,
        readOnly: false,
      })),
      allowInsertRow: false,
      allowInsertColumn: false,
      allowRenameColumn: false,   
      tableOverflow: true,
      tableHeight: height,
      tableWidth: width,

      // Block edits until IDs are filled
      onbeforechange: () => {
        if (!ids) {
          setShowIdsModal(true);
          return false; // cancel change
        }
        return true;
      },

      onafterchanges: (_el, changes) => {
        if (!ids || !changes?.length) return;

        const newLogs: ChangeLogRow[] = [];
        changes.forEach((chg: any) => {
          const { x, y, oldValue, newValue } = chg; // 0-based
          try {
            const rowValues = (instance.getRowData as any)(y) as (string | number | null)[];
            const header = headerTitles[x] || `Coluna ${x}`;

            const logRow: ChangeLogRow = {
              administrador: ids.administrador,
              administradora: ids.administradora,
              identificadorCnab: ids.identificadorCnab,
              idIdentificadorCnab: ids.idIdentificadorCnab,
              nomeDoCampo: rowValues?.[safeNomeIdx] ?? null,
              inicio: rowValues?.[safeInicioIdx] ?? null,
              fim: rowValues?.[safeFimIdx] ?? null,
              colunaAlterada: header,
              valorAntigo: oldValue ?? null,
              valorNovo: newValue ?? null,
              linha: y,
              timestamp: new Date().toISOString(),
            };
            newLogs.push(logRow);
          } catch (e) {
            console.error("Falha ao registrar alteração:", e);
          }
        });
        if (newLogs.length) setChangeLog((prev) => [...prev, ...newLogs]);
      },
    }) as unknown as JSpreadsheet;

    sheetRef.current = instance;

    return () => {
      try {
        (instance as any)?.destroy?.();
      } catch {}
    };
  }, [data, columns, height, width, ids]);

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
    setShowIdsModal(false);
  };

  const resetIds = () => {
    setIds(null);
    setShowIdsModal(true);
  };

  const exportChanges = () => {
    const blob = new Blob([JSON.stringify(changeLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cnab_changes_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">📄 Layout CNAB</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-md border"
            onClick={() => setShowIdsModal(true)}
          >
            {ids ? "Ver IDs" : "Informar IDs"}
          </button>
          <button
            className="px-3 py-1 rounded-md border"
            onClick={exportChanges}
            disabled={!changeLog.length}
            title={!changeLog.length ? "Sem alterações ainda" : "Exportar alterações"}
          >
            Exportar alterações
          </button>
          <button className="px-3 py-1 rounded-md border" onClick={resetIds}>Trocar IDs</button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div ref={wrapperRef} />

      {/* Changes table */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Alterações registradas ({changeLog.length})</h3>
        {changeLog.length === 0 ? (
          <p className="text-sm opacity-80">Nenhuma alteração ainda.</p>
        ) : (
          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="sticky top-0 bg-white">
                  <th className="p-2 text-left border">Administrador</th>
                  <th className="p-2 text-left border">Administradora</th>
                  <th className="p-2 text-left border">IDENTIFICADOR_CNAB</th>
                  <th className="p-2 text-left border">ID_IDENTIFICADOR_CNAB</th>
                  <th className="p-2 text-left border">Nome do campo</th>
                  <th className="p-2 text-left border">Início</th>
                  <th className="p-2 text-left border">Fim</th>
                  <th className="p-2 text-left border">Coluna alterada</th>
                  <th className="p-2 text-left border">Valor antigo</th>
                  <th className="p-2 text-left border">Valor novo</th>
                  <th className="p-2 text-left border">Linha</th>
                  <th className="p-2 text-left border">Quando</th>
                </tr>
              </thead>
              <tbody>
                {changeLog.map((r, i) => (
                  <tr key={`${r.timestamp}-${i}`}> 
                    <td className="p-2 border">{r.administrador}</td>
                    <td className="p-2 border">{r.administradora}</td>
                    <td className="p-2 border">{r.identificadorCnab}</td>
                    <td className="p-2 border">{r.idIdentificadorCnab}</td>
                    <td className="p-2 border">{String(r.nomeDoCampo ?? "")}</td>
                    <td className="p-2 border">{String(r.inicio ?? "")}</td>
                    <td className="p-2 border">{String(r.fim ?? "")}</td>
                    <td className="p-2 border">{r.colunaAlterada}</td>
                    <td className="p-2 border">{String(r.valorAntigo ?? "")}</td>
                    <td className="p-2 border">{String(r.valorNovo ?? "")}</td>
                    <td className="p-2 border">{r.linha}</td>
                    <td className="p-2 border">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IDs Modal */}
      {showIdsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-xl shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Preencha os identificadores antes de editar</h3>
            <form onSubmit={handleIdsSubmit} className="grid grid-cols-2 gap-4">
              <label className="flex flex-col text-sm">
                Administrador
                <input name="administrador" defaultValue={ids?.administrador || ""} className="border rounded px-2 py-1" />
              </label>
              <label className="flex flex-col text-sm">
                Administradora
                <input name="administradora" defaultValue={ids?.administradora || ""} className="border rounded px-2 py-1" />
              </label>
              <label className="flex flex-col text-sm col-span-2">
                IDENTIFICADOR_CNAB
                <input name="identificadorCnab" defaultValue={ids?.identificadorCnab || ""} className="border rounded px-2 py-1" />
              </label>
              <label className="flex flex-col text-sm col-span-2">
                ID_IDENTIFICADOR_CNAB
                <input name="idIdentificadorCnab" defaultValue={ids?.idIdentificadorCnab || ""} className="border rounded px-2 py-1" />
              </label>

              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button type="button" className="px-3 py-1 rounded border" onClick={() => setShowIdsModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="px-3 py-1 rounded bg-black text-white">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetWithIdsAndAudit;
