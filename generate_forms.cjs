const fs = require('fs');
const path = require('path');

const forms = [
  {
    file: 'NovoProcedimento.tsx', title: '✨ Novo Procedimento PPR', baseName: 'PPR', basePath: '/procedimentos/ppr', hookName: 'useCreateProcedimento', hookImport: 'useProcedimentos',
    customFields: { arcada: '', dente: '' },
    children: `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="arcada" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Arcada <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.arcada} onValueChange={(value) => setFormData((prev) => ({ ...prev, arcada: value }))}>
                  <SelectTrigger id="arcada" className="h-12 border-2 hover:border-primary/50 transition-colors"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUP">⬆️ Superior</SelectItem>
                    <SelectItem value="INF">⬇️ Inferior</SelectItem>
                    <SelectItem value="SUP/INF">⬆️⬇️ Superior e Inferior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="dente" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Dente(s) <span className="text-red-500">*</span>
                </Label>
                <Input id="dente" placeholder="Ex: 11, 12, 13..." value={formData.dente} onChange={(e) => setFormData((prev) => ({ ...prev, dente: e.target.value }))} className="h-12 border-2 hover:border-primary/50" />
              </div>
            </div>`
  },
  {
    file: 'NovoPTPM.tsx', title: '✨ Novo Procedimento PT/PM', baseName: 'PT/PM', basePath: '/procedimentos/pt-pm', hookName: 'useCreateProcedimentoPTPM', hookImport: 'useProcedimentosPTPM',
    customFields: { arcada: '', tipo_protese: '', observacoes: '' },
    children: `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Tipo de Prótese <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.tipo_protese} onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo_protese: value }))}>
                  <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent><SelectItem value="PT">PT - Prótese Total</SelectItem><SelectItem value="PM">PM - Prótese Móvel</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🦷 Arcada</Label>
                <Select value={formData.arcada} onValueChange={(value) => setFormData((prev) => ({ ...prev, arcada: value }))}>
                  <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="SUP">⬆️ Superior</SelectItem><SelectItem value="INF">⬇️ Inferior</SelectItem><SelectItem value="SUP/INF">⬆️⬇️ Superior e Inferior</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações adicionais..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2 hover:border-primary/50 resize-none"/>
            </div>`
  },
  {
    file: 'NovaFixa.tsx', title: '✨ Nova Prótese Fixa', baseName: 'Fixa', basePath: '/procedimentos/fixa', hookName: 'useCreateProcedimentoFixa', hookImport: 'useProcedimentosFixa',
    customFields: { dente: '', observacoes: '' },
    children: `
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Dente(s) <span className="text-red-500">*</span></Label>
              <Input placeholder="Ex: 11, 12, 13..." value={formData.dente} onChange={(e) => setFormData((prev) => ({ ...prev, dente: e.target.value }))} className="h-12 border-2" />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovoProtocoloProvisorio.tsx', title: '✨ Novo Protocolo Provisório', baseName: 'Protocolo Provisório', basePath: '/procedimentos/protocolo-provisorio', hookName: 'useCreateProcedimentoProtocolo', hookImport: 'useProcedimentosProtocolo',
    customFields: { arcada: '', observacoes: '', tipo_protocolo: 'PROVISORIO' },
    children: `
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🦷 Arcada</Label>
              <Select value={formData.arcada} onValueChange={(value) => setFormData((prev) => ({ ...prev, arcada: value }))}>
                <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors"><SelectValue placeholder="Selecione a arcada" /></SelectTrigger>
                <SelectContent><SelectItem value="SUP">⬆️ Superior</SelectItem><SelectItem value="INF">⬇️ Inferior</SelectItem><SelectItem value="SUP/INF">⬆️⬇️ Superior e Inferior</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovoProtocoloDefinitivo.tsx', title: '✨ Novo Protocolo Definitivo', baseName: 'Protocolo Definitivo', basePath: '/procedimentos/protocolo-definitivo', hookName: 'useCreateProcedimentoProtocolo', hookImport: 'useProcedimentosProtocolo',
    customFields: { arcada: '', observacoes: '', tipo_protocolo: 'DEFINITIVO' },
    children: `
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🦷 Arcada</Label>
              <Select value={formData.arcada} onValueChange={(value) => setFormData((prev) => ({ ...prev, arcada: value }))}>
                <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors"><SelectValue placeholder="Selecione a arcada" /></SelectTrigger>
                <SelectContent><SelectItem value="SUP">⬆️ Superior</SelectItem><SelectItem value="INF">⬇️ Inferior</SelectItem><SelectItem value="SUP/INF">⬆️⬇️ Superior e Inferior</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovaResinaImpressa.tsx', title: '✨ Nova Resina Impressa', baseName: 'Resina Impressa', basePath: '/procedimentos/resina-impressa', hookName: 'useCreateResinaImpressa', hookImport: 'useResinaImpressa',
    customFields: { tipo_trabalho: '', cor: '', observacoes: '' },
    children: `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🦷 Tipo de Trabalho</Label>
                <Input placeholder="Ex: Placa miorrelaxante, Provisório..." value={formData.tipo_trabalho} onChange={(e) => setFormData((prev) => ({ ...prev, tipo_trabalho: e.target.value }))} className="h-12 border-2" />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🎨 Cor</Label>
                <Input placeholder="Ex: A1, A2, BL1..." value={formData.cor} onChange={(e) => setFormData((prev) => ({ ...prev, cor: e.target.value }))} className="h-12 border-2" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovaCeramica.tsx', title: '✨ Nova Cerâmica', baseName: 'Cerâmica', basePath: '/procedimentos/ceramica', hookName: 'useCreateCeramica', hookImport: 'useCeramica',
    customFields: { dente: '', cor: '', observacoes: '' },
    children: `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Dente(s) <span className="text-red-500">*</span></Label>
                <Input placeholder="Ex: 11, 12, 13..." value={formData.dente} onChange={(e) => setFormData((prev) => ({ ...prev, dente: e.target.value }))} className="h-12 border-2" required />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🎨 Cor</Label>
                <Input placeholder="Ex: A1, A2, BL1..." value={formData.cor} onChange={(e) => setFormData((prev) => ({ ...prev, cor: e.target.value }))} className="h-12 border-2" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovaPlaca.tsx', title: '✨ Nova Placa de Bruxismo/Clareamento', baseName: 'Placa', basePath: '/procedimentos/placa', hookName: 'useCreatePlaca', hookImport: 'usePlaca',
    customFields: { tipo_placa: '', arcada: '', observacoes: '' },
    children: `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Tipo de Placa <span className="text-red-500">*</span></Label>
                <Select value={formData.tipo_placa} onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo_placa: value }))}>
                  <SelectTrigger className="h-12 border-2 text-left"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="BRUXISMO">Bruxismo</SelectItem><SelectItem value="CLAREAMENTO">Clareamento</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>🦷 Arcada</Label>
                <Select value={formData.arcada} onValueChange={(value) => setFormData((prev) => ({ ...prev, arcada: value }))}>
                  <SelectTrigger className="h-12 border-2 text-left"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="SUP">⬆️ Superior</SelectItem><SelectItem value="INF">⬇️ Inferior</SelectItem><SelectItem value="SUP/INF">⬆️⬇️ Superior e Inferior</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovoProvisorio.tsx', title: '✨ Novo Provisório', baseName: 'Provisório', basePath: '/procedimentos/provisorio', hookName: 'useCreateProvisorio', hookImport: 'useProvisorio',
    customFields: { dente: '', observacoes: '' },
    children: `
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🦷 Dente(s) <span className="text-red-500">*</span></Label>
              <Input placeholder="Ex: 11, 12, 13..." value={formData.dente} onChange={(e) => setFormData((prev) => ({ ...prev, dente: e.target.value }))} className="h-12 border-2" required />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  },
  {
    file: 'NovoLabExterno.tsx', title: '✨ Novo Laboratório Externo', baseName: 'Lab Externo', basePath: '/procedimentos/lab-externo', hookName: 'useCreateLabExterno', hookImport: 'useLabExterno',
    customFields: { servico_solicitado: '', observacoes: '' },
    children: `
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>🛠️ Serviço Solicitado <span className="text-red-500">*</span></Label>
              <Textarea placeholder="Ex: Placa estabilizadora, Zircônia..." value={formData.servico_solicitado} onChange={(e) => setFormData((prev) => ({ ...prev, servico_solicitado: e.target.value }))} rows={2} className="border-2" required />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>📝 Observações</Label>
              <Textarea placeholder="Observações adicionais..." value={formData.observacoes} onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))} rows={3} className="border-2"/>
            </div>`
  }
];

forms.forEach(form => {
  const customFieldsKeys = Object.keys(form.customFields);
  let customFieldsInit = '';
  customFieldsKeys.forEach(k => { 
    customFieldsInit += '    ' + k + ': \'' + form.customFields[k] + '\',\n'; 
  });
  
  let customFieldsSubmit = '';
  customFieldsKeys.forEach(k => { 
    customFieldsSubmit += '        ' + k + ': formData.' + k + ' || null,\n'; 
  });

  const layoutContent = [
    "import { useState } from 'react';",
    "import { useNavigate } from 'react-router-dom';",
    "import { FormularioProcedimentoLayout } from '@/components/procedimentos/FormularioProcedimentoLayout';",
    "import { " + form.hookName + " } from '@/hooks/" + form.hookImport + "';",
    "import { Label } from '@/components/ui/label';",
    "import { Input } from '@/components/ui/input';",
    "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';",
    "import { Textarea } from '@/components/ui/textarea';",
    "",
    "export default function " + form.file.replace('.tsx', '') + "() {",
    "  const navigate = useNavigate();",
    "  const createProcedimento = " + form.hookName + "();",
    "",
    "  const [formData, setFormData] = useState({",
    "    ordem_servico: '',",
    "    paciente_id: '',",
    "    nome_paciente: '',",
    "    data_inicial: new Date().toISOString().split('T')[0],",
    "    data_entrega: '',",
    "    dentista_id: '',",
    "    protetico_id: '',",
    customFieldsInit + "  });",
    "",
    "  const handleSubmit = async (e: React.FormEvent) => {",
    "    e.preventDefault();",
    "    if (!formData.ordem_servico || !formData.nome_paciente) {",
    "      alert('Por favor, preencha a OS e o Paciente');",
    "      return;",
    "    }",
    "",
    "    try {",
    "      await createProcedimento.mutateAsync({",
    "        ordem_servico: parseInt(formData.ordem_servico),",
    "        nome_paciente: formData.nome_paciente,",
    "        paciente_id: formData.paciente_id || null,",
    "        data_inicial: formData.data_inicial,",
    "        data_entrega: formData.data_entrega || null,",
    "        dentista_id: formData.dentista_id && formData.dentista_id !== 'none' ? formData.dentista_id : null,",
    "        protetico_id: formData.protetico_id && formData.protetico_id !== 'none' ? parseInt(formData.protetico_id) : null,",
    customFieldsSubmit + "      });",
    "      navigate('" + form.basePath + "');",
    "    } catch (error) {",
    "      console.error('Erro ao criar:', error);",
    "    }",
    "  };",
    "",
    "  return (",
    "    <FormularioProcedimentoLayout",
    "      title=\"" + form.title + "\"",
    "      baseName=\"" + form.baseName + "\"",
    "      basePath=\"" + form.basePath + "\"",
    "      formData={formData}",
    "      setFormData={setFormData}",
    "      onSubmit={handleSubmit}",
    "      isPending={createProcedimento.isPending}",
    "    >",
    form.children,
    "    </FormularioProcedimentoLayout>",
    "  );",
    "}"
  ].join('\n');

  fs.writeFileSync(path.join('e:\\\\Projetos_Novos\\\\Odonto PRO\\\\src\\\\pages\\\\procedimentos', form.file), layoutContent, 'utf8');
  console.log('Gerado', form.file);
});
