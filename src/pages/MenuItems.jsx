import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  FiPlus, FiGrid, FiList, FiEdit2, FiTrash2, FiEyeOff, FiEye,
  FiUploadCloud, FiPackage,
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import Toggle from '../components/ui/Toggle'
import { SearchInput } from '../components/ui/SearchInput'
import { Input, Textarea, Select } from '../components/ui/Input'
import { SkeletonProductCard } from '../components/ui/Skeletons'
import { resolveImageUrl } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../utils/format'

// Product schema (productModel.js) is ONLY { name, description, price, image,
// category, isAvailable } — no English name, discount price, prep time,
// calories, or featured flag exist on the backend, so those form fields have
// been removed entirely.

function categoryIdOf(product) {
  return product.category?._id || product.category?.id || product.category
}

export default function MenuItems() {
  const { isRTL, t } = useLang()
  const { products, categories, addProduct, updateProduct, deleteProduct, loading } = useAppData()

  const [view, setView] = useState('table')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availFilter, setAvailFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const isAvailable = watch('isAvailable')

  const categoryName = (product) => {
    const id = categoryIdOf(product)
    return categories.find((c) => c.id === id)?.name || '-'
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || p.name?.toLowerCase().includes(q)
      const matchesCat = categoryFilter === 'all' || categoryIdOf(p) === categoryFilter
      const matchesAvail = availFilter === 'all' || (availFilter === 'available' ? p.isAvailable : !p.isAvailable)
      return matchesQuery && matchesCat && matchesAvail
    })
  }, [products, query, categoryFilter, availFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const stats = useMemo(() => ({
    total: products.length,
    available: products.filter((p) => p.isAvailable).length,
    unavailable: products.filter((p) => !p.isAvailable).length,
    categories: categories.length,
  }), [products, categories])

  const openCreate = () => {
    setEditing(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    reset({ name: '', description: '', category: categories[0]?.id || '', price: '', isAvailable: true })
    setModalOpen(true)
  }
  const openEdit = (p) => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    setEditing(p)
    reset({ name: p.name, description: p.description, category: categoryIdOf(p), price: p.price, isAvailable: p.isAvailable })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    const pendingFile = fileInputRef.current?.files?.[0]
    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      isAvailable: data.isAvailable,
      ...(pendingFile ? { image: pendingFile } : {}),
    }
    setSaving(true)
    try {
      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success(isRTL ? 'تم تحديث الصنف' : 'Product updated')
      } else {
        await addProduct(payload)
        toast.success(isRTL ? 'تمت إضافة الصنف' : 'Product added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'حدث خطأ أثناء الحفظ' : 'Something went wrong'))
    } finally {
      setSaving(false)
    }
  }

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (editing?.id) {
      setUploading(true)
      try {
        await updateProduct(editing.id, { image: file })
        toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded')
      } catch (err) {
        toast.error(err.message || (isRTL ? 'فشل رفع الصورة' : 'Image upload failed'))
      } finally {
        setUploading(false)
      }
    }
  }

  const toggleAvailability = async (r) => {
    try {
      await updateProduct(r.id, { isAvailable: !r.isAvailable })
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحديث الحالة' : 'Failed to update status'))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id)
      toast.success(isRTL ? 'تم حذف الصنف' : 'Product deleted')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر حذف الصنف' : 'Failed to delete product'))
    }
  }

  const columns = [
    { key: 'image', label: isRTL ? 'الصورة' : 'Image', render: (r) => (
      <div className="h-10 w-10 rounded-lg bg-bg-hover flex items-center justify-center text-lg overflow-hidden text-txt-muted">
        {r.image ? <img src={resolveImageUrl(r.image)} alt="" className="h-full w-full object-cover" /> : <FiPackage />}
      </div>
    ) },
    { key: 'name', label: isRTL ? 'اسم الصنف' : 'Name', render: (r) => <span className="font-medium text-txt">{r.name}</span> },
    { key: 'category', label: isRTL ? 'القسم' : 'Category', render: (r) => categoryName(r) },
    { key: 'price', label: isRTL ? 'السعر' : 'Price', render: (r) => formatCurrency(r.price) },
    { key: 'available', label: isRTL ? 'التوفر' : 'Availability', render: (r) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.isAvailable ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
        {r.isAvailable ? (isRTL ? 'متوفر' : 'Available') : (isRTL ? 'غير متوفر' : 'Unavailable')}
      </span>
    ) },
    { key: 'actions', label: t.common.actions, render: (r) => (
      <div className="flex items-center gap-1.5">
        <button onClick={() => openEdit(r)} className="h-7 w-7 rounded-md bg-bg-hover text-primary-400 flex items-center justify-center"><FiEdit2 size={13} /></button>
        <button onClick={() => toggleAvailability(r)} className="h-7 w-7 rounded-md bg-bg-hover text-warning flex items-center justify-center"><FiEyeOff size={13} /></button>
        <button onClick={() => setDeleteTarget(r)} className="h-7 w-7 rounded-md bg-bg-hover text-danger flex items-center justify-center"><FiTrash2 size={13} /></button>
      </div>
    ) },
  ]

  return (
    <MainLayout title={isRTL ? 'الأصناف' : 'Menu Items'} subtitle={isRTL ? 'إضافة وتعديل وحذف الأصناف' : 'Add, edit and remove products'}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الأصناف' : 'Total Products'}</p><p className="text-xl font-bold text-txt mt-1">{stats.total}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'متوفرة' : 'Available'}</p><p className="text-xl font-bold text-success mt-1">{stats.available}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'غير متوفرة' : 'Unavailable'}</p><p className="text-xl font-bold text-danger mt-1">{stats.unavailable}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'عدد الأقسام' : 'Categories'}</p><p className="text-xl font-bold text-txt mt-1">{stats.categories}</p></Card>
        </div>

        <Card className="!p-4">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <SearchInput value={query} onChange={setQuery} placeholder={isRTL ? 'ابحث عن صنف...' : 'Search product...'} className="flex-1" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="lg:w-48">
              <option value="all">{isRTL ? 'كل الأقسام' : 'All categories'}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select value={availFilter} onChange={(e) => setAvailFilter(e.target.value)} className="lg:w-48">
              <option value="all">{isRTL ? 'كل الحالات' : 'All'}</option>
              <option value="available">{isRTL ? 'متوفر' : 'Available'}</option>
              <option value="unavailable">{isRTL ? 'غير متوفر' : 'Unavailable'}</option>
            </Select>
            <div className="flex items-center gap-1 bg-bg-sidebar border border-border rounded-lg p-1">
              <button onClick={() => setView('table')} className={`h-9 w-9 rounded-md flex items-center justify-center transition-colors ${view === 'table' ? 'bg-primary-600 text-white' : 'text-txt-secondary'}`}><FiList size={15} /></button>
              <button onClick={() => setView('grid')} className={`h-9 w-9 rounded-md flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-txt-secondary'}`}><FiGrid size={15} /></button>
            </div>
            <Button icon={FiPlus} onClick={openCreate}>{isRTL ? 'إضافة صنف' : 'Add Product'}</Button>
          </div>

          {view === 'table' ? (
            <>
              <DataTable columns={columns} data={paged} loading={loading.products} emptyTitle={isRTL ? 'لا توجد أصناف' : 'No products'} />
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading.products ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)
              ) : paged.map((p) => (
                <motion.div key={p.id} whileHover={{ y: -4 }} className="card p-4 flex flex-col gap-2">
                  <div className="h-20 rounded-lg bg-bg-hover flex items-center justify-center text-3xl overflow-hidden text-txt-muted">
                    {p.image ? <img src={resolveImageUrl(p.image)} alt="" className="h-full w-full object-cover" /> : <FiPackage />}
                  </div>
                  <p className="text-sm font-semibold text-txt truncate">{p.name}</p>
                  <p className="text-xs text-txt-muted truncate">{categoryName(p)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-secondary-light font-bold text-sm">{formatCurrency(p.price)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.isAvailable ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                      {p.isAvailable ? (isRTL ? 'متوفر' : 'Available') : (isRTL ? 'غير متوفر' : 'Unavailable')}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => openEdit(p)} className="flex-1 h-8 rounded-md bg-bg-hover text-primary-400 flex items-center justify-center"><FiEdit2 size={13} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="flex-1 h-8 rounded-md bg-bg-hover text-danger flex items-center justify-center"><FiTrash2 size={13} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? (isRTL ? 'تعديل الصنف' : 'Edit Product') : (isRTL ? 'إضافة صنف جديد' : 'Add Product')}
        size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={saving}>{t.common.save}</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-lg">
            <div className="h-16 w-16 rounded-lg bg-bg-hover flex items-center justify-center text-2xl shrink-0 overflow-hidden text-txt-muted">
              {editing?.image ? <img src={resolveImageUrl(editing.image)} alt="" className="h-full w-full object-cover" /> : <FiPackage />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-txt-secondary mb-1">{isRTL ? 'صورة المنتج' : 'Product Image'}</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" id="product-image-input" />
              <label
                htmlFor="product-image-input"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs text-txt-secondary cursor-pointer hover:border-primary-500 hover:text-primary-300 transition-colors"
              >
                <FiUploadCloud size={13} />
                {uploading ? t.common.loading : (isRTL ? 'رفع صورة' : 'Upload Image')}
              </label>
            </div>
          </div>

          <Input label={isRTL ? 'اسم الصنف' : 'Product Name'} {...register('name', { required: true })} />
          <Textarea label={isRTL ? 'الوصف' : 'Description'} {...register('description')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label={isRTL ? 'القسم' : 'Category'} {...register('category', { required: true })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label={isRTL ? 'السعر' : 'Price'} type="number" step="0.01" {...register('price', { required: true })} />
          </div>
          <Toggle checked={!!isAvailable} onChange={(v) => setValue('isAvailable', v)} label={isRTL ? 'متوفر' : 'Available'} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={isRTL ? 'حذف الصنف' : 'Delete Product'}
        message={isRTL ? `هل أنت متأكد من حذف "${deleteTarget?.name}"؟` : `Delete "${deleteTarget?.name}"?`}
      />
    </MainLayout>
  )
}
