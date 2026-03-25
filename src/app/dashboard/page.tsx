'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, DollarSign, Clock, Loader2, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getMyRentals, extendRental, cancelRental } from '@/lib/api';
import RentalCard from '@/components/RentalCard';

type TabFilter = 'all' | 'active' | 'expired' | 'cancelled';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('all');

  // Extend modal state
  const [extendModalId, setExtendModalId] = useState<string | null>(null);
  const [extendHours, setExtendHours] = useState(1);
  const [extending, setExtending] = useState(false);

  // Cancel confirm state
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchRentals();
  }, [isAuthenticated, authLoading, router]);

  async function fetchRentals() {
    try {
      setLoading(true);
      const data: any = await getMyRentals();
      setRentals(Array.isArray(data) ? data : data?.rentals || []);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }

  async function handleExtend() {
    if (!extendModalId) return;
    setExtending(true);
    try {
      await extendRental(extendModalId, { hours: extendHours, txSignature: 'pending' });
      setExtendModalId(null);
      setExtendHours(1);
      fetchRentals();
    } catch (err: any) {
      alert(err.message || 'Failed to extend rental');
    } finally {
      setExtending(false);
    }
  }

  async function handleCancel() {
    if (!cancelConfirmId) return;
    setCancelling(true);
    try {
      await cancelRental(cancelConfirmId);
      setCancelConfirmId(null);
      fetchRentals();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel rental');
    } finally {
      setCancelling(false);
    }
  }

  const filtered = rentals.filter((r) => tab === 'all' || r.status === tab);
  const activeRentals = rentals.filter((r) => r.status === 'active');
  const totalSpent = rentals.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
  const totalHoursRemaining = activeRentals.reduce((sum, r) => {
    const diff = new Date(r.endTime).getTime() - Date.now();
    return sum + Math.max(0, diff / 3600000);
  }, 0);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">My Rentals</h1>
        <p className="text-white/60">Manage your active and past agent rentals</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-white/60">Active Rentals</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeRentals.length}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-white/60">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalSpent.toFixed(2)} SOL</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-white/60">Hours Remaining</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalHoursRemaining.toFixed(1)}h</p>
        </div>
      </motion.div>

      {/* Tab Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-purple-600 text-white'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            {t.label}
            {t.key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({rentals.filter((r) => t.key === 'all' || r.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Rental List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No rentals yet</h3>
          <p className="text-white/60 mb-6">Browse agents to get started!</p>
          <Link href="/agents" className="btn-primary inline-block">
            Browse Agents
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((rental, i) => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
              >
                <RentalCard
                  rental={rental}
                  onExtend={(id) => setExtendModalId(id)}
                  onCancel={(id) => setCancelConfirmId(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Extend Modal */}
      <AnimatePresence>
        {extendModalId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setExtendModalId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md glow-purple"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Extend Rental</h3>
                <button onClick={() => setExtendModalId(null)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <label className="block text-sm text-white/60 mb-2">Additional hours</label>
              <input
                type="number"
                min={1}
                max={720}
                value={extendHours}
                onChange={(e) => setExtendHours(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 mb-4"
              />
              <p className="text-sm text-white/40 mb-6">
                Cost will be calculated based on the agent&apos;s hourly rate.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setExtendModalId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtend}
                  disabled={extending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {extending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Extend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setCancelConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-3">Cancel Rental?</h3>
              <p className="text-white/60 text-sm mb-6">
                Are you sure you want to cancel this rental? This action cannot be undone and you may not receive a refund.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmId(null)}
                  className="btn-secondary flex-1"
                >
                  Keep Rental
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel Rental
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
