import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiEyeOff, FiEye, FiFolder, FiUploadCloud } from 'react-icons/fi'
import { motion } from 'framer-motion'
import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toggle from '../components/ui/Toggle'
import { SearchInput } from '../components/ui/SearchInput'
import { Input } from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeletons'
import { resolveImageUrl } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'

// Category schema (categoryModel.js) is ONLY { name, image, isActive } — no
// description, color theme, icon picker, or display-order fields exist on
// the backend, so those form controls have been removed entirely.

export default function Categories() {
  const { isRTL, t } = useLang()
  const { categories, products, addCategory, updateCategory, deleteCategory, loading } = useAppData()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const isActive = watch('isActive')

  const list = useMemo(() => {
    if (!query.trim()) return categories
    const q = query.trim().toLowerCase()
    return categories.filter((c) => c.name?.toLowerCase().includes(q))
  }, [categories, query])

  const productCount = (id) => products.filter((p) => (p.category?._id || p.category?.id || p.category) === id).length

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
  }

  const openCreate = () => {
    setEditing(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    reset({ name: '', isActive: true })
    setModalOpen(true)
  }
  const openEdit = (c) => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    setEditing(c)
    reset({ name: c.name, isActive: c.isActive })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const pendingFile = fileInputRef.current?.files?.[0]
      const payload = pendingFile ? { ...data, image: pendingFile } : data
      if (editing) {
        await updateCategory(editing.id, payload)
        toast.success(isRTL ? 'تم تحديث القسم' : 'Category updated')
      } else {
        await addCategory(payload)
        toast.success(isRTL ? 'تمت إضافة القسم' : 'Category added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || (isRTL ? 'حدث خطأ أثناء الحفظ' : 'Something went wrong'))
    } finally {
      setSaving(false)
    }
  }

  // Image is bundled into the create/update call. When editing an existing
  // category, we can push the image immediately since PUT also accepts multipart.
  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (editing?.id) {
      setUploading(true)
      try {
        await updateCategory(editing.id, { image: file })
        toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded')
      } catch (err) {
        toast.error(err.message || (isRTL ? 'فشل رفع الصورة' : 'Image upload failed'))
      } finally {
        setUploading(false)
      }
    }
    // For a brand-new category, the file stays in the input and is bundled
    // into the create request when the form is submitted (see onSubmit above).
  }

  const toggleActive = async (c) => {
    try {
      await updateCategory(c.id, { isActive: !c.isActive })
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر تحديث الحالة' : 'Failed to update status'))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteTarget.id)
      toast.success(isRTL ? 'تم حذف القسم' : 'Category deleted')
    } catch (err) {
      toast.error(err.message || (isRTL ? 'تعذر حذف القسم' : 'Failed to delete category'))
    }
  }

  return (
    <MainLayout title={isRTL ? 'الأقسام' : 'Categories'} subtitle={isRTL ? 'إدارة أقسام القائمة' : 'Manage menu categories'}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder={isRTL ? 'البحث عن قسم...' : 'Search category...'} className="sm:max-w-xs" />
          <Button icon={FiPlus} onClick={openCreate}>{isRTL ? 'إضافة قسم جديد' : 'Add Category'}</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'إجمالي الأقسام' : 'Total Categories'}</p><p className="text-xl font-bold text-txt mt-1">{stats.total}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'نشطة' : 'Active'}</p><p className="text-xl font-bold text-success mt-1">{stats.active}</p></Card>
          <Card><p className="text-xs text-txt-secondary">{isRTL ? 'غير نشطة' : 'Inactive'}</p><p className="text-xl font-bold text-danger mt-1">{stats.inactive}</p></Card>
        </div>

        {loading.categories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={FiFolder} title={isRTL ? 'لا توجد أقسام' : 'No categories'} message={isRTL ? 'أضف أول قسم لمنتجاتك' : 'Add your first product category'} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((c, i) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card hover className="flex flex-col gap-3 relative">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden bg-primary-600/15 text-primary-400">
                      {c.image ? <img src={resolveImageUrl(c.image)} alt="" className="h-full w-full object-cover" /> : <FiFolder />}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${c.isActive ? 'bg-success-bg text-success' : 'bg-bg-hover text-txt-muted'}`}>
                      {c.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-txt">{c.name}</p>
                    <p className="text-xs text-txt-muted mt-0.5">{productCount(c.id)} {isRTL ? 'صنف' : 'products'}</p>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t border-border">
                    <button onClick={() => openEdit(c)} className="flex-1 h-8 rounded-md bg-bg-hover text-primary-400 flex items-center justify-center text-xs gap-1"><FiEdit2 size={12} />{t.common.edit}</button>
                    <button onClick={() => toggleActive(c)} className="flex-1 h-8 rounded-md bg-bg-hover text-warning flex items-center justify-center text-xs gap-1">
                      {c.isActive ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="flex-1 h-8 rounded-md bg-bg-hover text-danger flex items-center justify-center text-xs gap-1"><FiTrash2 size={12} /></button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? (isRTL ? 'تعديل القسم' : 'Edit Category') : (isRTL ? 'إضافة قسم جديد' : 'Create Category')}
        size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={saving}>{t.common.save}</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={isRTL ? 'اسم القسم' : 'Category Name'} {...register('name', { required: true })} />

          <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-lg">
            <div className="h-14 w-14 rounded-lg bg-bg-hover flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {editing?.image ? <img src={resolveImageUrl(editing.image)} alt="" className="h-full w-full object-cover" /> : <FiFolder className="text-txt-muted" />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-txt-secondary mb-1.5">{isRTL ? 'صورة القسم' : 'Category Image'}</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" id="category-image-input" />
              <label
                htmlFor="category-image-input"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs text-txt-secondary cursor-pointer hover:border-primary-500 hover:text-primary-300 transition-colors"
              >
                <FiUploadCloud size={13} />
                {uploading ? t.common.loading : (isRTL ? 'رفع صورة' : 'Upload Image')}
              </label>
            </div>
          </div>

          <Toggle checked={!!isActive} onChange={(v) => setValue('isActive', v)} label={isRTL ? 'نشط' : 'Active'} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={isRTL ? 'حذف القسم' : 'Delete Category'}
        message={isRTL ? `هل أنت متأكد من حذف "${deleteTarget?.name}"؟` : `Delete "${deleteTarget?.name}"?`}
      />
    </MainLayout>
  )
}
