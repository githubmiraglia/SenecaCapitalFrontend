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
  subcategorias?: Subcategoria[]; // optional for flexibility
  linhas?: (string | number | null)[][];
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
  spreadsheetRawData: CategoriaData[] | CategoriaData[][];
  defaultChart?: {
    chart_type: string;
    y_values: string[] | "NA";
  };
}

const SpreadsheetAndChart: React.FC<SpreadsheetAndChartProps> = ({
  spreadsheetData,
  columns,
  style = {},
  worksheetName = "Planilha",
  spreadsheetRawData,
  defaultChart,
}) => {
  const [currentData, setCurrentData] = useState<
    (string | number | null)[][]
  >(spreadsheetData);

  const chartData: ChartPoint[] = useMemo(() => {
    return convertToChartData(currentData);
  }, [currentData]);

  // Normalize spreadsheetRawData to CategoriaData[] for chart rendering
  const normalizedRawData: CategoriaData[] = Array.isArray(spreadsheetRawData[0])
    ? (spreadsheetRawData as CategoriaData[][]).flat()
    : (spreadsheetRawData as CategoriaData[]);

  console.log("📦 SpreadsheetAndChart received defaultChart:", defaultChart);

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
          spreadsheetRawData={normalizedRawData}
          defaultChart={defaultChart}
        />
      </div>
    </div>
  );
};

export default SpreadsheetAndChart;
