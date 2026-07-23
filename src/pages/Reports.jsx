import { useEffect, useState } from 'react'
import { FiDollarSign, FiShoppingCart, FiPercent, FiAward, FiPrinter, FiInbox } from 'react-icons/fi'
import toast from 'react-hot-toast'
import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeletons'
import * as reportsApi from '../api/reports'
import { useLang } from '../context/LanguageContext'
import { formatCurrency } from '../utils/format'

// GET /reports/daily and GET /reports/monthly (services/reportService.js)
// both hardcode "today" / "this calendar month" server-side — there's no
// date/month/year param handling at all, so Yesterday/Week/Year/Custom tabs
// have been removed entirely rather than silently showing mislabeled data.
// Each report returns EXACTLY { date|month, totalOrders, totalSales,
// averageOrder } — no hourly breakdown or category split exists.
// Best products: { productId, name, price, totalSold, revenue }.

const TABS = ['today', 'month']

export default function Reports() {
  const { isRTL, t } = useLang()
  const [tab, setTab] = useState('today')
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(true)

  const [bestProducts, setBestProducts] = useState([])
  const [bestLoading, setBestLoading] = useState(true)

  const TAB_LABEL = { today: t.common.today, month: t.common.thisMonth }

  useEffect(() => {
    setReportLoading(true)
    const call = tab === 'today' ? reportsApi.getDailyReport() : reportsApi.getMonthlyReport()
    call
      .then(setReport)
      .catch((err) => toast.error(err.message || (isRTL ? 'تعذر تحميل التقرير (يتطلب صلاحية admin)' : 'Failed to load report (requires admin role)')))
      .finally(() => setReportLoading(false))
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setBestLoading(true)
    reportsApi
      .getBestProducts()
      .then((data) => setBestProducts(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(err.message || (isRTL ? 'تعذر تحميل أكثر الأصناف مبيعًا' : 'Failed to load best products')))
      .finally(() => setBestLoading(false))
  }, [])

  return (
    <MainLayout title={isRTL ? 'التقارير' : 'Reports & Analytics'} subtitle={isRTL ? 'تقارير المبيعات اليومية والشهرية' : 'Daily and monthly sales reports'}>
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row gap-3 justify-between">
          <div className="flex gap-1.5 bg-bg-card border border-border rounded-lg p-1">
            {TABS.map((r) => (
              <button key={r} onClick={() => setTab(r)} className={`px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${tab === r ? 'bg-primary-600 text-white' : 'text-txt-secondary hover:bg-bg-hover'}`}>
                {TAB_LABEL[r]}
              </button>
            ))}
          </div>
          <Button variant="dark" icon={FiPrinter} size="sm" onClick={() => window.print()}>{t.common.print}</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {reportLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard icon={FiDollarSign} color="green" label={isRTL ? 'إجمالي المبيعات' : 'Total Sales'} value={formatCurrency(report?.totalSales ?? 0)} />
              <StatCard icon={FiShoppingCart} color="blue" label={isRTL ? 'عدد الطلبات' : 'Total Orders'} value={report?.totalOrders ?? 0} />
              <StatCard icon={FiPercent} color="orange" label={isRTL ? 'متوسط الطلب' : 'Average Order'} value={formatCurrency(report?.averageOrder ?? 0)} />
            </>
          )}
        </div>

        <Card>
          <h3 className="font-semibold font-display text-txt mb-3 flex items-center gap-2"><FiAward className="text-warning" />{isRTL ? 'الأصناف الأكثر مبيعًا' : 'Best Selling Products'}</h3>
          {bestLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-9 w-full rounded-lg" />)}</div>
          ) : bestProducts.length === 0 ? (
            <EmptyState icon={FiInbox} title={isRTL ? 'لا توجد بيانات' : 'No data'} message="" />
          ) : (
            <div className="space-y-2">
              {bestProducts.map((p, i) => (
                <div key={p.productId || i} className="flex items-center justify-between py-2 border-b border-border/60 last:border-b-0">
                  <span className="flex items-center gap-3 text-sm text-txt"><span className="text-txt-muted w-4">{i + 1}</span>{p.name}</span>
                  <div className="flex items-center gap-4 text-sm text-txt-secondary">
                    <span>{p.totalSold} {isRTL ? 'مباع' : 'sold'}</span>
                    <span className="text-success font-medium">{formatCurrency(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  )
}
