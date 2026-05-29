import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X } from "lucide-react";

// FDI: vista do profissional (espelhada — dir. do pac. = esq. da boca do pov. do prof.)
const SUPERIOR_DIR = ["18","17","16","15","14","13","12","11"]; // Q1
const SUPERIOR_ESQ = ["21","22","23","24","25","26","27","28"]; // Q2
const INFERIOR_ESQ = ["31","32","33","34","35","36","37","38"]; // Q3
const INFERIOR_DIR = ["41","42","43","44","45","46","47","48"]; // Q4

const TIPO_DENTE: Record<string, "incisivo" | "canino" | "pre-molar" | "molar"> = {
  "11":"incisivo","12":"incisivo","21":"incisivo","22":"incisivo",
  "31":"incisivo","32":"incisivo","41":"incisivo","42":"incisivo",
  "13":"canino","23":"canino","33":"canino","43":"canino",
  "14":"pre-molar","15":"pre-molar","24":"pre-molar","25":"pre-molar",
  "34":"pre-molar","35":"pre-molar","44":"pre-molar","45":"pre-molar",
  "16":"molar","17":"molar","18":"molar","26":"molar","27":"molar","28":"molar",
  "36":"molar","37":"molar","38":"molar","46":"molar","47":"molar","48":"molar",
};

function denteWidth(n: string) {
  const t = TIPO_DENTE[n];
  if (t === "molar") return 32;
  if (t === "pre-molar") return 26;
  if (t === "canino") return 24;
  return 22;
}

interface DenteProps {
  numero: string;
  selecionado: boolean;
  superior: boolean;
  onToggle: () => void;
}

const Dente = memo(function Dente({ numero, selecionado, superior, onToggle }: DenteProps) {
  const w = denteWidth(numero);
  return (
    <button
      type="button"
      onClick={onToggle}
      title={`Dente ${numero}`}
      className="flex flex-col items-center gap-0.5 group"
    >
      {superior && (
        <span className={cn(
          "text-[9px] font-bold transition-colors",
          selecionado ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
        )}>{numero}</span>
      )}
      <div style={{ width: w }} className={cn(
        "rounded-md border-2 transition-all h-8 flex items-center justify-center",
        selecionado
          ? "bg-primary border-primary shadow-md shadow-primary/30 scale-110"
          : "bg-white border-slate-200 hover:border-primary/50 hover:bg-primary/5"
      )}>
        {selecionado && <div className="w-2 h-2 rounded-full bg-white opacity-80" />}
      </div>
      {!superior && (
        <span className={cn(
          "text-[9px] font-bold transition-colors",
          selecionado ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
        )}>{numero}</span>
      )}
    </button>
  );
});

interface OdontogramaSeletorProps {
  dentes: string[];
  onChange: (dentes: string[]) => void;
}

export function OdontogramaSeletor({ dentes, onChange }: OdontogramaSeletorProps) {
  const toggle = (n: string) => {
    onChange(dentes.includes(n) ? dentes.filter(d => d !== n) : [...dentes, n]);
  };

  const sel = (quadrante: string[]) => {
    const todos = quadrante.every(d => dentes.includes(d));
    if (todos) onChange(dentes.filter(d => !quadrante.includes(d)));
    else onChange([...new Set([...dentes, ...quadrante])]);
  };

  return (
    <div className="space-y-3 select-none">
      {/* Controles rápidos */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seleção rápida:</span>
        {[
          { label: "Sup. Dir.", q: SUPERIOR_DIR },
          { label: "Sup. Esq.", q: SUPERIOR_ESQ },
          { label: "Inf. Esq.", q: INFERIOR_ESQ },
          { label: "Inf. Dir.", q: INFERIOR_DIR },
          { label: "Todos Sup.", q: [...SUPERIOR_DIR, ...SUPERIOR_ESQ] },
          { label: "Todos Inf.", q: [...INFERIOR_ESQ, ...INFERIOR_DIR] },
        ].map(({ label, q }) => (
          <button
            key={label}
            type="button"
            onClick={() => sel(q)}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            {label}
          </button>
        ))}
        {dentes.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {/* Grade visual */}
      <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 overflow-x-auto">
        {/* Superior */}
        <div className="flex justify-center mb-1">
          <div className="flex gap-1 items-end">
            {SUPERIOR_DIR.map(n => (
              <Dente key={n} numero={n} selecionado={dentes.includes(n)} superior onToggle={() => toggle(n)} />
            ))}
            <div className="w-px h-6 bg-slate-200 mx-1 self-end mb-1" />
            {SUPERIOR_ESQ.map(n => (
              <Dente key={n} numero={n} selecionado={dentes.includes(n)} superior onToggle={() => toggle(n)} />
            ))}
          </div>
        </div>

        {/* Linha separadora */}
        <div className="flex justify-center my-1">
          <div className="w-full max-w-sm border-t-2 border-dashed border-slate-300" />
        </div>

        {/* Inferior */}
        <div className="flex justify-center mt-1">
          <div className="flex gap-1 items-start">
            {INFERIOR_ESQ.map(n => (
              <Dente key={n} numero={n} selecionado={dentes.includes(n)} superior={false} onToggle={() => toggle(n)} />
            ))}
            <div className="w-px h-6 bg-slate-200 mx-1 self-start mt-1" />
            {INFERIOR_DIR.map(n => (
              <Dente key={n} numero={n} selecionado={dentes.includes(n)} superior={false} onToggle={() => toggle(n)} />
            ))}
          </div>
        </div>
      </div>

      {/* Contagem */}
      <div className="flex items-center gap-2">
        {dentes.length > 0 ? (
          <>
            <Badge className="bg-primary text-white">{dentes.length} dente{dentes.length > 1 ? "s" : ""} selecionado{dentes.length > 1 ? "s" : ""}</Badge>
            <span className="text-xs text-muted-foreground">{dentes.sort((a, b) => Number(a) - Number(b)).join(", ")}</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Nenhum dente selecionado — clique para selecionar</span>
        )}
      </div>
    </div>
  );
}

// ─── Botão trigger com Sheet ──────────────────────────────────────────────

interface OdontogramaBotaoProps {
  dentes: string[];
  onChange: (dentes: string[]) => void;
}

export function OdontogramaBotao({ dentes, onChange }: OdontogramaBotaoProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<string[]>(dentes);

  const handleOpen = (v: boolean) => {
    if (v) setLocal(dentes);
    setOpen(v);
  };

  const handleConfirmar = () => {
    onChange(local);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-8 px-2 rounded-lg border-2 text-xs font-bold flex items-center gap-1 transition-all",
            dentes.length > 0
              ? "border-primary text-primary bg-primary/5"
              : "border-slate-200 text-slate-500 hover:border-primary/50"
          )}
        >
          🦷
          {dentes.length > 0 ? (
            <span className="bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {dentes.length}
            </span>
          ) : (
            <span>Dente(s)</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-black uppercase tracking-tight">Selecionar Dentes</SheetTitle>
        </SheetHeader>
        <OdontogramaSeletor dentes={local} onChange={setLocal} />
        <div className="flex gap-3 pt-4 pb-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} className="flex-1 rounded-xl font-black">
            {local.length > 0 ? `Confirmar ${local.length} dente${local.length > 1 ? "s" : ""}` : "Confirmar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
