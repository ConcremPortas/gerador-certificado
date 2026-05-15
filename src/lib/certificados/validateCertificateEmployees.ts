import type { CertificateEmployee } from '../../types/certificados';
import { isValidCpfLength, formatCpf, onlyNumbers } from './cpf';

export function validateCertificateEmployees(
  employees: CertificateEmployee[]
): CertificateEmployee[] {
  const cpfCount: Record<string, number> = {};

  for (const emp of employees) {
    const digits = onlyNumbers(emp.rawCpf);
    if (digits.length === 11) {
      cpfCount[digits] = (cpfCount[digits] ?? 0) + 1;
    }
  }

  return employees.map((emp) => {
    const errors: string[] = [];

    if (!emp.name) {
      errors.push('Nome é obrigatório.');
    } else if (emp.name.length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres.');
    }

    if (!emp.rawCpf) {
      errors.push('CPF é obrigatório.');
    } else if (!isValidCpfLength(emp.rawCpf)) {
      errors.push('CPF deve ter 11 dígitos.');
    } else {
      const digits = onlyNumbers(emp.rawCpf);
      if (cpfCount[digits] > 1) {
        errors.push('CPF duplicado na planilha.');
      }
    }

    const formattedCpf =
      isValidCpfLength(emp.rawCpf) ? formatCpf(emp.rawCpf) : emp.rawCpf;

    return {
      ...emp,
      cpf: formattedCpf,
      isValid: errors.length === 0,
      errors,
    };
  });
}
