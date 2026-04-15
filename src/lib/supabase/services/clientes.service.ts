/**
 * Serviço de Clientes - Gerenciamento completo de clientes
 */

import { supabase, createResponse, paginatedQuery, type SupabaseResponse } from '../client'

export type Cliente = {
  id?: string
  whatsapp_id: string
  telefone?: string
  nome?: string
  email?: string
  cpf_cnpj?: string
  data_nascimento?: string
  genero?: 'masculino' | 'feminino' | 'outro' | 'nao_informado'
  endereco?: Record<string, any>
  categoria_id?: string
  tags?: string[]
  funil_stage_id?: string
  score?: number
  status?: 'lead' | 'cliente' | 'vip' | 'inativo' | 'bloqueado'
  origem?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  preferencias?: Record<string, any>
  observacoes?: string
  indicado_por?: string
  user_id?: string
}

export type ClienteCompleto = Cliente & {
  categoria?: { nome: string; cor: string }
  funil_stage?: { nome: string; cor: string }
  total_compras: number
  valor_total_gasto: number
  ticket_medio: number
  ultima_compra_em?: string
  pedidos?: any[]
  interacoes?: any[]
}

export type FiltrosCliente = {
  status?: string[]
  categoria_id?: string
  funil_stage_id?: string
  tags?: string[]
  busca?: string
  score_min?: number
  score_max?: number
  data_cadastro_inicio?: string
  data_cadastro_fim?: string
}

class ClientesService {

  /**
   * Criar novo cliente
   */
  async criar(cliente: Cliente): Promise<SupabaseResponse<Cliente>> {
    // Verificar se já existe
    const existe = await this.buscarPorWhatsApp(cliente.whatsapp_id)
    if (existe.data) {
      return createResponse(null, { message: 'Cliente já existe', code: 409 })
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        ...cliente,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Buscar cliente por WhatsApp ID
   */
  async buscarPorWhatsApp(whatsapp_id: string): Promise<SupabaseResponse<ClienteCompleto>> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        categoria:categorias(nome, cor),
        funil_stage:funil_vendas(nome, cor),
        pedidos(id, numero_pedido, total, status, created_at),
        interacoes(id, tipo, conteudo, created_at)
      `)
      .eq('whatsapp_id', whatsapp_id)
      .single()

    return createResponse(data, error)
  }

  /**
   * Buscar cliente por ID
   */
  async buscarPorId(id: string): Promise<SupabaseResponse<ClienteCompleto>> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        categoria:categorias(nome, cor),
        funil_stage:funil_vendas(nome, cor),
        pedidos(id, numero_pedido, total, status, created_at),
        interacoes(id, tipo, conteudo, created_at)
      `)
      .eq('id', id)
      .single()

    return createResponse(data, error)
  }

  /**
   * Listar clientes com filtros e paginação
   */
  async listar(
    filtros: FiltrosCliente = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<SupabaseResponse<ClienteCompleto[]>> {
    let query = supabase
      .from('clientes')
      .select(`
        *,
        categoria:categorias(nome, cor),
        funil_stage:funil_vendas(nome, cor)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filtros.status && filtros.status.length > 0) {
      query = query.in('status', filtros.status)
    }

    if (filtros.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id)
    }

    if (filtros.funil_stage_id) {
      query = query.eq('funil_stage_id', filtros.funil_stage_id)
    }

    if (filtros.tags && filtros.tags.length > 0) {
      query = query.contains('tags', filtros.tags)
    }

    if (filtros.score_min !== undefined) {
      query = query.gte('score', filtros.score_min)
    }

    if (filtros.score_max !== undefined) {
      query = query.lte('score', filtros.score_max)
    }

    if (filtros.busca) {
      query = query.or(`nome.ilike.%${filtros.busca}%,telefone.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`)
    }

    return paginatedQuery(query, page, pageSize)
  }

  /**
   * Atualizar cliente
   */
  async atualizar(id: string, dados: Partial<Cliente>): Promise<SupabaseResponse<Cliente>> {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...dados,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Atualizar score do cliente
   */
  async atualizarScore(id: string, score: number, breakdown?: Record<string, number>): Promise<SupabaseResponse<Cliente>> {
    return this.atualizar(id, {
      score,
      score_breakdown: breakdown
    })
  }

  /**
   * Mover cliente no funil
   */
  async moverNoFunil(id: string, funil_stage_id: string): Promise<SupabaseResponse<Cliente>> {
    return this.atualizar(id, {
      funil_stage_id,
      funil_updated_at: new Date().toISOString()
    } as any)
  }

  /**
   * Adicionar tags ao cliente
   */
  async adicionarTags(id: string, novasTags: string[]): Promise<SupabaseResponse<Cliente>> {
    const cliente = await this.buscarPorId(id)
    if (!cliente.data) return createResponse(null, cliente.error)

    const tagsAtuais = cliente.data.tags || []
    const tagsUnicas = [...new Set([...tagsAtuais, ...novasTags])]

    return this.atualizar(id, { tags: tagsUnicas })
  }

  /**
   * Remover tags do cliente
   */
  async removerTags(id: string, tagsRemover: string[]): Promise<SupabaseResponse<Cliente>> {
    const cliente = await this.buscarPorId(id)
    if (!cliente.data) return createResponse(null, cliente.error)

    const tagsAtuais = cliente.data.tags || []
    const tagsFiltradas = tagsAtuais.filter(tag => !tagsRemover.includes(tag))

    return this.atualizar(id, { tags: tagsFiltradas })
  }

  /**
   * Registrar interação
   */
  async registrarInteracao(
    cliente_id: string,
    interacao: {
      tipo: string
      canal: string
      conteudo: string
      sentimento?: string
      tags?: string[]
    }
  ): Promise<SupabaseResponse<any>> {
    const { data, error } = await supabase
      .from('interacoes')
      .insert({
        cliente_id,
        ...interacao,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    // Atualizar última interação do cliente
    if (data) {
      await this.atualizar(cliente_id, {
        ultima_interacao_em: new Date().toISOString()
      } as any)
    }

    return createResponse(data, error)
  }

  /**
   * Buscar clientes VIP (top 20%)
   */
  async buscarVIPs(limit: number = 50): Promise<SupabaseResponse<ClienteCompleto[]>> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        categoria:categorias(nome, cor)
      `)
      .order('valor_total_gasto', { ascending: false })
      .limit(limit)

    return createResponse(data, error)
  }

  /**
   * Buscar clientes inativos (sem interação em X dias)
   */
  async buscarInativos(dias: number = 30): Promise<SupabaseResponse<ClienteCompleto[]>> {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .lt('ultima_interacao_em', dataLimite.toISOString())
      .order('ultima_interacao_em', { ascending: true })

    return createResponse(data, error)
  }

  /**
   * Buscar aniversariantes do dia
   */
  async buscarAniversariantes(): Promise<SupabaseResponse<Cliente[]>> {
    const hoje = new Date()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const dia = String(hoje.getDate()).padStart(2, '0')

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .like('data_nascimento', `%-${mes}-${dia}`)

    return createResponse(data, error)
  }

  /**
   * Estatísticas gerais
   */
  async estatisticas(): Promise<SupabaseResponse<any>> {
    const { data, error } = await supabase
      .rpc('vw_dashboard_resumo')

    return createResponse(data, error)
  }

  /**
   * Deletar cliente (soft delete)
   */
  async deletar(id: string): Promise<SupabaseResponse<void>> {
    const { error } = await supabase
      .from('clientes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    return createResponse(null, error)
  }
}

export const clientesService = new ClientesService()
export default clientesService
