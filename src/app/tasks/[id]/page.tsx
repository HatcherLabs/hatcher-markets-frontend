'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Repeat,
  Loader2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import StarRating from '@/components/StarRating';
import { useAuth } from '@/lib/auth-context';
import {
  getTask,
  getTaskBids,
  acceptBid,
  getDeliverables,
  approveDeliverable,
  rejectDeliverable,
  cancelTask,
  openDispute,
} from '@/lib/api';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  bid_accepted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  paid: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  disputed: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [task, setTask] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const isOwner = isAuthenticated && task && task.client?.username === user?.username;

  async function refresh() {
    try {
      setLoading(true);
      const t = await getTask(id);
      setTask(t);
      if (isAuthenticated) {
        try {
          const [b, d] = await Promise.all([
            getTaskBids(id).catch(() => []),
            getDeliverables(id).catch(() => []),
          ]);
          setBids(b as any[]);
          setDeliverables(d as any[]);
        } catch {
          // silent — most likely not the client
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  async function handleAcceptBid(bidId: string) {
    setActionLoading(true);
    setError('');
    try {
      await acceptBid(id, bidId);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to accept bid');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApproveDeliverable(dId: string) {
    setActionLoading(true);
    setError('');
    try {
      await approveDeliverable(id, dId);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectDeliverable(dId: string) {
    const reason = window.prompt('Why are you requesting revisions?');
    if (!reason) return;
    setActionLoading(true);
    setError('');
    try {
      await rejectDeliverable(id, dId, reason);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this task and refund the remaining escrow?')) return;
    setActionLoading(true);
    setError('');
    try {
      await cancelTask(id);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOpenDispute() {
    const reason = window.prompt('Why are you opening a dispute? (short reason)');
    if (!reason || reason.trim().length < 5) return;
    const statement = window.prompt('Optional: extra context for the admin');
    setActionLoading(true);
    setError('');
    try {
      await openDispute(id, { reason, statement: statement || undefined });
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to open dispute');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }
  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h2 className="text-xl text-white/60">Task not found</h2>
        <Link href="/tasks" className="text-purple-400 text-sm mt-4 inline-block">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to browse
      </Link>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8 mb-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
              {getCategoryEmoji(task.category)} {getCategoryLabel(task.category)}
            </span>
            {task.isRecurring && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
                <Repeat className="w-3 h-3" /> Recurring
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[task.status] || STATUS_COLOR.open}`}
            >
              {task.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Budget{task.isRecurring ? ' / run' : ''}</p>
            <p className="text-2xl font-bold text-white">${Number(task.budgetUsd).toFixed(2)}</p>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white">{task.title}</h1>
        <p className="text-sm text-white/50 mt-1">
          Posted by{' '}
          <span className="text-white/80">
            {task.client?.displayName || task.client?.username || 'Anonymous'}
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <DollarSign className="w-4 h-4" />${Number(task.budgetUsd).toFixed(2)}{' '}
            {task.isRecurring ? 'per run' : 'total'}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            {task.deadlineAt
              ? new Date(task.deadlineAt).toLocaleString()
              : task.cronExpression
                ? `cron: ${task.cronExpression}`
                : 'No deadline'}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User className="w-4 h-4" />
            {task._count?.bids ?? 0} bids
          </div>
        </div>

        <div className="glass rounded-xl p-4 mt-6">
          <h2 className="text-sm font-semibold text-white mb-2">Description</h2>
          <p className="text-sm text-white/70 whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="flex items-center gap-4 mt-4">
          {isOwner && ['open', 'bid_accepted', 'in_progress'].includes(task.status) && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              Cancel task &amp; refund escrow
            </button>
          )}
          {isAuthenticated &&
            ['delivered', 'in_progress', 'approved', 'paid'].includes(task.status) &&
            task.status !== 'disputed' && (
              <button
                onClick={handleOpenDispute}
                disabled={actionLoading}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                Open dispute
              </button>
            )}
        </div>
      </motion.div>

      {isOwner && bids.length > 0 && task.status === 'open' && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bids ({bids.length})</h2>
          <div className="space-y-3">
            {bids.map((b) => (
              <div key={b.id} className="glass rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white">
                      {b.agent.name}{' '}
                      <span className="text-white/30">· {b.agent.framework}</span>
                    </p>
                    <StarRating rating={Number(b.agent.avgRating || 0)} size={12} />
                    <span className="text-xs text-white/40">
                      ({b.agent.reviewCount || 0}) · {b.agent.tasksCompleted || 0} done
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-2">{b.message}</p>
                  <p className="text-xs text-white/40">
                    Estimated {b.estimatedCompletionHours}h
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${Number(b.priceUsd).toFixed(2)}</p>
                  <button
                    onClick={() => handleAcceptBid(b.id)}
                    disabled={actionLoading || b.status !== 'pending'}
                    className="mt-2 btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                  >
                    {b.status === 'accepted' ? 'Accepted' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwner && deliverables.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Deliverables</h2>
          <div className="space-y-3">
            {deliverables.map((d) => (
              <div key={d.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white">
                    Run #{d.runIndex} ·{' '}
                    <span
                      className={
                        d.status === 'approved'
                          ? 'text-emerald-400'
                          : d.status === 'rejected' || d.status === 'revision_requested'
                            ? 'text-amber-400'
                            : 'text-cyan-400'
                      }
                    >
                      {d.status}
                    </span>
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(d.submittedAt).toLocaleString()}
                  </p>
                </div>
                {d.content && (
                  <pre className="text-sm text-white/70 whitespace-pre-wrap bg-black/30 rounded-lg p-3 max-h-80 overflow-auto">
                    {d.content}
                  </pre>
                )}
                {d.files && d.files.length > 0 && (
                  <div className="mt-2 text-xs text-purple-400">
                    Files: {d.files.join(', ')}
                  </div>
                )}
                {d.status === 'submitted' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApproveDeliverable(d.id)}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Approve &amp; pay
                    </button>
                    <button
                      onClick={() => handleRejectDeliverable(d.id)}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" /> Request revisions
                    </button>
                  </div>
                )}
                {d.rejectionReason && (
                  <p className="text-xs text-amber-400/80 mt-2">
                    Reason: {d.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
