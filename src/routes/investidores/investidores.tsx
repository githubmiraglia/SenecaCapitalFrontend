import React, { useEffect, useState, useRef } from "react";
import Spreadsheet from "../../components/Spreadsheet";
import { CircularProgress, Box } from "@mui/material";
import "../../css/Spreadsheet.css";
import { api } from "../../api";

// 🔠 Helper to generate Excel-style column names
const getExcelColumnName = (index: number): string => {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const Investidores = () => {
  const spreadsheetRef = useRef<any>(null);
  const [data, setData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Always force value to string
  const forceString = (val: any): string => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  // ✅ Escape identifiers so JSpreadsheet never interprets as numeric
  const escapeIdentifier = (val: any): string => {
    if (val === null || val === undefined) return "";
    return "\u200B" + String(val); // prepend invisible zero-width space
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 Fetching investidores...");
        const response = await api.get("/api/investidores/");
        console.log("✅ API Response:", response.data);

        const rows = response.data.map((item: any) => [
          forceString(item.isin),
          escapeIdentifier(item.codigo_if), // ✅ prevents Infinity/scientific
          forceString(item.fii_investidor),
          item?.quantidade != null ? Number(item.quantidade) : "",
          item?.valor_mercado != null ? Number(item.valor_mercado) : "",
          forceString(item.serie_investida),
          forceString(item.classe_investida),
          forceString(item.mes_referencia),
          forceString(item.nome_operacao),
        ]);

        setData(rows);
      } catch (error) {
        console.error("❌ Failed to fetch investidores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Real columns
  const baseColumns = [
    { type: "text", title: "ISIN", width: 150 },
    {
      type: "text",
      title: "Código IF",
      width: 220,
      readOnly: true, // ✅ stops JSpreadsheet from re-parsing
    },
    { type: "text", title: "FII Investidor", width: 200 },
    { type: "numeric", title: "Quantidade", width: 120 },
    { type: "numeric", title: "Valor Mercado", width: 150 },
    { type: "text", title: "Série Investida", width: 120 },
    { type: "text", title: "Classe Investida", width: 120 },
    {
      type: "calendar",
      title: "Mês Referência",
      width: 150,
      options: { format: "YYYY-MM-DD" },
    },
    { type: "text", title: "Nome Operação", width: 200 },
  ];

  // ✅ Dummy Excel-like columns after real ones
  const dummyCount = 30; // adjust how many you want
  const extraColumns = Array.from({ length: dummyCount }, (_, i) => ({
    title: getExcelColumnName(i + baseColumns.length),
    width: 120,
    type: "text",
  }));

  const allColumns = [...baseColumns, ...extraColumns];

  return (
    <Box sx={{ padding: "20px" }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Spreadsheet
          ref={spreadsheetRef}
          data={data.map((row) => [
            ...row,
            ...Array(extraColumns.length).fill(""), // pad with blanks
          ])}
          columns={allColumns}
          worksheetName="Investidores"
          onDataChange={(newData) => setData(newData)}
        />
      )}
    </Box>
  );
};

export default Investidores;
