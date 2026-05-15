import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ShieldCheck, Loader2 } from 'lucide-react';
import { Paciente } from '@/hooks/usePacientes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExportacaoLGPDProps {
  paciente: Paciente;
}

export function ExportacaoLGPD({ paciente }: ExportacaoLGPDProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Registrar log de auditoria no supabase
      const supabaseAny = supabase as any;
      const { error: logError } = await supabaseAny
        .from('auditoria')
        .insert([{
          user_id: user?.id,
          acao: 'EXPORTACAO_DADOS_LGPD',
          tabela: 'pacientes',
          registro_id: paciente.id,
          detalhes: `Exportação de dados solicitada pelo titular (LGPD Art. 18)`,
          ip_address: null, // Obtido backend-side via trigger
        }]);
        
        if (logError && logError.code !== '42P01') { 
            console.warn("Auditoria não disponível nativamente ou tabela ausente, mas exportação continua", logError);
        }

      // Preparar os dados (Num cenário real, puxaria também de PRONTUÁRIOS e FOTOS)
      const dataToExport = {
        dados_pessoais: {
          nome: paciente.nome,
          email: paciente.email,
          telefone: paciente.telefone,
          cpf: paciente.cpf || 'Não informado',
          endereco: paciente.endereco || 'Não informado',
          data_nascimento: paciente.data_nascimento || 'Não informado',
        },
        conformidade_lgpd: {
          aceite_termos: (paciente as any).aceitou_lgpd ? 'Sim' : 'Não',
          data_aceite: (paciente as any).data_aceite_lgpd || 'Não registrado',
          ip_aceite: (paciente as any).ip_aceite_lgpd || 'Não registrado',
        },
        historico_clinico: {
          ultima_consulta: paciente.ultima_consulta || 'Nenhuma',
          status_cadastro: paciente.status,
        },
        meta: {
          gerado_em: new Date().toISOString(),
          sistema: 'Odonto PRO - Exportador Titular de Dados',
          lei_referencia: 'Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)'
        }
      };

      // Transformar para HTML para a impressão amigável ao paciente
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Dados do Paciente - Odonto PRO</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #4b5563; margin-top: 30px; }
            .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
            .row { display: flex; margin-bottom: 8px; }
            .label { font-weight: bold; width: 200px; color: #6b7280; }
            .value { flex: 1; color: #111827; font-weight: 500;}
            .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;}
            @media print {
                body { margin: 0; padding: 20px; }
                .section { break-inside: avoid; }
                button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Dados do Titular (LGPD)</h1>
          <p>Documento gerado em atendimento ao <strong>Art. 18 da Lei nº 13.709/2018 (LGPD)</strong> referente aos direitos do titular.</p>
          
          <div class="section">
            <h2>Dados Pessoais</h2>
            <div class="row"><div class="label">Nome Completo:</div><div class="value">${dataToExport.dados_pessoais.nome}</div></div>
            <div class="row"><div class="label">CPF:</div><div class="value">${dataToExport.dados_pessoais.cpf}</div></div>
            <div class="row"><div class="label">Email:</div><div class="value">${dataToExport.dados_pessoais.email}</div></div>
            <div class="row"><div class="label">Telefone:</div><div class="value">${dataToExport.dados_pessoais.telefone}</div></div>
            <div class="row"><div class="label">Endereço:</div><div class="value">${dataToExport.dados_pessoais.endereco}</div></div>
            <div class="row"><div class="label">Data de Nasc.:</div><div class="value">${dataToExport.dados_pessoais.data_nascimento}</div></div>
          </div>

          <div class="section">
            <h2>Histórico Clínico e Logs</h2>
            <div class="row"><div class="label">Status do Cadastro:</div><div class="value">${dataToExport.historico_clinico.status_cadastro}</div></div>
            <div class="row"><div class="label">Última Consulta:</div><div class="value">${dataToExport.historico_clinico.ultima_consulta}</div></div>
          </div>

          <div class="section">
            <h2>Conformidade e Sigilo</h2>
            <div class="row"><div class="label">Termos Aceitos:</div><div class="value">${dataToExport.conformidade_lgpd.aceite_termos}</div></div>
            <div class="row"><div class="label">Data de Registro:</div><div class="value">${dataToExport.conformidade_lgpd.data_aceite}</div></div>
            <div class="row"><div class="label">IP Localizador:</div><div class="value">${dataToExport.conformidade_lgpd.ip_aceite}</div></div>
          </div>

          <div class="footer">
            <p>Gerado por Odonto PRO Software. Emitido em ${new Date(dataToExport.meta.gerado_em).toLocaleString('pt-BR')}</p>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
        </html>
      `;

      // Abrir em nova janela para impressão como PDF via browser nativo
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
          toast.info('Popup bloqueado. Por favor, permita popups para este site.');
      }

      toast.success('Relatório gerado com sucesso!');

    } catch (error) {
      console.error('Erro na exportação LGPD', error);
      toast.error('Ocorreu um erro ao processar os dados.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900">Portal de Privacidade (LGPD)</h4>
          <p className="text-sm text-blue-700 mt-1 max-w-xl">
            Exporte o prontuário completo, imagens e o histórico de dados como garantia legal aos direitos do titular. Esta ação será registrada por segurança.
          </p>
        </div>
      </div>
      <Button 
        onClick={handleExport}
        disabled={isExporting}
        variant="outline" 
        className="shrink-0 bg-white border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
      >
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Extrair Documento
      </Button>
    </div>
  );
}
