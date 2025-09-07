import React, { useState, useEffect, useRef } from "react";
import {
  Spreadsheet as JSSpreadsheet,
  Worksheet,
  jspreadsheet,
} from "@jspreadsheet/react";
import "jspreadsheet/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "../css/Spreadsheet.css";
import { convertSpreadsheetToJSON } from "../utils/utils";
import { uploadSpreadsheetData, api } from "../api";
import * as XLSX from "xlsx";
import { NoEncryption } from "@mui/icons-material";

jspreadsheet.setLicense(import.meta.env.VITE_JSPREADSHEET_LICENSE as string);

interface SpreadsheetProps {
  data: (string | number | null)[][];
  columns: {
    title: string;
    width: number;
    type?: string;
    mask?: string;
    decimal?: string;
    delimiter?: string;
  }[];
  style?: Record<string, string>;
  worksheetName?: string;
  onDataChange?: (newData: (string | number | null)[][]) => void;
}

export default function Spreadsheet({
  data,
  columns,
  style = {},
  worksheetName = "Planilha",
  onDataChange,
}: SpreadsheetProps) {
  const spreadsheetRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [loadingInvestidores, setLoadingInvestidores] = useState(false);
  const [loadingPrecos, setLoadingPrecos] = useState(false); 
  const [loadingCalculos, setLoadingCalculos] = useState(false); 


  // ✅ Salvar alterações no Django
  const handleSaveToDjango = () => {
    const headers = columns.map((col) => col.title);
    const jsonData = convertSpreadsheetToJSON(headers, data);
    const rowsArray = Array.isArray(jsonData) ? jsonData : [jsonData];

    console.log("🔄 Saving to Django CRIOperacoes:", rowsArray);

    uploadSpreadsheetData(rowsArray, headers)
      .then(() => alert("Alterações salvas no servidor com sucesso!"))
      .catch((err) => {
        if (err.response) {
          console.error("❌ Django error:", err.response.data);
          alert(
            `Erro ao salvar no servidor: ${JSON.stringify(err.response.data)}`
          );
        } else {
          console.error("❌ Unknown error:", err);
          alert("Erro desconhecido ao salvar no servidor.");
        }
      });
  };

  // ✅ Rodar script Investidores
  const handleRunInvestidores = async () => {
    setLoadingInvestidores(true);
    try {
      const instance = spreadsheetRef.current[0];
      if (!instance) {
        alert("⚠️ Planilha não carregada.");
        return;
      }

      // ✅ Map visible rows to pure arrays of cell values
      // ✅ Map visible rows to pure arrays of clean values
      const visibleData = instance.visibleRows.map((rowIndex: number) => {
        const row = instance.records[rowIndex] || [];
        return row.map((cell: any) => {
          let val = cell?.v ?? "";

          // 🧹 Remove zero-width spaces and trim
          if (typeof val === "string") {
            val = val.replace(/\u200B/g, "").trim();
          }

          return val;
        });
      });
      // ✅ Convert to JSON using headers
      const headers = columns.map((col) => col.title);
      const jsonData = convertSpreadsheetToJSON(headers, visibleData);
      const rowsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      await api.post("/api/run-investidores/", { listaCodigos: rowsArray });
      alert("✅ Script Investidores rodado com sucesso!");
    } catch (err) {
      console.error("❌ Error running Investidores:", err);
      alert("Erro ao rodar script de Investidores.");
    } finally {
      setLoadingInvestidores(false);
    }
  };

  // ✅ Rodar script Preços
  const handleRunPrecos = async () => {
    setLoadingPrecos(true);
    try {
      const instance = spreadsheetRef.current[0];
      if (!instance) {
        alert("⚠️ Planilha não carregada.");
        return;
      }

      // ✅ Map visible rows to pure arrays of clean values
      const visibleData = instance.visibleRows.map((rowIndex: number) => {
        const row = instance.records[rowIndex] || [];
        return row.map((cell: any) => {
          let val = cell?.v ?? "";
          // 🧹 Remove zero-width spaces and trim
          if (typeof val === "string") {
            val = val.replace(/\u200B/g, "").trim();
          }

          return val;
        });
      });

      // ✅ Convert to JSON using headers
      const headers = columns.map((col) => col.title);
      const jsonData = convertSpreadsheetToJSON(headers, visibleData);
      const rowsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      // 🚀 Chama backend
      await api.post("/api/run-precos/", { listaCodigos: rowsArray });
      alert("✅ Script Preços rodado com sucesso!");
    } catch (err) {
      console.error("❌ Error running Preços:", err);
      alert("Erro ao rodar script de Preços.");
    } finally {
      setLoadingPrecos(false);
    }
  };


  // ✅ Rodar script Calculos
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleRunCalculos = async () => {
    setLoadingCalculos(true);
    setStatusMessage(""); // reset
    try {
      const instance = spreadsheetRef.current[0];
      if (!instance) {
        setStatusMessage("⚠️ Planilha não carregada.");
        return;
      }

      // ✅ pega todos os dados
      const allData = instance.getData();
      const cleanedData = allData.map((row: any[]) =>
        row.map((cell: any) => {
          let val = cell ?? "";
          if (typeof val === "string") {
            val = val.replace(/\u200B/g, "").trim();
          }
          return val;
        })
      );

      const headers = columns.map((col) => col.title);
      const jsonData = convertSpreadsheetToJSON(headers, cleanedData);
      const rowsArray = Array.isArray(jsonData) ? jsonData : [jsonData];

      // 🔄 envia em chunks
      const chunkSize = 500;
      const totalChunks = Math.ceil(rowsArray.length / chunkSize);

      for (let i = 0; i < rowsArray.length; i += chunkSize) {
        const chunkIndex = i / chunkSize + 1;
        const chunk = rowsArray.slice(i, i + chunkSize);

        // 👀 atualiza status em tela
        setStatusMessage(
          `📤 Enviando chunk ${chunkIndex}/${totalChunks} (${i + 1}–${
            i + chunk.length
          })...`
        );

        // 👇 forçar renderização antes do próximo await
        await new Promise((resolve) => setTimeout(resolve, 0));

        await api.post("/api/run-calculos/", { listaCodigos: chunk });
      }

      setStatusMessage("");

    } catch (err) {
      console.error("❌ Error running Cálculos:", err);
      setStatusMessage("❌ Erro ao rodar script de Cálculos.");
    } finally {
      setLoadingCalculos(false);
    }
  };



  // ✅ Exportar Excel
  const handleDownloadExcel = () => {
    const headers = columns.map((col) => col.title);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, worksheetName || "Planilha");
    XLSX.writeFile(wb, `${worksheetName || "planilha"}.xlsx`);
  };

  // ✅ Exportar CSV
  const handleDownloadCSV = () => {
    const headers = columns.map((col) => col.title);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${worksheetName || "planilha"}.csv`;
    link.click();
  };

  // ✅ Toolbar com botões extras
  const toolbar = (toolbar: any) => {
    toolbar.items.push(
      {
        tooltip: "Salvar alterações no Django (Upsert)",
        content: "cloud_upload",
        onclick: handleSaveToDjango,
      },
      {
        tooltip: "Baixar como Excel",
        content: "table_view",
        onclick: handleDownloadExcel,
      },
      {
        tooltip: "Baixar como CSV",
        content: "description",
        onclick: handleDownloadCSV,
      },
      {
        tooltip: "Rodar script Investidores",
        content: "groups",
        onclick: handleRunInvestidores,
      },
      {
        tooltip: "Rodar script Mercado Secundário",
        content: "paid",
        onclick: handleRunPrecos,
      },
      {
        tooltip: "Rodar calculos",
        content: "query_stats",
        onclick: handleRunCalculos,
      }
    );
    return toolbar;
  };

  const handleCellChange = (
    instance: any,
    cell: any,
    x: number,
    y: number,
    value: string
  ) => {
    const newData = instance.getData?.();
    if (onDataChange) onDataChange(newData);
  };

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="spreadsheet-wrapper">
      {ready && (
        <>
          <JSSpreadsheet
            ref={spreadsheetRef}
            toolbar={toolbar}
            onchange={handleCellChange}
          >
            <Worksheet
              data={data && data.length > 0 ? data : [[""]]}
              columns={columns}
              worksheetName={worksheetName}
              tableOverflow
              tableHeight="650px"
              tableWidth="1850px"
              style={{
                backgroundColor: "#ffffff",
                width: "1850px",
                height: "650px",
                ...style,
              }}
              tableStyle={{ backgroundColor: "#ffffffff" }}
              zoom={1}
              allowManualSort
              filters={true}
            />
          </JSSpreadsheet>

          {statusMessage && statusMessage.length > 0 && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 9999,
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {statusMessage}
            </div>
          )}
        </>
      )}
    </div>
  );

}
