import api from './client'
import { getOrderReceipt, createOrder as createOrderBase, addOrderItem } from './orders'

// CONFIRMED — read directly from orderRoute.js / orderService.js:
// GET /orders/delivery         getDeliveryOrders     -> { results, data: [...] }  (populates cashier.name only, NOT table since delivery orders have table:null)
// GET /orders/delivery/:id     getDeliveryOrder       -> { data: { order, items } }  — NOTE the nested shape, different from getOrder
// PUT /orders/:id/delivery-status  updateDeliveryStatus -> { status:'success', data: order }  body: { deliveryStatus: 'preparing'|'out_for_delivery'|'delivered' }
//
// Delivery orders are created through the shared POST /orders endpoint with
// { orderType:'delivery', customerName, customerPhone, deliveryAddress, deliveryFee }.
// createOrder does NOT accept a paymentMethod field at all (confirmed via
// createOrderValidator) — delivery orders never go through /checkout in this
// backend (checkoutOrder assumes a non-null table, which delivery orders don't
// have), so there is no payment-method concept for delivery orders whatsoever.
// Items are synced afterward via the same POST /orders/:orderId/items endpoint
// used for dine-in orders.

export const listDeliveryOrders = () => api.get('/orders/delivery').then((res) => res.data)
export const getDeliveryOrder = (id) => api.get(`/orders/delivery/${id}`).then((res) => res.data)
export const updateDeliveryStatus = (id, deliveryStatus) => api.put(`/orders/${id}/delivery-status`, { deliveryStatus }).then((res) => res.data)
export const getDeliveryReceipt = (id) => getOrderReceipt(id)

/**
 * Creates a delivery order, then syncs each cart line item via the confirmed
 * "Add Product" endpoint (the create call itself only accepts customer/address
 * fields, not an items array).
 */
export async function createDeliveryOrder({ customerName, customerPhone, deliveryAddress, deliveryFee, items }) {
  const order = await createOrderBase({
    orderType: 'delivery',
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryFee,
  })
  const orderId = order._id || order.id
  for (const item of items) {
    await addOrderItem(orderId, item.id, item.qty)
  }
  return order
}
