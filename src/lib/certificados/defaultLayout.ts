import type { CertificateLayout, FieldLayout } from '../../types/certificados';

// Positions in % of A4 landscape (297 mm × 210 mm).
// y is the text baseline anchor in jsPDF terms.
// Visible defaults reproduce the previous hardcoded PDF layout.
// Individual variable fields are hidden by default and become useful
// when the user uploads a background image with static text.
export const DEFAULT_FIELDS: FieldLayout[] = [
  {
    id: 'static_titulo',
    label: 'Título "CERTIFICADO"',
    variable: 'CERTIFICADO',
    x: 10, y: 14, width: 80,
    fontSize: 28, bold: true, align: 'center',
    color: '#111827', visible: true,
  },
  {
    id: 'static_certificamos',
    label: 'Texto "Certificamos que"',
    variable: 'Certificamos que',
    x: 20, y: 23, width: 60,
    fontSize: 13, bold: false, align: 'center',
    color: '#6B7280', visible: true,
  },
  {
    id: 'NOME_FUNCIONARIO',
    label: 'Nome do Funcionário',
    variable: '{NOME_FUNCIONARIO}',
    x: 10, y: 30, width: 80,
    fontSize: 20, bold: true, align: 'center',
    color: '#111827', visible: true,
  },
  {
    id: 'CPF_FUNCIONARIO',
    label: 'CPF do Funcionário',
    variable: '{CPF_FUNCIONARIO}',
    x: 20, y: 37, width: 60,
    fontSize: 10, bold: false, align: 'center',
    color: '#6B7280', visible: true,
  },
  {
    id: 'CERTIFICATE_TEXT',
    label: 'Texto do Certificado (parágrafo)',
    variable: '{CERTIFICATE_TEXT}',
    x: 8, y: 45, width: 84,
    fontSize: 11, bold: false, align: 'center',
    color: '#374151', visible: true,
  },
  // Individual fields — hidden by default, useful with background images
  {
    id: 'NOME_CURSO',
    label: 'Nome do Curso',
    variable: '{NOME_CURSO}',
    x: 10, y: 45, width: 80,
    fontSize: 12, bold: true, align: 'center',
    color: '#111827', visible: false,
  },
  {
    id: 'CARGA_HORARIA',
    label: 'Carga Horária',
    variable: '{CARGA_HORARIA}',
    x: 8, y: 53, width: 36,
    fontSize: 10, bold: false, align: 'left',
    color: '#374151', visible: false,
  },
  {
    id: 'DATA_CURSO',
    label: 'Data do Curso',
    variable: '{DATA_CURSO}',
    x: 56, y: 53, width: 36,
    fontSize: 10, bold: false, align: 'right',
    color: '#374151', visible: false,
  },
  {
    id: 'LOCAL',
    label: 'Local',
    variable: '{LOCAL}',
    x: 8, y: 65, width: 42,
    fontSize: 10, bold: false, align: 'left',
    color: '#6B7280', visible: true,
  },
  {
    id: 'DATA_EMISSAO',
    label: 'Data de Emissão',
    variable: '{DATA_EMISSAO}',
    x: 62, y: 65, width: 30,
    fontSize: 10, bold: false, align: 'right',
    color: '#6B7280', visible: true,
  },
  {
    id: 'EMPRESA',
    label: 'Empresa',
    variable: '{EMPRESA}',
    x: 8, y: 72, width: 50,
    fontSize: 10, bold: false, align: 'left',
    color: '#374151', visible: false,
  },
  {
    id: 'ASSINATURA_PARTICIPANTE',
    label: 'Assinatura do Participante',
    variable: '{NOME_FUNCIONARIO}',
    x: 7, y: 86, width: 33,
    fontSize: 9, bold: false, align: 'center',
    color: '#374151', visible: true,
    isSignature: true,
  },
  {
    id: 'NOME_RESPONSAVEL',
    label: 'Nome do Responsável',
    variable: '{NOME_RESPONSAVEL}',
    x: 60, y: 86, width: 33,
    fontSize: 9, bold: false, align: 'center',
    color: '#374151', visible: true,
    isSignature: true,
  },
  {
    id: 'CARGO_RESPONSAVEL',
    label: 'Cargo do Responsável',
    variable: '{CARGO_RESPONSAVEL}',
    x: 60, y: 93, width: 33,
    fontSize: 8, bold: false, align: 'center',
    color: '#6B7280', visible: true,
  },
];

export const DEFAULT_LAYOUT: CertificateLayout = {
  backgroundImage: null,
  fields: DEFAULT_FIELDS,
};
