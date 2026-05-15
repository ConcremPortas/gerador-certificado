export interface CertificateConfig {
  courseName: string;
  workload: string;
  courseDate: string;
  issueDate: string;
  location: string;
  companyName: string;
  responsibleName: string;
  responsibleRole: string;
  certificateText: string;
}

export interface CertificateEmployee {
  id: string;
  rowNumber: number;
  name: string;
  cpf: string;
  rawCpf: string;
  isValid: boolean;
  errors: string[];
}

export interface SpreadsheetImportResult {
  employees: CertificateEmployee[];
  validCount: number;
  invalidCount: number;
  errors: string[];
}

export interface FieldLayout {
  id: string;
  label: string;
  /** {VAR_NAME} for variable substitution; '' for free text; legacy literal text without {} */
  variable: string;
  /** Free-text content (used when variable === '') */
  text?: string;
  x: number;        // % of page width (left edge of box)
  y: number;        // % of page height (top/baseline anchor)
  width: number;    // % of page width
  fontSize: number; // in pt
  bold: boolean;
  italic?: boolean;
  align: 'left' | 'center' | 'right';
  color: string;    // hex e.g. "#111827"
  visible: boolean;
  isSignature?: boolean;
  zIndex?: number;
}

export interface CertificateLayout {
  backgroundImage: string | null; // base64 data URL
  fields: FieldLayout[];
}
