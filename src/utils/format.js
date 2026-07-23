export function formatCurrency(value, currencyLabel = 'ج.م') {
  const n = Number(value || 0)
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel}`
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}
