// src/routes/tabelas/Precos.tsx
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

const Precos = () => {
  const spreadsheetRef = useRef<any>(null);
  const [data, setData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Always force value to string
  const forceString = (val: any): string =>
    val === null || val === undefined ? "" : String(val);

  // ✅ Escape identifiers so JSpreadsheet never interprets as numeric
  const escapeIdentifier = (val: any): string =>
    val === null || val === undefined ? "" : "\u200B" + String(val);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 Fetching preços...");
        const response = await api.get("/api/precos/");
        console.log("✅ API Response:", response.data);

        const rows = response.data.map((item: any) => [
          forceString(item.isin),
          escapeIdentifier(item.codigo_if),
          forceString(item.classe),
          forceString(item.titulo),
          forceString(item.data),
          item?.preco_minimo != null ? Number(item.preco_minimo) : "",
          item?.preco_maximo != null ? Number(item.preco_maximo) : "",
          item?.preco_ultimo != null ? Number(item.preco_ultimo) : "",
          item?.quantidade != null ? Number(item.quantidade) : "",
          item?.num_negocios != null ? Number(item.num_negocios) : "",
          item?.volume != null ? Number(item.volume) : "",
          forceString(item.ambiente),
          item?.duration ?? "", // duration (from DB if exists)
          item?.spread ?? "",   // spread (from DB if exists)
          item?.taxa ?? "",     // taxa (from DB if exists)
        ]);

        setData(rows);
      } catch (error) {
        console.error("❌ Failed to fetch preços:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Real columns
  const baseColumns = [
    { type: "text", title: "ISIN", width: 150 },
    { type: "text", title: "CÓDIGO IF", width: 150, readOnly: true },
    { type: "text", title: "CLASSE", width: 120 },
    { type: "text", title: "TÍTULO", width: 200 },
    {
      type: "calendar",
      title: "DATA",
      width: 150,
      options: { format: "YYYY-MM-DD" },
    },
    { type: "numeric", title: "PREÇO (MÍNIMO)", width: 140 },
    { type: "numeric", title: "PREÇO (MÁXIMO)", width: 140 },
    { type: "numeric", title: "PREÇO (ÚLTIMO)", width: 140 },
    { type: "numeric", title: "QUANTIDADE", width: 120 },
    { type: "numeric", title: "NUM NEGOCIOS", width: 140 },
    { type: "numeric", title: "VOLUME", width: 150 },
    { type: "text", title: "AMBIENTE", width: 120 },
    { type: "numeric", title: "DURATION", width: 120 },
    { type: "numeric", title: "SPREAD", width: 120 },
    { type: "numeric", title: "TAXA", width: 120 },
  ];

  // ✅ Dummy Excel-like columns after real ones
  const dummyCount = 5;
  const extraColumns = Array.from({ length: dummyCount }, (_, i) => ({
    title: getExcelColumnName(i + baseColumns.length),
    width: 120,
    type: "text",
  }));

  const allColumns = [...baseColumns, ...extraColumns];

  // ✅ Trigger backend calculations
  const handleCalculate = async () => {
    try {
      const payload = {
        listaCodigos: data.map((row) => ({
          ISIN: row[0],
          "CÓDIGO IF": String(row[1] || "")
            .replace("\u200B", "")
            .trim()
            .toUpperCase(),
          CLASSE: row[2],
          TÍTULO: row[3],
          DATA: row[4],
          "PREÇO (MÍNIMO)": row[5],
          "PREÇO (MÁXIMO)": row[6],
          "PREÇO (ÚLTIMO)": row[7],
          QUANTIDADE: row[8],
          "NUM NEGOCIOS": row[9],
          VOLUME: row[10],
          AMBIENTE: row[11],
        })),
      };

      const response = await api.post("/api/run-calculos/", payload);
      console.log("🟢 Backend rows:", response.data.rows);

      const updates = (response.data.rows || []).map((u: any) => ({
        ...u,
        codigo_if: String(u.codigo_if || "")
          .replace("\u200B", "")
          .trim()
          .toUpperCase(),
      }));

      const updatedData = data.map((row) => {
        const codigo_if = String(row[1] || "")
          .replace("\u200B", "")
          .trim()
          .toUpperCase();

        const found = updates.find((u: any) => u.codigo_if === codigo_if);

        console.log("🔎 Matching row:", codigo_if, "→", found);

        if (found) {
          return [
            ...row.slice(0, 12),
            found.duration ?? "",
            found.spread ?? "",
            found.taxa ?? "",
          ];
        }
        return row;
      });

      console.log("✅ Updated spreadsheet rows:", updatedData);
      setData(updatedData);
    } catch (err) {
      console.error("❌ Erro ao rodar cálculos", err);
      alert("Erro ao rodar cálculos");
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Spreadsheet
          ref={spreadsheetRef}
          data={data.map((row) => [
            ...row,
            ...Array(extraColumns.length).fill(""),
          ])}
          columns={allColumns}
          worksheetName="Preços"
          onDataChange={(newData) => setData(newData)}
          customFunctions={{ calcularTaxas: handleCalculate }}
        />
      )}
    </Box>
  );
};

export default Precos;
