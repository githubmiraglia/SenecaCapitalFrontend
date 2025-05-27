import React, { useState, useEffect, useRef } from "react";
import {
  Spreadsheet as JSSpreadsheet,
  Worksheet,
  jspreadsheet,
} from "@jspreadsheet/react";
import "jspreadsheet/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "../css/Spreadsheet.css";
import { table } from "console";
import { tab } from "@testing-library/user-event/dist/tab";

jspreadsheet.setLicense(import.meta.env.VITE_JSPREADSHEET_LICENSE as string);

interface SpreadsheetProps {
  data: (string | number | null)[][];
  columns: {
    title: string;
    width: number;
    type?: string;
    mask?: string;
    decimal?: string;
    delimiter?: string;
  }[];
  style?: Record<string, string>;
  worksheetName?: string;
}

export default function Spreadsheet({
  data,
  columns,
  style = {},
  worksheetName = "Planilha",
}: SpreadsheetProps) {
  const spreadsheet = useRef<any>(null);
  const [tableHeight, setTableHeight] = useState<string>("600");
  const [tableWidth, setTableWidth] = useState<string>("600");
  const [ready, setReady] = useState(false);

  const toolbar = (toolbar: any) => {
    toolbar.items.push({
      tooltip: "Exportar",
      content: "backup",
      onclick: function () {
        alert("Exportar para a nuvem...");
      },
    });
    return toolbar;
  };

  useEffect(() => {
    const vhHeight = Math.floor(window.innerHeight * 0.90);
    setTableHeight(vhHeight.toString());
    const vhWidth = Math.floor(window.innerWidth);

    setTableWidth(vhWidth.toString());
      // Delay rendering slightly to let height apply
    const timeout = setTimeout(() => {
      setReady(true);
    }, 50); // 50ms should be enough
      return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="spreadsheet-screen spreadsheet-active spreadsheet-container" >
      {ready && (
        <JSSpreadsheet 
        ref={spreadsheet} 
        toolbar={toolbar}
        >
          <Worksheet
            data={data}
            columns={columns}
            style={style}
            worksheetName={worksheetName}
            tableOverflow={true}
            tableWidth={tableWidth} 
            tableHeight={tableHeight}
            minDimensions={[50, 50]} 
            zoom={0.9}
            freezeColumns={1}
            freezeRows={0}
            allowManualSort={true}
          />
        </JSSpreadsheet>
      )}
      </div>
  );
}
