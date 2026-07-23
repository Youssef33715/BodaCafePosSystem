import api from './client'

// CONFIRMED — read directly from reportRoute.js / services/reportService.js
// (admin only, all routes):
// GET /reports/daily         -> { status:'success', data: { date, totalOrders, totalSales, averageOrder } }
// GET /reports/monthly       -> { status:'success', data: { month, totalOrders, totalSales, averageOrder } }
// GET /reports/best-products -> { status:'success', results, data: [{ productId, name, price, totalSold, revenue }] }
//
// IMPORTANT: getDailyReport and getMonthlyReport both hardcode "today" /
// "this calendar month" server-side (new Date() with no query-param handling
// at all) — there is no way to request yesterday's, a past month's, or any
// custom date range. Query params are intentionally NOT sent since the
// backend ignores them; sending them would be misleading about what's actually happening.

export const getDailyReport = () => api.get('/reports/daily').then((res) => res.data)
export const getMonthlyReport = () => api.get('/reports/monthly').then((res) => res.data)
export const getBestProducts = () => api.get('/reports/best-products').then((res) => res.data)
