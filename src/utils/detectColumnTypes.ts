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
  width: number;
}

/**
 * Checks if a string is in dd/mm/yyyy format
 */
function isBrazilianDate(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

/**
 * Checks if a string is an ISO date like 2025-01-01T03:00:00.000Z
 */
function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value);
}

/**
 * Checks if a value is a CPF (xxx.xxx.xxx-xx)
 */
function isCPF(value: string): boolean {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
}

/**
 * Checks if a value is a Brazilian RG (e.g., 12.345.678-9 or 36.519.203-X)
 */
function isRG(value: string): boolean {
  return /^\d{2}\.\d{3}\.\d{3}-[\dXx]$/.test(value);
}

/**
 * Checks if a value is a Brazilian CEP (e.g., 12345-678)
 */
function isCEP(value: string): boolean {
  return /^\d{5}-\d{3}$/.test(value);
}

/**
 * Checks if value is a formatted float like "1.234,56"
 */
function isFormattedFloat(value: string): boolean {
  return /^(\d{1,3}(\.\d{3})*,\d{2})$/.test(value);
}

/**
 * Detects plain float numbers (e.g., 122269645.18784036) that are not CPF
 */
function isCurrencyNumber(value: string): boolean {
  return /^\d+\.\d+$/.test(value) && !isCPF(value);
}

/**
 * Checks if a number might represent a percentage (e.g., 0.012345)
 */
function isPercentageCandidate(value: string): boolean {
  const parsed = parseFloat(value);
  return !isNaN(parsed) && parsed > 0 && parsed < 1;
}

/**
 * Detect column types from categorized data
 */
export function detectColumnTypes(carteira: CategoriaColuna[]): DetectedColumnType[] {
  return carteira.map((col) => {
    const sampleValues = col.linhas
      .map((v) => (v != null ? String(v) : ""))
      .slice(0, 10);

    let type = "text";
    let mask: string | undefined;
    let decimal: string | undefined;
    let delimiter: string | undefined;
    let width = 200;

    const threshold = Math.max(1, Math.floor(sampleValues.length / 2));

    const hasCPF = sampleValues.filter(isCPF).length >= threshold;
    const hasRG = sampleValues.filter(isRG).length >= threshold;
    const hasCEP = sampleValues.filter(isCEP).length >= threshold;
    const hasBrDate = sampleValues.filter(isBrazilianDate).length >= threshold;
    const hasISODate = sampleValues.filter(isISODate).length >= threshold;
    const hasFormattedFloat = sampleValues.filter(isFormattedFloat).length >= threshold;
    const hasCurrencyLike = sampleValues.filter(isCurrencyNumber).length >= threshold;
    const hasPercentage = sampleValues.filter(isPercentageCandidate).length >= threshold;

    if (hasCPF) {
      type = "text";
      mask = "000.000.000-00";
      width = 160;
    } else if (hasRG) {
      type = "text";
      mask = "00.000.000-0";
      width = 140;
    } else if (hasCEP) {
      type = "text";
      mask = "00000-000";
      width = 120;
    } else if (hasBrDate || hasISODate) {
      type = "calendar";
      width = 140;
    } else if (hasFormattedFloat || hasCurrencyLike || hasPercentage) {
      type = "number";
      decimal = ",";
      delimiter = ".";
      width = 120;
      mask = hasPercentage ? "#.##0,00000" : "#.##0,00";
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
