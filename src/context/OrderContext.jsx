import { createContext, useContext, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const OrderContext = createContext(null)

// The Order model (orderModel.js) has no tax or discount field — totalPrice
// is simply the sum of order-item totals. So this cart context only tracks
// items and computes a plain total, matching what the backend will actually
// calculate server-side (calculateOrderTotal in orderService.js).
export function OrderProvider({ children }) {
  const [tableNumber, setTableNumber] = useState('')
  const [items, setItems] = useState([])

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
    toast.success(`تمت إضافة ${product.name}`, { id: `add-${product.id}` })
  }

  const incrementItem = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
  const decrementItem = (id) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    )
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clearOrder = () => {
    setItems([])
  }

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])

  return (
    <OrderContext.Provider
      value={{
        tableNumber, setTableNumber,
        items, addItem, incrementItem, decrementItem, removeItem, clearOrder,
        total,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => useContext(OrderContext)
