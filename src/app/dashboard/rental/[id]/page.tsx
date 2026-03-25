'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Clock,
  RefreshCw,
  XCircle,
  Loader2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getRental, extendRental, cancelRental } from '@/lib/api';
import CountdownTimer from '@/components/CountdownTimer';

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [extendHours, setExtendHours] = useState(1);
  const [extending, setExtending] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchRental();
  }, [isAuthenticated, authLoading, params.id]);

  async function fetchRental() {
    try {
      setLoading(true);
      const raw = await getRental(params.id as string);
      const data = raw.rental || raw;
      // Normalize field names from API response
      setRental({
        ...data,
        agentName: data.listing?.name || data.agentName || 'Agent',
        agentAvatar: data.listing?.avatarUrl || data.agentAvatar,
        startTime: data.startsAt || data.startTime,
        endTime: data.expiresAt || data.endTime,
        hourlyRate: Number(data.listing?.hourlyRateSol || data.hourlyRate || 0),
        totalPaid: Number(data.amountSol || data.totalPaid || 0),
        listingSlug: data.listing?.slug || data.listingSlug,
        listingId: data.listingId || data.listing?.id,
        txSignature: data.paymentTx || data.txSignature,
      });
    } catch {
      // not found
    } finally {
      setLoading(false);
    }
  }

  function copyAccessUrl() {
    if (!rental?.accessUrl) return;
    navigator.clipboard.writeText(rental.accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExtend() {
    setExtending(true);
    try {
      await extendRental(params.id as string, { hours: extendHours, txSignature: 'pending' });
      setShowExtend(false);
      setExtendHours(1);
      fetchRental();
    } catch (err: any) {
      alert(err.message || 'Failed to extend');
    } finally {
      setExtending(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelRental(params.id as string);
      setShowCancel(false);
      fetchRental();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
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
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  if (!rental) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-white">Rental not found</h1>
        <Link href="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const status = statusConfig[rental.status] || statusConfig.expired;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8 mb-6"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {rental.agentAvatar ? (
              <img src={rental.agentAvatar} alt={rental.agentName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-purple-400 text-2xl font-bold">
                {(rental.agentName || 'A').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{rental.agentName || 'Agent'}</h1>
              <span className={`text-xs px-3 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>
            {rental.listingId && (
              <Link
                href={`/agents/${rental.listingSlug || rental.listingId}`}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors mt-1 inline-block"
              >
                View listing
              </Link>
            )}
          </div>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-xs text-white/40">Started</p>
              <p className="text-sm text-white">{new Date(rental.startTime).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-xs text-white/40">
                {rental.status === 'active' ? 'Ends' : 'Ended'}
              </p>
              <p className="text-sm">
                {rental.status === 'active' ? (
                  <CountdownTimer endTime={rental.endTime} />
                ) : (
                  <span className="text-white">{new Date(rental.endTime).toLocaleString()}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-xs text-white/40">Hourly Rate</p>
              <p className="text-sm text-white">{rental.hourlyRate} SOL/hr</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-white/40">Total Paid</p>
              <p className="text-sm text-purple-400 font-semibold">{rental.totalPaid} SOL</p>
            </div>
          </div>
        </div>

        {/* Access URL */}
        {rental.accessUrl && rental.status === 'active' && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-xs text-white/40 mb-2">Access URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-emerald-400 truncate">{rental.accessUrl}</code>
              <button
                onClick={copyAccessUrl}
                className="p-2 rounded-lg glass glass-hover text-white/60 hover:text-white transition-colors flex-shrink-0"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={rental.accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg glass glass-hover text-white/60 hover:text-white transition-colors flex-shrink-0"
                title="Open"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        {rental.status === 'active' && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowExtend(true)}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Extend Rental
            </button>
            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium px-6 py-3 rounded-xl transition-all"
            >
              <XCircle className="w-4 h-4" /> Cancel Rental
            </button>
          </div>
        )}
      </motion.div>

      {/* Transaction Details */}
      {rental.txSignature && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Transaction</h3>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">Signature</p>
            <code className="text-xs text-white/80 break-all">{rental.txSignature}</code>
          </div>
        </motion.div>
      )}

      {/* Extend Inline */}
      {showExtend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mt-6 glow-purple"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Extend Rental</h3>
          <label className="block text-sm text-white/60 mb-2">Additional hours</label>
          <input
            type="number"
            min={1}
            max={720}
            value={extendHours}
            onChange={(e) => setExtendHours(Math.max(1, Number(e.target.value)))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 mb-4"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowExtend(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleExtend}
              disabled={extending}
              className="btn-primary flex items-center gap-2"
            >
              {extending && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Extension
            </button>
          </div>
        </motion.div>
      )}

      {/* Cancel Confirm Inline */}
      {showCancel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mt-6 border-red-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Confirm Cancellation</h3>
          <p className="text-white/60 text-sm mb-6">
            This action cannot be undone. You may not receive a refund for unused time.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowCancel(false)} className="btn-secondary">
              Keep Rental
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Cancel Rental
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
