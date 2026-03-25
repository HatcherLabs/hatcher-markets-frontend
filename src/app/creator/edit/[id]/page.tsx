'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getCreatorListings, updateListing } from '@/lib/api';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'trading', label: 'Trading' },
  { value: 'research', label: 'Research' },
  { value: 'support', label: 'Support' },
  { value: 'creative', label: 'Creative' },
  { value: 'dev', label: 'Dev' },
];

const categoryColors: Record<string, string> = {
  general: 'bg-purple-500/20 text-purple-400',
  trading: 'bg-green-500/20 text-green-400',
  research: 'bg-blue-500/20 text-blue-400',
  support: 'bg-yellow-500/20 text-yellow-400',
  creative: 'bg-pink-500/20 text-pink-400',
  dev: 'bg-cyan-500/20 text-cyan-400',
};

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    agentId: '',
    name: '',
    shortDescription: '',
    longDescription: '',
    category: 'general',
    tags: '',
    hourlyRate: '',
    minHours: '1',
    maxHours: '720',
    avatarUrl: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadListing();
  }, [isAuthenticated, authLoading, params.id]);

  async function loadListing() {
    try {
      setLoading(true);
      const data: any = await getCreatorListings();
      const listings = Array.isArray(data) ? data : data?.listings || [];
      const listing = listings.find((l: any) => l.id === params.id);
      if (listing) {
        setForm({
          agentId: listing.agentId || '',
          name: listing.name || '',
          shortDescription: listing.shortDescription || '',
          longDescription: listing.longDescription || '',
          category: listing.category || 'general',
          tags: Array.isArray(listing.tags) ? listing.tags.join(', ') : listing.tags || '',
          hourlyRate: String(listing.hourlyRate || ''),
          minHours: String(listing.minHours || 1),
          maxHours: String(listing.maxHours || 720),
          avatarUrl: listing.avatarUrl || '',
        });
      }
    } catch {
      // not found
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Name is required');
    if (!form.shortDescription.trim()) return setError('Short description is required');
    if (!form.hourlyRate || Number(form.hourlyRate) <= 0) return setError('Hourly rate must be > 0');

    setSubmitting(true);
    try {
      await updateListing(params.id as string, {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        longDescription: form.longDescription.trim(),
        category: form.category,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        hourlyRate: Number(form.hourlyRate),
        minHours: Number(form.minHours) || 1,
        maxHours: Number(form.maxHours) || 720,
        avatarUrl: form.avatarUrl.trim() || undefined,
      });
      router.push('/creator');
    } catch (err: any) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-white">Connect your wallet</h1>
        <p className="text-white/60">Connect your Solana wallet to edit a listing.</p>
      </div>
    );
  }

  const colorClass = categoryColors[form.category] || categoryColors.general;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          href="/creator"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Creator Dashboard
        </Link>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-8"
      >
        Edit Listing
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="lg:col-span-2 space-y-6"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="glass rounded-2xl p-6 space-y-5">
            {/* Agent ID (read-only) */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Agent ID on hatcher.host</label>
              <input
                type="text"
                value={form.agentId}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
              />
              <p className="text-xs text-white/30 mt-1">Agent ID cannot be changed after creation</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Short Description ({form.shortDescription.length}/200)
              </label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value.slice(0, 200))}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Long Description ({form.longDescription.length}/2000)
              </label>
              <textarea
                value={form.longDescription}
                onChange={(e) => updateField('longDescription', e.target.value.slice(0, 2000))}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#1a0b2e]">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Hourly Rate (SOL)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={form.hourlyRate}
                  onChange={(e) => updateField('hourlyRate', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Min Hours</label>
                <input
                  type="number"
                  min="1"
                  value={form.minHours}
                  onChange={(e) => updateField('minHours', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Max Hours</label>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={form.maxHours}
                  onChange={(e) => updateField('maxHours', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Avatar URL (optional)</label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => updateField('avatarUrl', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Changes
          </button>
        </motion.form>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:sticky lg:top-24"
        >
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-medium text-white/60">Preview</h3>
          </div>
          <div className="glass glass-hover rounded-2xl p-5 flex flex-col gap-4 glow-purple">
            <div className="flex items-center gap-3">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={form.name}
                  className="w-12 h-12 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  {form.name
                    ? form.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '??'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {form.name || 'Agent Name'}
                </h3>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${colorClass}`}>
                  {categories.find((c) => c.value === form.category)?.label || 'General'}
                </span>
              </div>
            </div>

            {form.shortDescription && (
              <p className="text-sm text-white/60 line-clamp-2">{form.shortDescription}</p>
            )}

            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{form.hourlyRate || '0.00'}</span>
              <span className="text-sm text-white/40">SOL/hr</span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs text-white/40">-</span>
              </div>
              <span className="text-xs text-white/40">
                {form.minHours || 1}h - {form.maxHours || 720}h
              </span>
            </div>

            {form.tags && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
