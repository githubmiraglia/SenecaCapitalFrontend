import React, { useEffect, useState, useRef } from "react";
import Spreadsheet from "../../components/Spreadsheet";
import { CircularProgress, Typography, Box } from "@mui/material";
import "../../css/Spreadsheet.css";
import * as XLSX from "xlsx";
import { api } from "../../api";

interface Indice {
  data_da_tabela: string;
  dias_uteis: number;
  taxa_nominal: number;
  taxa_real: number;
  inflacao_implicita: number;
}

// 🔠 Helper: convert index → Excel-like header (A, B, … Z, AA, AB…)
const getExcelColumnName = (index: number): string => {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const ListaDeIndices: React.FC = () => {
  const [data, setData] = useState<(string | number | null)[][]>([]);
  const [loading, setLoading] = useState(true);

  const spreadsheetRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Indice[]>("/api/indices/");
        const rows = res.data.map((r: Indice) => [
          r.data_da_tabela,
          r.dias_uteis,
          r.taxa_nominal,
          r.taxa_real,
          r.inflacao_implicita,
        ]);
        setData(rows);
      } catch (err) {
        console.error("Erro ao carregar Índices:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Base columns (real data)
  const baseColumns = [
    { title: "Data da Tabela", width: 160, type: "text" },
    { title: "Dias Úteis", width: 120, type: "numeric" },
    { title: "Taxa Nominal", width: 160, type: "numeric", mask: "#,##0.0000" },
    { title: "Taxa Real", width: 160, type: "numeric", mask: "#,##0.0000" },
    { title: "Inflação Implícita", width: 180, type: "numeric", mask: "#,##0.0000" },
  ];

  // ✅ Add dummy Excel-like columns after real ones
  const dummyCount = 30; // adjust how many you want
  const extraColumns = Array.from({ length: dummyCount }, (_, i) => ({
    title: getExcelColumnName(i + baseColumns.length),
    width: 120,
    type: "text",
  }));

  const allColumns = [...baseColumns, ...extraColumns];

  // ✅ Export to Excel
  const handleDownload = () => {
    const ws = XLSX.utils.aoa_to_sheet([allColumns.map(c => c.title), ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Indices");
    XLSX.writeFile(wb, "Lista_de_Indices.xlsx");
  };

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Carregando índices Anbima…</Typography>
        </Box>
      ) : (
        <>
          <Spreadsheet
            ref={spreadsheetRef}
            data={data.map(row => [
              ...row,
              ...Array(extraColumns.length).fill(""), // pad with blanks for dummies
            ])}
            columns={allColumns}
            worksheetName="Indices"
            onDataChange={(newData) => setData(newData)}
          />
        </>
      )}
    </Box>
  );
};

export default ListaDeIndices;
