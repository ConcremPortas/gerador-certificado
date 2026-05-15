import { jsPDF } from 'jspdf';
import type { CertificateConfig, CertificateEmployee, CertificateLayout, FieldLayout } from '../../types/certificados';
import { DEFAULT_LAYOUT } from './defaultLayout';

const PAGE_W = 297; // A4 landscape mm
const PAGE_H = 210;

function pct(value: number, dim: number): number {
  return (value / 100) * dim;
}

function substituteAll(source: string, employee: CertificateEmployee, config: CertificateConfig): string {
  return source
    .replace(/\{NOME_FUNCIONARIO\}/g, employee.name)
    .replace(/\{CPF_FUNCIONARIO\}/g, employee.cpf)
    .replace(/\{NOME_CURSO\}/g, config.courseName)
    .replace(/\{CARGA_HORARIA\}/g, config.workload)
    .replace(/\{DATA_CURSO\}/g, config.courseDate)
    .replace(/\{LOCAL\}/g, config.location)
    .replace(/\{DATA_EMISSAO\}/g, config.issueDate)
    .replace(/\{EMPRESA\}/g, config.companyName)
    .replace(/\{NOME_RESPONSAVEL\}/g, config.responsibleName)
    .replace(/\{CARGO_RESPONSAVEL\}/g, config.responsibleRole);
}

function resolveContent(
  field: FieldLayout,
  employee: CertificateEmployee,
  config: CertificateConfig,
): string {
  if (field.variable?.includes('{')) {
    const src = field.variable === '{CERTIFICATE_TEXT}' ? config.certificateText : field.variable;
    return substituteAll(src, employee, config);
  }
  return field.text ?? field.variable ?? '';
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function sanitizeFilename(str: string): string {
  return removeAccents(str).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

function fontStyle(field: FieldLayout): string {
  if (field.bold && field.italic) return 'bolditalic';
  if (field.bold) return 'bold';
  if (field.italic) return 'italic';
  return 'normal';
}

export function generateCertificatesPdf(
  config: CertificateConfig,
  employees: CertificateEmployee[],
  layout: CertificateLayout = DEFAULT_LAYOUT,
): void {
  const valid = employees.filter((e) => e.isValid);
  if (valid.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Sort visible fields by zIndex so layers render in the correct order
  const visibleFields = [...layout.fields.filter((f) => f.visible)].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
  );

  valid.forEach((employee, index) => {
    if (index > 0) doc.addPage();

    if (layout.backgroundImage) {
      const fmt = layout.backgroundImage.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(layout.backgroundImage, fmt, 0, 0, PAGE_W, PAGE_H);
    }

    visibleFields.forEach((field) => {
      const text = resolveContent(field, employee, config);
      if (!text) return;

      const [r, g, b] = hexToRgb(field.color);
      doc.setTextColor(r, g, b);
      doc.setFontSize(field.fontSize);
      doc.setFont('helvetica', fontStyle(field));

      const xLeft = pct(field.x, PAGE_W);
      const yAnchor = pct(field.y, PAGE_H);
      const maxW = pct(field.width, PAGE_W);
      const textX =
        field.align === 'center' ? xLeft + maxW / 2
        : field.align === 'right' ? xLeft + maxW
        : xLeft;

      if (field.isSignature) {
        const [dr, dg, db] = hexToRgb(field.color);
        doc.setDrawColor(dr, dg, db);
        doc.setLineWidth(0.3);
        doc.line(xLeft, yAnchor, xLeft + maxW, yAnchor);
      }

      const textY = field.isSignature ? yAnchor + 4 : yAnchor;
      const lines = doc.splitTextToSize(text, maxW);
      doc.text(lines, textX, textY, { align: field.align });
    });
  });

  const filename = `certificados_${sanitizeFilename(config.courseName)}_${sanitizeFilename(config.issueDate)}.pdf`;
  doc.save(filename);
}
