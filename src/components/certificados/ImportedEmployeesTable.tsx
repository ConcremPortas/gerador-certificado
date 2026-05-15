import { type ReactNode } from 'react';
import type { CertificateEmployee } from '../../types/certificados';

interface Props {
  employees: CertificateEmployee[];
}

export function ImportedEmployeesTable({ employees }: Props) {
  if (employees.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-card border border-border p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
          <TableIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground text-sm font-semibold">Nenhum funcionário importado</p>
        <p className="text-muted-foreground text-xs mt-1">
          Faça upload de uma planilha para visualizar os dados aqui.
        </p>
      </div>
    );
  }

  const validCount = employees.filter((e) => e.isValid).length;
  const invalidCount = employees.filter((e) => !e.isValid).length;

  return (
    <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden hover:shadow-card-hover transition-all duration-200">
      {/* Summary cards */}
      <div className="grid grid-cols-3 border-b border-border bg-muted/10">
        <SummaryCard
          label="Total"
          value={employees.length}
          variant="neutral"
          icon={<UsersIcon className="w-4 h-4" />}
        />
        <SummaryCard
          label="Válidos"
          value={validCount}
          variant="success"
          icon={<CheckCircleIcon className="w-4 h-4" />}
        />
        <SummaryCard
          label="Com erro"
          value={invalidCount}
          variant="danger"
          icon={<XCircleIcon className="w-4 h-4" />}
        />
      </div>

      {/* Error alert */}
      {invalidCount > 0 && (
        <div className="mx-4 mt-4 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
          <WarningIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Corrija os erros na planilha antes de gerar os certificados.</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14">
                Nº
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                CPF
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Erros
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className={
                  emp.isValid
                    ? 'hover:bg-muted/30 transition-colors duration-150'
                    : 'bg-red-50/60 border-l-2 border-red-400 hover:bg-red-50 transition-colors duration-150'
                }
              >
                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums font-mono">
                  {emp.rowNumber}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {emp.name || <EmptyCell />}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {emp.cpf || <EmptyCell />}
                </td>
                <td className="px-4 py-3">
                  {emp.isValid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 whitespace-nowrap">
                      ✓ Válido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
                      ✕ Erro
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-red-600 max-w-xs">
                  {emp.errors.length > 0 && (
                    <ul className="space-y-0.5">
                      {emp.errors.map((err, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="mt-1 w-1 h-1 bg-red-400 rounded-full shrink-0" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {employees.length} registro{employees.length !== 1 ? 's' : ''} importado{employees.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

/* ── Summary card ────────────────────────────────────────────────────────── */

function SummaryCard({
  label, value, variant, icon,
}: {
  label: string;
  value: number;
  variant: 'neutral' | 'success' | 'danger';
  icon: ReactNode;
}) {
  const styles = {
    neutral: {
      value: 'text-foreground',
      icon: 'bg-muted text-muted-foreground',
      border: undefined,
    },
    success: {
      value: 'text-secondary',
      icon: 'bg-secondary/10 text-secondary',
      border: '3px solid hsl(var(--secondary))',
    },
    danger: {
      value: value > 0 ? 'text-red-600' : 'text-muted-foreground',
      icon: value > 0 ? 'bg-red-50 text-red-500' : 'bg-muted text-muted-foreground',
      border: value > 0 ? '3px solid hsl(var(--status-danger))' : undefined,
    },
  }[variant];

  return (
    <div
      className={[
        'px-4 py-4 text-center flex flex-col items-center gap-2',
        variant !== 'neutral' ? 'border-r-0' : 'border-r border-border',
      ].join(' ')}
      style={styles.border ? { borderLeft: styles.border } : undefined}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}>
        {icon}
      </div>
      <div>
        <div className={`text-xl font-bold tabular-nums leading-none ${styles.value}`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{label}</div>
      </div>
    </div>
  );
}

function EmptyCell() {
  return <span className="text-muted-foreground/40 text-xs">—</span>;
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function TableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}
