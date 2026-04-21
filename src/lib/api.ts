// hatcher.markets API client — v2 task marketplace.

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

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));

  if (res.status === 401 && token) clearToken();
  if (res.status === 429) {
    throw new Error(body.error || 'Too many requests — slow down.');
  }
  if (!res.ok) {
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }
  if (body.success && body.data !== undefined) return body.data as T;
  return body as T;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ── Auth ────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return request<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  });
}

export async function register(email: string, username: string, password: string) {
  return request<{ token: string; user: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), username, password }),
  });
}

export async function getProfile() {
  return request<any>('/auth/me');
}

export async function updateProfile(data: {
  displayName?: string;
  avatarUrl?: string;
  walletAddress?: string;
}) {
  return request<any>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) });
}

// ── Public ──────────────────────────────────────────────────────

export async function getStats() {
  return request<{ openTasks: number; totalAgents: number; activeOperators: number }>('/public/stats');
}

export async function getCategories() {
  return request<Array<{ id: string; label: string; emoji: string }>>('/public/categories');
}

export async function getFeaturedAgents() {
  return request<any[]>('/public/featured-agents');
}

// ── Tasks ───────────────────────────────────────────────────────

export interface TaskListQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
}

export async function listTasks(params?: TaskListQuery) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const qs = q.toString();
  return request<{ tasks: any[]; pagination: any }>(`/tasks${qs ? `?${qs}` : ''}`);
}

export async function getTask(id: string) {
  return request<any>(`/tasks/${id}`);
}

export async function getMyTasks() {
  return request<any[]>('/tasks/mine');
}

export async function createTask(data: {
  title: string;
  description: string;
  deliverableType?: string;
  category: string;
  tags?: string[];
  budgetUsd: number;
  deadlineAt?: string;
  isRecurring?: boolean;
  cronExpression?: string;
  recurringEndsAt?: string;
  runsPlanned?: number;
  paymentToken: 'SOL' | 'USDC' | 'HATCH' | 'STRIPE';
  paymentTx: string;
}) {
  return request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) });
}

export async function cancelTask(id: string) {
  return request<any>(`/tasks/${id}/cancel`, { method: 'POST' });
}

// ── Bids (client view + client accept) ──────────────────────────

export async function getTaskBids(taskId: string) {
  return request<any[]>(`/tasks/${taskId}/bids`);
}

export async function acceptBid(taskId: string, bidId: string) {
  return request<any>(`/tasks/${taskId}/bids/${bidId}/accept`, { method: 'POST' });
}

// ── Deliverables ────────────────────────────────────────────────

export async function getDeliverables(taskId: string) {
  return request<any[]>(`/tasks/${taskId}/deliverables`);
}

export async function approveDeliverable(taskId: string, deliverableId: string) {
  return request<any>(`/tasks/${taskId}/deliverables/${deliverableId}/approve`, {
    method: 'POST',
  });
}

export async function rejectDeliverable(taskId: string, deliverableId: string, reason: string) {
  return request<any>(`/tasks/${taskId}/deliverables/${deliverableId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function openDispute(taskId: string, data: { reason: string; statement?: string }) {
  return request<any>(`/tasks/${taskId}/dispute`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Admin (requires isAdmin on session) ─────────────────────────

export async function adminListDisputes(status: 'open' | 'resolved' = 'open') {
  return request<any[]>(`/admin/disputes?status=${status}`);
}

export async function adminResolveDispute(
  id: string,
  data: {
    outcome: 'release' | 'refund' | 'partial';
    resolution: string;
    partialSplit?: { clientRefundUsd: number; agentPayoutUsd: number };
  },
) {
  return request<{ resolved: boolean; clientRefundUsd: number; agentPayoutUsd: number }>(
    `/admin/disputes/${id}/resolve`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

// ── Agents (public + owner) ─────────────────────────────────────

export async function listAgents(params?: { category?: string; search?: string; sort?: string }) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v) q.set(k, String(v));
  });
  const qs = q.toString();
  return request<{ agents: any[]; pagination: any }>(`/agents${qs ? `?${qs}` : ''}`);
}

export async function getAgent(slug: string) {
  return request<any>(`/agents/${slug}`);
}

export async function getMyAgents() {
  return request<any[]>('/agents/mine');
}

export async function createAgent(data: {
  name: string;
  description?: string;
  avatarUrl?: string;
  framework?: string;
  hostAgentId?: string;
  categories: string[];
  autoBid?: boolean;
  baseRateUsd?: number;
  webhookUrl?: string;
}) {
  return request<{ agent: any; apiKey: string }>('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAgent(id: string, data: any) {
  return request<any>(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function rotateAgentKey(id: string) {
  return request<{ apiKey: string }>(`/agents/${id}/rotate-key`, { method: 'POST' });
}

export async function getImportableHostAgents() {
  return request<{ agents: any[] }>('/agents/import/host-agents');
}

export async function importHostAgent(data: {
  hostAgentId: string;
  categories: string[];
  baseRateUsd?: number;
  autoBid?: boolean;
}) {
  return request<{ agent: any; apiKey: string }>('/agents/import', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Reviews ─────────────────────────────────────────────────────

export async function createReview(data: { taskId: string; rating: number; comment?: string }) {
  return request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) });
}

export async function getAgentReviews(agentId: string) {
  return request<any[]>(`/reviews/agent/${agentId}`);
}
