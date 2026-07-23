import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  FiPlus, FiGrid, FiEdit2, FiTrash2, FiShoppingBag, FiMoreVertical,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import StatusBadge from '../components/ui/StatusBadge'
import { SearchInput } from '../components/ui/SearchInput'
import { Input, Select } from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'

// Table schema (tableModel.js) is ONLY { tableNumber, status: 'available'|'occupied' }
// — no table name, area/zone, or reserved/disabled statuses exist on the
// backend, so those fields/filters have been removed entirely. There's also
// no running-total field on a table (that lives on the Order, not the Table),
// so the "current total" badge that used to show here has been removed too.

export default function Tables() {
  const { isRTL, t } = useLang()
  const { tables, addTable, updateTable, deleteTable, loading } = useAppData()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm()

  const filtered = useMemo(() => {
    return tables.filter((tb) => {
      const matchesQuery = query.trim() === '' || String(tb.tableNumber).includes(query)
      const matchesStatus = statusFilter === 'all' || tb.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [tables, query, statusFilter])

  const stats = useMemo(() => ({
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
  }), [tables])

  const openCreate = () => { setEditingTable(null); reset({ tableNumber: tables.length + 1, status: 'available' }); setModalOpen(true) }
  const openEdit = (tb) => { setEditingTable(tb); reset({ tableNumber: tb.tableNumber, status: tb.status }); setModalOpen(true); setMenuOpenId(null) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = { tableNumber: Number(data.tableNumber), status: data.status }
      if (editingTable) {
        await updateTable(editingTable.id, payload)
        toast.success(isRTL ? 'تم تحديث الطاولة' : 'Table updated')
      } else {
        await addTable(payload)
        toast.success(isRTL ? 'تمت إضافة الطاولة' : 'Table added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'حدث خطأ أثناء الحفظ' : 'Something went wrong'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTable(deleteTarget.id)
      toast.success(isRTL ? 'تم حذف الطاولة' : 'Table deleted')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر حذف الطاولة' : 'Failed to delete table'))
    }
  }

  return (
    <MainLayout title={isRTL ? 'الطاولات' : 'Tables'} subtitle={isRTL ? 'عرض حالة جميع الطاولات في الكافيه' : 'View status of all cafe tables'}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <SearchInput value={query} onChange={setQuery} placeholder={isRTL ? 'بحث عن طاولة...' : 'Search table...'} className="sm:max-w-xs" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48">
              <option value="all">{isRTL ? 'كل الحالات' : 'All statuses'}</option>
              <option value="available">{isRTL ? 'متاحة' : 'Available'}</option>
              <option value="occupied">{isRTL ? 'مشغولة' : 'Occupied'}</option>
            </Select>
          </div>
          <Button icon={FiPlus} onClick={openCreate}>{isRTL ? 'إضافة طاولة جديدة' : 'Add New Table'}</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="flex items-center gap-3"><span className="h-10 w-10 rounded-lg bg-primary-600/15 text-primary-400 flex items-center justify-center text-lg"><FiGrid /></span><div><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الطاولات' : 'Total Tables'}</p><p className="font-bold text-txt text-lg">{stats.total}</p></div></Card>
          <Card className="flex items-center gap-3"><span className="h-10 w-10 rounded-lg bg-success-bg text-success flex items-center justify-center text-lg">●</span><div><p className="text-xs text-txt-secondary">{isRTL ? 'متاحة' : 'Available'}</p><p className="font-bold text-txt text-lg">{stats.available}</p></div></Card>
          <Card className="flex items-center gap-3"><span className="h-10 w-10 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-lg">●</span><div><p className="text-xs text-txt-secondary">{isRTL ? 'مشغولة' : 'Occupied'}</p><p className="font-bold text-txt text-lg">{stats.occupied}</p></div></Card>
        </div>

        {loading.tables ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 flex flex-col items-center gap-2">
                <div className="skeleton h-8 w-8 rounded-lg" />
                <div className="skeleton h-4 w-10 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiGrid} title={isRTL ? 'لا توجد طاولات' : 'No tables'} message={isRTL ? 'أضف طاولتك الأولى للبدء' : 'Add your first table to get started'} action={<Button icon={FiPlus} onClick={openCreate}>{isRTL ? 'إضافة طاولة' : 'Add Table'}</Button>} />
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            <AnimatePresence>
              {filtered.map((tb) => (
                <motion.div
                  key={tb.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className={`relative card p-4 flex flex-col items-center gap-2 text-center transition-shadow ${
                    tb.status === 'occupied' ? 'hover:shadow-[0_0_0_1px_rgba(239,68,68,0.4),0_0_24px_-4px_rgba(239,68,68,0.35)]' : 'hover:shadow-glow'
                  }`}
                >
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === tb.id ? null : tb.id)}
                    className="absolute top-2 end-2 h-6 w-6 rounded-md text-txt-muted hover:bg-bg-hover flex items-center justify-center"
                  >
                    <FiMoreVertical size={14} />
                  </button>
                  <AnimatePresence>
                    {menuOpenId === tb.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute top-8 end-2 z-20 w-40 bg-bg-card border border-border rounded-lg shadow-lift p-1"
                      >
                        <button onClick={() => { navigate('/pos'); setMenuOpenId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-txt-secondary hover:bg-bg-hover rounded-md"><FiShoppingBag size={13} />{isRTL ? 'فتح الطلب' : 'Open Order'}</button>
                        <button onClick={() => openEdit(tb)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-txt-secondary hover:bg-bg-hover rounded-md"><FiEdit2 size={13} />{t.common.edit}</button>
                        <button onClick={() => { setDeleteTarget(tb); setMenuOpenId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger-bg rounded-md"><FiTrash2 size={13} />{t.common.delete}</button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-3xl mt-2">🪑</div>
                  <p className="text-lg font-bold text-txt">{tb.tableNumber}</p>
                  <StatusBadge status={tb.status} isRTL={isRTL} />
                  <button onClick={() => navigate('/pos')} className="text-[11px] text-primary-400 hover:text-primary-300 font-medium mt-1">
                    {isRTL ? 'فتح الطلب ←' : 'Open Order →'}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTable ? (isRTL ? 'تعديل الطاولة' : 'Edit Table') : (isRTL ? 'إضافة طاولة جديدة' : 'Add New Table')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>{t.common.save}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={isRTL ? 'رقم الطاولة' : 'Table Number'} type="number" {...register('tableNumber', { required: true })} />
          <Select label={t.common.status} {...register('status')}>
            <option value="available">{isRTL ? 'متاحة' : 'Available'}</option>
            <option value="occupied">{isRTL ? 'مشغولة' : 'Occupied'}</option>
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={isRTL ? 'حذف الطاولة' : 'Delete Table'}
        message={isRTL ? `هل أنت متأكد من حذف طاولة رقم ${deleteTarget?.tableNumber}؟` : `Are you sure you want to delete table #${deleteTarget?.tableNumber}?`}
      />
    </MainLayout>
  )
}
