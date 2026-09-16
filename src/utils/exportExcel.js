import * as XLSX from 'xlsx'

export function exportExcel(fileName, sheetName, headers, rows) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  worksheet['!cols'] = headers.map((header, index) => ({ wch: Math.min(40, Math.max(String(header).length + 2, ...rows.map((row) => String(row[index] ?? '').length + 2))) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
