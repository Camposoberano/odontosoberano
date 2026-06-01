import { forwardRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusDente =
  | 'saudavel' | 'carie' | 'restauracao' | 'obturacao'
  | 'canal' | 'coroa' | 'implante' | 'extraido' | 'ausente' | 'fratura';

export type Superficie = 'V' | 'M' | 'D' | 'L' | 'O';

export interface DadosDenteOdontograma {
  status?: StatusDente;
  superficies?: Partial<Record<Superficie, StatusDente | null>>;
  anotacao?: string;
  finalizado?: boolean;
  procedimentos?: string[];        // compat legado
  destacado?: boolean;             // orçamento: dente selecionado
  procedimento_nome?: string;      // orçamento: nome do procedimento
}

export type OdontogramaDados = Record<string, DadosDenteOdontograma>;

// ─── Constantes ───────────────────────────────────────────────────────────────

export const SUPERIOR = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28] as const;
export const INFERIOR = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38] as const;

const DECIDUOS: Record<number, number> = {
  11:51, 12:52, 13:53, 14:54, 15:55,
  21:61, 22:62, 23:63, 24:64, 25:65,
  31:71, 32:72, 33:73, 34:74, 35:75,
  41:81, 42:82, 43:83, 44:84, 45:85,
};

export const LEGENDA_STATUS: Record<StatusDente, string> = {
  saudavel:'Saudável', carie:'Cárie', restauracao:'Restauração',
  obturacao:'Obturação', canal:'Canal', coroa:'Coroa',
  implante:'Implante', extraido:'Extraído', ausente:'Ausente', fratura:'Fratura',
};

// Ordem de ciclo ao clicar no dente (modo interativo)
const STATUS_CICLO: StatusDente[] = [
  'saudavel','carie','restauracao','obturacao','canal','coroa','implante','extraido','ausente',
];

function proxStatus(atual: StatusDente = 'saudavel'): StatusDente {
  const idx = STATUS_CICLO.indexOf(atual);
  return STATUS_CICLO[(idx + 1) % STATUS_CICLO.length];
}

function tiposDente(fdi: number): 'molar' | 'premolar' | 'canino' | 'incisivo' {
  const p = fdi % 10;
  if (p >= 6) return 'molar';
  if (p >= 4) return 'premolar';
  if (p === 3) return 'canino';
  return 'incisivo';
}

// ─── Cores ────────────────────────────────────────────────────────────────────

const COR_COROA: Record<StatusDente, string> = {
  saudavel:'#fdf3e3', carie:'#fee2e2', restauracao:'#fef9c3',
  obturacao:'#fef3c7', canal:'#dbeafe', coroa:'#ede9fe',
  implante:'#f0fdf4', extraido:'transparent', ausente:'#f9fafb', fratura:'#fff7ed',
};
const COR_BORDA: Record<StatusDente, string> = {
  saudavel:'#d4a96a', carie:'#ef4444', restauracao:'#ca8a04',
  obturacao:'#d97706', canal:'#2563eb', coroa:'#7c3aed',
  implante:'#16a34a', extraido:'#ef4444', ausente:'#d1d5db', fratura:'#ea580c',
};
const COR_RAIZ: Record<StatusDente, string> = {
  saudavel:'#e8d5b7', carie:'#e8d5b7', restauracao:'#e8d5b7',
  obturacao:'#e8d5b7', canal:'#bfdbfe', coroa:'#e8d5b7',
  implante:'#9ca3af', extraido:'transparent', ausente:'#e5e7eb', fratura:'#e8d5b7',
};
const COR_SUP: Record<StatusDente, string> = {
  saudavel:'#fff', carie:'#ef4444', restauracao:'#f8cc72',
  obturacao:'#fbbf24', canal:'#3b82f6', coroa:'#8b5cf6',
  implante:'#22c55e', extraido:'#f87171', ausente:'#e5e7eb', fratura:'#f97316',
};

// ─── SVG do dente ─────────────────────────────────────────────────────────────

function ToothSVG({
  tipo, status, inferior = false, compact = false,
}: {
  tipo: ReturnType<typeof tiposDente>;
  status: StatusDente;
  inferior?: boolean;
  compact?: boolean;
}) {
  const W = compact ? 22 : 28;
  const H = compact ? 36 : 44;
  const coroa = COR_COROA[status] ?? '#fdf3e3';
  const borda = COR_BORDA[status] ?? '#d4a96a';
  const raiz  = COR_RAIZ[status]  ?? '#e8d5b7';

  const flip = inferior
    ? `scale(1,-1) translate(0,${-H})`
    : undefined;

  if (status === 'extraido') {
    const cx = W / 2, cy = H / 2;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
        <line x1={cx-8} y1={cy-8} x2={cx+8} y2={cy+8} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1={cx+8} y1={cy-8} x2={cx-8} y2={cy+8} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  if (status === 'implante') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
        <g transform={flip}>
          <rect x={W/2-8} y="2" width="16" height="10" rx="5"
            fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.2"/>
          <rect x={W/2-3} y="11" width="6" height="5" fill="#86efac"/>
          <rect x={W/2-4} y="16" width="8" height={H-18} rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.8"/>
          {[20,24,28,32].filter(y => y < H-2).map(y => (
            <line key={y} x1={W/2-4} y1={y} x2={W/2+4} y2={y} stroke="#6b7280" strokeWidth="0.8"/>
          ))}
        </g>
      </svg>
    );
  }

  const ausente = status === 'ausente';

  const shapes: Record<string, JSX.Element> = {
    molar: (
      <g transform={flip}>
        <rect x="3" y="17" width="9" height="22" rx="5"
          fill={ausente ? '#e5e7eb' : raiz} stroke={ausente ? '#d1d5db' : '#c4a882'} strokeWidth="0.8"/>
        <rect x="16" y="17" width="9" height="22" rx="5"
          fill={ausente ? '#e5e7eb' : raiz} stroke={ausente ? '#d1d5db' : '#c4a882'} strokeWidth="0.8"/>
        <rect x="2" y="2" width="24" height="16" rx="5"
          fill={ausente ? '#f9fafb' : coroa} stroke={borda} strokeWidth="1.5"/>
        <line x1="14" y1="3" x2="14" y2="17" stroke={borda} strokeWidth="0.8" opacity="0.4"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke={borda} strokeWidth="0.6" opacity="0.3"/>
        <line x1="20" y1="2" x2="20" y2="6" stroke={borda} strokeWidth="0.6" opacity="0.3"/>
      </g>
    ),
    premolar: (
      <g transform={flip}>
        <rect x="7" y="17" width="14" height="24" rx="7"
          fill={ausente ? '#e5e7eb' : raiz} stroke={ausente ? '#d1d5db' : '#c4a882'} strokeWidth="0.8"/>
        <rect x="5" y="2" width="18" height="16" rx="4"
          fill={ausente ? '#f9fafb' : coroa} stroke={borda} strokeWidth="1.5"/>
        <line x1="14" y1="3" x2="14" y2="13" stroke={borda} strokeWidth="0.8" opacity="0.4"/>
      </g>
    ),
    canino: (
      <g transform={flip}>
        <rect x="9" y="17" width="10" height="26" rx="5"
          fill={ausente ? '#e5e7eb' : raiz} stroke={ausente ? '#d1d5db' : '#c4a882'} strokeWidth="0.8"/>
        <path d={`M7,18 L7,6 Q7,1 14,1 Q21,1 21,6 L21,18 Z`}
          fill={ausente ? '#f9fafb' : coroa} stroke={borda} strokeWidth="1.5"/>
      </g>
    ),
    incisivo: (
      <g transform={flip}>
        <rect x="10" y="17" width="8" height="24" rx="4"
          fill={ausente ? '#e5e7eb' : raiz} stroke={ausente ? '#d1d5db' : '#c4a882'} strokeWidth="0.8"/>
        <path d={`M6,18 L6,4 Q6,2 14,2 Q22,2 22,4 L22,18 Z`}
          fill={ausente ? '#f9fafb' : coroa} stroke={borda} strokeWidth="1.5"/>
      </g>
    ),
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block', overflow:'visible' }}>
      {shapes[tipo]}
    </svg>
  );
}

// ─── Diagrama de 5 Superfícies ────────────────────────────────────────────────

function DiagramaSuperficies({
  superficies, status, size = 26, interactive, onSurfaceClick,
}: {
  superficies?: Partial<Record<Superficie, StatusDente | null>>;
  status?: StatusDente;
  size?: number;
  interactive?: boolean;
  onSurfaceClick?: (sup: Superficie) => void;
}) {
  const s = Math.floor(size / 3);
  const getCor = (sup: Superficie) => {
    const st = superficies?.[sup];
    if (st) return COR_SUP[st];
    return '#fff';
  };
  const b = '1px solid #c0c0c0';
  const bg = '#e5e7eb';

  const Cell = ({ sup, style }: { sup: Superficie; style?: React.CSSProperties }) => (
    <div
      onClick={() => interactive && onSurfaceClick?.(sup)}
      title={sup}
      style={{
        width: s, height: s,
        backgroundColor: getCor(sup),
        border: b,
        cursor: interactive ? 'pointer' : 'default',
        display:'flex', alignItems:'center', justifyContent:'center',
        ...style,
      }}
    >
      {interactive && (
        <span style={{ fontSize: 5.5, color:'#9ca3af', userSelect:'none', lineHeight:1 }}>{sup}</span>
      )}
    </div>
  );

  return (
    <div style={{
      display:'inline-grid',
      gridTemplateColumns:`${s}px ${s}px ${s}px`,
      gridTemplateRows:`${s}px ${s}px ${s}px`,
      border:'1.5px solid #9ca3af',
      borderRadius: 3,
      overflow:'hidden',
      backgroundColor: bg,
      width: size, height: size,
    }}>
      <div style={{ backgroundColor: bg }} />
      <Cell sup="V" />
      <div style={{ backgroundColor: bg }} />
      <Cell sup="M" />
      <Cell sup="O" />
      <Cell sup="D" />
      <div style={{ backgroundColor: bg }} />
      <Cell sup="L" />
      <div style={{ backgroundColor: bg }} />
    </div>
  );
}

// ─── Legenda de status ────────────────────────────────────────────────────────

function LegendaStatus() {
  const items: [StatusDente, string][] = [
    ['saudavel','Saudável'],['carie','Cárie'],['restauracao','Restauração'],
    ['obturacao','Obturação'],['canal','Canal'],['coroa','Coroa'],
    ['implante','Implante'],['extraido','Extraído'],['ausente','Ausente'],
  ];
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', marginTop: 10 }}>
      {items.map(([st, label]) => (
        <div key={st} style={{ display:'flex', alignItems:'center', gap: 4 }}>
          <div style={{
            width: 12, height: 12, borderRadius: 3,
            backgroundColor: st === 'extraido' ? '#fff' : COR_COROA[st],
            border:`1.5px solid ${COR_BORDA[st]}`,
          }} />
          <span style={{ fontSize: 9, color:'#4b5563' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Coluna de um dente ───────────────────────────────────────────────────────

function ColunaDente({
  fdi, dado = {}, inferior = false, compact = false,
  interactive, onStatusChange, onSurfaceChange, onAnotacaoChange, onFinalizadoChange,
  selectedColor,
}: {
  fdi: number;
  dado?: DadosDenteOdontograma;
  inferior?: boolean;
  compact?: boolean;
  interactive?: boolean;
  onStatusChange?: (fdi: number, status: StatusDente) => void;
  onSurfaceChange?: (fdi: number, sup: Superficie, st: StatusDente | null) => void;
  onAnotacaoChange?: (fdi: number, text: string) => void;
  onFinalizadoChange?: (fdi: number, val: boolean) => void;
  selectedColor?: string;
}) {
  const tipo = tiposDente(fdi);
  const status = dado.status ?? 'saudavel';
  const deciduo = DECIDUOS[fdi];
  const W = compact ? 22 : 28;
  const diagSize = compact ? 22 : 26;
  const isDestacado = dado.destacado;

  const containerStyle: React.CSSProperties = {
    display:'flex', flexDirection:'column', alignItems:'center',
    gap: compact ? 2 : 3,
    position:'relative',
    padding: compact ? '0 1px' : '0 2px',
    backgroundColor: isDestacado ? (selectedColor ?? '#fef9c3') : 'transparent',
    borderRadius: 4,
    border: isDestacado ? `1.5px solid ${selectedColor ?? '#f8cc72'}` : '1.5px solid transparent',
  };

  // Checkbox square
  const Checkbox = ({ checked, onChange }: { checked?: boolean; onChange?: () => void }) => (
    <div
      onClick={interactive ? onChange : undefined}
      style={{
        width: compact ? 14 : 16, height: compact ? 14 : 16,
        border:'1.5px solid #3b82f6',
        borderRadius: 3,
        backgroundColor: checked ? '#3b82f6' : '#fff',
        cursor: interactive ? 'pointer' : 'default',
        flexShrink: 0,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M2,5 L4,7 L8,3" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );

  // Número FDI + deciduo
  const NumeroLabel = () => (
    <div style={{ textAlign:'center', lineHeight: 1.2 }}>
      <div style={{
        fontSize: compact ? 8 : 9, fontWeight: 700,
        color: isDestacado ? '#010101' : '#1f2937',
      }}>{fdi}</div>
      {deciduo && (
        <div style={{
          fontSize: compact ? 6.5 : 7.5, color:'#6b7280', fontWeight: 500,
        }}>{deciduo}</div>
      )}
    </div>
  );

  // Procedure label (for orçamento)
  const ProcLabel = () => dado.procedimento_nome ? (
    <div style={{
      fontSize: 6, color:'#7a5c00', fontWeight: 700,
      textAlign:'center', maxWidth: W,
      overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
    }}>
      {dado.procedimento_nome.length > 8
        ? dado.procedimento_nome.slice(0,7) + '…'
        : dado.procedimento_nome}
    </div>
  ) : null;

  // Finalizado badge
  const FinalizadoBadge = () => (
    <div
      onClick={() => interactive && onFinalizadoChange?.(fdi, !dado.finalizado)}
      style={{
        fontSize: 6.5, fontWeight: 700, padding:'1px 4px',
        borderRadius: 3, cursor: interactive ? 'pointer' : 'default',
        backgroundColor: dado.finalizado ? '#d1fae5' : '#fef3c7',
        color: dado.finalizado ? '#065f46' : '#92400e',
        border: `1px solid ${dado.finalizado ? '#6ee7b7' : '#fbbf24'}`,
      }}
    >
      {dado.finalizado ? '✓ Ok' : '● Aberto'}
    </div>
  );

  const toothEl = (
    <div
      onClick={() => interactive && onStatusChange?.(fdi, proxStatus(status))}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
      title={`${fdi} — ${LEGENDA_STATUS[status]}`}
    >
      <ToothSVG tipo={tipo} status={status} inferior={inferior} compact={compact} />
    </div>
  );

  const diagEl = (
    <DiagramaSuperficies
      superficies={dado.superficies}
      status={status}
      size={diagSize}
      interactive={interactive}
      onSurfaceClick={(sup) => {
        const atual = dado.superficies?.[sup];
        const prox: StatusDente | null = atual ? null : status === 'saudavel' ? 'restauracao' : status;
        onSurfaceChange?.(fdi, sup, prox);
      }}
    />
  );

  const checkboxEl = (
    <Checkbox
      checked={dado.finalizado}
      onChange={() => onFinalizadoChange?.(fdi, !dado.finalizado)}
    />
  );

  if (inferior) {
    // Bottom arch: tooth first (roots up), then diagram, then number, then checkbox
    return (
      <div style={containerStyle}>
        {toothEl}
        {diagEl}
        <NumeroLabel />
        {checkboxEl}
        {dado.procedimento_nome && <ProcLabel />}
        {interactive && status !== 'saudavel' && status !== 'extraido' && (
          <FinalizadoBadge />
        )}
        {interactive && (
          <input
            value={dado.anotacao ?? ''}
            onChange={e => onAnotacaoChange?.(fdi, e.target.value)}
            placeholder="nota"
            style={{
              width: W, fontSize: 7, border:'1px solid #d1d5db',
              borderRadius: 2, padding:'1px 2px', outline:'none',
              backgroundColor:'#fafafa',
            }}
          />
        )}
        {!interactive && dado.anotacao && (
          <span style={{ fontSize: 6.5, color:'#6b7280', textAlign:'center', maxWidth: W }}>
            {dado.anotacao}
          </span>
        )}
      </div>
    );
  }

  // Top arch: checkbox, number, diagram, tooth
  return (
    <div style={containerStyle}>
      {checkboxEl}
      <NumeroLabel />
      {diagEl}
      {toothEl}
      {dado.procedimento_nome && <ProcLabel />}
      {interactive && status !== 'saudavel' && status !== 'extraido' && (
        <FinalizadoBadge />
      )}
      {interactive && (
        <input
          value={dado.anotacao ?? ''}
          onChange={e => onAnotacaoChange?.(fdi, e.target.value)}
          placeholder="nota"
          style={{
            width: W, fontSize: 7, border:'1px solid #d1d5db',
            borderRadius: 2, padding:'1px 2px', outline:'none',
            backgroundColor:'#fafafa',
          }}
        />
      )}
      {!interactive && dado.anotacao && (
        <span style={{ fontSize: 6.5, color:'#6b7280', textAlign:'center', maxWidth: W }}>
          {dado.anotacao}
        </span>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface OdontogramaCompletoProps {
  dados?: OdontogramaDados;
  onChange?: (dados: OdontogramaDados) => void;
  interactive?: boolean;
  compact?: boolean;
  showLegenda?: boolean;
  title?: string;
  selectedTeethColor?: string;
}

export const OdontogramaCompleto = forwardRef<HTMLDivElement, OdontogramaCompletoProps>(
  ({
    dados = {},
    onChange,
    interactive = false,
    compact = false,
    showLegenda = true,
    title,
    selectedTeethColor,
  }, ref) => {

    const updateStatus = (fdi: number, status: StatusDente) => {
      onChange?.({ ...dados, [String(fdi)]: { ...dados[String(fdi)], status } });
    };

    const updateSurface = (fdi: number, sup: Superficie, st: StatusDente | null) => {
      const atual = dados[String(fdi)] ?? {};
      onChange?.({
        ...dados,
        [String(fdi)]: {
          ...atual,
          superficies: { ...(atual.superficies ?? {}), [sup]: st },
        },
      });
    };

    const updateAnotacao = (fdi: number, text: string) => {
      onChange?.({ ...dados, [String(fdi)]: { ...dados[String(fdi)], anotacao: text } });
    };

    const updateFinalizado = (fdi: number, val: boolean) => {
      onChange?.({ ...dados, [String(fdi)]: { ...dados[String(fdi)], finalizado: val } });
    };

    const gap = compact ? 2 : 4;

    const renderArco = (dentes: readonly number[], inferior: boolean) => (
      <div style={{ display:'flex', gap, justifyContent:'flex-start', alignItems: inferior ? 'flex-start' : 'flex-end' }}>
        {dentes.map((fdi, i) => (
          <div key={fdi} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            {/* Separador de linha média */}
            {(fdi === 11 || fdi === 31) && i > 0 && (
              <div style={{ width: 1.5, backgroundColor:'#9ca3af', alignSelf:'stretch', margin: `0 ${gap/2}px` }} />
            )}
            <ColunaDente
              fdi={fdi}
              dado={dados[String(fdi)]}
              inferior={inferior}
              compact={compact}
              interactive={interactive}
              onStatusChange={updateStatus}
              onSurfaceChange={updateSurface}
              onAnotacaoChange={updateAnotacao}
              onFinalizadoChange={updateFinalizado}
              selectedColor={selectedTeethColor}
            />
          </div>
        ))}
      </div>
    );

    return (
      <div ref={ref} style={{
        fontFamily:"'Segoe UI', Arial, sans-serif",
        background:'#fff',
        padding: compact ? '8px' : '16px',
        borderRadius: 8,
        border:'1.5px solid #e5e7eb',
        width: 'fit-content',
        minWidth: compact ? 480 : 560,
      }}>
        {title && (
          <p style={{
            fontSize: compact ? 9 : 11, fontWeight: 800,
            color:'#010101', textTransform:'uppercase', letterSpacing: 0.8,
            margin:'0 0 8px', textAlign:'center',
          }}>{title}</p>
        )}

        {/* Label Maxilar */}
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 7.5, color:'#6b7280', fontWeight: 700, textTransform:'uppercase', letterSpacing: 1 }}>
            MAXILAR (Superior)
          </span>
          <span style={{ fontSize: 7.5, color:'#6b7280', fontWeight: 700, textTransform:'uppercase', letterSpacing: 1 }}>
            Direito ← → Esquerdo
          </span>
        </div>

        {renderArco(SUPERIOR, false)}

        {/* Separador maxilar/mandibular */}
        <div style={{
          display:'flex', alignItems:'center', margin: compact ? '4px 0' : '8px 0', gap: 8,
        }}>
          <div style={{ flex:1, height: 1, backgroundColor:'#d1d5db' }} />
          <span style={{
            fontSize: 7, fontWeight: 700, color:'#9ca3af',
            textTransform:'uppercase', letterSpacing: 1, whiteSpace:'nowrap',
          }}>Linha de Oclusão</span>
          <div style={{ flex:1, height: 1, backgroundColor:'#d1d5db' }} />
        </div>

        {renderArco(INFERIOR, true)}

        {/* Label Mandíbula */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 7.5, color:'#6b7280', fontWeight: 700, textTransform:'uppercase', letterSpacing: 1 }}>
            MANDÍBULA (Inferior)
          </span>
        </div>

        {/* Legenda */}
        {showLegenda && !compact && (
          <>
            <div style={{ borderTop:'1px solid #e5e7eb', marginTop: 12, paddingTop: 8 }}>
              <p style={{ fontSize: 8, fontWeight: 700, color:'#6b7280', textTransform:'uppercase', letterSpacing: 0.8, margin:'0 0 4px' }}>
                Legenda
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 12px' }}>
                {(Object.entries(LEGENDA_STATUS) as [StatusDente, string][]).map(([st, label]) => (
                  <div key={st} style={{ display:'flex', alignItems:'center', gap: 3 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 2,
                      backgroundColor: st === 'extraido' ? '#fff' : COR_COROA[st],
                      border:`1.5px solid ${COR_BORDA[st]}`,
                    }} />
                    <span style={{ fontSize: 8, color:'#4b5563' }}>{label}</span>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap: 3 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 2,
                    border:'1.5px solid #9ca3af',
                    background: 'linear-gradient(to right, #fff 0%, #fff 33%, #f8cc72 33%, #f8cc72 66%, #3b82f6 66%, #3b82f6 100%)',
                  }} />
                  <span style={{ fontSize: 8, color:'#4b5563' }}>V·O·M·D·L = Superfícies</span>
                </div>
              </div>
            </div>
            {interactive && (
              <p style={{ fontSize: 8, color:'#9ca3af', margin:'6px 0 0', fontStyle:'italic' }}>
                Clique no dente para alterar status · Clique na superfície para marcar tratamento · ✓ = finalizado
              </p>
            )}
          </>
        )}
      </div>
    );
  }
);

OdontogramaCompleto.displayName = 'OdontogramaCompleto';

// ─── Adapter: dados legados → novo formato ────────────────────────────────────

export function adaptarDadosLegados(
  legado: Record<string, { numero: number; procedimentos: string[] }>
): OdontogramaDados {
  const mapa: Record<string, StatusDente> = {
    'Cárie':'carie', 'Restauração':'restauracao', 'Coroa':'coroa',
    'Obturação':'obturacao', 'Implante':'implante', 'Canal':'canal', 'Extraído':'extraido',
  };
  return Object.fromEntries(
    Object.entries(legado).map(([k, v]) => {
      const proc = v.procedimentos?.[0];
      const status: StatusDente = (proc && mapa[proc]) ? mapa[proc] : 'saudavel';
      return [k, { status, procedimentos: v.procedimentos }];
    })
  );
}

// ─── Adapter: orçamento items → dados odontograma ────────────────────────────

export function adaptarItemsOrcamento(
  itens: Array<{ dente_numero?: string | null; nome_procedimento: string }>
): OdontogramaDados {
  const dados: OdontogramaDados = {};
  itens.forEach(item => {
    if (!item.dente_numero) return;
    const dentes = item.dente_numero.includes(',')
      ? item.dente_numero.split(',')
      : [item.dente_numero];
    dentes.forEach(d => {
      const k = d.trim();
      if (!dados[k]) {
        dados[k] = { destacado: true, procedimento_nome: item.nome_procedimento, status: 'restauracao' };
      }
    });
  });
  return dados;
}
