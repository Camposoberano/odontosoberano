/**
 * Sistema de Sincronização Inteligente
 * Gerencia dados entre Chrome Storage (local) e Supabase (remoto)
 */

import { supabase } from '../supabase/client'
import { clientesService, pedidosService, produtosService } from '../supabase/services'

type SyncQueueItem = {
  id: string
  table: string
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
}

type SyncStatus = 'idle' | 'syncing' | 'error'

export class SyncManager {
  private queue: SyncQueueItem[] = []
  private status: SyncStatus = 'idle'
  private maxRetries = 3
  private syncInterval: number = 30000 // 30 segundos
  private intervalId?: number
  private listeners: Map<string, Function[]> = new Map()

  constructor() {
    this.loadQueueFromStorage()
    this.startAutoSync()
    this.setupOnlineListener()
  }

  /**
   * Iniciar sincronização automática
   */
  private startAutoSync() {
    this.intervalId = window.setInterval(() => {
      this.sync()
    }, this.syncInterval)
  }

  /**
   * Parar sincronização automática
   */
  stopAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  /**
   * Detectar quando voltar online
   */
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexão restaurada - iniciando sincronização')
      this.sync()
    })
  }

  /**
   * Adicionar item à fila de sincronização
   */
  private addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    }

    this.queue.push(queueItem)
    this.saveQueueToStorage()
    this.emit('queue-updated', this.queue.length)

    // Tentar sincronizar imediatamente
    this.sync()
  }

  /**
   * Salvar localmente e adicionar à fila de sincronização
   */
  async saveLocal<T>(table: string, key: string, data: T): Promise<T> {
    // Salvar no Chrome Storage primeiro (performance)
    await chrome.storage.local.set({ [key]: data })

    // Adicionar à fila para sincronizar com Supabase
    this.addToQueue({
      table,
      action: 'update',
      data: { key, value: data }
    })

    return data
  }

  /**
   * Criar/Atualizar registro no Supabase e cachear localmente
   */
  async upsert(table: string, data: any): Promise<any> {
    // Salvar local primeiro para UX rápida
    const cacheKey = `cache_${table}_${data.id || 'new'}`
    await chrome.storage.local.set({ [cacheKey]: data })

    // Adicionar à fila
    this.addToQueue({
      table,
      action: data.id ? 'update' : 'create',
      data
    })

    return data
  }

  /**
   * Deletar registro
   */
  async delete(table: string, id: string): Promise<void> {
    // Remover do cache local
    const cacheKey = `cache_${table}_${id}`
    await chrome.storage.local.remove(cacheKey)

    // Adicionar à fila
    this.addToQueue({
      table,
      action: 'delete',
      data: { id }
    })
  }

  /**
   * Buscar dados (cache first)
   */
  async fetch<T>(table: string, id: string, force: boolean = false): Promise<T | null> {
    const cacheKey = `cache_${table}_${id}`

    if (!force) {
      // Tentar buscar do cache primeiro
      const cached = await chrome.storage.local.get(cacheKey)
      if (cached[cacheKey]) {
        return cached[cacheKey] as T
      }
    }

    // Se não tiver no cache ou force=true, buscar do Supabase
    try {
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        // Cachear para próximas consultas
        await chrome.storage.local.set({ [cacheKey]: data })
        return data as T
      }
    } catch (error) {
      console.error(`Erro ao buscar ${table}:${id}`, error)
    }

    return null
  }

  /**
   * Sincronizar fila com Supabase
   */
  async sync(): Promise<void> {
    if (this.status === 'syncing' || this.queue.length === 0) {
      return
    }

    if (!navigator.onLine) {
      console.log('📡 Offline - sincronização adiada')
      return
    }

    this.status = 'syncing'
    this.emit('sync-start')

    console.log(`🔄 Sincronizando ${this.queue.length} itens...`)

    const itemsToSync = [...this.queue]
    const successfulIds: string[] = []

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item)
        successfulIds.push(item.id)
        this.emit('item-synced', item)
      } catch (error) {
        console.error(`Erro ao sincronizar item ${item.id}:`, error)

        // Incrementar retries
        item.retries++

        if (item.retries >= this.maxRetries) {
          console.error(`Item ${item.id} excedeu máximo de tentativas`)
          this.emit('item-failed', item)
          successfulIds.push(item.id) // Remover da fila
        }
      }
    }

    // Remover itens sincronizados da fila
    this.queue = this.queue.filter(item => !successfulIds.includes(item.id))
    await this.saveQueueToStorage()

    this.status = 'idle'
    this.emit('sync-complete', successfulIds.length)

    console.log(`✅ Sincronização concluída: ${successfulIds.length}/${itemsToSync.length}`)
  }

  /**
   * Sincronizar um item específico
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { table, action, data } = item

    switch (table) {
      case 'clientes':
        return this.syncCliente(action, data)

      case 'pedidos':
        return this.syncPedido(action, data)

      case 'produtos':
        return this.syncProduto(action, data)

      default:
        // Sincronização genérica
        return this.syncGeneric(table, action, data)
    }
  }

  /**
   * Sincronizar cliente
   */
  private async syncCliente(action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await clientesService.criar(data)
        break

      case 'update':
        if (data.id) {
          await clientesService.atualizar(data.id, data)
        }
        break

      case 'delete':
        if (data.id) {
          await clientesService.deletar(data.id)
        }
        break
    }
  }

  /**
   * Sincronizar pedido
   */
  private async syncPedido(action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await pedidosService.criar(data)
        break

      case 'update':
        if (data.id && data.status) {
          await pedidosService.atualizarStatus(data.id, data.status)
        }
        break

      case 'delete':
        if (data.id) {
          await pedidosService.cancelar(data.id, 'Cancelado pelo usuário')
        }
        break
    }
  }

  /**
   * Sincronizar produto
   */
  private async syncProduto(action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await produtosService.criar(data)
        break

      case 'update':
        if (data.id) {
          await produtosService.atualizar(data.id, data)
        }
        break

      case 'delete':
        if (data.id) {
          await produtosService.deletar(data.id)
        }
        break
    }
  }

  /**
   * Sincronização genérica
   */
  private async syncGeneric(table: string, action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
      case 'update':
        await supabase.from(table).upsert(data)
        break

      case 'delete':
        await supabase.from(table).delete().eq('id', data.id)
        break
    }
  }

  /**
   * Salvar fila no storage
   */
  private async saveQueueToStorage() {
    await chrome.storage.local.set({
      sync_queue: this.queue,
      sync_queue_updated: Date.now()
    })
  }

  /**
   * Carregar fila do storage
   */
  private async loadQueueFromStorage() {
    const result = await chrome.storage.local.get('sync_queue')
    if (result.sync_queue) {
      this.queue = result.sync_queue
      console.log(`📥 Fila de sincronização carregada: ${this.queue.length} itens`)
    }
  }

  /**
   * Limpar cache local
   */
  async clearCache() {
    const keys = await chrome.storage.local.get(null)
    const cacheKeys = Object.keys(keys).filter(k => k.startsWith('cache_'))

    await chrome.storage.local.remove(cacheKeys)
    console.log(`🗑️ Cache limpo: ${cacheKeys.length} itens removidos`)
  }

  /**
   * Forçar sincronização completa (pull do Supabase)
   */
  async fullSync() {
    console.log('🔄 Iniciando sincronização completa...')

    try {
      // Buscar todos os dados do Supabase
      const [clientes, pedidos, produtos] = await Promise.all([
        clientesService.listar({}, 1, 1000),
        pedidosService.listar({}, 1, 1000),
        produtosService.listar({}, 1, 1000)
      ])

      // Salvar no cache local
      await chrome.storage.local.set({
        cache_clientes: clientes.data || [],
        cache_pedidos: pedidos.data || [],
        cache_produtos: produtos.data || [],
        last_full_sync: Date.now()
      })

      console.log('✅ Sincronização completa concluída')
      this.emit('full-sync-complete')
    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error)
      this.emit('full-sync-error', error)
    }
  }

  /**
   * Event emitter
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(...args))
    }
  }

  /**
   * Status da sincronização
   */
  getStatus() {
    return {
      status: this.status,
      queueLength: this.queue.length,
      isOnline: navigator.onLine
    }
  }
}

// Singleton
export const syncManager = new SyncManager()
export default syncManager
