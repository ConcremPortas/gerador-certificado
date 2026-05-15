import * as XLSX from 'xlsx';
import type { CertificateEmployee, SpreadsheetImportResult } from '../../types/certificados';

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, ' ');
}

function findColumn(headers: string[], candidates: string[]): string | undefined {
  return headers.find((h) => candidates.includes(h));
}

export async function parseCertificateSpreadsheet(file: File): Promise<SpreadsheetImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const errors: string[] = [];

  if (rows.length === 0) {
    return { employees: [], validCount: 0, invalidCount: 0, errors: ['A planilha está vazia.'] };
  }

  const headers = Object.keys(rows[0]);
  const nameCol = findColumn(headers, ['Nome', 'nome', 'NOME']);
  const cpfCol = findColumn(headers, ['CPF', 'cpf', 'Cpf']);

  if (!nameCol) errors.push('Coluna "Nome" não encontrada na planilha.');
  if (!cpfCol) errors.push('Coluna "CPF" não encontrada na planilha.');

  if (!nameCol || !cpfCol) {
    return { employees: [], validCount: 0, invalidCount: 0, errors };
  }

  const employees: CertificateEmployee[] = [];

  rows.forEach((row, index) => {
    const name = normalizeText(row[nameCol]);
    const rawCpf = normalizeText(row[cpfCol]);

    if (!name && !rawCpf) return;

    employees.push({
      id: crypto.randomUUID(),
      rowNumber: index + 2,
      name,
      cpf: rawCpf,
      rawCpf,
      isValid: false,
      errors: [],
    });
  });

  return {
    employees,
    validCount: 0,
    invalidCount: employees.length,
    errors,
  };
}
