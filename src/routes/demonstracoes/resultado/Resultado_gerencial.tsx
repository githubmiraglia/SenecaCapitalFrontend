import React, { useRef, useState } from "react";
import { Spreadsheet } from "@jspreadsheet/react";
import ChartRenderer from "../../../components/ChartRenderer";
import "jspreadsheet/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "../../../css/Spreadsheet.css";

// Define a custom type for the event used in onChange
interface JSpreadsheetChangeEvent {
  jspreadsheet: {
    getData: () => any[][];
  };
}

const initialData = [
  { Cliente: "João", Produto: "A", Valor: 100 },
  { Cliente: "Maria", Produto: "B", Valor: 200 },
  { Cliente: "João", Produto: "A", Valor: 150 },
  { Cliente: "Maria", Produto: "A", Valor: 300 },
];

const BIExplorer: React.FC = () => {
  const [data, setData] = useState(initialData);
  const spreadsheetRef = useRef<any>(null);

  const handleSpreadsheetChange = (newData: any[][]) => {
    const [headers, ...rows] = newData;
    const newStructuredData = rows.map((row) =>
      Object.fromEntries(row.map((value, i) => [headers[i], value]))
    );
    setData(newStructuredData);
  };

  const license = import.meta.env.VITE_JSPREADSHEET_LICENSE;

  return (
    <div style={{ padding: "24px" }}>
      <h2>BI Explorer</h2>

      <Spreadsheet
        ref={spreadsheetRef}
        license={license}
        data={data.map((row) => Object.values(row))}
        columns={Object.keys(data[0] || {}).map(() => ({ type: "text" }))}
        minDimensions={[Object.keys(data[0] || {}).length, data.length + 1]}
        onChange={(e: JSpreadsheetChangeEvent) => {
          handleSpreadsheetChange(e.jspreadsheet.getData());
        }}
      />

      <div style={{ marginTop: "32px" }}>
        <ChartRenderer data={data} />
      </div>
    </div>
  );
};

export default BIExplorer;
