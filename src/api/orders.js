import api from './client'

// CONFIRMED — read directly from orderRoute.js / orderModel.js / orderService.js.
// Every route below requires auth (router.use(authService.protect)) and is
// restricted to admin/cashier roles.
//
// GET    /orders                     getOrders                -> { results, data: [...] } (populates table.tableNumber, cashier.name/email)
// POST   /orders                     createOrder               -> { status:'success', data: order }
//   body: { table, orderType?('dineIn'|'delivery', default dineIn), customerName?, customerPhone?, deliveryAddress?, deliveryFee? }
//   dineIn requires `table` (must not already be occupied); delivery requires customerName+customerPhone+deliveryAddress.
// GET    /orders/table/:tableId      getActiveOrderByTable     -> { data: order } or { data: null, message } if none active
// GET    /orders/:orderId/receipt    getOrderReceipt           -> { status:'success', data: receipt } (see shape below)
// POST   /orders/:orderId/items      addProductToOrder         -> { status:'success', data: orderItem } body: { product, quantity }
// PUT    /orders/:orderId/checkout   checkoutOrder             -> { status:'success', message, data: order } body: { paymentMethod: 'cash'|'card' }
// PUT    /orders/:orderId/cancel     cancelOrder               -> { status:'success', message } (no data)
// PUT    /orders/items/:itemId       updateOrderItem           -> { status:'success', data: orderItem } body: { quantity }
// DELETE /orders/items/:itemId       removeOrderItem           -> { status:'success', message } (no data)
// GET    /orders/:id                 getOrder                  -> { data: order }
//
// Receipt shape (services/orderService.js getOrderReceipt):
// { orderNumber, orderType, table, customerName, customerPhone, deliveryAddress,
//   deliveryFee, cashier, items: [{ product:{name,price}, quantity, unitPrice, totalPrice }],
//   totalPrice, paymentMethod, status, createdAt, paidAt }
// There is NO tax, discount, or service-charge field anywhere in this backend.

export const listOrders = () => api.get('/orders').then((res) => res.data)
export const getOrder = (id) => api.get(`/orders/${id}`).then((res) => res.data)
export const getActiveOrderByTable = (tableId) => api.get(`/orders/table/${tableId}`).then((res) => res.data)
export const createOrder = (payload) => api.post('/orders', payload).then((res) => res.data)
export const addOrderItem = (orderId, product, quantity) => api.post(`/orders/${orderId}/items`, { product, quantity }).then((res) => res.data)
export const updateOrderItemQuantity = (itemId, quantity) => api.put(`/orders/items/${itemId}`, { quantity }).then((res) => res.data)
export const removeOrderItem = (itemId) => api.delete(`/orders/items/${itemId}`)
export const checkoutOrder = (orderId, paymentMethod) => api.put(`/orders/${orderId}/checkout`, { paymentMethod }).then((res) => res.data)
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`)
export const getOrderReceipt = (orderId) => api.get(`/orders/${orderId}/receipt`).then((res) => res.data)
