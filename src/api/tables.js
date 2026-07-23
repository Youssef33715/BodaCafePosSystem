import api from './client'

// CONFIRMED — read directly from tableRoute.js / tableModel.js:
// GET    /tables        getTables (factory.getAll)   -> { results, paginationResult, data: [...] }
// POST   /tables        createTable (factory.createOne) -> { data: table }   body: { tableNumber }
// GET    /tables/:id    getTable (factory.getOne)       -> { data: table }
// PUT    /tables/:id    updateTable (factory.updateOne)  -> { data: table }   body: { tableNumber?, status? }
// DELETE /tables/:id    deleteTable (factory.deleteOne)  -> 204 No Content
//
// Table schema is ONLY { tableNumber, status: 'available'|'occupied' } — no
// table name, area/zone, or reserved/disabled statuses exist on the backend.

export const listTables = () => api.get('/tables').then((res) => res.data)
export const getTable = (id) => api.get(`/tables/${id}`).then((res) => res.data)
export const createTable = (payload) => api.post('/tables', { tableNumber: payload.tableNumber }).then((res) => res.data)
export const updateTable = (id, payload) => {
  const body = {}
  if (payload.tableNumber !== undefined) body.tableNumber = payload.tableNumber
  if (payload.status !== undefined) body.status = payload.status
  return api.put(`/tables/${id}`, body).then((res) => res.data)
}
export const deleteTable = (id) => api.delete(`/tables/${id}`)
