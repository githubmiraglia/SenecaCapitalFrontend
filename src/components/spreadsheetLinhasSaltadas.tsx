import React from "react";
import Spreadsheet from "./Spreadsheet";
import {
  applyRowStyle,
  rowStyleRightAligned,
} from "../utils/utils";
import { detectColumnTypes } from "../utils/detectColumnTypes";
import {
  styleHeaderLight,
  styleRowEven,
  styleRowOdd,
} from "../variables/stylesForJSpreadsheet";
import "../css/Spreadsheet.css";

interface SpreadsheetLinhasSaltadasProps {
  spreadsheetData: {
    categoria: string;
    linhas: (string | number | null)[];
  }[];
}

const SpreadSheetLinhasSaltadas: React.FC<SpreadsheetLinhasSaltadasProps> = ({
  spreadsheetData,
}) => {
  // ✅ Defensive check: if data is not an array, abort render
  if (!Array.isArray(spreadsheetData) || spreadsheetData.length === 0) {
    return <div style={{ padding: "1rem" }}>Nenhum dado disponível.</div>;
  }

  const rows: (string | number | null)[][] = [];
  const style: Record<string, string> = {};

  const categorias = spreadsheetData.map((item) =>
    item?.categoria?.toUpperCase?.() ?? "SEM NOME"
  );
  const maxRows = Math.max(
    ...spreadsheetData.map((item) => item?.linhas?.length || 0)
  );

  // ✅ Header row
  rows.push(categorias);
  applyRowStyle(style, 1, styleHeaderLight, categorias.length); // Excel-style row indexing

  // ✅ Data rows with zebra striping
  for (let i = 0; i < maxRows; i++) {
    const row: (string | number | null)[] = [];

    spreadsheetData.forEach((item) => {
      row.push(item.linhas?.[i] ?? "");
    });

    rows.push(row);

    const alternatingStyle = i % 2 === 0 ? styleRowEven : styleRowOdd;
    applyRowStyle(
      style,
      i + 2, // +1 for header row, +1 because Excel-style row index starts at 1
      `${rowStyleRightAligned(false)} ${alternatingStyle}`,
      categorias.length
    );
  }

  const columns = detectColumnTypes(spreadsheetData).map((col) => ({
    ...col,
    filter: true,
    sort: true,
  }));

  return (
    <div className="spreadsheet-wrapper">
      <Spreadsheet
        data={rows}
        columns={columns}
        style={style}
        worksheetName="Linhas Saltadas"
      />
    </div>
  );
};

export default SpreadSheetLinhasSaltadas;
