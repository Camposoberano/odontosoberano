import * as React from "react";
import { Check, Search, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProcedimentosCatalogo, ProcedimentoCatalogo } from "@/hooks/useProcedimentosCatalogo";

interface CatalogoSearchProps {
  selectedId?: string;
  onSelect: (item: ProcedimentoCatalogo | null) => void;
  className?: string;
}

export function CatalogoSearch({ selectedId, onSelect, className }: CatalogoSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const { data: catalogo = [] } = useProcedimentosCatalogo({ apenasAtivos: true });

  const selected = React.useMemo(
    () => catalogo.find((p) => p.id === selectedId) ?? null,
    [catalogo, selectedId]
  );

  React.useEffect(() => {
    setQuery(selected ? selected.nome : "");
  }, [selected]);

  const filtered = React.useMemo(() => {
    if (!query || selected?.nome === query) return catalogo;
    const lq = query.toLowerCase();
    return catalogo.filter(
      (p) =>
        p.nome.toLowerCase().includes(lq) ||
        (p.codigo_tuss && p.codigo_tuss.includes(query)) ||
        (p.codigo_vrpo && p.codigo_vrpo.includes(query))
    );
  }, [catalogo, query, selected]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open && filtered.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar procedimento no catálogo TUSS..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="h-14 pl-12 pr-12 text-lg font-bold border-2 rounded-2xl shadow-inner bg-slate-50/50 focus:bg-white transition-all"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-2 shadow-2xl overflow-hidden"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList className="max-h-[350px]">
              <CommandEmpty>Nenhum procedimento encontrado para "{query}".</CommandEmpty>
              <CommandGroup heading="Catálogo de Procedimentos">
                {filtered.slice(0, 12).map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => {
                      onSelect(item);
                      setQuery(item.nome);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between py-4 px-6 cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-base text-slate-800">{item.nome}</span>
                        <span className="text-[11px] font-black text-primary/60 uppercase tracking-tighter">
                          {item.categoria}
                          {item.codigo_tuss ? ` • TUSS: ${item.codigo_tuss}` : ""}
                          {item.codigo_vrpo ? ` • VRPO: ${item.codigo_vrpo}` : ""}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-5 w-5 text-primary transition-all",
                        selectedId === item.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
