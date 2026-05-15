/**
 * Dashboard Moderno - CRM SOBERANO
 * Com novo design profissional, glass morphism e animações
 */

import React, { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  Star,
  Zap
} from 'lucide-react'
import { clientesService, pedidosService } from '@/lib/supabase/services'

export function DashboardModerno() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    novosClientesMes: 0,
    pedidosAtivos: 0,
    faturamentoMes: 0,
    ticketMedio: 0,
    produtosEstoqueBaixo: 0,
    crescimentoClientes: 12,
    crescimentoFaturamento: 23
  })

  useEffect(() => {
    carregarMetricas()
  }, [])

  async function carregarMetricas() {
    try {
      const [estatisticas] = await Promise.all([
        clientesService.estatisticas()
      ])

      if (estatisticas.data) {
        setMetricas({
          totalClientes: estatisticas.data.total_clientes || 0,
          novosClientesMes: estatisticas.data.novos_clientes_mes || 0,
          pedidosAtivos: estatisticas.data.pedidos_ativos || 0,
          faturamentoMes: estatisticas.data.faturamento_mes || 0,
          ticketMedio: estatisticas.data.ticket_medio_geral || 0,
          produtosEstoqueBaixo: estatisticas.data.produtos_estoque_baixo || 0,
          crescimentoClientes: 12,
          crescimentoFaturamento: 23
        })
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* Header com Glass Morphism */}
      <header className="
        sticky top-0 z-50
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl
        border-b border-gray-200/50 dark:border-gray-700/50
        shadow-soft
      ">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="
              w-12 h-12
              bg-gradient-to-br from-blue-600 to-purple-600
              rounded-2xl
              flex items-center justify-center
              text-white font-bold text-xl
              shadow-lg shadow-primary/50
            ">
              CS
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">
                CRM SOBERANO
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dashboard v7.4.2
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button className="
              p-2 rounded-xl
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors
            ">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Avatar */}
            <div className="
              w-10 h-10
              bg-gradient-to-br from-blue-500 to-purple-600
              rounded-xl
              flex items-center justify-center
              text-white font-semibold text-sm
              shadow-lg
              ring-4 ring-white/50 dark:ring-gray-900/50
              cursor-pointer
              hover:scale-110
              transition-transform
            ">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 animate-fade-in">

        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bem-vindo de volta! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Aqui está o resumo do seu negócio hoje
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Atualizado agora</span>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1 - Total de Clientes */}
          <div className="
            group
            card-premium
            hover:shadow-2xl
            transition-all duration-500
            hover:-translate-y-2
            cursor-pointer
            overflow-hidden
          ">
            {/* Linha gradiente superior */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total de Clientes
                  </p>

                  <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {loading ? '...' : metricas.totalClientes}
                  </h3>

                  {/* Tendência */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                      <ArrowUp className="w-4 h-4" />
                      {metricas.crescimentoClientes}%
                    </span>
                    <span className="text-xs text-gray-500">vs mês anterior</span>
                  </div>
                </div>

                {/* Ícone */}
                <div className="
                  w-14 h-14
                  bg-gradient-to-br from-blue-500 to-blue-600
                  rounded-2xl
                  flex items-center justify-center
                  text-white
                  shadow-lg shadow-blue-500/50
                  group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-500
                ">
                  <Users className="w-7 h-7" />
                </div>
              </div>

              {/* Mini descrição */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {metricas.novosClientesMes} novos este mês
              </p>
            </div>
          </div>

          {/* Card 2 - Pedidos Ativos */}
          <div className="
            group
            card-premium
            hover:shadow-2xl
            transition-all duration-500
            hover:-translate-y-2
            cursor-pointer
            overflow-hidden
          ">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Pedidos Ativos
                  </p>

                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {loading ? '...' : metricas.pedidosAtivos}
                  </h3>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 font-medium">
                      <Activity className="w-4 h-4" />
                      Em andamento
                    </span>
                  </div>
                </div>

                <div className="
                  w-14 h-14
                  bg-gradient-to-br from-purple-500 to-purple-600
                  rounded-2xl
                  flex items-center justify-center
                  text-white
                  shadow-lg shadow-purple-500/50
                  group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-500
                ">
                  <ShoppingCart className="w-7 h-7" />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Aguardando processamento
              </p>
            </div>
          </div>

          {/* Card 3 - Faturamento */}
          <div className="
            group
            card-premium
            hover:shadow-2xl
            transition-all duration-500
            hover:-translate-y-2
            cursor-pointer
            overflow-hidden
          ">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Faturamento Mensal
                  </p>

                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    {loading ? '...' : formatCurrency(metricas.faturamentoMes)}
                  </h3>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                      <ArrowUp className="w-4 h-4" />
                      {metricas.crescimentoFaturamento}%
                    </span>
                    <span className="text-xs text-gray-500">vs mês anterior</span>
                  </div>
                </div>

                <div className="
                  w-14 h-14
                  bg-gradient-to-br from-green-500 to-emerald-600
                  rounded-2xl
                  flex items-center justify-center
                  text-white
                  shadow-lg shadow-green-500/50
                  group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-500
                ">
                  <DollarSign className="w-7 h-7" />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Vendas confirmadas e pagas
              </p>
            </div>
          </div>

          {/* Card 4 - Ticket Médio */}
          <div className="
            group
            card-premium
            hover:shadow-2xl
            transition-all duration-500
            hover:-translate-y-2
            cursor-pointer
            overflow-hidden
          ">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600" />

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Ticket Médio
                  </p>

                  <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    {loading ? '...' : formatCurrency(metricas.ticketMedio)}
                  </h3>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      Por pedido
                    </span>
                  </div>
                </div>

                <div className="
                  w-14 h-14
                  bg-gradient-to-br from-orange-500 to-orange-600
                  rounded-2xl
                  flex items-center justify-center
                  text-white
                  shadow-lg shadow-orange-500/50
                  group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-500
                ">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Média de valor por venda
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Estoque Baixo */}
        {metricas.produtosEstoqueBaixo > 0 && (
          <div className="
            bg-gradient-to-r from-yellow-50 to-orange-50
            dark:from-yellow-900/20 dark:to-orange-900/20
            border-l-4 border-yellow-500
            rounded-xl p-4
            flex items-center gap-3
            shadow-soft
            animate-slide-in
          ">
            <div className="
              w-10 h-10
              bg-yellow-500
              rounded-xl
              flex items-center justify-center
              text-white
              animate-pulse-slow
            ">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                Atenção: {metricas.produtosEstoqueBaixo} produtos com estoque baixo
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                Verifique o estoque para evitar rupturas e perda de vendas
              </p>
            </div>

            <button className="
              px-4 py-2
              bg-yellow-500 hover:bg-yellow-600
              text-white font-medium
              rounded-lg
              transition-colors
              hover:scale-105
              transform
            ">
              Ver Produtos
            </button>
          </div>
        )}

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Últimos Pedidos */}
          <div className="lg:col-span-2 card-premium">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Últimos Pedidos
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver todos →
                </button>
              </div>

              <div className="space-y-3">
                {/* Exemplo de pedido */}
                <div className="
                  flex items-center gap-4 p-4
                  bg-gray-50 dark:bg-gray-800/50
                  rounded-xl
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors
                  cursor-pointer
                ">
                  <div className="
                    w-12 h-12
                    bg-gradient-to-br from-blue-500 to-purple-600
                    rounded-xl
                    flex items-center justify-center
                    text-white font-bold
                  ">
                    #1
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Pedido #001234
                    </p>
                    <p className="text-sm text-gray-500">
                      João Silva • há 5 minutos
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      R$ 234,56
                    </p>
                    <span className="
                      inline-flex items-center gap-1.5 px-3 py-1
                      bg-green-100 dark:bg-green-900/20
                      text-green-700 dark:text-green-400
                      text-xs font-medium rounded-full
                    ">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Pago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Ações Rápidas
              </h3>

              <div className="space-y-2">
                <button className="
                  w-full
                  flex items-center gap-3 px-4 py-3
                  bg-gradient-to-r from-blue-600 to-purple-600
                  hover:from-blue-700 hover:to-purple-700
                  text-white font-medium
                  rounded-xl
                  shadow-lg shadow-primary/50
                  hover:shadow-xl hover:shadow-primary/60
                  transition-all duration-300
                  hover:scale-105
                ">
                  <ShoppingCart className="w-5 h-5" />
                  Novo Pedido
                </button>

                <button className="btn-ghost w-full justify-start">
                  <Users className="w-5 h-5" />
                  Adicionar Cliente
                </button>

                <button className="btn-ghost w-full justify-start">
                  <Package className="w-5 h-5" />
                  Cadastrar Produto
                </button>

                <button className="btn-ghost w-full justify-start">
                  <Star className="w-5 h-5" />
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
