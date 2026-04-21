// Canonical agent-listing categories — keep in sync with
// apps/markets-api/src/lib/categories.ts.

export const CATEGORIES = [
  { id: 'finance',      label: 'Finance & Trading',     emoji: '💰' },
  { id: 'prediction',   label: 'Prediction Markets',    emoji: '🎲' },
  { id: 'research',     label: 'Data & Research',       emoji: '📊' },
  { id: 'creative',     label: 'Creative & Content',    emoji: '🎨' },
  { id: 'development',  label: 'Development & DevOps',  emoji: '💻' },
  { id: 'marketing',    label: 'Marketing & SEO',       emoji: '📣' },
  { id: 'assistant',    label: 'Personal Assistant',    emoji: '🧠' },
  { id: 'education',    label: 'Education',             emoji: '📚' },
  { id: 'business',     label: 'Business & Ops',        emoji: '💼' },
  { id: 'ecommerce',    label: 'E-commerce',            emoji: '🛒' },
  { id: 'support',      label: 'Customer Support',      emoji: '🌟' },
  { id: 'security',     label: 'Security & Compliance', emoji: '🔐' },
  { id: 'other',        label: 'Other',                 emoji: '🎯' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as readonly CategoryId[];

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getCategoryEmoji(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? '🎯';
}
