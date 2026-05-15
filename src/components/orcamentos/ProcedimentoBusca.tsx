import { useState, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcedimentosCatalogo, CATEGORIAS_PROCEDIMENTOS, ProcedimentoCatalogo } from "@/hooks/useProcedimentosCatalogo";
import { Skeleton } from "@/components/ui/skeleton";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (val: T) => {
      if (timeoutRef[0]) clearTimeout(timeoutRef[0]);
      timeoutRef[1](setTimeout(() => setDebounced(val), delay));
    },
    [delay, timeoutRef]
  );

  // trigger update when value changes
  useState(() => { update(value); });

  return debounced;
}

interface ProcedimentoBuscaProps {
  onAdicionar: (proc: ProcedimentoCatalogo) => void;
}

export function ProcedimentoBusca({ onAdicionar }: ProcedimentoBuscaProps) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [inputBusca, setInputBusca] = useState("");

  const handleBuscaChange = (value: string) => {
    setInputBusca(value);
    const timer = setTimeout(() => setBusca(value), 300);
    return () => clearTimeout(timer);
  };

  const { data: procedimentos, isLoading } = useProcedimentosCatalogo({
    busca,
    categoria: categoria === "todas" ? undefined : categoria,
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar procedimento (ex: extração, resina...)"
          className="pl-9"
          value={inputBusca}
          onChange={(e) => handleBuscaChange(e.target.value)}
        />
      </div>

      <ScrollArea className="w-full" type="scroll">
        <Tabs value={categoria} onValueChange={setCategoria}>
          <TabsList className="flex w-max gap-1 h-auto flex-wrap">
            <TabsTrigger value="todas" className="text-xs h-7">Todas</TabsTrigger>
            {CATEGORIAS_PROCEDIMENTOS.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs h-7 whitespace-nowrap">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ScrollArea>

      <div className="border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !procedimentos?.length ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhum procedimento encontrado
          </div>
        ) : (
          <ScrollArea className="h-56">
            <div className="divide-y">
              {procedimentos.map((proc) => (
                <div
                  key={proc.id}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium truncate">{proc.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs py-0">
                        {proc.categoria}
                      </Badge>
                      {proc.codigo_tuss && (
                        <span className="text-xs text-muted-foreground">TUSS {proc.codigo_tuss}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {proc.preco_sugerido.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => onAdicionar(proc)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
