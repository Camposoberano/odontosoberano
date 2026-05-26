import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Printer, Users, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function RelatorioPacientesIndicados() {
  const { user } = useAuth();

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ["relatorio-pacientes-indicados", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome, telefone, cpf, created_at, como_conheceu, status")
        .eq("como_conheceu", "Indicação")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
              PACIENTES INDICADOS
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Pacientes que vieram por indicação
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="h-9 px-4 text-base font-black">
              <Users className="w-4 h-4 mr-2" />
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""}
            </Badge>
            <Button variant="outline" onClick={() => window.print()} className="gap-2 no-print">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Pacientes Captados por Indicação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : pacientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum paciente com indicação registrada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Paciente</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Cadastro</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">CPF</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Telefone</th>
                      <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map(p => (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.nome}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {p.cpf ? p.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.telefone ? (
                            <a href={`https://wa.me/55${p.telefone.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-green-600 hover:underline font-medium">
                              <Phone className="w-3 h-3" /> {p.telefone}
                            </a>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={p.status === "Ativo" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
