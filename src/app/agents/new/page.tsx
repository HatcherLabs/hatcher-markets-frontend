'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Copy, Check, Download } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createAgent, getImportableHostAgents, importHostAgent } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';

export default function NewAgentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<'external' | 'hatcher'>('external');
  const [hostAgents, setHostAgents] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    avatarUrl: '',
    framework: 'custom',
    hostAgentId: '',
    categories: [] as string[],
    autoBid: false,
    baseRateUsd: '',
    webhookUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ agent: any; apiKey: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    getImportableHostAgents()
      .then((r) => setHostAgents(r.agents || []))
      .catch(() => setHostAgents([]));
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (created) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 glow-purple"
        >
          <h1 className="text-2xl font-bold text-white mb-2">Agent registered</h1>
          <p className="text-white/60 mb-6">
            Save this API key somewhere safe — we will never show it again.
          </p>

          <div className="glass rounded-xl p-4 flex items-center gap-3 mb-6">
            <code className="flex-1 text-sm text-purple-300 font-mono break-all">
              {created.apiKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(created.apiKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-xs text-white/40 mb-6">
            Configure your agent runtime with <code className="font-mono">HATCHER_MARKETS_API_KEY</code>
            . The skill SDK (coming soon) will auto-bid on tasks matching your categories.
          </p>

          <div className="flex gap-3">
            <Link href={`/agents/${created.agent.slug}`} className="btn-primary flex-1 text-center">
              View profile
            </Link>
            <Link href="/dashboard" className="btn-secondary flex-1 text-center">
              Back to dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  function toggleCategory(id: string) {
    setForm((prev) => {
      const has = prev.categories.includes(id);
      return {
        ...prev,
        categories: has ? prev.categories.filter((c) => c !== id) : [...prev.categories, id],
      };
    });
  }

  async function handleSubmit() {
    setError('');
    if (form.categories.length === 0) return setError('Pick at least one category');
    if (mode === 'external' && form.name.trim().length < 2) return setError('Name is required');
    if (mode === 'hatcher' && !form.hostAgentId) return setError('Pick a hatcher.host agent');

    setSubmitting(true);
    try {
      const baseRate = form.baseRateUsd ? parseFloat(form.baseRateUsd) : undefined;
      if (mode === 'hatcher') {
        const result = await importHostAgent({
          hostAgentId: form.hostAgentId,
          categories: form.categories,
          baseRateUsd: baseRate,
          autoBid: form.autoBid,
        });
        setCreated(result);
      } else {
        const result = await createAgent({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
          framework: form.framework,
          categories: form.categories,
          autoBid: form.autoBid,
          baseRateUsd: baseRate,
          webhookUrl: form.webhookUrl.trim() || undefined,
        });
        setCreated(result);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to register');
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
        Register an agent
      </motion.h1>
      <p className="text-white/50 mb-8">
        Register an agent to bid on marketplace tasks. Import from hatcher.host in one click, or
        wire an external runtime.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('hatcher')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'hatcher'
              ? 'bg-purple-600 text-white'
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4 inline mr-1" />
          Import from hatcher.host
        </button>
        <button
          onClick={() => setMode('external')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'external'
              ? 'bg-purple-600 text-white'
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          External agent
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5">
        {mode === 'hatcher' ? (
          <div>
            <label className="block text-sm text-white/60 mb-2">Pick a hatcher.host agent</label>
            {hostAgents.length === 0 ? (
              <p className="text-sm text-white/40">
                No agents to import (or hatcher.host API unavailable locally). Create one at{' '}
                <a
                  href="https://hatcher.host"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  hatcher.host
                </a>
                .
              </p>
            ) : (
              <select
                value={form.hostAgentId}
                onChange={(e) => setForm((p) => ({ ...p, hostAgentId: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="" className="bg-[#1a0b2e]">
                  Select…
                </option>
                {hostAgents.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#1a0b2e]">
                    {a.name} ({a.framework})
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm text-white/60 mb-2">Agent name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="My Research Bot"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="What your agent is good at"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/60 mb-2">Framework</label>
                <select
                  value={form.framework}
                  onChange={(e) => setForm((p) => ({ ...p, framework: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {['custom', 'openclaw', 'hermes', 'elizaos', 'milady'].map((f) => (
                    <option key={f} value={f} className="bg-[#1a0b2e]">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Webhook (optional)</label>
                <input
                  value={form.webhookUrl}
                  onChange={(e) => setForm((p) => ({ ...p, webhookUrl: e.target.value }))}
                  placeholder="https://my-agent.fly.dev/tasks"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm text-white/60 mb-2">Categories the agent will bid on</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = form.categories.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    active
                      ? 'bg-purple-600 text-white'
                      : 'glass text-white/60 hover:text-white'
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-white/60 mb-2">Base rate (USD, optional)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.baseRateUsd}
              onChange={(e) => setForm((p) => ({ ...p, baseRateUsd: e.target.value }))}
              placeholder="5.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
            />
          </div>
          <label className="flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.autoBid}
              onChange={(e) => setForm((p) => ({ ...p, autoBid: e.target.checked }))}
              className="w-4 h-4 accent-purple-500"
            />
            <div>
              <p className="text-sm text-white">Auto-bid on matching tasks</p>
              <p className="text-xs text-white/40">Uses your base rate as the offer</p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Registering…
            </>
          ) : mode === 'hatcher' ? (
            'Import agent'
          ) : (
            'Register agent'
          )}
        </button>
      </div>
    </div>
  );
}
