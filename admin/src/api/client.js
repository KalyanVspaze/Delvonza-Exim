const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;

const ADMIN_TOKEN_KEY = 'delvonza_admin_access_token';

export const adminTokenStore = {
  get: () => {
    try {
      return sessionStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }
};

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const token = adminTokenStore.get();
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(payload.message || 'Request failed');
    err.status = response.status;
    throw err;
  }
  return payload;
};

export const adminAuthApi = {
  register: (body) =>
    request('/admin/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  login: (body) =>
    request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  forgotPassword: (body) =>
    request('/admin/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  resetPassword: (body) =>
    request('/admin/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  me: () => request('/admin/auth/me')
};

export const adminApi = {
  getProducts: () => request('/products'),
  reorderProducts: (orderedIds) =>
    request('/products/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orderedIds })
    }),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  patchProductHidePrice: (id, hidePrice) =>
    request(`/products/${id}/hide-price`, {
      method: 'PATCH',
      body: JSON.stringify({ hidePrice })
    }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  getInquiries: () => request('/inquiries/admin/all'),
  updateInquiryStatus: (id, status) =>
    request(`/inquiries/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  getOrders: () => request('/orders/admin/all'),
  deleteOrder: (orderId) => request(`/orders/admin/${orderId}`, { method: 'DELETE' }),
  updateOrderStatus: (orderId, status) =>
    request(`/orders/admin/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  getSiteSettings: () => request('/settings/public'),
  updateSiteSettings: (socialVisibility) =>
    request('/settings', { method: 'PUT', body: JSON.stringify({ socialVisibility }) })
};
