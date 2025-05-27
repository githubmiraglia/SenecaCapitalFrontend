import React from "react";
import Spreadsheet from "./Spreadsheet";
import {
  applyRowStyle,
  rowStyleRightAligned,
  dateToExcelSerial,
  getMaxColumnsFlat,
  setStyleColumns,
} from "../utils/utils";
import {
  styleCategoria,
  styleSubcategoria,
  styleTotal,
  styleHeader,
} from "../variables/stylesForJSpreadsheet";
import "../css/Spreadsheet.css";

interface Subcategoria {
  titulo: string;
  linhas: (string | number | null)[][];
}

interface CategoriaData {
  categoria: string;
  dates?: string[];
  subcategorias: Subcategoria[];
  total: (string | number | null)[];
}

interface SpreadsheetCategoriasProps {
  spreadsheetData: CategoriaData[] | any[];
}

const SpreadsheetCategoriasSubcategoriasLinhas: React.FC<SpreadsheetCategoriasProps> = ({
  spreadsheetData,
}) => {
  const rows: (string | number | null)[][] = [];
  const style: Record<string, string> = {};
  let rowIndex = 1;

  // Normalize in case items are accidentally nested in arrays
  const normalizedData: CategoriaData[] = spreadsheetData.flatMap((entry: any) =>
    Array.isArray(entry) ? entry : [entry]
  );

  console.log("SpreadsheetDATA", normalizedData);

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

    item.subcategorias.forEach((sub: Subcategoria) => {
      const subTitle = sub.titulo ?? "";
      rows.push([subTitle, ...Array(columnCount - 1).fill("")]);
      applyRowStyle(style, rowIndex, styleSubcategoria, columnCount);
      rowIndex++;

      sub.linhas.forEach((linha: (string | number | null)[], i: number) => {
        const label = linha[0];
        const isLast = i === sub.linhas.length - 1;
        const hasTotal =
          typeof label === "string" && label.toLowerCase().includes("total");
        const row = [
          label,
          ...linha.slice(1).map((v: string | number | null) =>
            v === "" || v == null ? 0 : v
          ),
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
    });

    if (item.total && item.total.length > 0) {
      const totalRow = [
        item.total[0],
        ...item.total.slice(1).map((v: string | number | null) =>
          v === "" || v == null ? 0 : v
        ),
      ];
      while (totalRow.length < columnCount) totalRow.push("");
      rows.push(totalRow);
      applyRowStyle(style, rowIndex, styleTotal, columnCount);
      rowIndex++;
    }

    // Spacer
    rows.push(Array(columnCount).fill(""));
    applyRowStyle(style, rowIndex, styleHeader, columnCount);
    rowIndex++;
  });

  const columns = setStyleColumns(columnCount, serverDates);

  return (
    <div className="spreadsheet-wrapper">
      <Spreadsheet
        data={rows}
        columns={columns}
        style={style}
        worksheetName="Planilha"
      />
    </div>
  );
};

export default SpreadsheetCategoriasSubcategoriasLinhas;