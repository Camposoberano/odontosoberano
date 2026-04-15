/**
 * Serviço de Pedidos - Gerenciamento completo de vendas
 */

import { supabase, createResponse, paginatedQuery, type SupabaseResponse } from '../client'

export type ItemPedido = {
  produto_id: string
  produto_nome: string
  produto_sku?: string
  variacao?: Record<string, any>
  quantidade: number
  preco_unitario: number
  desconto?: number
  total: number
  observacoes?: string
}

export type Pedido = {
  id?: string
  cliente_id?: string
  numero_pedido?: string
  status?: 'pendente' | 'confirmado' | 'preparando' | 'enviado' | 'entregue' | 'cancelado' | 'devolvido'
  subtotal: number
  desconto?: number
  cupom_codigo?: string
  frete?: number
  taxa_adicional?: number
  total: number
  forma_pagamento?: string
  status_pagamento?: 'pendente' | 'pago' | 'estornado' | 'cancelado'
  data_pagamento?: string
  parcelas?: number
  link_pagamento?: string
  tipo_entrega?: string
  endereco_entrega?: Record<string, any>
  codigo_rastreio?: string
  transportadora?: string
  previsao_entrega?: string
  observacoes?: string
  observacoes_internas?: string
  atendente_id?: string
  origem?: string
  itens?: ItemPedido[]
}

export type PedidoCompleto = Pedido & {
  cliente?: {
    nome: string
    telefone: string
    whatsapp_id: string
  }
  itens_pedido?: ItemPedido[]
  atendente?: {
    nome: string
  }
}

export type FiltrosPedido = {
  cliente_id?: string
  status?: string[]
  status_pagamento?: string[]
  data_inicio?: string
  data_fim?: string
  forma_pagamento?: string
  atendente_id?: string
  busca?: string
}

class PedidosService {

  /**
   * Criar novo pedido
   */
  async criar(pedido: Pedido): Promise<SupabaseResponse<PedidoCompleto>> {
    const itens = pedido.itens || []
    delete pedido.itens

    // Inserir pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        ...pedido,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (pedidoError) {
      return createResponse(null, pedidoError)
    }

    // Inserir itens
    if (itens.length > 0) {
      const itensComPedidoId = itens.map(item => ({
        ...item,
        pedido_id: pedidoData.id
      }))

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensComPedidoId)

      if (itensError) {
        // Rollback: deletar pedido se falhar ao inserir itens
        await supabase.from('pedidos').delete().eq('id', pedidoData.id)
        return createResponse(null, itensError)
      }
    }

    // Buscar pedido completo
    return this.buscarPorId(pedidoData.id)
  }

  /**
   * Buscar pedido por ID
   */
  async buscarPorId(id: string): Promise<SupabaseResponse<PedidoCompleto>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(nome, telefone, whatsapp_id),
        atendente:users(nome),
        itens_pedido(
          *,
          produto:produtos(nome, sku, imagem_principal)
        )
      `)
      .eq('id', id)
      .single()

    return createResponse(data, error)
  }

  /**
   * Buscar pedido por número
   */
  async buscarPorNumero(numero_pedido: string): Promise<SupabaseResponse<PedidoCompleto>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(nome, telefone, whatsapp_id),
        atendente:users(nome),
        itens_pedido(
          *,
          produto:produtos(nome, sku, imagem_principal)
        )
      `)
      .eq('numero_pedido', numero_pedido)
      .single()

    return createResponse(data, error)
  }

  /**
   * Listar pedidos com filtros
   */
  async listar(
    filtros: FiltrosPedido = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<SupabaseResponse<PedidoCompleto[]>> {
    let query = supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(nome, telefone),
        atendente:users(nome)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filtros.cliente_id) {
      query = query.eq('cliente_id', filtros.cliente_id)
    }

    if (filtros.status && filtros.status.length > 0) {
      query = query.in('status', filtros.status)
    }

    if (filtros.status_pagamento && filtros.status_pagamento.length > 0) {
      query = query.in('status_pagamento', filtros.status_pagamento)
    }

    if (filtros.forma_pagamento) {
      query = query.eq('forma_pagamento', filtros.forma_pagamento)
    }

    if (filtros.atendente_id) {
      query = query.eq('atendente_id', filtros.atendente_id)
    }

    if (filtros.data_inicio) {
      query = query.gte('created_at', filtros.data_inicio)
    }

    if (filtros.data_fim) {
      query = query.lte('created_at', filtros.data_fim)
    }

    if (filtros.busca) {
      query = query.or(`numero_pedido.ilike.%${filtros.busca}%`)
    }

    return paginatedQuery(query, page, pageSize)
  }

  /**
   * Listar pedidos de um cliente
   */
  async listarPorCliente(cliente_id: string): Promise<SupabaseResponse<PedidoCompleto[]>> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        itens_pedido(
          *,
          produto:produtos(nome, imagem_principal)
        )
      `)
      .eq('cliente_id', cliente_id)
      .order('created_at', { ascending: false })

    return createResponse(data, error)
  }

  /**
   * Atualizar status do pedido
   */
  async atualizarStatus(
    id: string,
    status: Pedido['status']
  ): Promise<SupabaseResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Atualizar status de pagamento
   */
  async atualizarPagamento(
    id: string,
    status_pagamento: Pedido['status_pagamento'],
    data_pagamento?: string
  ): Promise<SupabaseResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status_pagamento,
        data_pagamento: data_pagamento || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Adicionar código de rastreio
   */
  async adicionarRastreio(
    id: string,
    codigo_rastreio: string,
    transportadora?: string
  ): Promise<SupabaseResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        codigo_rastreio,
        transportadora,
        status: 'enviado',
        data_envio: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Cancelar pedido
   */
  async cancelar(
    id: string,
    motivo: string,
    user_id?: string
  ): Promise<SupabaseResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status: 'cancelado',
        motivo_cancelamento: motivo,
        cancelado_por: user_id,
        cancelado_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Marcar como entregue
   */
  async marcarEntregue(id: string): Promise<SupabaseResponse<Pedido>> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status: 'entregue',
        data_entrega: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Estatísticas de vendas
   */
  async estatisticasVendas(
    data_inicio?: string,
    data_fim?: string
  ): Promise<SupabaseResponse<any>> {
    let query = supabase
      .from('pedidos')
      .select('total, status_pagamento, created_at')
      .eq('status_pagamento', 'pago')

    if (data_inicio) {
      query = query.gte('created_at', data_inicio)
    }

    if (data_fim) {
      query = query.lte('created_at', data_fim)
    }

    const { data, error } = await query

    if (error) {
      return createResponse(null, error)
    }

    const total = data.reduce((acc, p) => acc + (p.total || 0), 0)
    const quantidade = data.length
    const ticket_medio = quantidade > 0 ? total / quantidade : 0

    return createResponse({
      total_vendas: total,
      quantidade_pedidos: quantidade,
      ticket_medio
    }, null)
  }

  /**
   * Produtos mais vendidos
   */
  async produtosMaisVendidos(limit: number = 10): Promise<SupabaseResponse<any[]>> {
    const { data, error } = await supabase
      .from('itens_pedido')
      .select(`
        produto_id,
        produto_nome,
        quantidade,
        produto:produtos(imagem_principal)
      `)

    if (error) {
      return createResponse(null, error)
    }

    // Agrupar e somar quantidades
    const agrupado = data.reduce((acc: any, item: any) => {
      const key = item.produto_id
      if (!acc[key]) {
        acc[key] = {
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          imagem: item.produto?.imagem_principal,
          total_vendido: 0
        }
      }
      acc[key].total_vendido += item.quantidade
      return acc
    }, {})

    const ranking = Object.values(agrupado)
      .sort((a: any, b: any) => b.total_vendido - a.total_vendido)
      .slice(0, limit)

    return createResponse(ranking, null)
  }
}

export const pedidosService = new PedidosService()
export default pedidosService
