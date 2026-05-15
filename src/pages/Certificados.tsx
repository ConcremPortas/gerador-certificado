import { useEffect, useState, type ReactNode } from 'react';

import { CertificateForm, DEFAULT_CERTIFICATE_TEXT } from '../components/certificados/CertificateForm';
import { CertificateUpload } from '../components/certificados/CertificateUpload';
import { ImportedEmployeesTable } from '../components/certificados/ImportedEmployeesTable';
import { CertificateLayoutEditor } from '../components/certificados/CertificateLayoutEditor';

import { generateCertificatesPdf } from '../lib/certificados/generateCertificatesPdf';
import { DEFAULT_LAYOUT } from '../lib/certificados/defaultLayout';

import type {
  CertificateConfig,
  CertificateEmployee,
  CertificateLayout,
  SpreadsheetImportResult,
} from '../types/certificados';

const LS_LAYOUT_KEY = 'gerador-certificados:layout';

const INITIAL_CONFIG: CertificateConfig = {
  courseName: '',
  workload: '',
  courseDate: '',
  issueDate: '',
  location: '',
  companyName: '',
  responsibleName: '',
  responsibleRole: '',
  certificateText: DEFAULT_CERTIFICATE_TEXT,
};

function loadLayout(): CertificateLayout {
  try {
    const raw = localStorage.getItem(LS_LAYOUT_KEY);
    if (raw) return JSON.parse(raw) as CertificateLayout;
  } catch {
    /* ignore */
  }
  return DEFAULT_LAYOUT;
}

export function Certificados() {
  const [config, setConfig] = useState<CertificateConfig>(INITIAL_CONFIG);
  const [employees, setEmployees] = useState<CertificateEmployee[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [layout, setLayout] = useState<CertificateLayout>(loadLayout);

  const validEmployees = employees.filter((e) => e.isValid);
  const invalidEmployees = employees.filter((e) => !e.isValid);
  const canGenerate = validEmployees.length > 0 && invalidEmployees.length === 0;
  const firstValidEmployee = validEmployees[0] ?? null;

  useEffect(() => {
    try {
      localStorage.setItem(LS_LAYOUT_KEY, JSON.stringify(layout));
    } catch {
      /* QuotaExceededError — skip silently */
    }
  }, [layout]);

  function handleImport(result: SpreadsheetImportResult) {
    setEmployees(result.employees);
  }

  function handleGenerate() {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    try {
      generateCertificatesPdf(config, validEmployees, layout);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleClear() {
    setEmployees([]);
    setUploadKey((k) => k + 1);
  }

  const statusParts: string[] = [];
  if (validEmployees.length > 0)
    statusParts.push(`${validEmployees.length} válido${validEmployees.length !== 1 ? 's' : ''}`);
  if (invalidEmployees.length > 0)
    statusParts.push(`${invalidEmployees.length} com erro`);

  const statusText =
    employees.length === 0
      ? 'Nenhum funcionário importado'
      : statusParts.join(' · ') || 'Planilha carregada';

  return (
    <div style={{ paddingBottom: 72 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 40px 0' }}>

        {/* ── Page header ── */}
        <div
          style={{
            background: '#0a2a0f',
            borderRadius: 16,
            padding: '28px 32px',
            borderLeft: '4px solid #B8960C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              Gerador de Certificados
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
              Importe uma planilha e gere certificados em lote prontos para impressão
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { icon: <PdfIcon />, label: 'PDF em lote' },
              { icon: <UsersIcon />, label: 'Por funcionário' },
              { icon: <PrinterIcon />, label: 'Pronto para impressão' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {icon}
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section number={1} title="Dados do curso">
            <CertificateForm config={config} onChange={setConfig} />
          </Section>

          <Section number={2} title="Layout do certificado">
            <CertificateLayoutEditor
              layout={layout}
              onChange={setLayout}
              config={config}
              previewEmployee={firstValidEmployee}
            />
          </Section>

          <Section number={3} title="Importar funcionários">
            <CertificateUpload key={uploadKey} onImport={handleImport} />
          </Section>

          {employees.length > 0 && (
            <Section number={4} title="Conferência dos dados">
              <ImportedEmployeesTable employees={employees} />
            </Section>
          )}
        </div>
      </div>

      {/* ── Fixed action bar ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-20 flex items-center gap-3"
        style={{
          height: 56,
          background: '#0a2a0f',
          borderTop: '2px solid #B8960C',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.15)',
          padding: '0 40px',
        }}
      >
        {/* Status */}
        <span
          className="flex items-center gap-2 flex-1 min-w-0 truncate"
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}
        >
          <InfoIcon />
          {statusText}
        </span>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {employees.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="transition-all duration-150"
              style={{
                background: 'transparent',
                border: '0.5px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.5)',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 12,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              }}
            >
              Limpar dados
            </button>
          )}

          {invalidEmployees.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,100,100,0.8)', maxWidth: 240 }}>
              Corrija os erros antes de gerar.
            </span>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="inline-flex items-center gap-2 transition-all duration-150"
            style={{
              background: '#D4AF37',
              color: '#0a2a0f',
              fontWeight: 800,
              fontSize: 13,
              borderRadius: 9,
              padding: '10px 24px',
              border: 'none',
              boxShadow: canGenerate ? '0 2px 8px rgba(212,175,55,0.35)' : 'none',
              opacity: !canGenerate || isGenerating ? 0.35 : 1,
              cursor: !canGenerate || isGenerating ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating ? (
              <>
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                Gerando…
              </>
            ) : (
              <>
                <PdfIcon />
                {validEmployees.length > 0
                  ? `Gerar ${validEmployees.length} certificado${validEmployees.length !== 1 ? 's' : ''}`
                  : 'Gerar certificados'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#0a2a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: '#D4AF37' }}>{number}</span>
        </span>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#0a2a0f',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to right, #e2e8e2, transparent)',
          }}
        />
      </div>
      {children}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function PrinterIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.25)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
