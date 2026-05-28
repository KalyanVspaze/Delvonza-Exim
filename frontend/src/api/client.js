const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'delvonza_access_token';
const REFRESH_TOKEN_KEY = 'delvonza_refresh_token';

export const tokenStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

const request = async (path, options = {}, retry = true) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const accessToken = tokenStore.getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && retry && tokenStore.getRefreshToken()) {
    const refreshed = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokenStore.getRefreshToken() })
    });
    if (refreshed.ok) {
      const data = await refreshed.json();
      tokenStore.setTokens({ accessToken: data.accessToken });
      return request(path, options, false);
    }
    tokenStore.clear();
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload;
};

export const apiClient = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: (body) => request('/auth/logout', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
  getProducts: () => request('/products'),
  getProductBySlug: (slug) => request(`/products/${slug}`),
  getCart: () => request('/cart'),
  addToCart: (body) => request('/cart', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (body) => request('/cart', { method: 'PUT', body: JSON.stringify(body) }),
  removeCartItem: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
  placeOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body || {}) }),
  /** Create pending order + Stripe Checkout session (order removed if gateway fails). */
  createCheckoutSession: (body) =>
    request('/orders/checkout', { method: 'POST', body: JSON.stringify(body || {}) }),
  getOrders: () => request('/orders'),
  createStripeSession: (orderId) =>
    request('/payments/stripe/create', { method: 'POST', body: JSON.stringify({ orderId }) }),
  verifyStripeSession: (body) =>
    request('/payments/stripe/verify', { method: 'POST', body: JSON.stringify(body) }),
  submitInquiry: (body) => request('/inquiries', { method: 'POST', body: JSON.stringify(body) }),
  /** Public site settings (footer social visibility). No auth. */
  getSiteSettings: () => request('/settings/public')
};
