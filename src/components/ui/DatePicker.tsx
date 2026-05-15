import { useEffect, useMemo, useRef, useState } from 'react';

// ── types ─────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value: string;              // ISO yyyy-mm-dd or ''
  onChange: (iso: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minDate?: string;           // ISO
  maxDate?: string;           // ISO
  className?: string;
}

// ── constants ─────────────────────────────────────────────────────────────

const WEEK_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ── helpers ───────────────────────────────────────────────────────────────

function parseISO(iso?: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatBR(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];
  for (let i = firstDow - 1; i >= 0; i--) days.push(new Date(year, month, -i));
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  for (let d = 1; days.length < 42; d++) days.push(new Date(year, month + 1, d));
  return days;
}

// ── component ─────────────────────────────────────────────────────────────

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  label,
  required,
  minDate,
  maxDate,
  className = '',
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const selectedDate = useMemo(() => parseISO(value), [value]);
  const minParsed = useMemo(() => parseISO(minDate), [minDate]);
  const maxParsed = useMemo(() => parseISO(maxDate), [maxDate]);

  const [navYear, setNavYear] = useState(
    () => selectedDate?.getFullYear() ?? today.getFullYear(),
  );
  const [navMonth, setNavMonth] = useState(
    () => selectedDate?.getMonth() ?? today.getMonth(),
  );

  useEffect(() => {
    if (selectedDate) {
      setNavYear(selectedDate.getFullYear());
      setNavMonth(selectedDate.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => getCalendarDays(navYear, navMonth), [navYear, navMonth]);

  function openCalendar() {
    if (isOpen) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 370);
    }
    setIsOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsVisible(true)));
  }

  function closeCalendar() {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 180);
  }

  function toggleCalendar() {
    if (isOpen) closeCalendar();
    else openCalendar();
  }

  useEffect(() => {
    if (!isOpen) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) closeCalendar();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCalendar();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  function isDisabled(date: Date): boolean {
    if (minParsed && date < minParsed && !sameDay(date, minParsed)) return true;
    if (maxParsed && date > maxParsed && !sameDay(date, maxParsed)) return true;
    return false;
  }

  function handleSelect(date: Date) {
    onChange(toISO(date));
    setTimeout(closeCalendar, 100);
  }

  function handleToday() {
    if (!isDisabled(today)) {
      onChange(toISO(today));
      setNavYear(today.getFullYear());
      setNavMonth(today.getMonth());
      setTimeout(closeCalendar, 100);
    }
  }

  function handleClear() {
    onChange('');
    closeCalendar();
  }

  function prevMonth() {
    if (navMonth === 0) { setNavMonth(11); setNavYear((y) => y - 1); }
    else setNavMonth((m) => m - 1);
  }

  function nextMonth() {
    if (navMonth === 11) { setNavMonth(0); setNavYear((y) => y + 1); }
    else setNavMonth((m) => m + 1);
  }

  const displayValue = selectedDate ? formatBR(selectedDate) : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-foreground block mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleCalendar}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCalendar(); }
        }}
        className={[
          'flex items-center justify-between w-full',
          'border rounded-lg px-3 py-2 text-sm bg-white',
          'cursor-pointer select-none outline-none transition-all duration-150',
          isOpen
            ? 'border-secondary ring-2 ring-accent/30'
            : 'border-border hover:border-secondary/60 focus:border-secondary focus:ring-2 focus:ring-accent/30',
        ].join(' ')}
      >
        <span className={displayValue ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-muted-foreground ml-2 shrink-0 pointer-events-none" />
      </div>

      {/* Calendar */}
      {isOpen && (
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'opacity 180ms ease, transform 180ms ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.12)',
          }}
          className={[
            'absolute z-50 w-72',
            'bg-white border border-border rounded-xl overflow-hidden',
            openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            'left-0',
          ].join(' ')}
        >
          {/* Header — Concrem dark forest green */}
          <div
            className="flex items-center justify-between px-3 py-3"
            style={{ background: 'hsl(var(--primary))' }}
          >
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-md flex items-center justify-center text-base leading-none transition-colors"
              style={{
                color: 'rgba(110,231,183,0.7)',
                border: '1px solid rgba(110,231,183,0.35)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.color = '#6ee7b7';
                el.style.borderColor = '#6ee7b7';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.color = 'rgba(110,231,183,0.7)';
                el.style.borderColor = 'rgba(110,231,183,0.35)';
              }}
            >
              ‹
            </button>

            <span className="font-bold text-sm select-none" style={{ color: '#6ee7b7' }}>
              {MONTH_NAMES[navMonth]} {navYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-md flex items-center justify-center text-base leading-none transition-colors"
              style={{
                color: 'rgba(110,231,183,0.7)',
                border: '1px solid rgba(110,231,183,0.35)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.color = '#6ee7b7';
                el.style.borderColor = '#6ee7b7';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.color = 'rgba(110,231,183,0.7)';
                el.style.borderColor = 'rgba(110,231,183,0.35)';
              }}
            >
              ›
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {WEEK_LABELS.map((d, i) => (
              <div
                key={i}
                className="py-2 text-center font-semibold text-muted-foreground select-none"
                style={{ fontSize: '10px' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 p-2 gap-y-0.5">
            {days.map((day, i) => {
              const isCurrent =
                day.getFullYear() === navYear && day.getMonth() === navMonth;
              const isToday = sameDay(day, today);
              const isSel = selectedDate !== null && sameDay(day, selectedDate);
              const disabled = isDisabled(day);

              if (!isCurrent) {
                return (
                  <div
                    key={i}
                    className="aspect-square w-full flex items-center justify-center text-xs"
                    style={{ color: 'hsl(var(--muted-foreground) / 0.35)' }}
                  >
                    {day.getDate()}
                  </div>
                );
              }

              if (disabled) {
                return (
                  <div
                    key={i}
                    className="aspect-square w-full flex items-center justify-center text-xs line-through cursor-not-allowed"
                    style={{ color: 'hsl(var(--muted-foreground) / 0.3)' }}
                  >
                    {day.getDate()}
                  </div>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={[
                    'aspect-square w-full flex items-center justify-center rounded-md text-xs transition-colors duration-100 cursor-pointer font-medium',
                    isSel
                      ? 'font-bold shadow-sm'
                      : isToday
                        ? 'font-bold hover:opacity-80'
                        : 'text-foreground hover:bg-secondary/10 hover:text-secondary',
                  ].join(' ')}
                  style={
                    isSel
                      ? { background: 'hsl(var(--primary))', color: '#6ee7b7' }
                      : isToday
                        ? {
                            boxShadow: 'inset 0 0 0 1.5px hsl(var(--secondary))',
                            background: 'hsl(var(--secondary) / 0.08)',
                            color: 'hsl(var(--secondary))',
                          }
                        : undefined
                  }
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-2 pb-2.5 pt-1 border-t border-border">
            <button
              type="button"
              onClick={handleToday}
              className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150"
              style={{
                color: 'hsl(var(--secondary))',
                background: 'hsl(var(--secondary) / 0.08)',
                border: '1px solid hsl(var(--secondary) / 0.2)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'hsl(var(--secondary) / 0.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'hsl(var(--secondary) / 0.08)';
              }}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors duration-150"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <path strokeLinecap="round" d="M3 8h14M7 2v4M13 2v4" />
    </svg>
  );
}
