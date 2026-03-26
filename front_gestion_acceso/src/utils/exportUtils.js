import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function formatDateTime(datetimeStr) {
  if (!datetimeStr) return "";

  const date = new Date(datetimeStr);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Activo" : "Inactivo";
  return String(value);
}

function convertToCSV(rows, columns) {
  const escapeCell = (val) => `"${normalizeValue(val).replace(/"/g, '""')}"`;
  const header = columns.map((c) => escapeCell(c.header)).join(",");

  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = typeof c.key === "function" ? c.key(row) : row[c.key];
          const value = c.format ? c.format(raw, row) : raw;
          return escapeCell(value);
        })
        .join(",")
    )
    .join("\n");

  return `${header}\n${body}`;
}

function downloadBlob(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildPrintableRows(rows, columns) {
  return rows.map((row) => {
    const item = {};
    columns.forEach((c) => {
      const raw = typeof c.key === "function" ? c.key(row) : row[c.key];
      item[c.header] = normalizeValue(c.format ? c.format(raw, row) : raw);
    });
    return item;
  });
}

export function exportToCSV(rows, columns, filename = "reporte.csv") {
  const csv = convertToCSV(rows, columns);
  downloadBlob(csv, "text/csv;charset=utf-8;", filename);
}

export function exportToExcel(rows, columns, filename = "reporte.xlsx") {
  const tableRows = buildPrintableRows(rows, columns);
  const ws = XLSX.utils.json_to_sheet(tableRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, filename);
}

export function exportToPDF(rows, columns, filename = "reporte.pdf", title = "Reporte") {
  const doc = new jsPDF();
  const tableRows = buildPrintableRows(rows, columns);

  doc.setFontSize(16);
  doc.text(title, 14, 15);

  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: tableRows.map((r) => columns.map((c) => r[c.header])),
    startY: 22,
    styles: { fontSize: 9 },
  });

  doc.save(filename);
}
