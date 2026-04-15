/**
 * Exportação centralizada de todos os serviços
 */

export { default as clientesService } from './clientes.service'
export { default as pedidosService } from './pedidos.service'
export { default as produtosService } from './produtos.service'

export type { Cliente, ClienteCompleto, FiltrosCliente } from './clientes.service'
export type { Pedido, PedidoCompleto, ItemPedido, FiltrosPedido } from './pedidos.service'
export type { Produto, FiltrosProduto } from './produtos.service'
