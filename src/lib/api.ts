const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const TOKEN_KEY = 'hatcher_markets_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  return request<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, username: string, password: string) {
  return request<{ token: string; user: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
}

export async function getProfile() {
  return request<any>('/auth/me');
}

export async function updateProfile(data: { displayName?: string; avatarUrl?: string; bio?: string }) {
  return request<any>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function logout() {
  clearToken();
}

// ── Listings (public) ───────────────────────────────────────────
export async function getListings(params?: {
  category?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return request<{ listings: any[]; total: number }>(`/listings${qs ? `?${qs}` : ''}`);
}

export async function getListing(slug: string) {
  return request<any>(`/listings/${slug}`);
}

// ── Rentals ─────────────────────────────────────────────────────
export async function getMyRentals() {
  return request<any[]>('/rentals');
}

export async function createRental(data: { listingId: string; hours: number; txSignature: string }) {
  return request<any>('/rentals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function extendRental(id: string, data: { hours: number; txSignature: string }) {
  return request<any>(`/rentals/${id}/extend`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelRental(id: string) {
  return request<any>(`/rentals/${id}/cancel`, {
    method: 'POST',
  });
}

export async function getRental(id: string) {
  return request<any>(`/rentals/${id}`);
}

// ── Reviews ─────────────────────────────────────────────────────
export async function getReviews(listingId: string) {
  return request<any[]>(`/listings/${listingId}/reviews`);
}

export async function createReview(data: { listingId: string; rating: number; comment: string }) {
  return request<any>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: string) {
  return request<void>(`/reviews/${id}`, { method: 'DELETE' });
}

// ── Creator ─────────────────────────────────────────────────────
export async function registerAsCreator() {
  return request<any>('/creator/register', { method: 'POST' });
}

export async function getCreatorListings() {
  return request<any[]>('/creator/listings');
}

export async function createListing(data: any) {
  return request<any>('/creator/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateListing(id: string, data: any) {
  return request<any>(`/creator/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: string) {
  return request<void>(`/creator/listings/${id}`, { method: 'DELETE' });
}

export async function getCreatorEarnings() {
  return request<any>('/creator/earnings');
}

export async function requestPayout() {
  return request<any>('/creator/payout', { method: 'POST' });
}

// ── Public ──────────────────────────────────────────────────────
export async function getFeatured() {
  return request<any[]>('/public/featured');
}

export async function getCategories() {
  return request<any[]>('/public/categories');
}

export async function getStats() {
  return request<{ totalAgents: number; totalRentals: number; activeCreators: number }>('/public/stats');
}
