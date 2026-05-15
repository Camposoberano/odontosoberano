# 🚀 CRM SOBERANO - Implementação Completa

## 📦 Package.json - Dependências Necessárias

```json
{
  "name": "crm-soberano-whatsapp",
  "version": "7.4.2.12",
  "description": "CRM completo para WhatsApp Web com Supabase",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "recharts": "^2.10.3",
    "date-fns": "^3.0.6",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "lucide-react": "^0.314.0",
    "sonner": "^1.3.1",
    "@tanstack/react-table": "^8.11.6",
    "@tanstack/react-query": "^5.17.19",
    "framer-motion": "^10.18.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/chrome": "^0.0.258",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

---

## 🎨 Tailwind Config

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaria: '#3B82F6',
        secundaria: '#10B981',
        perigo: '#EF4444',
        aviso: '#F59E0B',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 📊 Dashboard Completo

```tsx
// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { clientesService, pedidosService } from '@/lib/supabase/services'
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle
} from 'lucide-react'

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    novosClientesMes: 0,
    pedidosAtivos: 0,
    faturamentoMes: 0,
    ticketMedio: 0,
    produtosEstoqueBaixo: 0
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
          produtosEstoqueBaixo: estatisticas.data.produtos_estoque_baixo || 0
        })
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Clientes"
          value={metricas.totalClientes}
          description={`${metricas.novosClientesMes} novos este mês`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          trend={{
            value: 12,
            label: 'vs mês anterior',
            isPositive: true
          }}
          loading={loading}
        />

        <MetricCard
          title="Pedidos Ativos"
          value={metricas.pedidosAtivos}
          description="Em processamento"
          icon={<ShoppingCart className="w-6 h-6" />}
          color="purple"
          loading={loading}
        />

        <MetricCard
          title="Faturamento do Mês"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(metricas.faturamentoMes)}
          description="Vendas pagas"
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          trend={{
            value: 23,
            label: 'vs mês anterior',
            isPositive: true
          }}
          loading={loading}
        />

        <MetricCard
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(metricas.ticketMedio)}
          description="Por pedido"
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Alertas */}
      {metricas.produtosEstoqueBaixo > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">
                Atenção: {metricas.produtosEstoqueBaixo} produtos com estoque baixo
              </p>
              <p className="text-sm text-yellow-700">
                Verifique o estoque para evitar rupturas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos e Listagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Componente de lista de pedidos */}
            <p className="text-gray-500">Carregando pedidos recentes...</p>
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Componente de produtos */}
            <p className="text-gray-500">Carregando produtos...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 👥 Lista de Clientes Modernizada

```tsx
// src/pages/ClientesList.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { clientesService, type ClienteCompleto } from '@/lib/supabase/services'
import { Search, Plus, Filter, Download } from 'lucide-react'
import { formatCurrency, formatPhone, timeAgo } from '@/lib/utils'

export function ClientesList() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState({
    status: [] as string[],
    categoria_id: undefined
  })

  useEffect(() => {
    carregarClientes()
  }, [filtros])

  async function carregarClientes() {
    setLoading(true)
    try {
      const { data } = await clientesService.listar({
        ...filtros,
        busca: busca || undefined
      }, 1, 50)

      if (data) {
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      lead: { variant: 'info', label: 'Lead' },
      cliente: { variant: 'success', label: 'Cliente' },
      vip: { variant: 'purple', label: 'VIP' },
      inativo: { variant: 'default', label: 'Inativo' }
    }

    const config = variants[status] || variants.lead

    return <Badge variant={config.variant} dot>{config.label}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{clientes.length} clientes cadastrados</p>
        </div>

        <Button icon={<Plus className="w-4 h-4" />}>
          Novo Cliente
        </Button>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                icon={<Search className="w-4 h-4" />}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && carregarClientes()}
              />
            </div>

            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
              Filtros
            </Button>

            <Button variant="outline" icon={<Download className="w-4 h-4" />}>
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Carregando clientes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={cliente.nome || 'Cliente'}
                      size="lg"
                      status="online"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {cliente.nome || 'Sem nome'}
                        </h3>
                        {getStatusBadge(cliente.status || 'lead')}
                        {cliente.categoria && (
                          <Badge variant="default">
                            {cliente.categoria.nome}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{formatPhone(cliente.telefone || '')}</span>
                        <span>{cliente.email}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(cliente.valor_total_gasto || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cliente.total_compras} compras
                      </p>
                    </div>

                    <div className="text-right text-xs text-gray-400">
                      <p>{timeAgo(cliente.ultima_interacao_em || cliente.created_at!)}</p>
                      <p>Última interação</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📱 Sidebar do WhatsApp (Integração)

```tsx
// src/components/WhatsAppSidebar.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Avatar } from './ui/Avatar'
import { clientesService, pedidosService } from '@/lib/supabase/services'
import { ShoppingBag, FileText, Calendar, Tag } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface WhatsAppSidebarProps {
  whatsappId: string
  telefone: string
}

export function WhatsAppSidebar({ whatsappId, telefone }: WhatsAppSidebarProps) {
  const [cliente, setCliente] = useState<any>(null)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDadosCliente()
  }, [whatsappId])

  async function carregarDadosCliente() {
    try {
      // Buscar ou criar cliente
      let { data: clienteData } = await clientesService.buscarPorWhatsApp(whatsappId)

      if (!clienteData) {
        // Criar novo lead
        const { data: novoCliente } = await clientesService.criar({
          whatsapp_id: whatsappId,
          telefone,
          status: 'lead'
        })
        clienteData = novoCliente
      }

      setCliente(clienteData)

      // Carregar pedidos
      if (clienteData?.id) {
        const { data: pedidosData } = await pedidosService.listarPorCliente(clienteData.id)
        setPedidos(pedidosData || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 h-full overflow-y-auto">
      {/* Card do Cliente */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={cliente?.nome || 'Cliente'} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {cliente?.nome || 'Novo Lead'}
              </h3>
              <p className="text-sm text-gray-500">{telefone}</p>
            </div>
          </div>

          {/* Score */}
          {cliente?.score && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Score</span>
                <span className="font-medium">{cliente.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${cliente.score}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold text-gray-900">
                {cliente?.total_compras || 0}
              </p>
              <p className="text-xs text-gray-500">Compras</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(cliente?.valor_total_gasto || 0)}
              </p>
              <p className="text-xs text-gray-500">Total Gasto</p>
            </div>
          </div>

          {/* Tags */}
          {cliente?.tags && cliente.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {cliente.tags.map((tag: string) => (
                <Badge key={tag} size="sm" variant="info">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            icon={<ShoppingBag className="w-4 h-4" />}
          >
            Criar Pedido
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            icon={<Calendar className="w-4 h-4" />}
          >
            Agendar Follow-up
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            icon={<FileText className="w-4 h-4" />}
          >
            Adicionar Nota
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            icon={<Tag className="w-4 h-4" />}
          >
            Gerenciar Tags
          </Button>
        </CardContent>
      </Card>

      {/* Últimos Pedidos */}
      {pedidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Últimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {pedidos.slice(0, 3).map((pedido) => (
              <div key={pedido.id} className="border-b border-gray-200 last:border-0 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pedido.numero_pedido}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(pedido.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      pedido.status === 'entregue' ? 'success' :
                      pedido.status === 'cancelado' ? 'danger' : 'warning'
                    }
                    size="sm"
                  >
                    {pedido.status}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatCurrency(pedido.total)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## 🛍️ Criação Rápida de Pedido

```tsx
// src/components/QuickOrderModal.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { produtosService, pedidosService } from '@/lib/supabase/services'
import { Search, Plus, Minus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface QuickOrderModalProps {
  clienteId: string
  onClose: () => void
  onSuccess: () => void
}

export function QuickOrderModal({ clienteId, onClose, onSuccess }: QuickOrderModalProps) {
  const [produtos, setProdutos] = useState<any[]>([])
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarProdutos()
  }, [busca])

  async function carregarProdutos() {
    const { data } = await produtosService.listar({
      busca,
      ativo: true
    }, 1, 10)

    if (data) {
      setProdutos(data)
    }
  }

  function adicionarAoCarrinho(produto: any) {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id)

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_sku: produto.sku,
        quantidade: 1,
        preco_unitario: produto.preco,
        desconto: 0,
        total: produto.preco
      }])
    }
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    setCarrinho(carrinho.map(item => {
      if (item.produto_id === produtoId) {
        const novaQtd = Math.max(1, item.quantidade + delta)
        return {
          ...item,
          quantidade: novaQtd,
          total: novaQtd * item.preco_unitario - item.desconto
        }
      }
      return item
    }))
  }

  function removerItem(produtoId: string) {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId))
  }

  const subtotal = carrinho.reduce((acc, item) => acc + item.total, 0)

  async function finalizarPedido() {
    setLoading(true)
    try {
      const { data, error } = await pedidosService.criar({
        cliente_id: clienteId,
        subtotal,
        total: subtotal,
        itens: carrinho
      })

      if (error) {
        alert('Erro ao criar pedido: ' + error.message)
      } else {
        onSuccess()
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>Criar Pedido Rápido</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto space-y-4">
          {/* Busca de Produtos */}
          <Input
            placeholder="Buscar produtos..."
            icon={<Search className="w-4 h-4" />}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {/* Lista de Produtos */}
          <div className="grid grid-cols-2 gap-3">
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => adicionarAoCarrinho(produto)}
              >
                {produto.imagem_principal && (
                  <img
                    src={produto.imagem_principal}
                    alt={produto.nome}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-medium text-sm truncate">{produto.nome}</h4>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(produto.preco)}
                </p>
                {produto.estoque_atual && (
                  <p className="text-xs text-gray-500">
                    Estoque: {produto.estoque_atual}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Carrinho */}
          {carrinho.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Carrinho ({carrinho.length} itens)</h3>
              <div className="space-y-2">
                {carrinho.map((item) => (
                  <div key={item.produto_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.produto_nome}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.preco_unitario)} cada
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alterarQuantidade(item.produto_id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantidade}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alterarQuantidade(item.produto_id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="font-bold w-24 text-right">
                      {formatCurrency(item.total)}
                    </p>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerItem(item.produto_id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(subtotal)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={finalizarPedido}
                loading={loading}
                disabled={carrinho.length === 0}
              >
                Criar Pedido
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
```

---

## 📝 Arquivo de Configuração de Ambiente

```env
# .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

---

## 🚀 Como Usar

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL do arquivo `supabase/schema.sql`
3. Configure as variáveis de ambiente

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

### 4. Build para Produção

```bash
npm run build
```

---

## 📚 Estrutura de Pastas Recomendada

```
src/
├── components/
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── Avatar.tsx
│   ├── MetricCard.tsx
│   ├── WhatsAppSidebar.tsx
│   └── QuickOrderModal.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── ClientesList.tsx
│   ├── ClienteProfile.tsx
│   └── Pedidos.tsx
├── lib/
│   ├── utils.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── services/
│   │       ├── clientes.service.ts
│   │       ├── pedidos.service.ts
│   │       ├── produtos.service.ts
│   │       └── index.ts
│   └── sync/
│       ├── SyncManager.ts
│       └── index.ts
└── styles/
    └── globals.css
```

---

## ✅ Checklist de Implementação

- [x] Schema SQL completo do Supabase
- [x] Serviços de integração (Clientes, Pedidos, Produtos)
- [x] Sistema de sincronização local/remoto
- [x] Componentes UI base (Card, Button, Badge, Input, Avatar)
- [x] Dashboard com métricas
- [x] Lista de clientes modernizada
- [x] Sidebar integrada no WhatsApp
- [x] Modal de criação rápida de pedidos
- [ ] Perfil completo do cliente
- [ ] Catálogo de produtos
- [ ] Sistema de relatórios
- [ ] Automações e webhooks
