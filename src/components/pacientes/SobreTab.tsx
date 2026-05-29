import { Paciente } from "@/hooks/usePacientes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User, Phone, Mail, MapPin, Calendar, CreditCard, Heart,
  Tag, Globe, UserCheck, Briefcase, Home,
} from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  paciente: Paciente;
}

function calcularIdade(nascimento?: string | null): string {
  if (!nascimento) return "—";
  const hoje = new Date();
  const nasc = new Date(nascimento + "T00:00:00");
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
  return `${idade} anos`;
}

function Campo({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-slate-800 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

export function SobreTab({ paciente }: Props) {
  const enderecoCompleto = [
    paciente.rua && `${paciente.rua}, ${paciente.numero ?? "s/n"}`,
    paciente.complemento,
    paciente.bairro,
    paciente.cidade && `${paciente.cidade} — ${paciente.estado ?? ""}`,
    paciente.cep && `CEP ${paciente.cep}`,
  ].filter(Boolean).join(" · ");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/10">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20 flex-shrink-0">
          {(paciente.apelido || paciente.nome)?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-slate-800 truncate">{paciente.nome}</h2>
          {paciente.apelido && <p className="text-xs text-muted-foreground font-medium">"{paciente.apelido}"</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge className={paciente.status === "Ativo" ? "bg-green-100 text-green-800 text-[10px]" : "bg-red-100 text-red-800 text-[10px]"}>
              {paciente.status}
            </Badge>
            {paciente.genero && <Badge variant="outline" className="text-[10px]">{paciente.genero}</Badge>}
            {paciente.numero_prontuario && (
              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                Prontuário #{paciente.numero_prontuario}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dados Pessoais */}
        <Secao titulo="Dados Pessoais">
          <div className="grid grid-cols-2 gap-4">
            <Campo label="CPF" value={paciente.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')} icon={CreditCard} />
            <Campo label="Data de Nascimento" value={paciente.data_nascimento ? new Date(paciente.data_nascimento + "T00:00:00").toLocaleDateString("pt-BR") : null} icon={Calendar} />
            <Campo label="Idade" value={calcularIdade(paciente.data_nascimento)} />
            <Campo label="Gênero" value={paciente.genero} icon={User} />
            <Campo label="Profissão" value={paciente.profissao} icon={Briefcase} />
            <Campo label="Como conheceu" value={paciente.como_conheceu} />
          </div>
          {paciente.etiquetas && paciente.etiquetas.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Etiquetas
              </p>
              <div className="flex flex-wrap gap-1">
                {paciente.etiquetas.map(e => (
                  <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                ))}
              </div>
            </div>
          )}
        </Secao>

        {/* Contato */}
        <Secao titulo="Contato">
          <Campo label="Telefone / WhatsApp" value={paciente.telefone} icon={Phone} />
          <Campo label="E-mail" value={paciente.email} icon={Mail} />
          {paciente.rede_social && <Campo label="Rede Social" value={paciente.rede_social} icon={Globe} />}
          {paciente.paciente_estrangeiro && (
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[10px]">
              Paciente Estrangeiro
            </Badge>
          )}

          <Separator />

          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary" /> Endereço
          </p>
          {enderecoCompleto ? (
            <div className="space-y-1">
              {paciente.rua && (
                <p className="text-sm font-medium text-slate-800">
                  {paciente.rua}, {paciente.numero ?? "s/n"}{paciente.complemento ? ` — ${paciente.complemento}` : ""}
                </p>
              )}
              {paciente.bairro && <p className="text-xs text-muted-foreground">{paciente.bairro}</p>}
              {paciente.cidade && (
                <p className="text-xs text-muted-foreground">
                  {paciente.cidade}{paciente.estado ? ` — ${paciente.estado}` : ""}
                  {paciente.cep ? ` · CEP ${paciente.cep}` : ""}
                </p>
              )}
              {paciente.observacao_endereco && (
                <p className="text-xs text-muted-foreground italic">Obs.: {paciente.observacao_endereco}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Endereço não cadastrado</p>
          )}
        </Secao>

        {/* Responsável (se menor/dependente) */}
        {(paciente.nome_responsavel || paciente.cpf_responsavel) && (
          <Secao titulo="Responsável Legal">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nome" value={paciente.nome_responsavel} icon={UserCheck} />
              <Campo label="CPF" value={paciente.cpf_responsavel} icon={CreditCard} />
              <Campo label="Telefone" value={paciente.telefone_responsavel} icon={Phone} />
              <Campo label="E-mail" value={paciente.email_responsavel} icon={Mail} />
              {paciente.data_nasc_responsavel && (
                <Campo label="Data de Nascimento" value={new Date(paciente.data_nasc_responsavel + "T00:00:00").toLocaleDateString("pt-BR")} icon={Calendar} />
              )}
            </div>
          </Secao>
        )}

        {/* Plano / Convênio */}
        {paciente.numero_carteirinha && (
          <Secao titulo="Convênio / Plano">
            <Campo label="Nº Carteirinha" value={paciente.numero_carteirinha} icon={CreditCard} />
            <Campo label="Titular do Plano" value={paciente.titular_plano} icon={User} />
          </Secao>
        )}
      </div>
    </motion.div>
  );
}
