// src/utils/detectColumnTypes.ts

interface CategoriaColuna {
  categoria: string;
  linhas: (string | number | null)[];
}

export interface DetectedColumnType {
  title: string;
  type: string;
  mask?: string;
  decimal?: string;
  delimiter?: string;
  align?: string;
  width: number; // required
}

/**
 * Checks if a string is a valid Brazilian date in dd/mm/yyyy format
 */
function isBrazilianDate(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

/**
 * Checks if a value is a CPF (xxx.xxx.xxx-xx)
 */
function isCPF(value: string): boolean {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
}

/**
 * Checks if a value is a likely Brazilian integer (e.g., "123")
 */
function isInteger(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Checks if value is a formatted float like "1.234,56" or "1,234.56"
 */
function isFormattedFloat(value: string): boolean {
  return /^(\d{1,3}(\.\d{3})*,\d{2})$|^(\d{1,3}(,\d{3})*\.\d{2})$/.test(value);
}

/**
 * Detect column types from categorized rows
 */
export function detectColumnTypes(carteira: CategoriaColuna[]): DetectedColumnType[] {
  return carteira.map((col) => {
    const sampleValues = col.linhas.filter((v) => typeof v === "string") as string[];
    const first10 = sampleValues.slice(0, 10);

    let type = "text";
    let mask;
    let decimal;
    let delimiter;
    let width = 200;

    const hasCPF = first10.filter(isCPF).length >= 5;
    const hasDate = first10.filter(isBrazilianDate).length >= 5;
    const hasFloat = first10.filter(isFormattedFloat).length >= 5;
    const hasInt = first10.filter(isInteger).length >= 5;

    if (hasCPF) {
      type = "text";
      mask = "000.000.000-00";
      width = 160;
    } else if (hasDate) {
      type = "calendar";
      width = 120;
    } else if (hasFloat) {
      type = "number";
      mask = "#.##0,00";
      decimal = ",";
      delimiter = ".";
      width = 120;
    } else if (hasInt) {
      type = "numeric";
      mask = "0";
      width = 100;
    }

    return {
      title: col.categoria,
      type,
      mask,
      decimal,
      delimiter,
      align: type === "text" ? "left" : "right",
      width,
    };
  });
}
