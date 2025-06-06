import React from "react";
import { useLocation } from "react-router-dom";
import SpreadsheetAndChart from "./spreadsheetAndChart";
import {
  applyRowStyle,
  rowStyleRightAligned,
  dateToExcelSerial,
  getMaxColumnsFlat,
  setStyleColumns,
  getDefaultChartFromPath,
} from "../utils/utils";
import {
  styleCategoria,
  styleTotal,
  styleHeader,
} from "../variables/stylesForJSpreadsheet";
import "../css/Spreadsheet.css";

interface CategoriaData {
  categoria: string;
  linhas: (string | number | null)[][];
  total: (string | number | null)[];
  dates?: string[];
}

interface SpreadsheetCategoriaProps {
  spreadsheetData: CategoriaData[] | any[];
}

const SpreadsheetCategoriaLinhas: React.FC<SpreadsheetCategoriaProps> = ({
  spreadsheetData,
}) => {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  const defaultChart = getDefaultChartFromPath(pathParts);
  console.log("📊 Resolved defaultChart from utils:", defaultChart);

  const rows: (string | number | null)[][] = [];
  const style: Record<string, string> = {};
  let rowIndex = 1;

  const normalizedData: CategoriaData[] = spreadsheetData.flatMap((entry: any) =>
    Array.isArray(entry) ? entry : [entry]
  );

  const columnCount = getMaxColumnsFlat(normalizedData);

  // Header row
  rows[0] = [];
  rows[0][0] = "Descrição";

  const serverDates = normalizedData.find((item) => item.dates)?.dates;

  if (serverDates && serverDates.length > 0) {
    serverDates.forEach((dateStr: string, index: number) => {
      rows[0][index + 1] = dateToExcelSerial(dateStr);
    });
  } else {
    for (let col = 1; col < columnCount; col++) {
      rows[0][col] = dateToExcelSerial(`${col}/01/2023`);
    }
  }

  rowIndex++;

  normalizedData.forEach((item: CategoriaData, index: number) => {
    const categoriaLabel =
      typeof item.categoria === "string"
        ? item.categoria.toUpperCase()
        : `SEM CATEGORIA ${index}`;

    rows.push([categoriaLabel, ...Array(columnCount - 1).fill("")]);
    applyRowStyle(style, rowIndex, styleCategoria, columnCount);
    rowIndex++;

    item.linhas.forEach((linha, i) => {
      const isLast = i === item.linhas.length - 1;
      const label = linha[0];
      const hasTotal =
        typeof label === "string" && label.toLowerCase().includes("total");

      const row = [
        label,
        ...linha.slice(1).map((v) => (v === "" || v == null ? 0 : v)),
      ];

      while (row.length < columnCount) row.push("");

      rows.push(row);
      applyRowStyle(
        style,
        rowIndex,
        rowStyleRightAligned(isLast && hasTotal),
        columnCount
      );
      rowIndex++;
    });

    if (item.total && item.total.length > 0) {
      const total = [
        item.total[0],
        ...item.total.slice(1).map((v) => (v === "" || v == null ? 0 : v)),
      ];
      while (total.length < columnCount) total.push("");
      rows.push(total);
      applyRowStyle(style, rowIndex, styleTotal, columnCount);
      rowIndex++;
    }

    rows.push(Array(columnCount).fill(""));
    applyRowStyle(style, rowIndex, styleHeader, columnCount);
    rowIndex++;
  });

  const columns = setStyleColumns(columnCount, serverDates);

  return (
    <div className="spreadsheet-wrapper">
      <SpreadsheetAndChart
        spreadsheetData={rows}
        columns={columns}
        style={style}
        worksheetName="Planilha"
        spreadsheetRawData={spreadsheetData}
        defaultChart={defaultChart}
      />
    </div>
  );
};

export default SpreadsheetCategoriaLinhas;
