import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable, { type DraggableData } from 'react-draggable';
import type {
  CertificateConfig,
  CertificateEmployee,
  CertificateLayout,
  FieldLayout,
} from '../../types/certificados';
import { DEFAULT_LAYOUT } from '../../lib/certificados/defaultLayout';
import { DEFAULT_CERTIFICATE_TEXT } from './CertificateForm';

// ── constants ─────────────────────────────────────────────────────────────

const A4_W_PX = 842;

const PLACEHOLDER: CertificateEmployee = {
  id: 'preview', rowNumber: 0,
  name: 'João da Silva', cpf: '123.456.789-00',
  rawCpf: '12345678900', isValid: true, errors: [],
};

const VARIABLE_OPTIONS = [
  { value: '', label: '— Texto fixo —' },
  { value: '{NOME_FUNCIONARIO}', label: 'Nome do Funcionário' },
  { value: '{CPF_FUNCIONARIO}', label: 'CPF do Funcionário' },
  { value: '{NOME_CURSO}', label: 'Nome do Curso' },
  { value: '{CARGA_HORARIA}', label: 'Carga Horária' },
  { value: '{DATA_CURSO}', label: 'Data do Curso' },
  { value: '{LOCAL}', label: 'Local' },
  { value: '{DATA_EMISSAO}', label: 'Data de Emissão' },
  { value: '{EMPRESA}', label: 'Empresa' },
  { value: '{NOME_RESPONSAVEL}', label: 'Nome do Responsável' },
  { value: '{CARGO_RESPONSAVEL}', label: 'Cargo do Responsável' },
  { value: '{CERTIFICATE_TEXT}', label: 'Texto completo do certificado' },
];

// ── helpers ───────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function substituteAll(source: string, emp: CertificateEmployee, cfg: CertificateConfig): string {
  return source
    .replace(/\{NOME_FUNCIONARIO\}/g, emp.name)
    .replace(/\{CPF_FUNCIONARIO\}/g, emp.cpf)
    .replace(/\{NOME_CURSO\}/g, cfg.courseName || '{NOME_CURSO}')
    .replace(/\{CARGA_HORARIA\}/g, cfg.workload || '{CARGA_HORARIA}')
    .replace(/\{DATA_CURSO\}/g, cfg.courseDate || '{DATA_CURSO}')
    .replace(/\{LOCAL\}/g, cfg.location || '{LOCAL}')
    .replace(/\{DATA_EMISSAO\}/g, cfg.issueDate || '{DATA_EMISSAO}')
    .replace(/\{EMPRESA\}/g, cfg.companyName || '{EMPRESA}')
    .replace(/\{NOME_RESPONSAVEL\}/g, cfg.responsibleName || '{NOME_RESPONSAVEL}')
    .replace(/\{CARGO_RESPONSAVEL\}/g, cfg.responsibleRole || '{CARGO_RESPONSAVEL}');
}

function getDisplayValue(field: FieldLayout, emp: CertificateEmployee, cfg: CertificateConfig): string {
  if (field.variable?.includes('{')) {
    const src = field.variable === '{CERTIFICATE_TEXT}'
      ? cfg.certificateText || DEFAULT_CERTIFICATE_TEXT
      : field.variable;
    return substituteAll(src, emp, cfg);
  }
  return field.text ?? field.variable ?? '';
}

function isVariableBound(field: FieldLayout) {
  return field.variable?.includes('{');
}

// ── resize handler factory ────────────────────────────────────────────────

type ResizeDir = 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

function startResize(
  e: React.MouseEvent,
  dir: ResizeDir,
  field: FieldLayout,
  canvasW: number,
  onUpdate: (c: Partial<FieldLayout>) => void,
) {
  e.stopPropagation();
  e.preventDefault();
  const startX = e.clientX;
  const origX = field.x;
  const origW = field.width;
  const isLeft = dir === 'w' || dir === 'nw' || dir === 'sw';

  function onMove(ev: MouseEvent) {
    const deltaPct = ((ev.clientX - startX) / canvasW) * 100;
    if (isLeft) {
      const newX = clamp(origX + deltaPct, 0, origX + origW - 4);
      onUpdate({ x: newX, width: origW + (origX - newX) });
    } else {
      onUpdate({ width: clamp(origW + deltaPct, 4, 100 - origX) });
    }
  }

  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

// ── FieldBox ──────────────────────────────────────────────────────────────

interface FieldBoxProps {
  field: FieldLayout;
  canvasSize: { w: number; h: number };
  isSelected: boolean;
  isEditing: boolean;
  editText: string;
  displayValue: string;
  fontScale: number;
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdate: (changes: Partial<FieldLayout>) => void;
  onEditChange: (t: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
}

const HANDLES: { dir: ResizeDir; style: React.CSSProperties }[] = [
  { dir: 'nw', style: { top: -4,    left: -4 } },
  { dir: 'ne', style: { top: -4,    right: -4 } },
  { dir: 'w',  style: { top: '50%', left: -4,  transform: 'translateY(-50%)' } },
  { dir: 'e',  style: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
  { dir: 'sw', style: { bottom: -4, left: -4 } },
  { dir: 'se', style: { bottom: -4, right: -4 } },
];

function FieldBox({
  field, canvasSize, isSelected, isEditing, editText, displayValue, fontScale,
  onSelect, onDoubleClick, onUpdate, onEditChange, onCommitEdit, onCancelEdit,
}: FieldBoxProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const px = (field.x / 100) * canvasSize.w;
  const py = (field.y / 100) * canvasSize.h;
  const pw = (field.width / 100) * canvasSize.w;
  const pxFont = Math.max(4, field.fontSize * fontScale);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  const textStyle: React.CSSProperties = {
    fontSize: `${pxFont}px`,
    fontWeight: field.bold ? 'bold' : 'normal',
    fontStyle: field.italic ? 'italic' : 'normal',
    textAlign: field.align,
    color: field.color,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.3,
    width: '100%',
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: px, y: py }}
      disabled={isEditing}
      onStart={onSelect}
      onStop={(_: unknown, data: DraggableData) => {
        onUpdate({
          x: clamp((data.x / canvasSize.w) * 100, 0, 100 - field.width),
          y: clamp((data.y / canvasSize.h) * 100, 0, 96),
        });
      }}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: `${pw}px`,
          cursor: isEditing ? 'text' : 'move',
          userSelect: 'none',
          zIndex: field.zIndex ?? 0,
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      >
        {isSelected && !isEditing && (
          <div style={{
            position: 'absolute', inset: -2,
            border: '1.5px dashed #1a5c2a', borderRadius: 2,
            pointerEvents: 'none', zIndex: 1,
          }} />
        )}

        {field.isSignature && (
          <div style={{
            borderTop: `${Math.max(0.5, fontScale)}px solid ${field.color}`,
            marginBottom: Math.max(1, 2 * fontScale),
          }} />
        )}

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onCommitEdit(); }
              if (e.key === 'Escape') onCancelEdit();
            }}
            rows={2}
            style={{
              ...textStyle,
              background: 'rgba(255,255,255,0.85)',
              border: '2px solid #3b82f6',
              borderRadius: 2,
              outline: 'none',
              resize: 'none',
              padding: '2px',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <div style={textStyle}>{displayValue}</div>
        )}

        {isSelected && !isEditing && HANDLES.map(({ dir, style }) => (
          <div
            key={dir}
            style={{
              position: 'absolute', width: 8, height: 8,
              background: '#1a5c2a', border: '2px solid #fff',
              borderRadius: 2, zIndex: 2,
              cursor: `${dir}-resize`,
              ...style,
            }}
            onMouseDown={(e) => startResize(e, dir, field, canvasSize.w, onUpdate)}
          />
        ))}
      </div>
    </Draggable>
  );
}

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  layout: CertificateLayout;
  onChange: (layout: CertificateLayout) => void;
  config: CertificateConfig;
  previewEmployee: CertificateEmployee | null;
}

export function CertificateLayoutEditor({ layout, onChange, config, previewEmployee }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const emp = previewEmployee ?? PLACEHOLDER;
  const fontScale = canvasSize.w > 0 ? canvasSize.w / A4_W_PX : 1;
  const selectedField = layout.fields.find((f) => f.id === selectedId) ?? null;

  const sortedFields = [...layout.fields]
    .filter((f) => f.visible)
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  const maxZ = layout.fields.reduce((m, f) => Math.max(m, f.zIndex ?? 0), 0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setCanvasSize({ w: r.width, h: r.height });
    });
    obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId || editingId) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteField(selectedId);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, layout.fields.length]);

  // ── field operations ─────────────────────────────────────────────────

  const updateField = useCallback((id: string, changes: Partial<FieldLayout>) => {
    onChange({
      ...layout,
      fields: layout.fields.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    });
  }, [layout, onChange]);

  function addField() {
    const newField: FieldLayout = {
      id: crypto.randomUUID(),
      label: 'Novo texto',
      variable: '',
      text: 'Novo texto',
      x: 35, y: 45, width: 30,
      fontSize: 12, bold: false, italic: false,
      align: 'center', color: '#111827',
      visible: true, zIndex: maxZ + 1,
    };
    onChange({ ...layout, fields: [...layout.fields, newField] });
    setSelectedId(newField.id);
  }

  function deleteField(id: string) {
    if (layout.fields.length <= 1) return;
    onChange({ ...layout, fields: layout.fields.filter((f) => f.id !== id) });
    setSelectedId(null);
    setEditingId(null);
  }

  function duplicateField(id: string) {
    const src = layout.fields.find((f) => f.id === id);
    if (!src) return;
    const copy: FieldLayout = {
      ...src,
      id: crypto.randomUUID(),
      label: src.label + ' (cópia)',
      x: clamp(src.x + 3, 0, 100 - src.width),
      y: clamp(src.y + 3, 0, 95),
      zIndex: maxZ + 1,
    };
    onChange({ ...layout, fields: [...layout.fields, copy] });
    setSelectedId(copy.id);
  }

  function bringForward(id: string) {
    updateField(id, { zIndex: maxZ + 1 });
  }

  function sendBackward(id: string) {
    const minZ = layout.fields.reduce((m, f) => Math.min(m, f.zIndex ?? 0), 0);
    updateField(id, { zIndex: minZ - 1 });
  }

  // ── inline editing ────────────────────────────────────────────────────

  function startInlineEdit(field: FieldLayout) {
    if (isVariableBound(field)) return;
    setEditingId(field.id);
    setEditText(field.text ?? field.variable ?? '');
  }

  function commitInlineEdit() {
    if (!editingId) return;
    const f = layout.fields.find((f) => f.id === editingId);
    if (!f) return;
    updateField(editingId, {
      text: editText,
      variable: '',
      label: editText.substring(0, 25) || f.label,
    });
    setEditingId(null);
  }

  function cancelInlineEdit() {
    setEditingId(null);
  }

  // ── image upload ──────────────────────────────────────────────────────

  function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange({ ...layout, backgroundImage: e.target?.result as string });
    reader.readAsDataURL(file);
  }

  // ── variable / content change in sidebar ─────────────────────────────

  function handleVariableChange(newVar: string) {
    if (!selectedId) return;
    if (newVar === '') {
      updateField(selectedId, { variable: '' });
    } else {
      updateField(selectedId, { variable: newVar });
    }
  }

  function handleTextChange(newText: string) {
    if (!selectedId) return;
    updateField(selectedId, {
      text: newText,
      variable: '',
      label: newText.substring(0, 25) || selectedField?.label || 'Novo texto',
    });
  }

  // ── render ────────────────────────────────────────────────────────────

  const SIDEBAR_INPUT: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8e2',
    borderRadius: 6,
    padding: '5px 8px',
    fontSize: 11,
    color: '#0a2a0f',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    fontFamily: 'Manrope, sans-serif',
  };

  const GROUP_LABEL: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: 8,
    display: 'block',
  };

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
      {/* ── Top bar ── */}
      <div
        style={{
          background: '#fafafa',
          borderBottom: '1px solid #e2e8e2',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InfoCircleIcon />
          <span style={{ fontSize: 11, color: '#666' }}>
            Arraste para mover · Duplo clique para editar · Alças nos cantos para redimensionar
          </span>
        </div>
        <button
          type="button"
          onClick={() => { onChange(DEFAULT_LAYOUT); setSelectedId(null); setEditingId(null); }}
          style={{
            border: '1px solid #0a2a0f',
            color: '#0a2a0f',
            background: 'transparent',
            borderRadius: 7,
            fontSize: 11,
            fontWeight: 600,
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0a2a0f';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#0a2a0f';
          }}
        >
          <ResetIcon /> Resetar posições
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        {/* ── Canvas ── */}
        <div style={{ flex: 1, minWidth: 0, padding: 16, background: '#f4f6f4' }}>
          <div
            ref={canvasRef}
            style={{
              position: 'relative',
              aspectRatio: '297 / 210',
              background: layout.backgroundImage ? 'transparent' : '#fff',
              border: '1px solid #e2e8e2',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              margin: '0 auto',
            }}
            onClick={() => { if (!editingId) setSelectedId(null); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
          >
            {layout.backgroundImage && (
              <img src={layout.backgroundImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', objectFit: 'fill' }} alt="" draggable={false} />
            )}
            {!layout.backgroundImage && canvasSize.w > 0 && (
              <div style={{ position: 'absolute', inset: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', border: '1px dashed #e5e7eb', borderRadius: 6 }}>
                <span style={{ color: '#ccc', fontSize: Math.max(8, 11 * fontScale) }}>Sem imagem de fundo</span>
              </div>
            )}
            {canvasSize.w > 0 && sortedFields.map((field) => (
              <FieldBox
                key={field.id}
                field={field}
                canvasSize={canvasSize}
                isSelected={selectedId === field.id}
                isEditing={editingId === field.id}
                editText={editText}
                displayValue={getDisplayValue(field, emp, config)}
                fontScale={fontScale}
                onSelect={() => setSelectedId(field.id)}
                onDoubleClick={() => startInlineEdit(field)}
                onUpdate={(changes) => updateField(field.id, changes)}
                onEditChange={setEditText}
                onCommitEdit={commitInlineEdit}
                onCancelEdit={cancelInlineEdit}
              />
            ))}
          </div>
          {previewEmployee === null && (
            <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 8 }}>Prévia com dados fictícios</p>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            borderLeft: '1px solid #e2e8e2',
            background: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            maxHeight: 640,
          }}
        >
          {/* Image */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8eee8' }}>
            <span style={GROUP_LABEL}>Imagem de Fundo</span>
            {layout.backgroundImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 48, height: 32, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8e2', flexShrink: 0 }}>
                  <img src={layout.backgroundImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button type="button" onClick={() => imageInputRef.current?.click()} style={{ fontSize: 11, color: '#0a2a0f', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'underline' }}>Trocar</button>
                  <button type="button" onClick={() => onChange({ ...layout, backgroundImage: null })} style={{ fontSize: 11, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'underline' }}>Remover</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                style={{
                  width: '100%',
                  border: '1.5px dashed #c8d8c8',
                  background: '#f4f8f4',
                  color: '#0a2a0f',
                  borderRadius: 8,
                  padding: '8px 0',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0a2a0f';
                  e.currentTarget.style.background = '#edf5ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#c8d8c8';
                  e.currentTarget.style.background = '#f4f8f4';
                }}
              >
                + Importar PNG ou JPG
              </button>
            )}
            <input ref={imageInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }} />
          </div>

          {/* Add field */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8eee8' }}>
            <button
              type="button"
              onClick={addField}
              style={{
                width: '100%',
                border: '1.5px dashed #c8d8c8',
                background: '#f4f8f4',
                color: '#0a2a0f',
                borderRadius: 8,
                padding: '8px 0',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0a2a0f';
                e.currentTarget.style.background = '#edf5ed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#c8d8c8';
                e.currentTarget.style.background = '#f4f8f4';
              }}
            >
              <PlusIcon /> Adicionar campo de texto
            </button>
          </div>

          {/* Field list */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8eee8' }}>
            <span style={GROUP_LABEL}>Campos</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {layout.fields.map((field) => (
                <label
                  key={field.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selectedId === field.id ? 'rgba(10,42,15,0.06)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => setSelectedId(field.id)}
                >
                  <input
                    type="checkbox"
                    checked={field.visible}
                    onChange={(e) => { e.stopPropagation(); updateField(field.id, { visible: e.target.checked }); }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 12, height: 12, flexShrink: 0, accentColor: '#0a2a0f' }}
                  />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: field.color }} />
                  <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: selectedId === field.id ? '#0a2a0f' : '#555' }}>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected field controls */}
          {selectedField ? (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ ...GROUP_LABEL, marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedField.label}
              </span>

              {/* Variable dropdown */}
              <div>
                <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>Variável</label>
                <select
                  value={isVariableBound(selectedField) ? selectedField.variable : ''}
                  onChange={(e) => handleVariableChange(e.target.value)}
                  style={{ ...SIDEBAR_INPUT, cursor: 'pointer' }}
                >
                  {VARIABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Free text content */}
              {!isVariableBound(selectedField) && (
                <div>
                  <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>Conteúdo</label>
                  <textarea
                    value={selectedField.text ?? selectedField.variable ?? ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    rows={2}
                    style={{ ...SIDEBAR_INPUT, resize: 'none', padding: '6px 8px', lineHeight: 1.4 }}
                    placeholder="Digite o texto..."
                  />
                </div>
              )}

              {/* Preview when variable is bound */}
              {isVariableBound(selectedField) && (
                <div style={{ fontSize: 10, color: '#888', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-all' }}>
                  {getDisplayValue(selectedField, emp, config)}
                </div>
              )}

              {/* Font size */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#888' }}>Tamanho</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#0a2a0f' }}>{selectedField.fontSize}pt</span>
                </div>
                <input
                  type="range" min={6} max={72}
                  value={selectedField.fontSize}
                  onChange={(e) => updateField(selectedId!, { fontSize: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#B8960C' }}
                />
              </div>

              {/* Alignment */}
              <div>
                <span style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>Alinhamento</span>
                <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8e2' }}>
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => updateField(selectedId!, { align: a })}
                      style={{
                        flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 500, border: 'none',
                        background: selectedField.align === a ? '#0a2a0f' : '#fff',
                        color: selectedField.align === a ? '#fff' : '#888',
                        cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {a === 'left' ? <AlignLIcon /> : a === 'center' ? <AlignCIcon /> : <AlignRIcon />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bold + Italic */}
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={selectedField.bold} onChange={(e) => updateField(selectedId!, { bold: e.target.checked })} style={{ width: 13, height: 13, accentColor: '#0a2a0f' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0a2a0f' }}>N</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={selectedField.italic ?? false} onChange={(e) => updateField(selectedId!, { italic: e.target.checked })} style={{ width: 13, height: 13, accentColor: '#0a2a0f' }} />
                  <span style={{ fontSize: 12, fontStyle: 'italic', color: '#0a2a0f' }}>I</span>
                </label>
              </div>

              {/* Color */}
              <div>
                <span style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>Cor do texto</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={selectedField.color} onChange={(e) => updateField(selectedId!, { color: e.target.value })} style={{ width: 32, height: 32, borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8e2', padding: 2 }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>{selectedField.color}</span>
                </div>
              </div>

              {/* Z-index */}
              <div>
                <span style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>Camada</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => bringForward(selectedId!)} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, color: '#0a2a0f', background: '#f0f4f0', border: '0.5px solid #d0dcd0', borderRadius: 6, cursor: 'pointer' }}>↑ Frente</button>
                  <button type="button" onClick={() => sendBackward(selectedId!)} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, color: '#0a2a0f', background: '#f0f4f0', border: '0.5px solid #d0dcd0', borderRadius: 6, cursor: 'pointer' }}>↓ Atrás</button>
                </div>
              </div>

              {/* Duplicate */}
              <button
                type="button"
                onClick={() => duplicateField(selectedId!)}
                style={{
                  width: '100%', padding: '6px 0', fontSize: 11, fontWeight: 600,
                  color: '#0a2a0f', background: '#f0f4f0', border: '0.5px solid #d0dcd0',
                  borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 5, transition: 'all 0.15s',
                }}
              >
                <DuplicateIcon /> Duplicar campo
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => deleteField(selectedId!)}
                disabled={layout.fields.length <= 1}
                style={{
                  width: '100%', padding: '6px 0', fontSize: 11, fontWeight: 600,
                  color: '#c0392b', background: '#fff0f0', border: '0.5px solid #f0c0c0',
                  borderRadius: 7, cursor: layout.fields.length <= 1 ? 'not-allowed' : 'pointer',
                  opacity: layout.fields.length <= 1 ? 0.4 : 1, transition: 'all 0.15s',
                }}
              >
                Excluir campo
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
              Clique num campo para editar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────

function InfoCircleIcon() {
  return (
    <svg style={{ width: 14, height: 14, color: '#B8960C', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function ResetIcon() {
  return <svg style={{ width: 13, height: 13 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
}

function PlusIcon() {
  return <svg style={{ width: 13, height: 13 }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
}

function DuplicateIcon() {
  return <svg style={{ width: 13, height: 13 }} viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" /></svg>;
}

function AlignLIcon() {
  return <svg style={{ width: 13, height: 13, margin: '0 auto' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" /></svg>;
}

function AlignCIcon() {
  return <svg style={{ width: 13, height: 13, margin: '0 auto' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm3 5.25a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 10zm-3 4.75a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
}

function AlignRIcon() {
  return <svg style={{ width: 13, height: 13, margin: '0 auto' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm6 5.25a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 018 10zm-6 4.75a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
}
