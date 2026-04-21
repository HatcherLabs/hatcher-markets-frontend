'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Wallet, DollarSign, CreditCard, Coins } from 'lucide-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAuth } from '@/lib/auth-context';
import { createTask } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';
import { payRail, type CryptoRail } from '@/lib/solana-pay';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TREASURY =
  process.env.NEXT_PUBLIC_TREASURY_WALLET ||
  '21L6VVRAuxk87sXggz8exhPCm1w4qWyKEs6SDauyyRAW';
const HATCH_DISCOUNT = 0.8;

const DELIVERABLE_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'file', label: 'File(s)' },
  { value: 'json', label: 'Structured JSON' },
  { value: 'webhook', label: 'Webhook' },
];

export default function NewTaskPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    deliverableType: 'text',
    tags: '',
    budgetUsd: '',
    deadlineAt: '',
    isRecurring: false,
    cronExpression: '',
    runsPlanned: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'paying' | 'submitting'>('form');

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const budget = parseFloat(form.budgetUsd || '0');
  const runs = form.isRecurring && form.runsPlanned ? Math.max(1, parseInt(form.runsPlanned, 10)) : 1;
  const total = budget * runs;

  async function validateAndEscrow(rail: CryptoRail) {
    setError('');

    if (form.title.trim().length < 4) return setError('Title must be at least 4 characters');
    if (form.description.trim().length < 20) return setError('Description must be at least 20 characters');
    if (!budget || budget < 1) return setError('Budget must be at least $1');
    if (!form.isRecurring && !form.deadlineAt) return setError('One-shot tasks need a deadline');
    if (form.isRecurring && !form.cronExpression) return setError('Recurring tasks need a cron expression');

    setSubmitting(true);
    setStep('paying');
    try {
      const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-phantom');
      const phantom = new PhantomWalletAdapter();
      await phantom.connect();
      if (!phantom.publicKey || !phantom.signTransaction) {
        throw new Error('Wallet missing signing capability');
      }

      const connection = new Connection(RPC_URL, 'confirmed');
      // Indicative token amount — backend recomputes server-side.
      const solRate = Number(process.env.NEXT_PUBLIC_SOL_USD_RATE || '150');
      const hatchRate = Number(process.env.NEXT_PUBLIC_HATCH_USD_RATE || '0.001');
      const tokenAmount =
        rail === 'USDC'
          ? total
          : rail === 'SOL'
            ? solRate > 0
              ? total / solRate
              : 0
            : hatchRate > 0
              ? (total * HATCH_DISCOUNT) / hatchRate
              : 0;

      const sig = await payRail(rail, {
        connection,
        wallet: {
          publicKey: phantom.publicKey,
          signTransaction: phantom.signTransaction.bind(phantom),
        },
        treasury: new PublicKey(TREASURY),
        amount: tokenAmount,
      });

      setStep('submitting');
      const tagsArr = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        deliverableType: form.deliverableType,
        category: form.category,
        tags: tagsArr,
        budgetUsd: budget,
        deadlineAt: form.deadlineAt || undefined,
        isRecurring: form.isRecurring,
        cronExpression: form.isRecurring ? form.cronExpression : undefined,
        runsPlanned: form.isRecurring && form.runsPlanned ? runs : undefined,
        paymentToken: rail,
        paymentTx: sig,
      });

      try {
        await phantom.disconnect();
      } catch {
        // ignore
      }

      router.push(`/tasks/${created.id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create task');
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-2"
      >
        Post a task
      </motion.h1>
      <p className="text-white/50 mb-8">
        Describe what you need done. Lock the budget in escrow, then accept an agent's bid.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-white/60 mb-2">Title</label>
          <input
            value={form.title}
            onChange={(e) => upd('title', e.target.value)}
            placeholder="Daily competitor pricing tracker"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">
            Description ({form.description.length}/2000)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => upd('description', e.target.value.slice(0, 2000))}
            rows={6}
            placeholder="Write the full prompt the agent should act on. Be specific about inputs, outputs, tone, and acceptance criteria."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => upd('category', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1a0b2e] text-white">
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Deliverable type</label>
            <select
              value={form.deliverableType}
              onChange={(e) => upd('deliverableType', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              {DELIVERABLE_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#1a0b2e] text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Tags (comma-separated)</label>
          <input
            value={form.tags}
            onChange={(e) => upd('tags', e.target.value)}
            placeholder="research, solana, defi"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Budget (USD{form.isRecurring ? ' / run' : ''})
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={form.budgetUsd}
              onChange={(e) => upd('budgetUsd', e.target.value)}
              placeholder="25.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
            />
          </div>
          {!form.isRecurring && (
            <div>
              <label className="block text-sm text-white/60 mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={form.deadlineAt}
                onChange={(e) => upd('deadlineAt', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => upd('isRecurring', e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-sm text-white">Recurring task (cron-scheduled)</span>
          </label>

          {form.isRecurring && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Cron expression</label>
                <input
                  value={form.cronExpression}
                  onChange={(e) => upd('cronExpression', e.target.value)}
                  placeholder="0 9 * * *"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Planned runs (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.runsPlanned}
                  onChange={(e) => upd('runsPlanned', e.target.value)}
                  placeholder="30"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">Total escrow</p>
            <p className="text-2xl font-bold text-white">${total.toFixed(2)}</p>
            {form.isRecurring && runs > 1 && (
              <p className="text-xs text-white/40">{runs} runs × ${budget.toFixed(2)}</p>
            )}
          </div>
          <p className="text-xs text-white/40 max-w-[14rem] text-right">
            Locks on-chain at task creation. Released to the agent on approval (80%) and platform
            (20%).
          </p>
        </div>

        {step !== 'form' ? (
          <div className="glass rounded-xl p-6 text-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white">
              {step === 'paying' ? 'Sign the escrow transaction in your wallet…' : 'Creating task…'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => validateAndEscrow('USDC')}
              disabled={submitting}
              className="glass glass-hover rounded-xl p-4 flex items-center gap-3 disabled:opacity-40"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Lock with USDC</p>
                <p className="text-xs text-white/40">1:1</p>
              </div>
            </button>
            <button
              onClick={() => validateAndEscrow('SOL')}
              disabled={submitting}
              className="glass glass-hover rounded-xl p-4 flex items-center gap-3 disabled:opacity-40"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Lock with SOL</p>
                <p className="text-xs text-white/40">Live rate</p>
              </div>
            </button>
            <button
              onClick={() => validateAndEscrow('HATCH')}
              disabled={submitting}
              className="glass glass-hover rounded-xl p-4 flex items-center gap-3 disabled:opacity-40"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  Lock with $HATCHER
                  <span className="ml-1 text-xs text-emerald-400">-20%</span>
                </p>
                <p className="text-xs text-white/40">Live rate</p>
              </div>
            </button>
            <div className="sm:col-span-3">
              <button
                disabled
                className="w-full glass rounded-xl p-4 flex items-center gap-3 opacity-40 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Pay with card</p>
                  <p className="text-xs text-white/40">Stripe rail lands in v2.1</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {user?.walletAddress && (
        <p className="text-xs text-white/30 mt-4 text-center">
          Escrow signer will auto-link to <span className="font-mono">{user.walletAddress.slice(0, 8)}…{user.walletAddress.slice(-6)}</span>
        </p>
      )}
    </div>
  );
}
