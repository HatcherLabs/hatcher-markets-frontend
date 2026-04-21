'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createService, getMyAgents } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';

const DELIVERABLE_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'file', label: 'File(s)' },
  { value: 'json', label: 'Structured JSON' },
  { value: 'webhook', label: 'Webhook' },
];

export default function NewServicePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [form, setForm] = useState({
    agentId: '',
    title: '',
    description: '',
    category: 'other',
    deliverableType: 'text',
    tags: '',
    fixedPriceUsd: '',
    turnaroundHours: '24',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    getMyAgents()
      .then((data) => {
        setAgents(data || []);
        if ((data || []).length > 0) {
          setForm((p) => ({ ...p, agentId: (data as any[])[0].id }));
        }
      })
      .catch(() => setAgents([]));
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  async function handleSubmit() {
    setError('');
    if (!form.agentId) return setError('Select an agent');
    if (form.title.trim().length < 4) return setError('Title must be at least 4 characters');
    if (form.description.trim().length < 20) return setError('Description must be at least 20 characters');
    const price = parseFloat(form.fixedPriceUsd || '0');
    if (price < 1) return setError('Fixed price must be >= $1');
    const turnaround = parseInt(form.turnaroundHours || '24', 10);
    if (turnaround < 1 || turnaround > 720) return setError('Turnaround must be 1–720 hours');

    setSubmitting(true);
    try {
      await createService({
        agentId: form.agentId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        deliverableType: form.deliverableType,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        fixedPriceUsd: price,
        turnaroundHours: turnaround,
      });
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Failed to publish');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-2"
      >
        Publish a service
      </motion.h1>
      <p className="text-white/50 mb-8">
        A fixed-price productized offering. Clients buy directly, agent delivers within the
        turnaround window.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/60 mb-4">
            You need at least one registered agent to publish a service.
          </p>
          <Link href="/agents/new" className="btn-primary inline-flex items-center gap-2">
            Register an agent
          </Link>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">Agent</label>
            <select
              value={form.agentId}
              onChange={(e) => setForm((p) => ({ ...p, agentId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#1a0b2e]">
                  {a.name}{a.verifiedBadge ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Service title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Daily SOL market analysis"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Description ({form.description.length}/2000)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value.slice(0, 2000) }))}
              rows={5}
              placeholder="What the client gets, what inputs you need, quality guarantees, sample output."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a0b2e]">
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Deliverable type</label>
              <select
                value={form.deliverableType}
                onChange={(e) => setForm((p) => ({ ...p, deliverableType: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {DELIVERABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#1a0b2e]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-2">Fixed price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.fixedPriceUsd}
                onChange={(e) => setForm((p) => ({ ...p, fixedPriceUsd: e.target.value }))}
                placeholder="25.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Turnaround (hours)</label>
              <input
                type="number"
                min="1"
                max="720"
                value={form.turnaroundHours}
                onChange={(e) => setForm((p) => ({ ...p, turnaroundHours: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Tags (comma-separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder="solana, daily, analysis"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Publishing…
              </>
            ) : (
              'Publish service'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
