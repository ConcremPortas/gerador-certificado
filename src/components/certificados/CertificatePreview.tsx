import type { CertificateConfig, CertificateEmployee } from '../../types/certificados';

interface Props {
  config: CertificateConfig;
  employee: CertificateEmployee | null;
}

const PLACEHOLDER: CertificateEmployee = {
  id: 'preview',
  rowNumber: 0,
  name: 'NOME DO FUNCIONÁRIO',
  cpf: '000.000.000-00',
  rawCpf: '00000000000',
  isValid: true,
  errors: [],
};

function substitute(text: string, emp: CertificateEmployee, cfg: CertificateConfig): string {
  return text
    .replace(/\{NOME_FUNCIONARIO\}/g, emp.name)
    .replace(/\{CPF_FUNCIONARIO\}/g, emp.cpf)
    .replace(/\{NOME_CURSO\}/g, cfg.courseName || '{NOME_CURSO}')
    .replace(/\{CARGA_HORARIA\}/g, cfg.workload || '{CARGA_HORARIA}')
    .replace(/\{DATA_CURSO\}/g, cfg.courseDate || '{DATA_CURSO}')
    .replace(/\{LOCAL\}/g, cfg.location || '{LOCAL}')
    .replace(/\{EMPRESA\}/g, cfg.companyName || '{EMPRESA}')
    .replace(/\{NOME_RESPONSAVEL\}/g, cfg.responsibleName || '{NOME_RESPONSAVEL}')
    .replace(/\{CARGO_RESPONSAVEL\}/g, cfg.responsibleRole || '{CARGO_RESPONSAVEL}')
    .replace(/\{DATA_EMISSAO\}/g, cfg.issueDate || '{DATA_EMISSAO}');
}

export function CertificatePreview({ config, employee }: Props) {
  const emp = employee ?? PLACEHOLDER;
  const isPlaceholder = employee === null;

  const bodyText = config.certificateText
    ? substitute(config.certificateText, emp, config)
    : substitute(
        'Certificamos que {NOME_FUNCIONARIO}, portador(a) do CPF {CPF_FUNCIONARIO}, participou do curso de {NOME_CURSO}, com carga horária de {CARGA_HORARIA}, realizado em {DATA_CURSO}, abordando os conteúdos previstos no programa de treinamento.',
        emp,
        config,
      );

  const hasResponsible = !!(config.responsibleName?.trim());
  const locationDate =
    [config.location, config.issueDate].filter(Boolean).join(', ') || '{LOCAL}, {DATA_EMISSAO}';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Paper background — gives depth to the floating certificate */}
      <div className="bg-gray-100 rounded-lg p-4">
        {/* A4 landscape paper — aspect ratio 297:210 */}
        <div
          className="relative mx-auto w-full overflow-hidden"
          style={{
            aspectRatio: '297 / 210',
            maxWidth: '800px',
            background: '#fffef8',
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10)',
          }}
        >
          {/* Outer decorative border */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: '8px', border: '2px solid #b8963e' }}
          />
          {/* Inner thin accent line */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: '13px', border: '1px solid #d4ab5a', opacity: 0.45 }}
          />

          {/* Certificate content */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between text-center"
            style={{ padding: '6% 9% 5.5% 9%' }}
          >
            {/* Header block */}
            <div className="w-full space-y-[1.5%]">
              {/* Title */}
              <h1
                className="font-serif font-black tracking-[0.3em] uppercase leading-none text-gray-900"
                style={{ fontSize: 'clamp(13px, 3.6vw, 32px)' }}
              >
                CERTIFICADO
              </h1>

              {/* Ornamental divider */}
              <div className="flex items-center justify-center gap-[1.5%] w-full">
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #b8963e)' }} />
                <div style={{ width: 'clamp(4px, 0.6vw, 6px)', height: 'clamp(4px, 0.6vw, 6px)', background: '#b8963e', borderRadius: '50%' }} />
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #b8963e)' }} />
              </div>

              {/* "Certificamos que" */}
              <p
                className="text-gray-500 tracking-widest uppercase"
                style={{ fontSize: 'clamp(5px, 1vw, 9px)', letterSpacing: '0.15em' }}
              >
                Certificamos que
              </p>

              {/* Employee name — the focal point */}
              <p
                className="font-serif font-bold text-gray-900 leading-tight"
                style={{ fontSize: 'clamp(11px, 2.4vw, 22px)' }}
              >
                {emp.name}
              </p>
            </div>

            {/* Body text */}
            <p
              className="text-gray-600 leading-relaxed text-justify w-full"
              style={{ fontSize: 'clamp(6px, 1vw, 9.5px)' }}
            >
              {bodyText}
            </p>

            {/* Footer block */}
            <div className="w-full space-y-[3%]">
              {/* Location / date */}
              <p
                className="text-gray-500 italic"
                style={{ fontSize: 'clamp(5.5px, 0.9vw, 8.5px)' }}
              >
                {locationDate}
              </p>

              {/* Signature lines */}
              <div
                className={`flex w-full ${hasResponsible ? 'justify-around' : 'justify-center'}`}
              >
                <SignatureLine name={emp.name} subtitle={emp.cpf} />
                {hasResponsible && (
                  <SignatureLine
                    name={config.responsibleName}
                    subtitle={config.responsibleRole || undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPlaceholder && (
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Prévia com dados fictícios — importe uma planilha e selecione um funcionário para ver o certificado real.
        </p>
      )}
    </div>
  );
}

function SignatureLine({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-[2px]"
      style={{ minWidth: '28%', maxWidth: '40%' }}
    >
      <div
        className="w-full"
        style={{ height: '1px', background: 'linear-gradient(to right, transparent, #6b7280 20%, #6b7280 80%, transparent)' }}
      />
      <span
        className="font-semibold text-gray-800 leading-snug text-center"
        style={{ fontSize: 'clamp(5px, 0.85vw, 8px)' }}
      >
        {name}
      </span>
      {subtitle && (
        <span
          className="text-gray-400 leading-snug text-center"
          style={{ fontSize: 'clamp(4px, 0.72vw, 7px)' }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
