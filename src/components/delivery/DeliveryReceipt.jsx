import { GiCoffeeCup } from 'react-icons/gi'
import { formatCurrency } from '../../utils/format'

/**
 * Print-optimized delivery receipt, sized for 58mm or 80mm thermal printers.
 * Matches the real backend receipt shape exactly (services/orderService.js
 * getOrderReceipt): { orderNumber, customerName, customerPhone,
 * deliveryAddress, deliveryFee, cashier:{name}, items:[{product:{name,price},
 * quantity, unitPrice, totalPrice}], totalPrice, paymentMethod, createdAt }.
 * There is NO tax/discount field anywhere in this backend. `totalPrice` is
 * the items subtotal only (the backend never adds deliveryFee into it), so
 * both are shown as separate lines, exactly as the data represents them.
 */
export default function DeliveryReceipt({ order, paperSize = '80', isRTL = true }) {
  const {
    orderNumber = isRTL ? 'معاينة' : 'PREVIEW',
    customerName, customerPhone, deliveryAddress,
    items = [], deliveryFee = 0, totalPrice = 0,
    cashier, createdAt,
  } = order || {}

  const cashierName = typeof cashier === 'string' ? cashier : cashier?.name
  const displayDate = createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString()
  const itemsSubtotal = items.reduce((s, it) => s + (it.totalPrice ?? it.price * (it.qty ?? it.quantity ?? 1)), 0)
  const grandTotal = totalPrice || itemsSubtotal

  return (
    <div
      id="print-area"
      className={`bg-white text-black rounded-lg p-4 font-mono mx-auto ${paperSize === '58' ? 'receipt-paper-58 max-w-[58mm] text-[10px]' : 'receipt-paper-80 max-w-[80mm] text-xs'}`}
    >
      <div className="flex flex-col items-center text-center gap-1 mb-2">
        <div className="h-10 w-10 rounded-full bg-[#4C1D95] flex items-center justify-center text-lg text-[#F97316]">
          <GiCoffeeCup />
        </div>
        <p className="font-bold text-sm leading-tight">Coffee House</p>
        <p className="text-[9px] text-gray-600">{isRTL ? 'طلب توصيل' : 'Delivery Order'}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="flex justify-between"><span>{isRTL ? 'رقم الطلب' : 'Order #'}</span><span className="font-semibold">{orderNumber}</span></div>
      <div className="flex justify-between"><span>{isRTL ? 'العميل' : 'Customer'}</span><span>{customerName || '—'}</span></div>
      <div className="flex justify-between"><span>{isRTL ? 'الهاتف' : 'Phone'}</span><span>{customerPhone || '—'}</span></div>
      <div className="flex justify-between gap-2"><span className="shrink-0">{isRTL ? 'العنوان' : 'Address'}</span><span className="text-end break-words">{deliveryAddress || '—'}</span></div>
      {cashierName && <div className="flex justify-between"><span>{isRTL ? 'الكاشير' : 'Cashier'}</span><span>{cashierName}</span></div>}
      <div className="flex justify-between"><span>{isRTL ? 'التاريخ' : 'Date'}</span><span>{displayDate}</span></div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-2">{isRTL ? 'لا توجد منتجات' : 'No items'}</p>
      ) : (
        items.map((it, i) => {
          const name = it.product?.name || it.name
          const qty = it.quantity ?? it.qty
          const lineTotal = it.totalPrice ?? it.price * qty
          const unitPrice = it.unitPrice ?? it.price
          return (
            <div key={i} className="mb-1">
              <div className="flex justify-between">
                <span className="truncate pe-2">{name}</span>
                <span className="shrink-0">{Number(lineTotal).toFixed(2)}</span>
              </div>
              <p className="text-[9px] text-gray-500">{qty} × {formatCurrency(unitPrice)}</p>
            </div>
          )
        })
      )}

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="flex justify-between"><span>{isRTL ? 'إجمالي المنتجات' : 'Items Subtotal'}</span><span>{grandTotal.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span><span>{Number(deliveryFee).toFixed(2)}</span></div>
      <div className="flex justify-between font-bold text-sm pt-1 mt-1 border-t border-gray-400"><span>{isRTL ? 'الإجمالي' : 'Total'}</span><span>{(grandTotal + Number(deliveryFee)).toFixed(2)}</span></div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <p className="text-center text-[10px] font-semibold mt-2">{isRTL ? 'شكرًا لطلبكم من Coffee House!' : 'Thank you for ordering from Coffee House!'}</p>
      <p className="text-center text-[9px] text-gray-500 mt-0.5">{isRTL ? 'نتمنى لكم وجبة شهية' : 'Enjoy your meal'}</p>
    </div>
  )
}
