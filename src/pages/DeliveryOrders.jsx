import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiPlus, FiPhone, FiMapPin } from 'react-icons/fi'
import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Input'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../utils/format'

// Delivery orders never get a paymentMethod set in this backend (checkout —
// where paymentMethod is written — assumes a non-null table, which delivery
// orders never have), so the payment column/filter that used to be here has
// been removed. "Final Total" = totalPrice (items only, backend field) +
// deliveryFee, computed client-side for display since the backend never sums them.

export default function DeliveryOrders() {
  const { isRTL, t } = useLang()
  const { deliveryOrders, loading } = useAppData()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    return deliveryOrders.filter((o) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(query) ||
        (o.deliveryAddress || '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || o.deliveryStatus === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [deliveryOrders, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const stats = useMemo(() => {
    const preparing = deliveryOrders.filter((o) => o.deliveryStatus === 'preparing').length
    const outForDelivery = deliveryOrders.filter((o) => o.deliveryStatus === 'out_for_delivery').length
    const delivered = deliveryOrders.filter((o) => o.deliveryStatus === 'delivered').length
    const revenue = deliveryOrders.reduce((s, o) => s + (o.totalPrice || 0) + (o.deliveryFee || 0), 0)
    return { total: deliveryOrders.length, preparing, outForDelivery, delivered, revenue }
  }, [deliveryOrders])

  const columns = [
    { key: 'orderNumber', label: isRTL ? 'رقم الطلب' : 'Order #', render: (r) => <span className="font-semibold text-txt">{r.orderNumber}</span> },
    { key: 'customerName', label: isRTL ? 'اسم العميل' : 'Customer', render: (r) => <span className="text-txt">{r.customerName}</span> },
    { key: 'customerPhone', label: isRTL ? 'رقم الهاتف' : 'Phone', render: (r) => <span className="flex items-center gap-1.5 text-txt-secondary"><FiPhone size={12} className="text-primary-400" />{r.customerPhone}</span> },
    { key: 'deliveryAddress', label: isRTL ? 'العنوان' : 'Address', render: (r) => <span className="flex items-center gap-1.5 text-txt-secondary max-w-[220px] truncate"><FiMapPin size={12} className="text-secondary-light shrink-0" /><span className="truncate">{r.deliveryAddress}</span></span> },
    { key: 'deliveryStatus', label: t.common.status, render: (r) => <StatusBadge status={r.deliveryStatus} isRTL={isRTL} /> },
    { key: 'totalPrice', label: isRTL ? 'إجمالي المنتجات' : 'Total Price', render: (r) => formatCurrency(r.totalPrice) },
    { key: 'deliveryFee', label: isRTL ? 'رسوم التوصيل' : 'Delivery Fee', render: (r) => formatCurrency(r.deliveryFee) },
    { key: 'final', label: isRTL ? 'الإجمالي النهائي' : 'Final Total', render: (r) => <span className="font-semibold text-success">{formatCurrency((r.totalPrice || 0) + (r.deliveryFee || 0))}</span> },
    { key: 'createdAt', label: isRTL ? 'تاريخ الإنشاء' : 'Created', render: (r) => <span className="text-txt-secondary">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</span> },
    {
      key: 'actions', label: t.common.actions, render: (r) => (
        <button
          onClick={() => navigate(`/delivery/${r.id}`)}
          className="h-7 w-7 rounded-md bg-bg-hover text-info flex items-center justify-center"
        >
          <FiEye size={13} />
        </button>
      )
    },
  ]

  return (
    <MainLayout title={isRTL ? 'طلبات التوصيل' : 'Delivery Orders'} subtitle={isRTL ? `طلبات التوصيل: ${deliveryOrders.length}` : `Delivery orders: ${deliveryOrders.length}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الطلبات' : 'Total Orders'}</p><p className="text-xl font-bold text-txt mt-1">{stats.total}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'قيد التحضير' : 'Preparing'}</p><p className="text-xl font-bold text-warning mt-1">{stats.preparing}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'في الطريق' : 'Out for Delivery'}</p><p className="text-xl font-bold text-info mt-1">{stats.outForDelivery}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'تم التوصيل' : 'Delivered'}</p><p className="text-xl font-bold text-success mt-1">{stats.delivered}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</p><p className="text-xl font-bold text-secondary-light mt-1">{formatCurrency(stats.revenue)}</p></Card>
        </div>

        <Card className="!p-4">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={isRTL ? 'بحث بالاسم، الهاتف، العنوان أو رقم الطلب' : 'Search by name, phone, address or order #'}
              className="flex-1"
            />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lg:w-52">
              <option value="all">{isRTL ? 'كل حالات التوصيل' : 'All delivery statuses'}</option>
              <option value="preparing">{isRTL ? 'قيد التحضير' : 'Preparing'}</option>
              <option value="out_for_delivery">{isRTL ? 'في الطريق' : 'Out for Delivery'}</option>
              <option value="delivered">{isRTL ? 'تم التوصيل' : 'Delivered'}</option>
            </Select>
            <Button icon={FiPlus} onClick={() => navigate('/delivery/create')}>
              {isRTL ? 'طلب توصيل جديد' : 'New Delivery Order'}
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={paged}
            loading={loading.deliveryOrders}
            emptyTitle={isRTL ? 'لا توجد طلبات توصيل بعد' : 'No delivery orders yet'}
            emptyMessage={isRTL ? 'ستظهر طلبات التوصيل هنا فور إنشائها' : 'Delivery orders will appear here once created'}
          />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} totalItems={filtered.length} />
        </Card>
      </div>
    </MainLayout>
  )
}
