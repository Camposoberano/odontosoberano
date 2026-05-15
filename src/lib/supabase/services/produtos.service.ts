/**
 * Serviço de Produtos - Gerenciamento de catálogo
 */

import { supabase, createResponse, paginatedQuery, type SupabaseResponse } from '../client'

export type Produto = {
  id?: string
  sku?: string
  codigo_barras?: string
  nome: string
  descricao?: string
  categoria?: string
  subcategoria?: string
  preco: number
  preco_promocional?: number
  custo?: number
  margem_lucro?: number
  estoque_atual?: number
  estoque_minimo?: number
  estoque_maximo?: number
  controla_estoque?: boolean
  peso?: number
  dimensoes?: Record<string, any>
  imagem_principal?: string
  imagens?: string[]
  tem_variacoes?: boolean
  variacoes?: any[]
  tags?: string[]
  palavras_chave?: string
  ativo?: boolean
  destaque?: boolean
  fornecedor?: string
  link_fornecedor?: string
}

export type FiltrosProduto = {
  categoria?: string
  busca?: string
  preco_min?: number
  preco_max?: number
  ativo?: boolean
  estoque_baixo?: boolean
  destaque?: boolean
  tags?: string[]
}

class ProdutosService {

  /**
   * Criar novo produto
   */
  async criar(produto: Produto): Promise<SupabaseResponse<Produto>> {
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        ...produto,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Buscar produto por ID
   */
  async buscarPorId(id: string): Promise<SupabaseResponse<Produto>> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single()

    return createResponse(data, error)
  }

  /**
   * Buscar produto por SKU
   */
  async buscarPorSku(sku: string): Promise<SupabaseResponse<Produto>> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('sku', sku)
      .single()

    return createResponse(data, error)
  }

  /**
   * Listar produtos com filtros
   */
  async listar(
    filtros: FiltrosProduto = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<SupabaseResponse<Produto[]>> {
    let query = supabase
      .from('produtos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filtros.categoria) {
      query = query.eq('categoria', filtros.categoria)
    }

    if (filtros.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo)
    }

    if (filtros.destaque) {
      query = query.eq('destaque', true)
    }

    if (filtros.estoque_baixo) {
      query = query.lte('estoque_atual', supabase.rpc('estoque_minimo'))
    }

    if (filtros.preco_min !== undefined) {
      query = query.gte('preco', filtros.preco_min)
    }

    if (filtros.preco_max !== undefined) {
      query = query.lte('preco', filtros.preco_max)
    }

    if (filtros.tags && filtros.tags.length > 0) {
      query = query.contains('tags', filtros.tags)
    }

    if (filtros.busca) {
      query = query.or(`nome.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%,sku.ilike.%${filtros.busca}%`)
    }

    return paginatedQuery(query, page, pageSize)
  }

  /**
   * Atualizar produto
   */
  async atualizar(id: string, dados: Partial<Produto>): Promise<SupabaseResponse<Produto>> {
    const { data, error } = await supabase
      .from('produtos')
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
   * Atualizar estoque
   */
  async atualizarEstoque(id: string, quantidade: number): Promise<SupabaseResponse<Produto>> {
    const { data, error } = await supabase
      .from('produtos')
      .update({
        estoque_atual: quantidade,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return createResponse(data, error)
  }

  /**
   * Adicionar estoque
   */
  async adicionarEstoque(id: string, quantidade: number): Promise<SupabaseResponse<Produto>> {
    const produto = await this.buscarPorId(id)
    if (!produto.data) return createResponse(null, produto.error)

    const novoEstoque = (produto.data.estoque_atual || 0) + quantidade
    return this.atualizarEstoque(id, novoEstoque)
  }

  /**
   * Remover estoque
   */
  async removerEstoque(id: string, quantidade: number): Promise<SupabaseResponse<Produto>> {
    const produto = await this.buscarPorId(id)
    if (!produto.data) return createResponse(null, produto.error)

    const novoEstoque = Math.max(0, (produto.data.estoque_atual || 0) - quantidade)
    return this.atualizarEstoque(id, novoEstoque)
  }

  /**
   * Buscar produtos com estoque baixo
   */
  async produtosEstoqueBaixo(): Promise<SupabaseResponse<Produto[]>> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .lte('estoque_atual', supabase.raw('estoque_minimo'))
      .eq('controla_estoque', true)
      .order('estoque_atual', { ascending: true })

    return createResponse(data, error)
  }

  /**
   * Buscar produtos em destaque
   */
  async produtosDestaque(limit: number = 10): Promise<SupabaseResponse<Produto[]>> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('destaque', true)
      .eq('ativo', true)
      .order('total_vendido', { ascending: false })
      .limit(limit)

    return createResponse(data, error)
  }

  /**
   * Buscar categorias disponíveis
   */
  async listarCategorias(): Promise<SupabaseResponse<string[]>> {
    const { data, error } = await supabase
      .from('produtos')
      .select('categoria')
      .not('categoria', 'is', null)

    if (error) {
      return createResponse(null, error)
    }

    const categorias = [...new Set(data.map((p: any) => p.categoria).filter(Boolean))]
    return createResponse(categorias, null)
  }

  /**
   * Ativar/Desativar produto
   */
  async toggleAtivo(id: string): Promise<SupabaseResponse<Produto>> {
    const produto = await this.buscarPorId(id)
    if (!produto.data) return createResponse(null, produto.error)

    return this.atualizar(id, { ativo: !produto.data.ativo })
  }

  /**
   * Deletar produto
   */
  async deletar(id: string): Promise<SupabaseResponse<void>> {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)

    return createResponse(null, error)
  }

  /**
   * Importar produtos em massa (CSV/JSON)
   */
  async importarEmMassa(produtos: Produto[]): Promise<SupabaseResponse<Produto[]>> {
    const { data, error } = await supabase
      .from('produtos')
      .insert(produtos)
      .select()

    return createResponse(data, error)
  }
}

export const produtosService = new ProdutosService()
export default produtosService
