import * as React from "react";
import { Check, Search, User, X } from "lucide-react";
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
import { usePacientes, Paciente } from "@/hooks/usePacientes";

interface PatientSearchProps {
  selectedPacienteId?: string;
  onSelect: (pacienteId: string) => void;
  placeholder?: string;
  className?: string;
}

export function PatientSearch({ 
  selectedPacienteId, 
  onSelect, 
  placeholder = "Pesquise por Nome, CPF ou Telefone...",
  className
}: PatientSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { pacientes } = usePacientes();

  const selectedPaciente = React.useMemo(() => 
    pacientes.find((p) => p.id === selectedPacienteId),
    [pacientes, selectedPacienteId]
  );

  // Sincroniza o texto do input com o paciente selecionado inicialmente ou ao mudar
  React.useEffect(() => {
    if (selectedPaciente) {
      setQuery(selectedPaciente.nome);
    } else {
      setQuery("");
    }
  }, [selectedPaciente]);

  const filteredPacientes = React.useMemo(() => {
    if (!query || selectedPaciente?.nome === query) return pacientes;
    
    const lowerQuery = query.toLowerCase();
    return pacientes.filter((p) => 
      p.nome.toLowerCase().includes(lowerQuery) ||
      (p.cpf && p.cpf.includes(query)) ||
      (p.telefone && p.telefone.includes(query))
    );
  }, [pacientes, query, selectedPaciente]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open && filteredPacientes.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
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
          onOpenAutoFocus={(e) => e.preventDefault()} // Não tira o foco do input ao abrir
        >
          <Command className="w-full">
            <CommandList className="max-h-[350px]">
               <CommandEmpty>Nenhum paciente encontrado com "{query}".</CommandEmpty>
               <CommandGroup heading="Sugestões de Pacientes">
                  {filteredPacientes.slice(0, 10).map((paciente) => (
                    <CommandItem
                      key={paciente.id}
                      value={paciente.id}
                      onSelect={() => {
                        onSelect(paciente.id);
                        setQuery(paciente.nome);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between py-4 px-6 cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-base text-slate-800">{paciente.nome}</span>
                          <span className="text-[11px] font-black text-primary/60 uppercase tracking-tighter">
                             {paciente.cpf ? `CPF: ${paciente.cpf}` : "SEM DOCUMENTO"} • {paciente.telefone || "SEM TELEFONE"}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-5 w-5 text-primary transition-all",
                          selectedPacienteId === paciente.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
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
