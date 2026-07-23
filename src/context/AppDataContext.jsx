import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as categoriesApi from '../api/categories'
import * as productsApi from '../api/products'
import * as tablesApi from '../api/tables'
import * as ordersApi from '../api/orders'
import * as deliveryApi from '../api/delivery'
// Employees has no backend model/route in this project — intentionally local only.
import { employees as initialEmployees } from '../data/employees'

const AppDataContext = createContext(null)

// The backend returns MongoDB documents with `_id`; the rest of the app was
// built around a plain `id` field, so normalize once at the data boundary.
const withId = (doc) => (doc && !doc.id && doc._id ? { ...doc, id: doc._id } : doc)
const withIds = (list) => (Array.isArray(list) ? list.map(withId) : [])

export function AppDataProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [deliveryOrders, setDeliveryOrders] = useState([])
  const [employees, setEmployees] = useState(initialEmployees)

  const [loading, setLoading] = useState({
    categories: true, products: true, tables: true, orders: true, deliveryOrders: true,
  })
  const setLoadingKey = (key, val) => setLoading((p) => ({ ...p, [key]: val }))

  // ---------- Fetchers ----------
  const fetchCategories = useCallback(async () => {
    setLoadingKey('categories', true)
    try {
      const data = await categoriesApi.listCategories()
      setCategories(withIds(data))
    } catch (err) {
      toast.error(err.message || 'Failed to load categories')
    } finally {
      setLoadingKey('categories', false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoadingKey('products', true)
    try {
      const data = await productsApi.listProducts()
      setProducts(withIds(data))
    } catch (err) {
      toast.error(err.message || 'Failed to load products')
    } finally {
      setLoadingKey('products', false)
    }
  }, [])

  const fetchTables = useCallback(async () => {
    setLoadingKey('tables', true)
    try {
      const data = await tablesApi.listTables()
      setTables(withIds(data))
    } catch (err) {
      toast.error(err.message || 'Failed to load tables')
    } finally {
      setLoadingKey('tables', false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoadingKey('orders', true)
    try {
      const data = await ordersApi.listOrders()
      setOrders(withIds(data))
    } catch (err) {
      toast.error(err.message || 'Failed to load orders')
    } finally {
      setLoadingKey('orders', false)
    }
  }, [])

  const fetchDeliveryOrders = useCallback(async () => {
    setLoadingKey('deliveryOrders', true)
    try {
      const data = await deliveryApi.listDeliveryOrders()
      setDeliveryOrders(withIds(data))
    } catch (err) {
      toast.error(err.message || 'Failed to load delivery orders')
    } finally {
      setLoadingKey('deliveryOrders', false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchTables()
    fetchOrders()
    fetchDeliveryOrders()
  }, [fetchCategories, fetchProducts, fetchTables, fetchOrders, fetchDeliveryOrders])

  // ---------- Categories (schema: name, image, isActive — image bundled into create/update) ----------
  const addCategory = async (payload) => {
    const created = await categoriesApi.createCategory(payload)
    setCategories((p) => [withId(created), ...p])
    return withId(created)
  }
  const updateCategory = async (id, patch) => {
    const updated = await categoriesApi.updateCategory(id, patch)
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...withId(updated) } : c)))
    return withId(updated)
  }
  const deleteCategory = async (id) => {
    await categoriesApi.deleteCategory(id)
    setCategories((p) => p.filter((c) => c.id !== id))
  }

  // ---------- Products (schema: name, description, price, image, category, isAvailable) ----------
  const addProduct = async (payload) => {
    const created = await productsApi.createProduct(payload)
    setProducts((p) => [withId(created), ...p])
    return withId(created)
  }
  const updateProduct = async (id, patch) => {
    const updated = await productsApi.updateProduct(id, patch)
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, ...withId(updated) } : x)))
    return withId(updated)
  }
  const deleteProduct = async (id) => {
    await productsApi.deleteProduct(id)
    setProducts((p) => p.filter((x) => x.id !== id))
  }

  // ---------- Tables (schema: tableNumber, status: 'available'|'occupied') ----------
  const addTable = async (payload) => {
    const created = await tablesApi.createTable(payload)
    setTables((p) => [...p, withId(created)])
    return withId(created)
  }
  const updateTable = async (id, patch) => {
    const updated = await tablesApi.updateTable(id, patch)
    setTables((p) => p.map((t) => (t.id === id ? { ...t, ...withId(updated) } : t)))
    return withId(updated)
  }
  const deleteTable = async (id) => {
    await tablesApi.deleteTable(id)
    setTables((p) => p.filter((t) => t.id !== id))
  }

  // ---------- Orders (dine-in / POS) ----------
  const createOrder = async (payload) => {
    const created = await ordersApi.createOrder(payload)
    const normalized = withId(created)
    setOrders((p) => [normalized, ...p])
    return normalized
  }
  const cancelOrderById = async (id) => {
    await ordersApi.cancelOrder(id)
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)))
  }

  // ---------- Delivery orders ----------
  const addDeliveryOrder = async (payload) => {
    const created = await deliveryApi.createDeliveryOrder(payload)
    const normalized = withId(created)
    setDeliveryOrders((p) => [normalized, ...p])
    return normalized
  }
  const updateDeliveryOrder = async (id, patch) => {
    if (patch.deliveryStatus) {
      const updated = await deliveryApi.updateDeliveryStatus(id, patch.deliveryStatus)
      setDeliveryOrders((p) => p.map((o) => (o.id === id ? { ...o, ...withId(updated) } : o)))
      return updated
    }
  }
  const deleteDeliveryOrder = (id) => setDeliveryOrders((p) => p.filter((o) => o.id !== id))

  // ---------- Employees (unchanged — no backend model/route exists for this resource) ----------
  const addEmployee = (emp) => setEmployees((p) => [{ ...emp, id: `e${Date.now()}` }, ...p])
  const updateEmployee = (id, patch) => setEmployees((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const deleteEmployee = (id) => setEmployees((p) => p.filter((e) => e.id !== id))

  return (
    <AppDataContext.Provider
      value={{
        categories, addCategory, updateCategory, deleteCategory, fetchCategories,
        products, addProduct, updateProduct, deleteProduct, fetchProducts,
        tables, addTable, updateTable, deleteTable, fetchTables,
        orders, setOrders, createOrder, cancelOrderById, fetchOrders,
        deliveryOrders, addDeliveryOrder, updateDeliveryOrder, deleteDeliveryOrder, fetchDeliveryOrders,
        employees, addEmployee, updateEmployee, deleteEmployee,
        loading,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => useContext(AppDataContext)
