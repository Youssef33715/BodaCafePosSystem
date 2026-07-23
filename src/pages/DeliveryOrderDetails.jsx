import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiArrowRight, FiArrowLeft, FiUser, FiPhone, FiMapPin, FiPrinter,
  FiClock, FiPackage, FiTruck, FiCheckCircle,
} from 'react-icons/fi'
import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import DeliveryReceipt from '../components/delivery/DeliveryReceipt'
import * as deliveryApi from '../api/delivery'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../utils/format'

// Order model has no paymentMethod concept for delivery orders (see
// createDeliveryOrder comment in api/delivery.js), so that row has been
// removed from "Order Information". Cashier is populated by the backend as
// { name, email } (orderService.js getDeliveryOrders/getOrderReceipt), not a
// plain string. The products table is sourced from the receipt endpoint
// (GET /orders/:id/receipt) since the Order document itself doesn't embed
// items — those live in a separate OrderItem collection.

const STATUS_STEPS = [
  { key: 'preparing', ar: 'قيد التحضير', en: 'Preparing', icon: FiPackage },
  { key: 'out_for_delivery', ar: 'في الطريق', en: 'Out for Delivery', icon: FiTruck },
  { key: 'delivered', ar: 'تم التوصيل', en: 'Delivered', icon: FiCheckCircle },
]

export default function DeliveryOrderDetails() {
  const { isRTL, t } = useLang()
  const { id } = useParams()
  const navigate = useNavigate()
  const { deliveryOrders, updateDeliveryOrder } = useAppData()
  const BackIcon = isRTL ? FiArrowRight : FiArrowLeft
  const [paperSize, setPaperSize] = useState('80')

  const order = deliveryOrders.find((o) => o.id === id)

  const [receiptData, setReceiptData] = useState(null)
  const [receiptLoading, setReceiptLoading] = useState(true)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    if (!order) return
    setReceiptLoading(true)
    deliveryApi
      .getDeliveryReceipt(order.id)
      .then(setReceiptData)
      .catch((err) => toast.error(err.message || (isRTL ? 'تعذر تحميل الفاتورة' : 'Failed to load receipt')))
      .finally(() => setReceiptLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id])

  if (!order) {
    return (
      <MainLayout title={isRTL ? 'تفاصيل طلب التوصيل' : 'Delivery Order Details'}>
        <EmptyState
          icon={FiPackage}
          title={isRTL ? 'الطلب غير موجود' : 'Order not found'}
          message={isRTL ? 'تعذر العثور على طلب التوصيل المطلوب.' : "We couldn't find this delivery order."}
          action={<Link to="/delivery"><Button icon={BackIcon}>{isRTL ? 'العودة لطلبات التوصيل' : 'Back to Delivery Orders'}</Button></Link>}
        />
      </MainLayout>
    )
  }

  const setStatus = async (status) => {
    setStatusUpdating(true)
    try {
      await updateDeliveryOrder(order.id, { deliveryStatus: status })
      toast.success(isRTL ? 'تم تحديث حالة التوصيل' : 'Delivery status updated')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحديث الحالة' : 'Failed to update status'))
    } finally {
      setStatusUpdating(false)
    }
  }

  const handlePrint = () => {
    if (!receiptData) {
      toast.error(isRTL ? 'الفاتورة غير جاهزة بعد' : 'Receipt is not ready yet')
      return
    }
    window.print()
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.deliveryStatus)
  const cashierName = typeof order.cashier === 'string' ? order.cashier : order.cashier?.name
  const grandTotal = (order.totalPrice || 0) + (order.deliveryFee || 0)

  return (
    <MainLayout title={isRTL ? `تفاصيل الطلب ${order.orderNumber}` : `Order Details ${order.orderNumber}`} subtitle={isRTL ? 'عرض وإدارة طلب التوصيل' : 'View and manage this delivery order'}>
      <div className="space-y-5">
        <button onClick={() => navigate('/delivery')} className="flex items-center gap-1.5 text-sm text-txt-secondary hover:text-txt transition-colors">
          <BackIcon size={14} />
          {isRTL ? 'العودة لطلبات التوصيل' : 'Back to Delivery Orders'}
        </button>

        {/* Status progress */}
        <Card>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <p className="text-xs text-txt-muted">{isRTL ? 'رقم الطلب' : 'Order Number'}</p>
              <p className="text-lg font-bold text-txt font-display">{order.orderNumber}</p>
            </div>
            <StatusBadge status={order.deliveryStatus} isRTL={isRTL} className="text-sm px-4 py-1.5" />
          </div>

          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg transition-colors ${
                    i <= currentStepIndex ? 'bg-gradient-to-tr from-primary-700 to-primary-600 text-white shadow-glow' : 'bg-bg-hover text-txt-muted'
                  }`}>
                    <step.icon />
                  </div>
                  <span className={`text-xs font-medium ${i <= currentStepIndex ? 'text-txt' : 'text-txt-muted'}`}>{isRTL ? step.ar : step.en}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${i < currentStepIndex ? 'bg-primary-600' : 'bg-bg-hover'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <Button variant={order.deliveryStatus === 'preparing' ? 'primary' : 'dark'} icon={FiPackage} loading={statusUpdating} onClick={() => setStatus('preparing')}>
              {isRTL ? 'قيد التحضير' : 'Preparing'}
            </Button>
            <Button variant={order.deliveryStatus === 'out_for_delivery' ? 'primary' : 'dark'} icon={FiTruck} loading={statusUpdating} onClick={() => setStatus('out_for_delivery')}>
              {isRTL ? 'في الطريق' : 'Out for Delivery'}
            </Button>
            <Button variant={order.deliveryStatus === 'delivered' ? 'success' : 'dark'} icon={FiCheckCircle} loading={statusUpdating} onClick={() => setStatus('delivered')}>
              {isRTL ? 'تم التوصيل' : 'Delivered'}
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Customer + meta info */}
          <div className="lg:col-span-1 space-y-5">
            <Card>
              <h3 className="font-semibold font-display text-txt mb-4">{isRTL ? 'بيانات العميل' : 'Customer Information'}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-primary-600/15 text-primary-400 flex items-center justify-center shrink-0"><FiUser size={15} /></span>
                  <div className="min-w-0"><p className="text-xs text-txt-muted">{isRTL ? 'اسم العميل' : 'Customer Name'}</p><p className="text-txt font-medium truncate">{order.customerName}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-info-bg text-info flex items-center justify-center shrink-0"><FiPhone size={15} /></span>
                  <div className="min-w-0"><p className="text-xs text-txt-muted">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</p><p className="text-txt font-medium truncate">{order.customerPhone}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="h-9 w-9 rounded-lg bg-secondary/15 text-secondary-light flex items-center justify-center shrink-0"><FiMapPin size={15} /></span>
                  <div className="min-w-0"><p className="text-xs text-txt-muted">{isRTL ? 'عنوان التوصيل' : 'Delivery Address'}</p><p className="text-txt font-medium">{order.deliveryAddress}</p></div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold font-display text-txt mb-4">{isRTL ? 'بيانات الطلب' : 'Order Information'}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-bg-hover text-txt-secondary flex items-center justify-center shrink-0"><FiClock size={15} /></span>
                  <div className="min-w-0"><p className="text-xs text-txt-muted">{isRTL ? 'تاريخ الطلب' : 'Order Date'}</p><p className="text-txt font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</p></div>
                </div>
                {cashierName && (
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-primary-600/20 text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">{cashierName[0]}</span>
                    <div className="min-w-0"><p className="text-xs text-txt-muted">{isRTL ? 'الكاشير' : 'Cashier'}</p><p className="text-txt font-medium truncate">{cashierName}</p></div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Products + totals */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="!p-0 overflow-hidden">
              <h3 className="font-semibold font-display text-txt px-5 pt-5 pb-3">{isRTL ? 'المنتجات المطلوبة' : 'Ordered Products'}</h3>
              {receiptLoading ? (
                <div className="px-5 pb-5 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-border text-start text-xs text-txt-muted uppercase tracking-wide">
                        <th className="px-5 py-3 text-start font-medium">{isRTL ? 'المنتج' : 'Product'}</th>
                        <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الكمية' : 'Quantity'}</th>
                        <th className="px-5 py-3 text-start font-medium">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</th>
                        <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الإجمالي الفرعي' : 'Subtotal'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(receiptData?.items || []).map((it, i) => (
                        <tr key={i} className="border-b border-border/60 last:border-b-0">
                          <td className="px-5 py-3.5 text-sm text-txt font-medium">{it.product?.name}</td>
                          <td className="px-5 py-3.5 text-sm text-txt-secondary">{it.quantity}</td>
                          <td className="px-5 py-3.5 text-sm text-txt-secondary">{formatCurrency(it.unitPrice)}</td>
                          <td className="px-5 py-3.5 text-sm text-txt font-medium">{formatCurrency(it.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-4 border-t border-border space-y-1.5 text-sm">
                <div className="flex justify-between text-txt-secondary"><span>{isRTL ? 'إجمالي المنتجات' : 'Items Subtotal'}</span><span className="text-txt">{formatCurrency(order.totalPrice)}</span></div>
                <div className="flex justify-between text-txt-secondary"><span>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span><span className="text-txt">{formatCurrency(order.deliveryFee)}</span></div>
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-border">
                  <span className="font-semibold text-txt">{isRTL ? 'الإجمالي النهائي' : 'Grand Total'}</span>
                  <span className="text-xl font-bold text-success">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </Card>

            {/* Printable receipt */}
            <Card>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="font-semibold font-display text-txt">{isRTL ? 'الفاتورة' : 'Receipt'}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-bg-sidebar border border-border rounded-lg p-1">
                    {['58', '80'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPaperSize(size)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          paperSize === size ? 'bg-primary-600 text-white' : 'text-txt-secondary hover:bg-bg-hover'
                        }`}
                      >
                        {size}mm
                      </button>
                    ))}
                  </div>
                  <Button variant="dark" icon={FiPrinter} size="sm" onClick={handlePrint}>{isRTL ? 'طباعة الفاتورة' : 'Print Receipt'}</Button>
                </div>
              </div>
              {receiptLoading ? (
                <div className="skeleton h-64 w-full max-w-[280px] mx-auto rounded-lg" />
              ) : receiptData ? (
                <DeliveryReceipt order={receiptData} paperSize={paperSize} isRTL={isRTL} />
              ) : (
                <EmptyState icon={FiPrinter} title={isRTL ? 'تعذر تحميل الفاتورة' : 'Receipt unavailable'} message={isRTL ? 'لم نتمكن من جلب بيانات الفاتورة من الخادم.' : "We couldn't fetch the receipt from the server."} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
