// src/utils/utils.ts

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


/**
 * Converts a date string in "dd/mm/yyyy" format to the corresponding Excel serial number.
*/
export function dateToExcelSerial(dateStr: string): number | null {
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year) return null;

  // JS months are 0-based
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return null;

  // Excel's base date is Jan 1, 1900, which is serial 1
  const excelBase = new Date(1899, 11, 30); // Excel incorrectly treats 1900 as a leap year
  const diffInMs = date.getTime() - excelBase.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.floor(diffInMs / msPerDay);
}