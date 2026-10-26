const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Échappe une cellule CSV. Les textes commençant par = + - @ sont préfixés
 * d'une apostrophe pour éviter qu'un tableur ne les interprète comme des
 * formules (injection CSV) ; les nombres ne sont jamais modifiés.
 */
export const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  let str = Array.isArray(value) ? value.join(" | ") : String(value);
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  if (/[",;\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

export const toCsv = (rows: Record<string, unknown>[]): string => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(",")),
  ].join("\n");
};

export const exportToCsv = (
  filename: string,
  rows: Record<string, unknown>[]
) => {
  if (!rows.length) return;
  // BOM UTF-8 : Excel affiche correctement les accents
  const blob = new Blob(["﻿" + toCsv(rows)], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
};

export const exportToJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  downloadBlob(
    blob,
    filename.endsWith(".json") ? filename : `${filename}.json`
  );
};
