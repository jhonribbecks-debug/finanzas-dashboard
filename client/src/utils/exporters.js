import * as XLSX from 'xlsx';
import { formatDate, formatDateISO } from './formatters.js';

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
