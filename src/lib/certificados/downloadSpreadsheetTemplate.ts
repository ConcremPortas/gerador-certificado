import * as XLSX from 'xlsx';

export function downloadSpreadsheetTemplate(): void {
  const data = [
    ['Nome', 'CPF'],
    ['João da Silva', '123.456.789-00'],
    ['Maria Oliveira', '987.654.321-00'],
    ['Carlos Souza', '456.789.123-00'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Funcionários');

  XLSX.writeFile(workbook, 'modelo_importacao_certificados.xlsx');
}
