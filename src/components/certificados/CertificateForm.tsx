import React from 'react';
import type { CertificateConfig } from '../../types/certificados';
import { DatePicker } from '../ui/DatePicker';

export const DEFAULT_CERTIFICATE_TEXT =
  'Certificamos que {NOME_FUNCIONARIO}, portador(a) do CPF {CPF_FUNCIONARIO}, participou do curso de {NOME_CURSO}, com carga horária de {CARGA_HORARIA}, realizado em {DATA_CURSO}, abordando os conteúdos previstos no programa de treinamento.';

const VARIABLES = [
  '{NOME_FUNCIONARIO}', '{CPF_FUNCIONARIO}', '{NOME_CURSO}', '{CARGA_HORARIA}',
  '{DATA_CURSO}', '{LOCAL}', '{EMPRESA}', '{NOME_RESPONSAVEL}',
  '{CARGO_RESPONSAVEL}', '{DATA_EMISSAO}',
];

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 42,
  border: '1.5px solid #e2e8e2',
  borderRadius: 9,
  padding: '0 14px',
  fontSize: 13,
  color: '#0a2a0f',
  background: '#fafafa',
  outline: 'none',
  transition: 'all 0.15s ease',
  boxSizing: 'border-box',
  fontFamily: 'Manrope, sans-serif',
};

const TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #e2e8e2',
  borderRadius: 9,
  padding: '12px 14px',
  fontSize: 13,
  color: '#0a2a0f',
  background: '#fafafa',
  outline: 'none',
  transition: 'all 0.15s ease',
  resize: 'vertical',
  minHeight: 100,
  boxSizing: 'border-box',
  fontFamily: 'Manrope, sans-serif',
  lineHeight: 1.5,
};

interface Props {
  config: CertificateConfig;
  onChange: (config: CertificateConfig) => void;
}

export function CertificateForm({ config, onChange }: Props) {
  function set<K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = '#0a2a0f';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(10,42,15,0.06)';
  }

  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = '#e2e8e2';
    e.target.style.background = '#fafafa';
    e.target.style.boxShadow = 'none';
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '0.5px solid #e2e8e2',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '24px 28px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nome do Curso *">
          <input
            type="text"
            value={config.courseName}
            onChange={(e) => set('courseName', e.target.value)}
            placeholder="Ex: NR-35 Trabalho em Altura"
            style={{ ...INPUT_STYLE }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </Field>

        <Field label="Carga Horária *">
          <input
            type="text"
            value={config.workload}
            onChange={(e) => set('workload', e.target.value)}
            placeholder="Ex: 8 horas"
            style={{ ...INPUT_STYLE }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </Field>

        <Field label="Data do Curso *">
          <DatePicker
            value={config.courseDate}
            onChange={(iso) => set('courseDate', iso)}
            placeholder="dd/mm/aaaa"
          />
        </Field>

        <Field label="Data de Emissão *">
          <DatePicker
            value={config.issueDate}
            onChange={(iso) => set('issueDate', iso)}
            placeholder="dd/mm/aaaa"
          />
        </Field>

        <Field label="Local *">
          <input
            type="text"
            value={config.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Ex: São Paulo, SP"
            style={{ ...INPUT_STYLE }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </Field>

        <Field label="Empresa">
          <input
            type="text"
            value={config.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            placeholder="Ex: Concrem Engenharia"
            style={{ ...INPUT_STYLE }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </Field>

        <Field label="Nome do Responsável">
          <input
            type="text"
            value={config.responsibleName}
            onChange={(e) => set('responsibleName', e.target.value)}
            placeholder="Ex: João Silva"
            style={{ ...INPUT_STYLE }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </Field>

        <Field label="Cargo do Responsável">
          <input
            type="text"
            value={config.responsibleRole}
            onChange={(e) => set('responsibleRole', e.target.value)}
            placeholder="Ex: Técnico de Segurança do Trabalho"
            style={{ ...INPUT_STYLE }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </Field>
      </div>

      {/* Texto base — full width */}
      <div style={{ marginTop: 16 }}>
        <Field label="Texto Base do Certificado *">
          <textarea
            value={config.certificateText}
            onChange={(e) => set('certificateText', e.target.value)}
            style={{ ...TEXTAREA_STYLE }}
            placeholder={DEFAULT_CERTIFICATE_TEXT}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#888', marginRight: 2 }}>Variáveis disponíveis:</span>
            {VARIABLES.map((v) => (
              <span
                key={v}
                style={{
                  background: '#f0f4f0',
                  border: '0.5px solid #d8e4d8',
                  borderRadius: 5,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#2a5a2a',
                  fontFamily: 'monospace',
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#0a2a0f',
          marginBottom: 6,
          display: 'block',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
