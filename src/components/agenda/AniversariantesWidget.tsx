import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Cake, Phone, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function diasParaAniv(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc + "T00:00:00");
  const prox = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate());
  if (prox < hoje && !isSameDay(prox, hoje)) prox.setFullYear(hoje.getFullYear() + 1);
  return Math.round((prox.getTime() - startOfDay(hoje).getTime()) / 86_400_000);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function calcularIdade(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc + "T00:00:00");
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function AniversariantesWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: aniversariantes = [] } = useQuery({
    queryKey: ["aniversariantes-widget", user?.id],
    enabled: !!user,
    staleTime: 60_000 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("pacientes")
        .select("id, nome, telefone, data_nascimento")
        .eq("status", "Ativo")
        .not("data_nascimento", "is", null);
      return (data ?? [])
        .map(p => ({ ...p, dias: diasParaAniv(p.data_nascimento!) }))
        .filter(p => p.dias <= 7)
        .sort((a, b) => a.dias - b.dias);
    },
  });

  const hoje = aniversariantes.filter(p => p.dias === 0);
  const proximos = aniversariantes.filter(p => p.dias > 0);

  if (aniversariantes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm overflow-hidden mt-3">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cake className="w-4 h-4 text-pink-500" />
          <span className="text-xs font-black uppercase tracking-widest text-pink-700">Aniversariantes</span>
          {aniversariantes.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center">
              {aniversariantes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/relatorios/aniversariantes")}
          className="text-[10px] font-black text-pink-500 hover:text-pink-700 flex items-center gap-0.5 uppercase tracking-wide"
        >
          Ver todos <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
        {/* Hoje */}
        {hoje.map(p => (
          <div key={p.id} className="flex items-center gap-2 p-2 rounded-xl bg-pink-50 border border-pink-200">
            <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 text-white text-[11px] font-black">
              🎂
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-pink-800 truncate">{p.nome}</p>
              <p className="text-[10px] text-pink-500 font-bold">
                Hoje! {p.data_nascimento ? `${calcularIdade(p.data_nascimento)} anos` : ''}
              </p>
            </div>
            {p.telefone && (
              <a
                href={`https://wa.me/55${p.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 flex-shrink-0"
              >
                <Phone className="w-3 h-3 text-green-600" />
              </a>
            )}
          </div>
        ))}

        {/* Próximos 7 dias */}
        {proximos.map(p => (
          <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-pink-50/50 transition-colors">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white",
              p.dias <= 2 ? "bg-rose-400" : p.dias <= 5 ? "bg-orange-400" : "bg-slate-300"
            )}>
              {p.dias}d
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-700 truncate">{p.nome}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                em {p.dias} {p.dias === 1 ? 'dia' : 'dias'}
                {p.data_nascimento ? ` · ${calcularIdade(p.data_nascimento) + 1} anos` : ''}
              </p>
            </div>
            {p.telefone && (
              <a
                href={`https://wa.me/55${p.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 flex-shrink-0"
              >
                <Phone className="w-3 h-3 text-green-500" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
