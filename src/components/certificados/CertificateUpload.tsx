import React, { useRef, useState } from 'react';
import type { SpreadsheetImportResult } from '../../types/certificados';
import { parseCertificateSpreadsheet } from '../../lib/certificados/parseCertificateSpreadsheet';
import { validateCertificateEmployees } from '../../lib/certificados/validateCertificateEmployees';
import { downloadSpreadsheetTemplate } from '../../lib/certificados/downloadSpreadsheetTemplate';

interface Props {
  onImport: (result: SpreadsheetImportResult) => void;
}

const EMPTY_RESULT: SpreadsheetImportResult = {
  employees: [],
  validCount: 0,
  invalidCount: 0,
  errors: [],
};

export function CertificateUpload({ onImport }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(f: File) {
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setError('Formato inválido. Envie um arquivo .xlsx ou .xls.');
      return;
    }

    setFile(f);
    setIsLoading(true);
    setError(null);
    setImportedCount(null);

    try {
      const parsed = await parseCertificateSpreadsheet(f);

      if (parsed.errors.length > 0 && parsed.employees.length === 0) {
        setError(parsed.errors.join(' '));
        setIsLoading(false);
        return;
      }

      const validated = validateCertificateEmployees(parsed.employees);
      const validCount = validated.filter((e) => e.isValid).length;
      const invalidCount = validated.filter((e) => !e.isValid).length;

      const result: SpreadsheetImportResult = {
        employees: validated,
        validCount,
        invalidCount,
        errors: parsed.errors,
      };

      setImportedCount(validated.length);
      onImport(result);
    } catch {
      setError('Erro ao processar o arquivo. Verifique se ele não está corrompido.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function reset() {
    setFile(null);
    setError(null);
    setImportedCount(null);
    if (inputRef.current) inputRef.current.value = '';
    onImport(EMPTY_RESULT);
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '0.5px solid #e2e8e2',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* ── Template download bar ── */}
      <div
        style={{
          background: '#fffbf0',
          border: 'none',
          borderBottom: '0.5px solid #f0e0a0',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TableIcon />
          <span style={{ fontSize: 12, color: '#666' }}>
            Use o modelo abaixo para preencher os dados corretamente.
          </span>
        </div>
        <button
          type="button"
          onClick={downloadSpreadsheetTemplate}
          style={{
            background: '#0a2a0f',
            color: '#fff',
            borderRadius: 7,
            padding: '6px 16px',
            fontSize: 11,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <DownloadIcon />
          Baixar modelo
        </button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* ── Drop zone ── */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: isDragging ? '2px dashed #0a2a0f' : '2px dashed #d0dcd0',
              borderRadius: 12,
              background: isDragging ? '#f0f5f0' : '#fafafa',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <UploadCloudIcon />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0a2a0f', margin: '0 0 4px' }}>
              Arraste sua planilha aqui ou{' '}
              <span style={{ color: '#B8960C', fontWeight: 700 }}>clique para selecionar</span>
            </p>
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>Aceita .xlsx e .xls</p>
          </div>
        ) : (
          /* ── File loaded ── */
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #e2e8e2',
              background: '#fafafa',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: 'rgba(10,42,15,0.06)',
                border: '1px solid rgba(10,42,15,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SpreadsheetIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0a2a0f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </p>
              {importedCount !== null && (
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>
                  {importedCount} linha{importedCount !== 1 ? 's' : ''} encontrada{importedCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              title="Remover arquivo"
              style={{
                flexShrink: 0,
                padding: 6,
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#aaa',
                transition: 'all 0.15s ease',
                display: 'flex',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#aaa';
              }}
            >
              <TrashIcon />
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0', fontSize: 13, color: '#888' }}>
            <SpinnerIcon />
            Processando arquivo…
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 13,
              color: '#b91c1c',
            }}
          >
            <AlertCircleIcon />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────

function UploadCloudIcon() {
  return (
    <svg style={{ width: 36, height: 36, color: '#b0c4b0' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.551 11.095" />
    </svg>
  );
}

function SpreadsheetIcon() {
  return (
    <svg style={{ width: 20, height: 20, color: '#0a2a0f' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg style={{ width: 16, height: 16, color: '#B8960C', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-15a1.125 1.125 0 011.125-1.125h15.75c.621 0 1.125.504 1.125 1.125v15a1.125 1.125 0 01-1.125 1.125M13.5 6.75h3.75M13.5 10.5h3.75M13.5 14.25h3.75M6.75 6.75h.75M6.75 10.5h.75M6.75 14.25h.75" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg style={{ width: 14, height: 14 }} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg style={{ width: 16, height: 16 }} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
