import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, FileText, User, Clock } from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useFichaClinica, type FichaClinicaInput } from "@/hooks/useFichaClinica";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ExportacaoLGPD } from "@/components/pacientes/ExportacaoLGPD";
import { motion, Variants } from "framer-motion";
import { PatientSearch } from "@/components/pacientes/PatientSearch";

interface FichaClinicaProps {
  pacienteId: string;
}

export function FichaClinica({ pacienteId }: FichaClinicaProps) {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  const { pacientes } = usePacientes();
  const { fichaClinica, isLoading, saveFichaClinica } = useFichaClinica(pacienteId);

  // Mock dados de consultas recentes para demonstração de UI
  const recentConsultations = [
    { id: 1, date: "10/03/2024", description: "Avaliação Inicial", status: "Concluído" },
    { id: 2, date: "15/02/2024", description: "Limpeza (Profilaxia)", status: "Concluído" },
    { id: 3, date: "20/11/2023", description: "Restauração", status: "Concluído" }
  ];

  const [formData, setFormData] = useState<FichaClinicaInput>({
    paciente_id: "",
    contato_emergencia_nome: "",
    contato_emergencia_telefone: "",
    contato_emergencia_parentesco: "",
    queixa_principal: "",
    historico_medico: "",
    alergias: "",
    pressao_arterial: "",
    temperatura: "",
    peso: "",
    exame_extraoral: "",
    exame_intraoral: "",
    diagnostico: "",
    plano_tratamento: "",
    observacoes: "",
  });

  // Load ficha data when it changes
  useEffect(() => {
    if (fichaClinica) {
      setFormData({
        paciente_id: fichaClinica.paciente_id,
        contato_emergencia_nome: fichaClinica.contato_emergencia_nome || "",
        contato_emergencia_telefone: fichaClinica.contato_emergencia_telefone || "",
        contato_emergencia_parentesco: fichaClinica.contato_emergencia_parentesco || "",
        queixa_principal: fichaClinica.queixa_principal || "",
        historico_medico: fichaClinica.historico_medico || "",
        alergias: fichaClinica.alergias || "",
        pressao_arterial: fichaClinica.pressao_arterial || "",
        temperatura: fichaClinica.temperatura || "",
        peso: fichaClinica.peso || "",
        exame_extraoral: fichaClinica.exame_extraoral || "",
        exame_intraoral: fichaClinica.exame_intraoral || "",
        diagnostico: fichaClinica.diagnostico || "",
        plano_tratamento: fichaClinica.plano_tratamento || "",
        observacoes: fichaClinica.observacoes || "",
      });
    } else if (pacienteId) {
      // Reset form for new ficha
      setFormData({
        paciente_id: pacienteId,
        contato_emergencia_nome: "",
        contato_emergencia_telefone: "",
        contato_emergencia_parentesco: "",
        queixa_principal: "",
        historico_medico: "",
        alergias: "",
        pressao_arterial: "",
        temperatura: "",
        peso: "",
        exame_extraoral: "",
        exame_intraoral: "",
        diagnostico: "",
        plano_tratamento: "",
        observacoes: "",
      });
    }
  }, [fichaClinica, pacienteId]);


  const handleInputChange = (field: keyof FichaClinicaInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!pacienteId) {
      return;
    }
    saveFichaClinica.mutate({ ...formData, paciente_id: pacienteId });
  };

  const selectedPaciente = pacientes.find(p => p.id === pacienteId);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Ficha Clínica</h2>
          <p className="text-sm text-muted-foreground">
            Informações médicas e histórico do paciente
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={!pacienteId || saveFichaClinica.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveFichaClinica.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {selectedPaciente && (
        <motion.div variants={itemVariants}>
          <ExportacaoLGPD paciente={selectedPaciente} />
        </motion.div>
      )}

      {pacienteId && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dados Pessoais - Read Only */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome Completo</Label>
                      <Input value={selectedPaciente?.nome || ""} disabled />
                    </div>
                    <div>
                      <Label>CPF</Label>
                      <Input value={selectedPaciente?.cpf || ""} disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Nascimento</Label>
                      <Input value={selectedPaciente?.data_nascimento || ""} disabled />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input value={selectedPaciente?.telefone || ""} disabled />
                    </div>
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input value={selectedPaciente?.endereco || ""} disabled />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contato de Emergência */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Contato de Emergência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contato_nome">Nome</Label>
                    <Input
                      id="contato_nome"
                      placeholder="Nome do contato"
                      value={formData.contato_emergencia_nome}
                      onChange={(e) => handleInputChange('contato_emergencia_nome', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contato_telefone">Telefone</Label>
                      <Input
                        id="contato_telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.contato_emergencia_telefone}
                        onChange={(e) => handleInputChange('contato_emergencia_telefone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentesco">Parentesco</Label>
                      <Input
                        id="parentesco"
                        placeholder="Mãe, pai, etc."
                        value={formData.contato_emergencia_parentesco}
                        onChange={(e) => handleInputChange('contato_emergencia_parentesco', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Anamnese */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Anamnese</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="queixa_principal">Queixa Principal</Label>
                  <Textarea
                    id="queixa_principal"
                    placeholder="Descreva o motivo da consulta"
                    className="min-h-[80px]"
                    value={formData.queixa_principal}
                    onChange={(e) => handleInputChange('queixa_principal', e.target.value)}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="historico_medico">Histórico Médico</Label>
                  <Textarea
                    id="historico_medico"
                    placeholder="Doenças, cirurgias, medicamentos em uso..."
                    className="min-h-[100px]"
                    value={formData.historico_medico}
                    onChange={(e) => handleInputChange('historico_medico', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="alergias">Alergias</Label>
                  <Textarea
                    id="alergias"
                    placeholder="Medicamentos, materiais, alimentos..."
                    className="min-h-[60px]"
                    value={formData.alergias}
                    onChange={(e) => handleInputChange('alergias', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exame Clínico */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Exame Clínico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pressao">Pressão Arterial</Label>
                    <Input
                      id="pressao"
                      placeholder="120/80 mmHg"
                      value={formData.pressao_arterial}
                      onChange={(e) => handleInputChange('pressao_arterial', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperatura">Temperatura</Label>
                    <Input
                      id="temperatura"
                      placeholder="36.5°C"
                      value={formData.temperatura}
                      onChange={(e) => handleInputChange('temperatura', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso</Label>
                    <Input
                      id="peso"
                      placeholder="70 kg"
                      value={formData.peso}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="exame_extraoral">Exame Extraoral</Label>
                  <Textarea
                    id="exame_extraoral"
                    placeholder="Simetria facial, palpação, ATM..."
                    className="min-h-[80px]"
                    value={formData.exame_extraoral}
                    onChange={(e) => handleInputChange('exame_extraoral', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="exame_intraoral">Exame Intraoral</Label>
                  <Textarea
                    id="exame_intraoral"
                    placeholder="Mucosas, língua, dentes, gengiva..."
                    className="min-h-[80px]"
                    value={formData.exame_intraoral}
                    onChange={(e) => handleInputChange('exame_intraoral', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Diagnóstico e Plano de Tratamento */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Diagnóstico e Plano de Tratamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="diagnostico">Diagnóstico</Label>
                  <Textarea
                    id="diagnostico"
                    placeholder="Diagnóstico clínico..."
                    className="min-h-[80px]"
                    value={formData.diagnostico}
                    onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="plano_tratamento">Plano de Tratamento</Label>
                  <Textarea
                    id="plano_tratamento"
                    placeholder="Procedimentos planejados, sequência de tratamento..."
                    className="min-h-[100px]"
                    value={formData.plano_tratamento}
                    onChange={(e) => handleInputChange('plano_tratamento', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais..."
                    className="min-h-[60px]"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {!pacienteId && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecione um paciente para gerenciar a ficha clínica
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
