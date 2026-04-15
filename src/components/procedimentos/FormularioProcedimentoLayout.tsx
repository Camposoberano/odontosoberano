import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Home, Clock, Users, Box, Calendar, Search, Package, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrdemServico } from '@/hooks/useOrdemServico';
import { usePacientes } from '@/hooks/usePacientes';
import { useDentistas } from '@/hooks/useDentistas';
import { useProteticos } from '@/hooks/useProteticos';
import { HistoricoTimeline } from './HistoricoTimeline';
import { useHistorico } from '@/hooks/useHistorico';
import { useEstoque } from '@/hooks/useEstoque';
import { PatientSearch } from '../pacientes/PatientSearch';
import { addDays } from 'date-fns';

export interface BaseProcedimentoFormData {
  ordem_servico: string;
  paciente_id: string;
  nome_paciente: string;
  data_inicial: string;
  data_entrega?: string;
  dentista_id?: string;
  protetico_id?: string;
  [key: string]: any;
}

interface FormularioProcedimentoLayoutProps {
  title: string;
  basePath: string;
  baseName: string;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  children: React.ReactNode;
  procedimentoId?: string;
  tipoProcedimento?: string;
  hideTechnicalSections?: boolean;
}

export function FormularioProcedimentoLayout({
  title,
  basePath,
  baseName,
  formData,
  setFormData,
  onSubmit,
  isPending,
  children,
  procedimentoId,
  tipoProcedimento,
  hideTechnicalSections = false
}: FormularioProcedimentoLayoutProps) {
  const navigate = useNavigate();
  const { ordensServico, loading: loadingOS } = useOrdemServico();
  const { pacientes } = usePacientes();
  const { dentistas } = useDentistas();
  const { data: proteticos } = useProteticos();
  const { itens: historico, isLoading: loadingHistorico } = useHistorico(procedimentoId, tipoProcedimento);

  const [ordemServicoSelecionada, setOrdemServicoSelecionada] = useState('');
  const [modoManual, setModoManual] = useState(false);
  const [loadingGerarOs, setLoadingGerarOs] = useState(false);
  const { estoques } = useEstoque();
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [quantidadeMaterial, setQuantidadeMaterial] = useState(1);

  // Sincronizar OS selecionada no dropdown
  useEffect(() => {
    if (ordemServicoSelecionada && ordensServico && pacientes && ordemServicoSelecionada !== 'none' && ordemServicoSelecionada !== 'loading') {
      const os = ordensServico.find(o => o.id === ordemServicoSelecionada);
      if (os) {
        const osNumero = os.numero_os ? String(os.numero_os).replace(/\D/g, '') : '';
        const paciente = pacientes.find(p => p.id === os.paciente_id);

        setFormData(prev => ({
          ...prev,
          ordem_servico: osNumero,
          paciente_id: os.paciente_id || '',
          nome_paciente: paciente?.nome || '',
        }));
      }
    }
  }, [ordemServicoSelecionada, ordensServico, pacientes, setFormData]);

  const handlePacienteChange = (pacienteId: string) => {
    const paciente = pacientes?.find((p) => p.id === pacienteId);
    console.log('Selecionando Paciente:', { pacienteId, nome: paciente?.nome });
    
    setFormData((prev) => ({
      ...prev,
      paciente_id: pacienteId,
      nome_paciente: paciente?.nome || '',
    }));
  };

  const handleDataInicialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = e.target.value;
    // Se estivermos criando (sem procedimentoId), sugerir +7 dias na data de entrega
    if (!procedimentoId && novaData) {
      const dataEntregaSugestao = addDays(new Date(novaData + 'T12:00:00'), 7).toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        data_inicial: novaData,
        data_entrega: dataEntregaSugestao
      }));
    } else {
      setFormData(prev => ({ ...prev, data_inicial: novaData }));
    }
  };

  const handleAutoGenerateOS = async () => {
    try {
      setLoadingGerarOs(true);
      const { data, error } = await supabase
        .from('ordem_servico')
        .select('numero_os')
        .order('numero_os', { ascending: false })
        .limit(1);
      
      let nextOs = 1000;
      if (data && data.length > 0) {
        const lastOsRaw = data[0].numero_os;
        const match = String(lastOsRaw).match(/^(\d+)/);
        const lastOs = match ? parseInt(match[1]) : parseInt(lastOsRaw);
        
        if (!isNaN(lastOs)) {
          nextOs = lastOs + 1;
        }
      }
      setFormData(prev => ({ ...prev, ordem_servico: nextOs.toString() }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGerarOs(false);
    }
  };

  const handleAddMaterial = () => {
    if (!materialSelecionado) return;
    const item = (estoques as any[]).find(e => e.id === materialSelecionado);
    if (!item) return;

    const novosMateriais = [...(formData.materiais || [])];
    novosMateriais.push({
      item_id: item.id,
      nome: item.item,
      quantidade: quantidadeMaterial
    });

    setFormData(prev => ({ ...prev, materiais: novosMateriais }));
    setMaterialSelecionado('');
    setQuantidadeMaterial(1);
  };

  const handleRemoveMaterial = (index: number) => {
    const novosMateriais = [...(formData.materiais || [])];
    novosMateriais.splice(index, 1);
    setFormData(prev => ({ ...prev, materiais: novosMateriais }));
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button 
            onClick={() => navigate(basePath)}
            className="flex items-center gap-2 text-primary font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform mb-4"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar para lista
          </button>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
            {title}
          </h1>
          <div className="h-2 w-24 bg-primary rounded-full mt-4"></div>
        </div>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="rounded-2xl border-2 font-bold px-6 h-14 hover:bg-slate-50"
          >
            <Home className="w-5 h-5 mr-2" /> Dashboard
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-12">
        {/* CARD 1: Informações Básicas (Obrigatório) */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-[40px] bg-white group transition-all duration-300 hover:shadow-primary/5">
          <CardHeader className="p-8 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CARD 1: Identificação e Datas</CardTitle>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Busca, Vínculo e Cronograma</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Modo de Entrada OS</Label>
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setModoManual(true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${modoManual ? 'bg-white shadow-lg text-primary scale-100' : 'text-slate-500 scale-95 hover:bg-slate-200'}`}
                  >
                    Nova OS (Manual)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoManual(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${!modoManual ? 'bg-white shadow-lg text-primary scale-100' : 'text-slate-500 scale-95 hover:bg-slate-200'}`}
                  >
                    OS Existente
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ordem_servico" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  🆔 Número da Ordem de Serviço <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="ordem_servico"
                    placeholder={modoManual ? "Digite o número..." : "Selecione à esquerda"}
                    value={formData.ordem_servico}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordem_servico: e.target.value }))}
                    className="h-14 border-2 font-black text-xl text-primary rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                    readOnly={!modoManual}
                    required
                  />
                  {modoManual && (
                    <Button 
                      type="button" 
                      onClick={handleAutoGenerateOS}
                      disabled={loadingGerarOs}
                      className="h-14 rounded-2xl bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-black"
                    >
                      {loadingGerarOs ? '...' : <PlusCircle className="w-6 h-6" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Datas - Lógica de +7 dias automática */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="data_inicial" className="text-sm font-semibold text-gray-700">📅 Data Inicial</Label>
                <Input
                  id="data_inicial"
                  type="date"
                  value={formData.data_inicial}
                  onChange={handleDataInicialChange}
                  className="h-12 border-2 hover:border-primary/50 transition-colors"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="data_entrega" className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                   🚀 Data de Entrega (D+7 Sugerido)
                </Label>
                <Input
                  id="data_entrega"
                  type="date"
                  value={formData.data_entrega}
                  onChange={(e) => setFormData((prev) => ({ ...prev, data_entrega: e.target.value }))}
                  className="h-12 border-2 border-emerald-100 bg-emerald-50/30 hover:border-emerald-500 transition-colors font-bold text-emerald-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!modoManual ? (
                <div className="space-y-3">
                  <Label htmlFor="os_dropdown" className="text-sm font-semibold text-gray-700">Vincular a OS Master</Label>
                  <Select value={ordemServicoSelecionada} onValueChange={setOrdemServicoSelecionada}>
                    <SelectTrigger id="os_dropdown" className="h-12 border-2 hover:border-primary/50 transition-colors bg-white">
                      <SelectValue placeholder="Escolha uma OS no sistema..." />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingOS ? (
                        <SelectItem value="loading">Carregando ordens...</SelectItem>
                      ) : (
                        ordensServico?.map((os) => (
                          <SelectItem key={os.id} value={os.id}>
                            OS: {os.numero_os} - {os.paciente_id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-3">
                 <Label htmlFor="paciente_id" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  👤 Paciente <span className="text-red-500">*</span>
                </Label>
                {!modoManual ? (
                  <div className="relative">
                    <Input
                      id="nome_paciente_read"
                      type="text"
                      placeholder="Será preenchido automaticamente"
                      value={formData.nome_paciente}
                      readOnly
                      className="h-14 border-2 bg-slate-50 font-bold text-lg cursor-not-allowed"
                      required
                    />
                  </div>
                ) : (
                  <PatientSearch 
                    selectedPacienteId={formData.paciente_id}
                    onSelect={handlePacienteChange}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Detalhes Técnicos (Onde entra o conteúdo específico de cada página) */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-[40px] bg-white group transition-all duration-300 hover:shadow-primary/5">
          <CardHeader className="p-8 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Box className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CARD 2: Detalhes Técnicos</CardTitle>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Especificação da Peça Protetética</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>

        {/* Seção Oculta na Criação (Profissionais e Materiais) */}
        {!hideTechnicalSections && (
          <>
            <Card className="border-none shadow-2xl overflow-hidden rounded-[40px] bg-white group transition-all duration-300 hover:shadow-primary/5">
              <CardHeader className="p-8 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CARD 3: Profissionais Responsáveis</CardTitle>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Dentista e Laboratório</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="dentista_id" className="text-sm font-semibold text-gray-700">👨‍⚕️ Dentista Responsável</Label>
                    <Select value={formData.dentista_id} onValueChange={(val) => setFormData((prev) => ({ ...prev, dentista_id: val }))}>
                      <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors bg-white">
                        <SelectValue placeholder="Selecione o dentista" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentistas?.map((dentista) => (
                          <SelectItem key={dentista.id} value={dentista.id}>
                            {dentista.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="protetico_id" className="text-sm font-semibold text-gray-700">🎨 Laboratório / Protético</Label>
                    <Select value={formData.protetico_id} onValueChange={(val) => setFormData((prev) => ({ ...prev, protetico_id: val }))}>
                      <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors bg-white">
                        <SelectValue placeholder="Selecione o protético" />
                      </SelectTrigger>
                      <SelectContent>
                        {proteticos?.map((protetico) => (
                          <SelectItem key={protetico.id} value={protetico.id}>
                            {protetico.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl overflow-hidden rounded-[40px] bg-white group transition-all duration-300 hover:shadow-emerald-500/5">
              <CardHeader className="p-8 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/30 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight italic">CARD 4: Materiais e Estoque</CardTitle>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mt-1">Consumo e Planejamento</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3">
                    <Label htmlFor="material" className="text-sm font-semibold text-gray-700">Item do Estoque</Label>
                    <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                      <SelectTrigger className="h-12 border-2 bg-white">
                        <SelectValue placeholder="Selecione um item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {estoques?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.item} ({item.estoque} em estoque)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Qtd</Label>
                      <Input 
                        type="number" 
                        value={quantidadeMaterial} 
                        onChange={e => setQuantidadeMaterial(Number(e.target.value))}
                        min={1}
                        className="h-12 border-2"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddMaterial}
                      disabled={!materialSelecionado}
                      className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.materiais?.map((mat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border-2 border-gray-100 group transition-all hover:border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{mat.nome}</p>
                          <p className="text-xs text-gray-500 font-bold">Quantidade: <span className="text-emerald-700">{mat.quantidade}</span></p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer de Ações */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t-2 border-dashed border-gray-200">
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 h-20 text-xl font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transform hover:scale-[1.02] transition-all rounded-[30px] gap-4"
          >
            {isPending ? '⏳ SALVANDO...' : <><Save className="w-6 h-6" /> SALVAR PROCEDIMENTO</>}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(basePath)}
            className="flex-1 sm:flex-none h-12 border-2 hover:bg-gray-50 transition-all duration-200 text-base font-semibold px-8"
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Histórico na Edição */}
      {procedimentoId && (
        <Card className="border-2 shadow-lg mt-8 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl flex items-center gap-3 text-gray-800">
              <Clock className="w-5 h-5 text-gray-600" /> Linha do Tempo da OS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-6 pb-12">
            <HistoricoTimeline itens={historico} isLoading={loadingHistorico} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
