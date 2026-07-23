// Status values here are restricted to what the real backend enums actually
// allow (orderModel.js, tableModel.js) — no invented statuses like
// open/ready/reserved/disabled, which don't exist on the backend.
const MAP = {
  // Order.status: 'active' | 'completed' | 'cancelled'
  active: { label: 'نشط', labelEn: 'Active', cls: 'bg-success-bg text-success' },
  completed: { label: 'مكتمل', labelEn: 'Completed', cls: 'bg-success-bg text-success' },
  cancelled: { label: 'ملغي', labelEn: 'Cancelled', cls: 'bg-danger-bg text-danger' },
  // Table.status: 'available' | 'occupied'
  available: { label: 'متاحة', labelEn: 'Available', cls: 'bg-success-bg text-success' },
  occupied: { label: 'مشغولة', labelEn: 'Occupied', cls: 'bg-danger-bg text-danger' },
  // Order.deliveryStatus: 'preparing' | 'out_for_delivery' | 'delivered'
  preparing: { label: 'قيد التحضير', labelEn: 'Preparing', cls: 'bg-warning-bg text-warning' },
  out_for_delivery: { label: 'في الطريق', labelEn: 'Out for Delivery', cls: 'bg-info-bg text-info' },
  delivered: { label: 'تم التوصيل', labelEn: 'Delivered', cls: 'bg-success-bg text-success' },
  // Category.isActive / Product.isAvailable / Employee.status (local only)
  inactive: { label: 'غير نشط', labelEn: 'Inactive', cls: 'bg-danger-bg text-danger' },
}

export default function StatusBadge({ status, isRTL = true, className = '' }) {
  const conf = MAP[status] || MAP.available
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${conf.cls} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isRTL ? conf.label : conf.labelEn}
    </span>
  )
}
