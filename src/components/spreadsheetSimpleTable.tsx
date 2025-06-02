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

interface CategoriaColuna {
  categoria: string;
  linhas: (string | number | null)[];
}

interface Props {
  tableData: CategoriaColuna[];
}

const SpreadsheetSimpleTable: React.FC<Props> = ({ tableData }) => {
  if (!Array.isArray(tableData) || tableData.length === 0) {
    return <div style={{ padding: "1rem" }}>Nenhum dado disponível.</div>;
  }

  const rows: (string | number | null)[][] = [];
  const style: Record<string, string> = {};

  // Header row
  const headers = tableData.map((col) => col.categoria ?? "Sem nome");
  //rows.push(headers);
  //applyRowStyle(style, 1, styleHeaderLight, headers.length);

  // Fill rows with aligned values
  const maxLength = Math.max(...tableData.map((col) => col.linhas.length));
  for (let i = 0; i < maxLength; i++) {
    const row: (string | number | null)[] = [];
    tableData.forEach((col) => {
      row.push(col.linhas[i] ?? "");
    });
    rows.push(row);

    //const zebra = i % 2 === 0 ? styleRowEven : styleRowOdd;
    //applyRowStyle(
    //  style,
    //  i + 2,
    //  `${rowStyleRightAligned(false)} ${zebra}`,
    //  headers.length
    //);
  }

  const columns = detectColumnTypes(tableData).map((col) => ({
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
        worksheetName="Tabela do Servidor"
      />
    </div>
  );
};



export default SpreadsheetSimpleTable;
