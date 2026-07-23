import api from './client'

// CONFIRMED — read directly from categoryRoute.js / categoryModel.js / categoryService.js:
// GET    /categories        getCategories (factory.getAll)  -> { results, paginationResult, data: [...] }  (public)
// POST   /categories        createCategory                   -> { data: category }  (admin, multipart: name, image)
// GET    /categories/:id    getCategory (factory.getOne)      -> { data: category }  (public)
// PUT    /categories/:id    updateCategory                    -> { data: category }  (admin, multipart: name, image)
// DELETE /categories/:id    deleteCategory (factory.deleteOne) -> 204 No Content      (admin)
//
// Category schema is ONLY { name, image, isActive } — no description, color,
// icon, or display-order fields exist on the backend.

function toFormData(payload) {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    form.append(key, value)
  })
  return form
}

export const listCategories = () => api.get('/categories').then((res) => res.data)
export const getCategory = (id) => api.get(`/categories/${id}`).then((res) => res.data)

export function createCategory(payload) {
  return api
    .post('/categories', toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data)
}

export function updateCategory(id, payload) {
  if (payload.image instanceof File) {
    return api
      .put(`/categories/${id}`, toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data)
  }
  const { image, ...rest } = payload
  return api.put(`/categories/${id}`, rest).then((res) => res.data)
}

export const deleteCategory = (id) => api.delete(`/categories/${id}`)
