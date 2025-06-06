// src/utils/utils.ts

// import needed for determing the default chart configuration below
import { navigationMap } from "../variables/navigationMap";

export interface DefaultChartConfig {
  chart_type: string;
  y_values: string[] | "NA";
}

/**
 * Format a Brazilian CPF as 000.000.000-00
 */
export function formatCPF(value: string): string {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  
  /**
   * Format a Brazilian CNPJ as 00.000.000/0000-00
   */
  export function formatCGC(value: string): string {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
  
  /**
   * Simple email validation
   */
  export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

/**
 * applies a style to rows in JSpreadsheet given a style object
*/
export const applyRowStyle = (
  styleObj: Record<string, string>,
  row: number,
  css: string,
  columnCount: number
) => {
  const colLetters = Array.from({ length: columnCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  colLetters.forEach((col) => {
    styleObj[`${col}${row}`] = css;
  });
};

/**
 * Applies a bold style to total rows in JSpreadsheet
*/
export const rowStyleRightAligned = (isBold: boolean = false): string => {
  return `
    text-align: right;
    padding-left: 8px;
    ${isBold ? "font-weight: bold;" : ""}
  `;
};

/**
 * Applies a the style to columns in JSpreadsheet
*/
export const setStyleColumns = (
  columnCount: number,
  dates?: string[]
) => Array.from({ length: columnCount }, (_, i) =>
  i === 0
    ? {
        title: "Descrição",
        width: 300,
        type: "text",
        mask: "",
        decimal: "",
        delimiter: "",
      }
    : {
        title: dates?.[i - 1] || "", // Use server-provided date in dd/mm/yyyy format
        width: 120,
        type: "number",
        mask: "#.##0,00",
        decimal: ",",
        delimiter: ".",
        align: "right",
      }
);

/**
 * Calculates the maximum number of columns needed for the JSpreadsheet
 * based on the length of the rows in `linhas` and `total`.
 */
export const getMaxColumns = (
  data: {
    subcategorias: {
      linhas: (string | number | null)[][];
    }[];
    total: (string | number | null)[];
  }[]
): number => {
  let max = 1;

  data.forEach((section) => {
    section.subcategorias.forEach((sub) => {
      sub.linhas.forEach((linha) => {
        if (linha.length > max) max = linha.length;
      });
    });

    if (section.total.length > max) max = section.total.length;
  });

  return max;
};

/**
 * Calculates the maximum number of columns needed for the JSpreadsheet
 * based on the length of the rows in `categoria`, `subcategorias` or `total`. Should work for both but will test someday only
 */
export function getMaxColumnsFlat(data: any[]): number {
  let maxCols = 1;

  data.forEach((block) => {
    if (block.subcategorias) {
      block.subcategorias.forEach((sub: any) => {
        sub.linhas.forEach((row: any[]) => {
          maxCols = Math.max(maxCols, row.length);
        });
      });
    } else if (block.linhas) {
      block.linhas.forEach((row: any[]) => {
        maxCols = Math.max(maxCols, row.length);
      });
    }

    if (block.total) {
      maxCols = Math.max(maxCols, block.total.length);
    }
  });

  return maxCols;
}

export function dateToExcelSerial(dateStr: string): number | null {
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year) return null;

  const jsDate = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(jsDate.getTime())) return null;

  // Excel starts at Jan 1, 1900 = serial 1, but internally counts from Dec 31, 1899
  const excelEpoch = new Date(Date.UTC(1899, 11, 31)); // Dec 31, 1899
  const diffInMs = jsDate.getTime() - excelEpoch.getTime();
  const serial = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Adjust for Excel’s fictitious leap year (Feb 29, 1900)
  return serial >= 60 ? serial + 1 : serial;
}

/**
 * Converts JSpreadsheet data and headers to JSON format for Pandas compatibility
 */
export function convertSpreadsheetToJSON(
  headers: string[],
  rows: (string | number | null)[][]
): Record<string, string | number | null>[] {
  return rows.map((row) => {
    const rowObj: Record<string, string | number | null> = {};
    headers.forEach((header, i) => {
      rowObj[header] = row[i];
    });
    return rowObj;
  });
}

/**
 * Converts JSpreadsheet data and headers to chartrendered data format
 */
export function convertToChartData(
  spreadsheetData: (string | number | null)[][]
): { label: string; date: string; value: number }[] {
  const chartData: { label: string; date: string; value: number }[] = [];

  if (!spreadsheetData || spreadsheetData.length < 2) return chartData;

  const headers = spreadsheetData[0].slice(1); // Skip the "Descrição" column

  for (let i = 1; i < spreadsheetData.length; i++) {
    const row = spreadsheetData[i];
    const label = row[0];
    if (typeof label !== "string" || !label.trim()) continue;

    for (let j = 1; j < row.length; j++) {
      const date = headers[j - 1] as string;
      const value = row[j] ?? 0;
      const numericValue = typeof value === "number" ? value : parseFloat(value as string) || 0;

      chartData.push({ label, date, value: numericValue });
    }
  }

  return chartData;
}

// Convert Excel serial date to "dd/mm/yy"
export function excelToDateLabel(serial: number): string {
  const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

// Normalize an array of numbers to [0, 1]
export function normalizeValues(values: number[]): number[] {
  const max = Math.max(...values);
  return max > 0 ? values.map((v) => v / max) : values;
}

/**
 * Abbreviates a label by taking the first letter of each word
 * and returning a string of those letters, e.g. "Conta de Luz" -> "CDL"
 */
export function abbreviateLabel(label: string): string {
  if (label.length <= 10) return label;
  const words = label
    .split(/\s+/)
    .filter(w => w.length > 2) // avoid short stopwords
    .map(w => w[0].toUpperCase());

  return words.join('');
}


/**
 * Resolves the default chart configuration from the current route path.
 * @param pathParts An array of route path segments (e.g., ["demonstracoes", "balanco", "balanco_administrador"])
 * @returns A DefaultChartConfig object or undefined if not found.
 */
export function getDefaultChartFromPath(pathParts: string[]): DefaultChartConfig | undefined {
  if (pathParts.length === 0) return undefined;

  let node: any = pathParts[0] in navigationMap
    ? navigationMap[pathParts[0] as keyof typeof navigationMap]
    : undefined;

  for (let i = 1; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (node && typeof node === "object" && "children" in node && part in node.children) {
      node = node.children[part];
    } else {
      return undefined;
    }
  }

  return node?.default_chart;
}
