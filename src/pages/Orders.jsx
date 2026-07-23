import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FiEye, FiPrinter, FiCopy, FiTrash2, FiDownload } from 'react-icons/fi'
import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import StatusBadge from '../components/ui/StatusBadge'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Input'
import * as ordersApi from '../api/orders'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../utils/format'

// Order.status is only 'active' | 'completed' | 'cancelled' (orderModel.js)
// — no open/preparing/ready states exist for dine-in orders. Payment method
// is only 'cash' | 'card' and is undefined until checkout runs. This list
// shows ALL orders returned by GET /orders, which includes both dineIn and
// delivery types (there's no type filter on that endpoint), so a table
// number won't exist for delivery rows.

export default function Orders() {
  const { isRTL, t } = useLang()
  const { orders, setOrders, loading } = useAppData()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewOrder, setViewOrder] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [rowBusyId, setRowBusyId] = useState(null)

  const cashierName = (o) => (typeof o.cashier === 'string' ? o.cashier : o.cashier?.name) || '-'
  const tableNumberOf = (o) => o.table?.tableNumber ?? '-'

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        (o.orderNumber || '').toLowerCase().includes(q) ||
        String(tableNumberOf(o)).includes(q) ||
        cashierName(o).toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter
      return matchesQuery && matchesStatus && matchesPayment
    })
  }, [orders, query, statusFilter, paymentFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed').length
    const active = orders.filter((o) => o.status === 'active').length
    const cancelled = orders.filter((o) => o.status === 'cancelled').length
    const revenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + (o.totalPrice || 0), 0)
    return { total: orders.length, completed, active, cancelled, revenue, avg: revenue / (completed || 1) }
  }, [orders])

  const openView = async (r) => {
    setViewOrder(r)
    setViewLoading(true)
    try {
      // The receipt endpoint is used here instead of GET /orders/:id because
      // it's the only endpoint that returns line items alongside order info
      // (OrderItem lives in a separate collection from Order).
      const fresh = await ordersApi.getOrderReceipt(r.id)
      setViewOrder(fresh)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحميل تفاصيل الطلب' : 'Failed to load order details'))
    } finally {
      setViewLoading(false)
    }
  }

  const handlePrint = async (r) => {
    setRowBusyId(r.id)
    try {
      await ordersApi.getOrderReceipt(r.id)
      toast.success(isRTL ? 'تم تجهيز الفاتورة للطباعة' : 'Receipt ready to print')
      window.print()
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحميل الفاتورة' : 'Failed to load receipt'))
    } finally {
      setRowBusyId(null)
    }
  }

  const handleDuplicate = async (r) => {
    if (!r.table) {
      toast.error(isRTL ? 'لا يمكن تكرار طلب توصيل من هنا' : 'Cannot duplicate a delivery order from here')
      return
    }
    setRowBusyId(r.id)
    try {
      const tableId = r.table?._id || r.table?.id || r.table
      const receipt = await ordersApi.getOrderReceipt(r.id)
      const created = await ordersApi.createOrder({ table: tableId })
      const newOrderId = created._id || created.id
      for (const item of receipt.items || []) {
        await ordersApi.addOrderItem(newOrderId, item.product?._id || item.product?.id || item.product, item.quantity)
      }
      setOrders((p) => [created, ...p])
      toast.success(isRTL ? 'تم تكرار الطلب' : 'Order duplicated')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تكرار الطلب' : 'Failed to duplicate order'))
    } finally {
      setRowBusyId(null)
    }
  }

  const handleDelete = async () => {
    // No DELETE /orders/:id endpoint exists — this cancels the order via the
    // confirmed PUT /orders/:id/cancel endpoint instead.
    try {
      await ordersApi.cancelOrder(deleteTarget.id)
      setOrders((p) => p.map((o) => (o.id === deleteTarget.id ? { ...o, status: 'cancelled' } : o)))
      toast.success(isRTL ? 'تم إلغاء الطلب' : 'Order cancelled')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر إلغاء الطلب' : 'Failed to cancel order'))
    }
  }

  const columns = [
    { key: 'orderNumber', label: isRTL ? 'رقم الطلب' : 'Invoice', render: (r) => <span className="font-semibold text-txt">{r.orderNumber}</span> },
    { key: 'table', label: isRTL ? 'الطاولة' : 'Table', render: (r) => tableNumberOf(r) },
    { key: 'cashier', label: isRTL ? 'الكاشير' : 'Cashier', render: (r) => cashierName(r) },
    { key: 'status', label: t.common.status, render: (r) => <StatusBadge status={r.status} isRTL={isRTL} /> },
    { key: 'paymentMethod', label: isRTL ? 'الدفع' : 'Payment', render: (r) => r.paymentMethod || '-' },
    { key: 'totalPrice', label: isRTL ? 'الإجمالي' : 'Total', render: (r) => formatCurrency(r.totalPrice) },
    { key: 'createdAt', label: isRTL ? 'التاريخ' : 'Date', render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : '-') },
    {
      key: 'actions', label: t.common.actions, render: (r) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openView(r)} className="h-7 w-7 rounded-md bg-bg-hover text-info flex items-center justify-center"><FiEye size={13} /></button>
          <button onClick={() => handlePrint(r)} disabled={rowBusyId === r.id} className="h-7 w-7 rounded-md bg-bg-hover text-txt-secondary flex items-center justify-center disabled:opacity-50"><FiPrinter size={13} /></button>
          <button onClick={() => handleDuplicate(r)} disabled={rowBusyId === r.id} className="h-7 w-7 rounded-md bg-bg-hover text-secondary-light flex items-center justify-center disabled:opacity-50"><FiCopy size={13} /></button>
          <button onClick={() => setDeleteTarget(r)} className="h-7 w-7 rounded-md bg-bg-hover text-danger flex items-center justify-center"><FiTrash2 size={13} /></button>
        </div>
      )
    },
  ]

  return (
    <MainLayout title={isRTL ? 'إدارة الطلبات' : 'Orders Management'} subtitle={isRTL ? `إجمالي الطلبات: ${orders.length}` : `Total orders: ${orders.length}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الطلبات' : 'Total Orders'}</p><p className="text-xl font-bold text-txt mt-1">{stats.total}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'مكتملة' : 'Completed'}</p><p className="text-xl font-bold text-success mt-1">{stats.completed}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'نشطة' : 'Active'}</p><p className="text-xl font-bold text-warning mt-1">{stats.active}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'ملغاة' : 'Cancelled'}</p><p className="text-xl font-bold text-danger mt-1">{stats.cancelled}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</p><p className="text-xl font-bold text-secondary-light mt-1">{formatCurrency(stats.revenue)}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'متوسط الطلب' : 'Avg Order'}</p><p className="text-xl font-bold text-txt mt-1">{formatCurrency(stats.avg)}</p></Card>
        </div>

        <Card className="!p-4">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <SearchInput value={query} onChange={setQuery} placeholder={isRTL ? 'بحث برقم الطلب، الطاولة أو الكاشير' : 'Search by invoice, table, cashier'} className="flex-1" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lg:w-48">
              <option value="all">{isRTL ? 'كل الحالات' : 'All statuses'}</option>
              <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
              <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
            </Select>
            <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="lg:w-48">
              <option value="all">{isRTL ? 'كل طرق الدفع' : 'All payments'}</option>
              <option value="cash">{isRTL ? 'كاش' : 'Cash'}</option>
              <option value="card">{isRTL ? 'بطاقة' : 'Card'}</option>
            </Select>
            <Button variant="dark" icon={FiDownload} onClick={() => toast.error(isRTL ? 'التصدير غير متاح (لا يوجد endpoint)' : 'Export not available (no endpoint)')}>{t.common.export}</Button>
            <Button variant="dark" icon={FiPrinter} onClick={() => window.print()}>{t.common.print}</Button>
          </div>

          <DataTable
            columns={columns}
            data={paged}
            loading={loading.orders}
            emptyTitle={isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
            emptyMessage={isRTL ? 'ستظهر الطلبات هنا فور إنشائها' : 'Orders will appear here once created'}
          />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} totalItems={filtered.length} />
        </Card>
      </div>

      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={isRTL ? `تفاصيل الطلب ${viewOrder?.orderNumber || ''}` : `Order Details ${viewOrder?.orderNumber || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewOrder(null)}>{t.common.close}</Button>
            <Button variant="dark" icon={FiPrinter} onClick={() => window.print()}>{t.common.print}</Button>
          </>
        }
      >
        {viewLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-16 w-full rounded-lg" />
            <div className="skeleton h-32 w-full rounded-lg" />
            <div className="skeleton h-20 w-full rounded-lg" />
          </div>
        ) : viewOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-txt-muted text-xs">{isRTL ? 'الطاولة' : 'Table'}</p><p className="text-txt font-medium">{viewOrder.table?.tableNumber ?? '-'}</p></div>
              <div><p className="text-txt-muted text-xs">{isRTL ? 'الكاشير' : 'Cashier'}</p><p className="text-txt font-medium">{viewOrder.cashier?.name || '-'}</p></div>
              <div><p className="text-txt-muted text-xs">{isRTL ? 'التاريخ' : 'Date'}</p><p className="text-txt font-medium">{viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString() : '-'}</p></div>
              <div><p className="text-txt-muted text-xs">{isRTL ? 'طريقة الدفع' : 'Payment'}</p><p className="text-txt font-medium">{viewOrder.paymentMethod || '-'}</p></div>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              {(viewOrder.items || []).map((it, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/60 last:border-b-0 text-sm">
                  <span className="text-txt">{it.product?.name} x{it.quantity}</span>
                  <span className="text-txt font-medium">{formatCurrency(it.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between pt-2 border-t border-border font-semibold"><span className="text-txt">{isRTL ? 'الإجمالي الكلي' : 'Grand Total'}</span><span className="text-success text-lg">{formatCurrency(viewOrder.totalPrice)}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={isRTL ? 'إلغاء الطلب' : 'Cancel Order'}
        message={isRTL ? `هل أنت متأكد من إلغاء الطلب ${deleteTarget?.orderNumber}؟` : `Cancel order ${deleteTarget?.orderNumber}?`}
      />
    </MainLayout>
  )
}
