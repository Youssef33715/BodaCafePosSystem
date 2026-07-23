import api from './client'

// CONFIRMED — read directly from dashboardRoute.js / services/dashboardService.js:
// GET /dashboard   getDashboardStats   (admin only) ->
// { status:'success', data: {
//     totalSales, totalOrders, activeOrders, completedOrders,
//     occupiedTables, availableTables, totalProducts, totalCategories
//   } }
// This is the COMPLETE set of fields — there is no sales trend, category
// breakdown, recent-orders list, or best-sellers list in this endpoint.

export const getDashboardStats = () => api.get('/dashboard').then((res) => res.data)
