import api from './client'

// CONFIRMED — read directly from productRoute.js / productModel.js / productService.js:
// GET    /products        getProducts (factory.getAll)  -> { results, paginationResult, data: [...] } (any authenticated user)
// POST   /products        createProduct                  -> { data: product }  (admin, multipart: name, description, price, category, image)
// GET    /products/:id    getProduct                      -> { data: product }  (any authenticated user)
// PUT    /products/:id    updateProduct                   -> { data: product }  (admin, multipart)
// DELETE /products/:id    deleteProduct (factory.deleteOne) -> 204 No Content    (admin)
//
// Product schema is ONLY { name, description, price, image, category, isAvailable }
// — no separate English name, discount price, prep time, calories, or featured flag.

function toFormData(payload) {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    form.append(key, value)
  })
  return form
}

export const listProducts = () => api.get('/products').then((res) => res.data)
export const getProduct = (id) => api.get(`/products/${id}`).then((res) => res.data)

export function createProduct(payload) {
  return api
    .post('/products', toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data)
}

export function updateProduct(id, payload) {
  if (payload.image instanceof File) {
    return api
      .put(`/products/${id}`, toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data)
  }
  const { image, ...rest } = payload
  return api.put(`/products/${id}`, rest).then((res) => res.data)
}

export const deleteProduct = (id) => api.delete(`/products/${id}`)
