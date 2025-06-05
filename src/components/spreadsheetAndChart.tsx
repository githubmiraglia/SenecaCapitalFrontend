import React, { useMemo, useState } from "react";
import Spreadsheet from "./Spreadsheet";
import ChartRenderer from "./ChartRenderer";
import { convertToChartData } from "../utils/utils";
import "../css/spreadsheetAndChart.css";

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

interface ChartPoint {
  label: string;
  date: string;
  value: number;
}

interface SpreadsheetAndChartProps {
  spreadsheetData: (string | number | null)[][];
  columns: {
    title: string;
    width: number;
    type?: string;
    mask?: string;
    decimal?: string;
    delimiter?: string;
    align?: string;
  }[];
  style?: Record<string, string>;
  worksheetName?: string;
  spreadsheetRawData: CategoriaData[];
}

const SpreadsheetAndChart: React.FC<SpreadsheetAndChartProps> = ({
  spreadsheetData,
  columns,
  style = {},
  worksheetName = "Planilha",
  spreadsheetRawData,
}) => {
  const [currentData, setCurrentData] = useState<(string | number | null)[][]>(
    spreadsheetData
  );

  const chartData: ChartPoint[] = useMemo(() => {
    const result = convertToChartData(currentData);
    return result;
  }, [currentData]);

  return (
    <div className="layout-two-panel">
      <div className="left-panel">
        <Spreadsheet
          data={currentData}
          columns={columns}
          style={style}
          worksheetName={worksheetName}
          onDataChange={(updatedData) => {
            setCurrentData(updatedData);
          }}
        />
      </div>
      <div className="right-panel">
        <ChartRenderer
          spreadsheetData={currentData}
          spreadsheetRawData={spreadsheetRawData}
        />
      </div>
    </div>
  );
};

export default SpreadsheetAndChart;
