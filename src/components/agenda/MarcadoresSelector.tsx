import { useState } from "react";
import { Check, Tag, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMarcadores, Marcador } from "@/hooks/useMarcadores";
import { cn } from "@/lib/utils";

interface MarcadoresSelectorProps {
  selectedMarcadores: Marcador[];
  onChange: (marcadores: Marcador[]) => void;
}

export function MarcadoresSelector({ selectedMarcadores, onChange }: MarcadoresSelectorProps) {
  const [open, setOpen] = useState(false);
  const { marcadores, createMarcador } = useMarcadores();
  const [newMarkerName, setNewMarkerName] = useState("");

  const toggleMarcador = (marcador: Marcador) => {
    const isSelected = selectedMarcadores.some((m) => m.id === marcador.id);
    if (isSelected) {
      onChange(selectedMarcadores.filter((m) => m.id !== marcador.id));
    } else {
      onChange([...selectedMarcadores, marcador]);
    }
  };

  const handleCreate = async () => {
    if (!newMarkerName.trim()) return;
    const colors = ["bg-orange-500", "bg-red-600", "bg-blue-500", "bg-purple-500", "bg-emerald-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await createMarcador(newMarkerName, randomColor);
    setNewMarkerName("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[32px] p-1 border rounded-md bg-slate-50/50">
        {selectedMarcadores.map((m) => (
          <Badge 
            key={m.id} 
            className={cn("text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 border-none", m.cor)}
          >
            {m.nome}
            <X 
              className="w-3 h-3 cursor-pointer hover:text-white/80" 
              onClick={(e) => {
                e.stopPropagation();
                toggleMarcador(m);
              }}
            />
          </Badge>
        ))}
        {selectedMarcadores.length === 0 && (
          <span className="text-xs text-slate-400 p-1">Nenhum marcador selecionado</span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs font-bold border-dashed">
            <Plus className="w-3 h-3 mr-2" /> Gerenciar Marcadores
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar ou criar..." 
              value={newMarkerName}
              onValueChange={setNewMarkerName}
            />
            <CommandList>
              <CommandEmpty>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs" 
                  onClick={handleCreate}
                >
                  Criar "{newMarkerName}"
                </Button>
              </CommandEmpty>
              <CommandGroup>
                {marcadores.map((m) => (
                  <CommandItem
                    key={m.id}
                    onSelect={() => toggleMarcador(m)}
                    className="text-xs font-medium cursor-pointer"
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-2", m.cor)} />
                    {m.nome}
                    {selectedMarcadores.some((sm) => sm.id === m.id) && (
                      <Check className="w-3 h-3 ml-auto" />
                    )}
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
