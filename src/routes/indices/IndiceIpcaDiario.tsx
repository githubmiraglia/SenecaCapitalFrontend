import React, { useEffect, useState, useRef } from "react";
import Spreadsheet from "../../components/Spreadsheet";
import { getIPCADiario, IPCADiario } from "../../api";
import { CircularProgress, Box } from "@mui/material";

// 🔠 Helper: convert 0 → A, 25 → Z, 26 → AA, 27 → AB...
const getExcelColumnName = (index: number): string => {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const IPCADiarioPage: React.FC = () => {
  const spreadsheetRef = useRef<any>(null);
  const [data, setData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Base columns
  const baseColumns = [
    { type: "calendar", title: "Data", width: 120 },
    { type: "numeric", title: "Index", width: 150 },
    { type: "numeric", title: "Variação %", width: 150 },
  ];

  // ✅ Generate dummy Excel-like columns (from D onwards)
  const dummyCount = 50; // adjust as needed
  const extraColumns = Array.from({ length: dummyCount }, (_, i) => ({
    title: getExcelColumnName(i + baseColumns.length), // start after base columns
    width: 120,
    type: "text",
  }));

  // ✅ Merge base + dummy
  const columns = [...baseColumns, ...extraColumns];

  useEffect(() => {
    (async () => {
      try {
        const rows: IPCADiario[] = await getIPCADiario();

        const mapped = rows.map((r) => [
          r.data,
          r.index,
          r.variacao_pct,
          ...Array(extraColumns.length).fill(""), // fill dummy cols
        ]);

        setData(mapped);
      } catch (error) {
        console.error("Erro ao carregar IPCA Diário:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="spreadsheet-wrapper">
      <Spreadsheet ref={spreadsheetRef} data={data} columns={columns} />
    </div>
  );
};

export default IPCADiarioPage;
