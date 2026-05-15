import { supabase } from '@/integrations/supabase/client';

/**
 * Função responsável por sincronizar a Ordem de Serviço na tabela mestre.
 * Garante que quando um procedimento for cadastrado, a sua Ordem de Serviço 
 * seja refletida em 'ordem_servico' para a secretária conseguir fazer a busca
 * se ela não existir.
 */
export async function ensureOrdemServicoExists(
  numero_os: number | string,
  user_id: string,
  paciente_id?: string | null,
  dentista_id?: string | null,
  protetico_id?: string | number | null
) {
  if (!numero_os) return;
  
  const osString = numero_os.toString().trim();
  if (osString === '') return;
  
  try {
    // Tenta encontrar a OS
    const { data: existingOS, error: findError } = await supabase
      .from('ordem_servico')
      .select('id')
      .eq('numero_os', osString)
      .maybeSingle();

    if (findError) {
      console.warn('Alerta ao pesquisar OS preexistente:', findError);
    }

    // Se a OS não existe, criamos automaticamente
    if (!existingOS && paciente_id) {
      console.info(`Criando OS ${osString} automaticamente na tabela Mestre.`);
      
      const { error: insertError } = await supabase.from('ordem_servico').insert({
        numero_os: osString,
        user_id: user_id,
        paciente_id: paciente_id || null, // Garantir nulo em vez de vazio
        dentista_id: (dentista_id && dentista_id !== "none") ? dentista_id : null, // Sanitizado
        protetico_id: (protetico_id && protetico_id !== "none" && protetico_id !== "loading") ? Number(protetico_id) : null, // Sanitizado
        data_abertura: new Date().toISOString().split('T')[0],
        status: 'Aberta',
        valor_total: 0,
      });

      if (insertError) {
        console.error('Falha ao sincronizar criação de OS Mestre:', insertError);
      }
    }
  } catch (err) {
    console.error('Erro irrecuperável ao sincronizar OS Master:', err);
  }
}
