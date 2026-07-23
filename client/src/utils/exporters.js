import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate, formatDateISO } from './formatters.js';

export function exportToExcel(movimientos) {
  const worksheetData = movimientos.map((m) => ({
    Fecha: formatDate(m.date),
    Categoria: m.category_name || '',
    Cuenta: m.account_name || '',
    Descripcion: m.description || '',
    Tipo: m.kind,
    Importe: m.amount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

  const fileName = `movimientos_${formatDateISO(new Date())}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportToPdf(movimientos) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Reporte de Movimientos', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date())}`, 105, 30, { align: 'center' });

  const columns = ['Fecha', 'Categoria', 'Cuenta', 'Descripcion', 'Tipo', 'Importe'];
  const rows = movimientos.map((m) => [
    formatDate(m.date),
    m.category_name || '',
    m.account_name || '',
    m.description || '',
    m.kind,
    m.amount,
  ]);

  const totalIngresos = movimientos
    .filter((m) => m.kind === 'ingreso')
    .reduce((sum, m) => sum + m.amount, 0);
  const totalGastos = movimientos
    .filter((m) => m.kind === 'gasto')
    .reduce((sum, m) => sum + m.amount, 0);
  const balance = totalIngresos - totalGastos;

  doc.autoTable({
    startY: 40,
    head: [columns],
    body: rows,
    foot: [
      [{ content: 'Total Ingresos:', colSpan: 5 }, formatCurrency(totalIngresos)],
      [{ content: 'Total Gastos:', colSpan: 5 }, formatCurrency(totalGastos)],
      [{ content: 'Balance:', colSpan: 5 }, formatCurrency(balance)],
    ],
    styles: { fontSize: 8 },
    footStyles: { fontStyle: 'bold' },
  });

  const fileName = `movimientos_${formatDateISO(new Date())}.pdf`;
  doc.save(fileName);
}
