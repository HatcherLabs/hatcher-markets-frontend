'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  Rocket,
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  registerAsCreator,
  getCreatorListings,
  getCreatorEarnings,
  deleteListing,
  updateListing,
  requestPayout,
} from '@/lib/api';

export default function CreatorPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.isCreator) {
      setIsCreator(true);
      loadCreatorData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user, router]);

  async function loadCreatorData() {
    try {
      setLoading(true);
      const [listingsData, earningsData]: any[] = await Promise.all([
        getCreatorListings().catch(() => []),
        getCreatorEarnings().catch(() => null),
      ]);
      setListings(Array.isArray(listingsData) ? listingsData : listingsData?.listings || []);
      setEarnings(earningsData);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setRegistering(true);
    try {
      await registerAsCreator();
      setIsCreator(true);
      loadCreatorData();
    } catch (err: any) {
      alert(err.message || 'Failed to register as creator');
    } finally {
      setRegistering(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    }
  }

  async function handleToggleStatus(listing: any) {
    const newActive = !listing.active;
    try {
      await updateListing(listing.id, { active: newActive });
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, active: newActive } : l))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update listing');
    }
  }

  async function handleRequestPayout() {
    setRequestingPayout(true);
    try {
      await requestPayout();
      loadCreatorData();
    } catch (err: any) {
      alert(err.message || 'Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  }

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

  // Not a creator yet — show CTA
  if (!isCreator) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 sm:p-12 text-center glow-purple w-full"
        >
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Become a Creator</h1>
          <p className="text-white/60 text-lg mb-4 max-w-md mx-auto">
            List AI agents you&apos;ve deployed on{' '}
            <a href="https://hatcher.host" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
              hatcher.host
            </a>{' '}
            and earn SOL every time someone rents them.
            Creators receive <span className="text-purple-400 font-semibold">80% revenue share</span> on all rentals.
          </p>
          <p className="text-white/30 text-sm mb-8">
            Don&apos;t have an agent yet?{' '}
            <a href="https://hatcher.host" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
              Deploy one on hatcher.host first
            </a>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">80% Revenue</p>
              <p className="text-xs text-white/40">On every rental</p>
            </div>
            <div className="glass rounded-xl p-4">
              <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Analytics</p>
              <p className="text-xs text-white/40">Track performance</p>
            </div>
            <div className="glass rounded-xl p-4">
              <Banknote className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">SOL Payouts</p>
              <p className="text-xs text-white/40">Direct to wallet</p>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={registering}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
          >
            {registering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            Register as Creator
          </button>
        </motion.div>
      </div>
    );
  }

  // Creator Dashboard
  const totalListings = listings.length;
  const totalRentals = listings.reduce((sum: number, l: any) => sum + (l.totalRentals || 0), 0);
  const totalEarnings = Number(earnings?.totalEarnings || 0);
  const pendingPayout = Number(earnings?.pendingPayout || 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Creator Dashboard</h1>
          <p className="text-white/60">Manage your listings and track earnings</p>
        </div>
        <Link href="/creator/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create Listing
        </Link>
      </motion.div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-white/60">Listings</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalListings}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-white/60">Total Rentals</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalRentals}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm text-white/60">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalEarnings.toFixed(2)} SOL</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-white/60">Pending Payout</span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-white">{pendingPayout.toFixed(2)} SOL</p>
                {pendingPayout > 0 && (
                  <button
                    onClick={handleRequestPayout}
                    disabled={requestingPayout}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    {requestingPayout ? 'Requesting...' : 'Payout'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Listings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Your Listings</h2>
            </div>
            {listings.length === 0 ? (
              <div className="p-12 text-center">
                <Rocket className="w-10 h-10 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-medium mb-2">No listings yet</p>
                <p className="text-white/30 text-sm mb-6">
                  List an agent you&apos;ve deployed on hatcher.host to start earning.
                </p>
                <Link href="/creator/new" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-white/40 uppercase tracking-wider">
                      <th className="px-5 py-3">Agent</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Rate</th>
                      <th className="px-5 py-3">Rentals</th>
                      <th className="px-5 py-3">Earnings</th>
                      <th className="px-5 py-3">Rating</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {listing.avatarUrl ? (
                                <img src={listing.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-purple-400 text-sm font-bold">
                                  {(listing.name || '?').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-white font-medium truncate max-w-[200px]">
                              {listing.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              listing.active !== false
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {listing.active !== false ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/80">{listing.hourlyRateSol || listing.hourlyRate} SOL/hr</td>
                        <td className="px-5 py-4 text-sm text-white/80">{listing.totalRentals || 0}</td>
                        <td className="px-5 py-4 text-sm text-purple-400 font-medium">
                          {Number(listing.totalEarnings || 0).toFixed(2)} SOL
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm text-white/80">
                              {listing.avgRating ? Number(listing.avgRating).toFixed(1) : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Link
                              href={`/creator/edit/${listing.id}`}
                              className="p-2 rounded-lg glass glass-hover text-white/60 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(listing)}
                              className="p-2 rounded-lg glass glass-hover text-white/60 hover:text-white transition-colors"
                              title={listing.active !== false ? 'Deactivate' : 'Activate'}
                            >
                              {listing.active !== false ? (
                                <ToggleRight className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="p-2 rounded-lg glass glass-hover text-white/60 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Recent Rentals Feed */}
          {earnings?.recentRentals && earnings.recentRentals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 mt-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Recent Rentals</h2>
              <div className="space-y-3">
                {earnings.recentRentals.map((rental: any) => (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white">{rental.listing?.name || rental.agentName || 'Agent'}</p>
                      <p className="text-xs text-white/40">
                        {new Date(rental.createdAt).toLocaleDateString()} - {rental.hours}h rental
                      </p>
                    </div>
                    <span className="text-sm text-emerald-400 font-medium">+{rental.amountSol || rental.amount} SOL</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
