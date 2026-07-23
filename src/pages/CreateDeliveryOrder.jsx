import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiSearch, FiGrid, FiList, FiPlus, FiMinus, FiTrash2, FiCheckCircle,
  FiXCircle, FiUser, FiPhone, FiMapPin, FiTruck, FiPrinter, FiPackage,
} from 'react-icons/fi'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import DeliveryReceipt from '../components/delivery/DeliveryReceipt'
import { resolveImageUrl } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../utils/format'

// createOrder's delivery branch only accepts { customerName, customerPhone,
// deliveryAddress, deliveryFee } — there is no payment-method field on
// delivery orders at all (checkout, where paymentMethod is set, assumes a
// non-null table, which delivery orders never have), so the payment picker
// that used to be here has been removed entirely.

function categoryIdOf(product) {
  return product.category?._id || product.category?.id || product.category
}

export default function CreateDeliveryOrder() {
  const { isRTL, t } = useLang()
  const { categories, products, addDeliveryOrder } = useAppData()
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [submitting, setSubmitting] = useState(false)

  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [paperSize, setPaperSize] = useState('80')

  const [items, setItems] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryFee, setDeliveryFee] = useState(20)

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { ...product, qty: 1 }]
    })
    toast.success(`${isRTL ? 'تمت إضافة' : 'Added'} ${product.name}`, { id: `add-${product.id}` })
  }
  const incrementItem = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
  const decrementItem = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0))
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clearForm = () => {
    setItems([]); setCustomerName(''); setCustomerPhone(''); setDeliveryAddress(''); setDeliveryFee(20)
  }

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? products : products.filter((p) => categoryIdOf(p) === activeCategory)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((p) => p.name?.toLowerCase().includes(q))
    }
    return list
  }, [products, activeCategory, query])

  // Items subtotal + delivery fee shown for the cashier's convenience — the
  // backend only stores totalPrice (items only) and deliveryFee separately;
  // it never sums them itself, so this combined figure is computed here for
  // display only and is not sent anywhere.
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const fee = Number(deliveryFee) || 0
  const total = subtotal + fee

  const buildOrderPayload = () => ({
    customerName,
    customerPhone,
    deliveryAddress,
    items,
    deliveryFee: fee,
  })

  const openPrintPreview = () => {
    setReceiptOrder({ ...buildOrderPayload(), totalPrice: subtotal })
    setReceiptOpen(true)
  }

  const handleCreate = async (andPrint = false) => {
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      toast.error(isRTL ? 'يرجى إدخال بيانات العميل والعنوان' : 'Please fill in customer details and address')
      return
    }
    if (items.length === 0) {
      toast.error(isRTL ? 'أضف منتجات للطلب أولاً' : 'Add products to the order first')
      return
    }

    setSubmitting(true)
    try {
      const created = await addDeliveryOrder(buildOrderPayload())
      toast.success(isRTL ? 'تم إنشاء طلب التوصيل بنجاح' : 'Delivery order created successfully')

      if (andPrint) {
        setReceiptOrder({ ...created, items, totalPrice: subtotal })
        setReceiptOpen(true)
      } else {
        clearForm()
        navigate('/delivery')
      }
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر إنشاء الطلب' : 'Failed to create order'))
    } finally {
      setSubmitting(false)
    }
  }

  const closeReceiptAndExit = () => {
    setReceiptOpen(false)
    clearForm()
    navigate('/delivery')
  }

  return (
    <MainLayout title={isRTL ? 'طلب توصيل جديد' : 'Create Delivery Order'} subtitle={isRTL ? 'إنشاء طلب توصيل جديد للعميل' : 'Create a new delivery order for a customer'}>
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
              <FiTruck className="text-primary-400" />
              {isRTL ? 'اختر المنتجات لطلب التوصيل' : 'Select products for the delivery order'}
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

        {/* Delivery order panel */}
        <div className="card p-5 flex flex-col xl:h-[calc(100vh-140px)] xl:sticky xl:top-24">
          <h3 className="font-bold font-display text-txt mb-4 flex items-center gap-2">
            <FiTruck className="text-primary-400" />
            {isRTL ? 'بيانات طلب التوصيل' : 'Delivery Order Details'}
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <FiUser className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" size={14} />
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isRTL ? 'اسم العميل' : 'Customer Name'}
                className="input-base ps-9 text-sm"
              />
            </div>
            <div className="relative">
              <FiPhone className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-txt-muted" size={14} />
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={isRTL ? 'رقم هاتف العميل' : 'Customer Phone'}
                className="input-base ps-9 text-sm"
              />
            </div>
            <div className="relative">
              <FiMapPin className="absolute inset-inline-start-3 top-3 text-txt-muted" size={14} />
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={isRTL ? 'عنوان التوصيل بالتفصيل' : 'Delivery address'}
                className="input-base ps-9 text-sm min-h-[70px] resize-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-3 min-h-[100px] mt-4">
            <AnimatePresence>
              {items.length === 0 ? (
                <EmptyState icon={FiPlus} title={isRTL ? 'لا يوجد منتجات' : 'No products yet'} message={isRTL ? 'اضغط على أي صنف لإضافته للطلب' : 'Tap a product to add it to the order'} />
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
                      <button onClick={() => decrementItem(item.id)} className="h-6 w-6 rounded-md bg-bg-hover flex items-center justify-center text-txt-secondary hover:text-txt"><FiMinus size={11} /></button>
                      <span className="w-5 text-center text-sm text-txt">{item.qty}</span>
                      <button onClick={() => incrementItem(item.id)} className="h-6 w-6 rounded-md bg-bg-hover flex items-center justify-center text-txt-secondary hover:text-txt"><FiPlus size={11} /></button>
                      <button onClick={() => removeItem(item.id)} className="h-6 w-6 rounded-md text-danger hover:bg-danger-bg flex items-center justify-center ms-1"><FiTrash2 size={12} /></button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-txt-secondary block mb-1.5">{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</label>
            <input
              type="number"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="input-base text-sm"
            />
          </div>

          <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-txt-secondary"><span>{isRTL ? 'إجمالي المنتجات' : 'Products Subtotal'}</span><span className="text-txt">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-txt-secondary"><span>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span><span className="text-txt">{formatCurrency(fee)}</span></div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-border">
              <span className="font-semibold text-txt">{isRTL ? 'الإجمالي النهائي' : 'Grand Total'}</span>
              <span className="text-xl font-bold text-success">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button variant="dark" icon={FiPrinter} onClick={openPrintPreview}>{isRTL ? 'طباعة الفاتورة' : 'Print Receipt'}</Button>
            <Button variant="outline" icon={FiXCircle} onClick={() => { clearForm(); navigate('/delivery') }}>{t.common.cancel}</Button>
            <Button variant="secondary" icon={FiPrinter} loading={submitting} onClick={() => handleCreate(true)}>{isRTL ? 'حفظ وطباعة' : 'Save & Print'}</Button>
            <Button variant="success" icon={FiCheckCircle} loading={submitting} onClick={() => handleCreate(false)}>{isRTL ? 'إنشاء الطلب' : 'Create Order'}</Button>
          </div>
        </div>
      </div>

      <Modal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title={isRTL ? 'معاينة فاتورة التوصيل' : 'Delivery Receipt Preview'}
        size="sm"
      >
        <div className="flex items-center justify-center gap-1 bg-bg-sidebar border border-border rounded-lg p-1 mb-4 w-fit mx-auto">
          {['58', '80'].map((size) => (
            <button
              key={size}
              onClick={() => setPaperSize(size)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                paperSize === size ? 'bg-primary-600 text-white' : 'text-txt-secondary hover:bg-bg-hover'
              }`}
            >
              {size}mm
            </button>
          ))}
        </div>

        <DeliveryReceipt order={receiptOrder} paperSize={paperSize} isRTL={isRTL} />

        <div className="flex gap-3 mt-5">
          <Button variant="ghost" fullWidth onClick={() => setReceiptOpen(false)}>{t.common.close}</Button>
          <Button variant="dark" fullWidth icon={FiPrinter} onClick={() => window.print()}>{t.common.print}</Button>
          {receiptOrder?.orderNumber && (
            <Button variant="primary" fullWidth onClick={closeReceiptAndExit}>{isRTL ? 'تم' : 'Done'}</Button>
          )}
        </div>
      </Modal>
    </MainLayout>
  )
}
