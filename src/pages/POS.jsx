import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiSearch, FiGrid, FiList, FiPlus, FiMinus, FiTrash2, FiPrinter,
  FiSave, FiCheckCircle, FiXCircle, FiClock, FiPackage,
} from 'react-icons/fi'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonProductCard } from '../components/ui/Skeletons'
import * as ordersApi from '../api/orders'
import { resolveImageUrl } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { useOrder } from '../context/OrderContext'
import { formatCurrency } from '../utils/format'

// checkoutOrderValidator only allows 'cash' | 'card' — no wallet/mixed option
// exists on the backend, so those have been removed.
const PAYMENT_METHODS = [
  { key: 'cash', label: 'كاش', labelEn: 'Cash', icon: '💵' },
  { key: 'card', label: 'بطاقة', labelEn: 'Card', icon: '💳' },
]

function categoryIdOf(product) {
  return product.category?._id || product.category?.id || product.category
}

export default function POS() {
  const { isRTL, t } = useLang()
  const { categories, products, tables, setOrders } = useAppData()
  const {
    tableNumber, setTableNumber,
    items, addItem, incrementItem, decrementItem, removeItem, clearOrder,
    total,
  } = useOrder()

  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [payment, setPayment] = useState('cash')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  // Backend-assigned order id once this cart has been persisted (via Save,
  // Print Receipt, or Complete). Null means nothing has been created yet.
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [receiptLoading, setReceiptLoading] = useState(false)

  // Tracks which cart items have already been pushed to the backend, mapped
  // to their backend line-item id, so later quantity changes/removals can hit
  // the confirmed update/remove endpoints instead of drifting out of sync.
  const [lineItemIds, setLineItemIds] = useState({})

  // Auto-select the first available table once tables load, since the
  // dropdown's value is the table's backend id (required by createOrder).
  useEffect(() => {
    if (!tableNumber && tables.length > 0) setTableNumber(tables[0].id)
  }, [tables]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? products : products.filter((p) => categoryIdOf(p) === activeCategory)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((p) => p.name?.toLowerCase().includes(q))
    }
    return list
  }, [products, activeCategory, query])

  // Ensures the current cart exists as a real order on the backend, creating
  // it with just the selected table if needed (reusing an already-active
  // order for that table if one exists, since createOrder rejects an
  // occupied table), then syncs any cart items that haven't been pushed yet.
  const ensureOrderCreated = async () => {
    let orderId = currentOrderId
    if (!orderId) {
      if (!tableNumber) throw new Error(isRTL ? 'اختر طاولة أولاً' : 'Select a table first')

      const existing = await ordersApi.getActiveOrderByTable(tableNumber).catch(() => null)
      if (existing) {
        orderId = existing._id || existing.id
      } else {
        const created = await ordersApi.createOrder({ table: tableNumber })
        orderId = created._id || created.id
        setOrders((prev) => [created, ...prev])
      }
      setCurrentOrderId(orderId)
    }

    const stillPending = items.filter((i) => !lineItemIds[i.id])
    for (const item of stillPending) {
      const res = await ordersApi.addOrderItem(orderId, item.id, item.qty)
      const lineItemId = res?._id || res?.id
      if (lineItemId) {
        setLineItemIds((prev) => ({ ...prev, [item.id]: lineItemId }))
      }
    }
    return orderId
  }

  const syncQuantity = async (productId, qty) => {
    const lineItemId = lineItemIds[productId]
    if (!currentOrderId || !lineItemId) return
    try {
      await ordersApi.updateOrderItemQuantity(lineItemId, qty)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحديث الكمية' : 'Failed to update quantity'))
    }
  }

  const syncRemoval = async (productId) => {
    const lineItemId = lineItemIds[productId]
    if (!currentOrderId || !lineItemId) return
    try {
      await ordersApi.removeOrderItem(lineItemId)
      setLineItemIds((prev) => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر حذف الصنف' : 'Failed to remove item'))
    }
  }

  const handleIncrement = (item) => {
    incrementItem(item.id)
    syncQuantity(item.id, item.qty + 1)
  }
  const handleDecrement = (item) => {
    decrementItem(item.id)
    if (item.qty - 1 > 0) syncQuantity(item.id, item.qty - 1)
    else syncRemoval(item.id)
  }
  const handleRemoveItem = (item) => {
    removeItem(item.id)
    syncRemoval(item.id)
  }

  const fetchReceipt = async (orderId) => {
    setReceiptLoading(true)
    try {
      const data = await ordersApi.getOrderReceipt(orderId)
      setReceiptData(data)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحميل الفاتورة' : 'Failed to load receipt'))
    } finally {
      setReceiptLoading(false)
    }
  }

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error(isRTL ? 'أضف أصناف للطلب أولاً' : 'Add items to the order first')
      return
    }
    setSubmitting(true)
    try {
      await ensureOrderCreated()
      toast.success(isRTL ? 'تم حفظ الطلب' : 'Order saved')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر حفظ الطلب' : 'Failed to save order'))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrintPreview = async () => {
    if (items.length === 0) {
      toast.error(isRTL ? 'أضف أصناف للطلب أولاً' : 'Add items to the order first')
      return
    }
    setSubmitting(true)
    try {
      const orderId = await ensureOrderCreated()
      setReceiptOpen(true)
      await fetchReceipt(orderId)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر إنشاء الطلب' : 'Failed to create order'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async () => {
    if (items.length === 0) {
      toast.error(isRTL ? 'أضف أصناف للطلب أولاً' : 'Add items to the order first')
      return
    }
    setSubmitting(true)
    try {
      const orderId = await ensureOrderCreated()
      await ordersApi.checkoutOrder(orderId, payment)
      toast.success(isRTL ? 'تم إتمام الدفع بنجاح' : 'Payment completed successfully')
      setReceiptOpen(true)
      await fetchReceipt(orderId)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر إتمام الدفع' : 'Failed to complete payment'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    try {
      if (currentOrderId) await ordersApi.cancelOrder(currentOrderId)
      clearOrder()
      setCurrentOrderId(null)
      setLineItemIds({})
      setCancelOpen(false)
      toast.success(isRTL ? 'تم إلغاء الطلب' : 'Order cancelled')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر إلغاء الطلب' : 'Failed to cancel order'))
    }
  }

  const startNewOrder = () => {
    setReceiptOpen(false)
    setReceiptData(null)
    setCurrentOrderId(null)
    setLineItemIds({})
    clearOrder()
  }

  return (
    <MainLayout title={t.nav.pos} subtitle={isRTL ? 'إنشاء طلب جديد' : 'Create a new order'}>
      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_380px] gap-5">
        {/* Categories */}
        <div className="card p-4 xl:h-[calc(100vh-140px)] xl:sticky xl:top-24 flex flex-col gap-3">
          <div className="relative">
            <FiSearch className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن صنف...' : 'Search item...'}
              className="input-base ps-9 text-sm"
            />
          </div>
          <div className="flex xl:flex-col gap-2 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0">
            {[{ id: 'all', name: isRTL ? 'الكل' : 'All' }, ...categories.filter((c) => c.isActive)].map((c) => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(c.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0 xl:w-full ${
                  activeCategory === c.id
                    ? 'bg-gradient-to-tr from-primary-700 to-primary-600 text-white shadow-glow'
                    : 'bg-bg-sidebar text-txt-secondary hover:bg-bg-hover'
                }`}
              >
                {c.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex-1 min-w-[160px] flex items-center gap-2 bg-bg-card border border-border rounded-lg px-3 py-2 text-xs text-txt-secondary">
              <FiClock className="text-primary-400" />
              {isRTL ? `طلب جديد — ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : `New order — ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
            </div>
            <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-1">
              <button onClick={() => setView('grid')} className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-txt-secondary'}`}><FiGrid size={14} /></button>
              <button onClick={() => setView('list')} className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-txt-secondary'}`}><FiList size={14} /></button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={FiSearch} title={isRTL ? 'لا توجد أصناف' : 'No products'} message={isRTL ? 'جرب كلمة بحث أخرى أو اختر قسمًا مختلفًا' : 'Try another search or category'} />
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => p.isAvailable && addItem(p)}
                  className={`card p-4 cursor-pointer relative overflow-hidden ${!p.isAvailable ? 'opacity-50 cursor-not-allowed' : ''} ${
                    view === 'list' ? 'flex items-center gap-4' : 'flex flex-col'
                  }`}
                >
                  <div className={`flex items-center justify-center bg-bg-hover rounded-lg text-3xl shrink-0 overflow-hidden text-txt-muted ${view === 'list' ? 'h-16 w-16' : 'h-24 w-full mb-3'}`}>
                    {p.image ? <img src={resolveImageUrl(p.image)} alt="" className="h-full w-full object-cover" /> : <FiPackage />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-txt truncate">{p.name}</p>
                    <p className="text-xs text-txt-muted truncate mt-0.5">{p.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-secondary-light">{formatCurrency(p.price)}</p>
                      <button className="h-8 w-8 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                        <FiPlus size={15} />
                      </button>
                    </div>
                  </div>
                  {!p.isAvailable && (
                    <span className="absolute top-2 end-2 text-[10px] px-2 py-0.5 rounded-full bg-danger-bg text-danger font-semibold">
                      {isRTL ? 'غير متوفر' : 'Unavailable'}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Current order */}
        <div className="card p-5 flex flex-col xl:h-[calc(100vh-140px)] xl:sticky xl:top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold font-display text-txt">{isRTL ? 'الطلب الحالي' : 'Current Order'}</h3>
            <select value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="input-base w-auto text-xs py-1.5">
              {tables.length === 0 ? (
                <option value="">{isRTL ? 'لا توجد طاولات' : 'No tables'}</option>
              ) : (
                tables.map((tb) => (
                  <option key={tb.id} value={tb.id}>{isRTL ? `طاولة ${tb.tableNumber}` : `Table ${tb.tableNumber}`}</option>
                ))
              )}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-3 min-h-[120px]">
            <AnimatePresence>
              {items.length === 0 ? (
                <EmptyState icon={FiPlus} title={isRTL ? 'لا يوجد أصناف' : 'No items yet'} message={isRTL ? 'اضغط على أي صنف لإضافته للطلب' : 'Tap a product to add it to the order'} />
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 bg-bg-sidebar rounded-lg p-2.5"
                  >
                    <div className="h-11 w-11 rounded-lg bg-bg-hover flex items-center justify-center text-lg shrink-0 overflow-hidden text-txt-muted">
                      {item.image ? <img src={resolveImageUrl(item.image)} alt="" className="h-full w-full object-cover" /> : <FiPackage />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-txt truncate">{item.name}</p>
                      <p className="text-xs text-secondary-light">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleDecrement(item)} className="h-6 w-6 rounded-md bg-bg-hover flex items-center justify-center text-txt-secondary hover:text-txt"><FiMinus size={11} /></button>
                      <span className="w-5 text-center text-sm text-txt">{item.qty}</span>
                      <button onClick={() => handleIncrement(item)} className="h-6 w-6 rounded-md bg-bg-hover flex items-center justify-center text-txt-secondary hover:text-txt"><FiPlus size={11} /></button>
                      <button onClick={() => handleRemoveItem(item)} className="h-6 w-6 rounded-md text-danger hover:bg-danger-bg flex items-center justify-center ms-1"><FiTrash2 size={12} /></button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-txt">{isRTL ? 'الإجمالي الكلي' : 'Grand Total'}</span>
              <span className="text-xl font-bold text-success">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setPayment(m.key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium border transition-colors ${
                  payment === m.key ? 'border-primary-500 bg-primary-600/10 text-primary-300' : 'border-border text-txt-secondary hover:bg-bg-hover'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                {isRTL ? m.label : m.labelEn}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button variant="dark" icon={FiPrinter} loading={submitting} onClick={handlePrintPreview}>{isRTL ? 'طباعة الفاتورة' : 'Print Receipt'}</Button>
            <Button variant="secondary" icon={FiSave} loading={submitting} onClick={handleSave}>{isRTL ? 'حفظ الطلب' : 'Save Order'}</Button>
            <Button variant="outline" icon={FiXCircle} onClick={() => setCancelOpen(true)}>{isRTL ? 'إلغاء الطلب' : 'Cancel Order'}</Button>
            <Button variant="success" icon={FiCheckCircle} loading={submitting} onClick={handleComplete}>{isRTL ? 'إغلاق الطلب' : 'Complete'}</Button>
          </div>
        </div>
      </div>

      {/* Receipt modal — data comes from GET /orders/:orderId/receipt exactly as the backend returns it (no tax/discount fields exist) */}
      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title={isRTL ? 'معاينة الفاتورة' : 'Receipt Preview'} size="sm">
        {receiptLoading ? (
          <div className="skeleton h-64 w-full max-w-[280px] mx-auto rounded-lg" />
        ) : receiptData ? (
          <div id="print-area" className="bg-white text-black rounded-lg p-5 font-mono text-xs max-w-[280px] mx-auto">
            <p className="text-center font-bold text-base">☕ Coffee House</p>
            <p className="text-center text-[10px] text-gray-600">POS System</p>
            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="flex justify-between"><span>{isRTL ? 'رقم الطلب' : 'Order #'}</span><span>{receiptData.orderNumber}</span></div>
            <div className="flex justify-between"><span>{isRTL ? 'الطاولة' : 'Table'}</span><span>{receiptData.table?.tableNumber ?? '-'}</span></div>
            <div className="flex justify-between"><span>{isRTL ? 'الكاشير' : 'Cashier'}</span><span>{receiptData.cashier?.name || '-'}</span></div>
            <div className="flex justify-between"><span>{isRTL ? 'التاريخ' : 'Date'}</span><span>{receiptData.createdAt ? new Date(receiptData.createdAt).toLocaleString() : '-'}</span></div>
            <div className="border-t border-dashed border-gray-400 my-2" />
            {(receiptData.items || []).length === 0 ? (
              <p className="text-center text-gray-500 py-2">{isRTL ? 'لا توجد أصناف' : 'No items'}</p>
            ) : receiptData.items.map((it, i) => (
              <div key={i} className="flex justify-between py-0.5">
                <span>{it.product?.name} x{it.quantity}</span>
                <span>{Number(it.totalPrice).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="flex justify-between font-bold text-sm"><span>{isRTL ? 'الإجمالي' : 'Total'}</span><span>{Number(receiptData.totalPrice ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between mt-1"><span>{isRTL ? 'طريقة الدفع' : 'Payment'}</span><span>{receiptData.paymentMethod || '-'}</span></div>
            <p className="text-center mt-3 text-[10px]">{isRTL ? 'شكرًا لزيارتكم' : 'Thank you for visiting!'}</p>
          </div>
        ) : (
          <EmptyState icon={FiPrinter} title={isRTL ? 'تعذر تحميل الفاتورة' : 'Receipt unavailable'} message={isRTL ? 'لم نتمكن من جلب بيانات الفاتورة من الخادم.' : "We couldn't fetch the receipt from the server."} />
        )}
        <div className="flex gap-3 mt-5">
          <Button variant="ghost" fullWidth onClick={() => setReceiptOpen(false)}>{t.common.close}</Button>
          <Button variant="dark" fullWidth icon={FiPrinter} onClick={() => window.print()} disabled={!receiptData}>{t.common.print}</Button>
          <Button variant="primary" fullWidth onClick={startNewOrder}>{isRTL ? 'طلب جديد' : 'New Order'}</Button>
        </div>
      </Modal>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={isRTL ? 'إلغاء الطلب' : 'Cancel Order'} size="sm">
        <p className="text-sm text-txt-secondary">{isRTL ? 'هل أنت متأكد من إلغاء هذا الطلب؟ سيتم حذف جميع الأصناف.' : 'Are you sure you want to cancel this order? All items will be removed.'}</p>
        <div className="flex gap-3 mt-5">
          <Button variant="ghost" fullWidth onClick={() => setCancelOpen(false)}>{t.common.cancel}</Button>
          <Button variant="danger" fullWidth onClick={handleCancel}>{t.common.confirm}</Button>
        </div>
      </Modal>
    </MainLayout>
  )
}
