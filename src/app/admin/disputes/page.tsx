'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Check, X, SplitSquareVertical } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { adminListDisputes, adminResolveDispute } from '@/lib/api';

type Outcome = 'release' | 'refund' | 'partial';

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tab, setTab] = useState<'open' | 'resolved'>('open');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline resolution form state — keyed by dispute id
  const [editing, setEditing] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>('release');
  const [resolution, setResolution] = useState('');
  const [clientRefundUsd, setClientRefundUsd] = useState('');
  const [agentPayoutUsd, setAgentPayoutUsd] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh(status: 'open' | 'resolved' = tab) {
    setLoading(true);
    setError('');
    try {
      const d = await adminListDisputes(status);
      setDisputes(d);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!user?.isAdmin) {
      setError('Admin only.');
      setLoading(false);
      return;
    }
    refresh(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, tab]);

  function openEditor(d: any) {
    setEditing(d.id);
    setOutcome('release');
    setResolution('');
    setClientRefundUsd('');
    setAgentPayoutUsd('');
  }

  async function handleResolve(d: any) {
    setBusy(true);
    setError('');
    try {
      const payload: any = { outcome, resolution: resolution.trim() };
      if (outcome === 'partial') {
        payload.partialSplit = {
          clientRefundUsd: parseFloat(clientRefundUsd || '0'),
          agentPayoutUsd: parseFloat(agentPayoutUsd || '0'),
        };
      }
      await adminResolveDispute(d.id, payload);
      setEditing(null);
      await refresh('open');
    } catch (e: any) {
      setError(e?.message || 'Failed to resolve');
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl text-white/60">Admin only</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dispute mediation</h1>
        <p className="text-white/40">Resolve disputes between clients and agent operators.</p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {(['open', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === s ? 'bg-purple-600 text-white' : 'glass text-white/60 hover:text-white'
            }`}
          >
            {s === 'open' ? 'Open' : 'Resolved'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-white/50">Nothing here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const task = d.task;
            const total = Number(task.escrowTotalUsd);
            const released = Number(task.escrowReleasedUsd);
            const remaining = total - released;
            const isEditing = editing === d.id;
            return (
              <div key={d.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div className="flex-1">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-lg font-semibold text-white hover:text-purple-300 transition-colors"
                    >
                      {task.title}
                    </Link>
                    <p className="text-xs text-white/40 mt-1">
                      Raised by <strong>{d.raisedBy}</strong> ·{' '}
                      {new Date(d.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40">Escrow remaining</p>
                    <p className="text-lg font-bold text-white">
                      ${remaining.toFixed(2)}{' '}
                      <span className="text-xs text-white/40">({task.escrowToken})</span>
                    </p>
                  </div>
                </div>

                <div className="glass rounded-xl p-3 mb-3">
                  <p className="text-xs text-white/40 mb-1">Reason</p>
                  <p className="text-sm text-white/80">{d.reason}</p>
                  {d.clientStatement && (
                    <>
                      <p className="text-xs text-white/40 mt-2 mb-1">Client statement</p>
                      <p className="text-sm text-white/80 whitespace-pre-wrap">
                        {d.clientStatement}
                      </p>
                    </>
                  )}
                  {d.agentStatement && (
                    <>
                      <p className="text-xs text-white/40 mt-2 mb-1">Agent statement</p>
                      <p className="text-sm text-white/80 whitespace-pre-wrap">
                        {d.agentStatement}
                      </p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/60 mb-3">
                  <p>
                    Client:{' '}
                    <span className="text-white">
                      {task.client?.username} ({task.client?.email})
                    </span>
                  </p>
                  <p>
                    Agent:{' '}
                    <span className="text-white">
                      {task.assignedAgent?.name}{' '}
                      <span className="text-white/40">
                        ({task.assignedAgent?.owner?.username})
                      </span>
                    </span>
                  </p>
                </div>

                {d.resolvedAt ? (
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-white/40 mb-1">
                      Resolved · {d.outcome} · {new Date(d.resolvedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-white/80">{d.resolution}</p>
                  </div>
                ) : !isEditing ? (
                  <button
                    onClick={() => openEditor(d)}
                    className="btn-primary text-sm"
                  >
                    Resolve dispute
                  </button>
                ) : (
                  <div className="glass rounded-xl p-4 space-y-4 bg-purple-500/5">
                    <div>
                      <label className="block text-xs text-white/60 mb-2">Outcome</label>
                      <div className="flex gap-2 flex-wrap">
                        {(['release', 'refund', 'partial'] as Outcome[]).map((o) => (
                          <button
                            key={o}
                            onClick={() => setOutcome(o)}
                            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                              outcome === o
                                ? 'bg-purple-600 text-white'
                                : 'glass text-white/60 hover:text-white'
                            }`}
                          >
                            {o === 'release' && <Check className="w-3 h-3" />}
                            {o === 'refund' && <X className="w-3 h-3" />}
                            {o === 'partial' && <SplitSquareVertical className="w-3 h-3" />}
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>

                    {outcome === 'partial' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">
                            Client refund (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={remaining}
                            value={clientRefundUsd}
                            onChange={(e) => setClientRefundUsd(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">
                            Agent payout (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={remaining}
                            value={agentPayoutUsd}
                            onChange={(e) => setAgentPayoutUsd(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-white/60 mb-1">
                        Resolution notes (visible to both parties)
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={3}
                        placeholder="Explain the decision…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolve(d)}
                        disabled={busy || resolution.trim().length < 10}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {busy ? 'Saving…' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="btn-secondary text-sm"
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
