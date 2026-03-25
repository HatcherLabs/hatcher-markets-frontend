'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  Loader2,
  Minus,
  Plus,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import PaymentModal from '@/components/PaymentModal';
import { getListing, getReviews, createReview } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const categoryColors: Record<string, string> = {
  trading: 'bg-green-500/20 text-green-400',
  research: 'bg-blue-500/20 text-blue-400',
  support: 'bg-yellow-500/20 text-yellow-400',
  creative: 'bg-pink-500/20 text-pink-400',
  dev: 'bg-cyan-500/20 text-cyan-400',
  general: 'bg-purple-500/20 text-purple-400',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(1);
  const [error, setError] = useState('');

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    getListing(slug)
      .then((listingData) => {
        setListing(listingData);
        // Use reviews embedded in listing response
        if (listingData?.reviews) {
          setReviews(Array.isArray(listingData.reviews) ? listingData.reviews : []);
        }
        // Also try loading full reviews list by listing ID
        if (listingData?.id) {
          getReviews(listingData.id).then((reviewsData: any) => {
            const list = reviewsData?.reviews || reviewsData;
            if (Array.isArray(list) && list.length > 0) {
              setReviews(list);
            }
          }).catch(() => {});
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [slug]);

  const minHours = listing?.minHours || 1;
  const maxHours = listing?.maxHours || 72;
  const hourlyRate = Number(listing?.hourlyRateSol || listing?.hourlyRate || 0);
  const totalCost = (hourlyRate * hours).toFixed(4);

  const handleRent = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setError('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    router.push('/dashboard');
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = await createReview({
        listingId: listing.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [newReview, ...prev]);
      setReviewRating(0);
      setReviewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white/60">Agent not found</h2>
        <Link href="/agents" className="text-purple-400 hover:text-purple-300 text-sm mt-4 inline-block">
          Back to Browse
        </Link>
      </div>
    );
  }

  const colorClass = categoryColors[listing.category?.toLowerCase()] || categoryColors.general;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : Number(listing.avgRating || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/agents"
        className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-5">
              {listing.avatarUrl ? (
                <img
                  src={listing.avatarUrl}
                  alt={listing.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-2xl">
                  {getInitials(listing.name)}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{listing.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${colorClass}`}>
                    {listing.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <StarRating rating={avgRating} size={16} />
                    <span className="text-sm text-white/40">
                      ({reviews.length || listing.reviewCount || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white/40">
                    <Users className="w-4 h-4" />
                    {listing.totalRentals || 0} rentals
                  </div>
                </div>

                {listing.creator && (
                  <div className="mt-3 text-sm text-white/40">
                    by{' '}
                    <span className="text-white/60">
                      {listing.creator.displayName ||
                        listing.creator.username ||
                        listing.creator.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-white mb-4">About this Agent</h2>
            <div className="prose prose-invert max-w-none text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
              {listing.longDescription || listing.description || 'No description provided.'}
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Reviews ({reviews.length || listing.reviewCount || 0})
              </h2>
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} size={18} />
                <span className="text-white/60 font-medium">{avgRating.toFixed(1)}</span>
              </div>
            </div>

            {/* Review list */}
            {reviews.length > 0 ? (
              <div className="space-y-4 mb-8">
                {reviews.map((review: any, i: number) => (
                  <div key={review.id || i} className="border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                          {(review.user?.displayName || review.user?.username || review.user?.email || 'A')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm text-white/60">
                          {review.user?.displayName ||
                            review.user?.username ||
                            review.user?.email}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-sm text-white/40">{review.comment}</p>
                    <span className="text-xs text-white/20 mt-1 block">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/20 mb-8">No reviews yet.</p>
            )}

            {/* Write review */}
            {isAuthenticated ? (
              <div className="border-t border-white/5 pt-6">
                <h3 className="text-sm font-medium text-white/60 mb-3">Write a Review</h3>
                <div className="space-y-3">
                  <div>
                    <StarRating
                      rating={reviewRating}
                      size={24}
                      interactive
                      onChange={setReviewRating}
                    />
                  </div>
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-24"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewRating || !reviewComment.trim() || submittingReview}
                    className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-6 text-center">
                <p className="text-sm text-white/30">
                  <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Login
                  </Link>{' '}
                  to write a review.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar — Pricing card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass rounded-2xl p-6 sticky top-24"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Rent this Agent</h3>

            {/* Hourly rate */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-white">{hourlyRate}</span>
              <span className="text-white/40">SOL / hour</span>
            </div>

            {/* Hours selector */}
            <div className="mb-6">
              <label className="text-sm text-white/40 mb-2 block">Duration (hours)</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHours(Math.max(minHours, hours - 1))}
                  className="w-10 h-10 rounded-lg glass glass-hover flex items-center justify-center text-white/60 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || minHours;
                    setHours(Math.max(minHours, Math.min(maxHours, v)));
                  }}
                  className="flex-1 text-center text-xl font-bold text-white bg-transparent border-0 focus:outline-none"
                  min={minHours}
                  max={maxHours}
                />
                <button
                  onClick={() => setHours(Math.min(maxHours, hours + 1))}
                  className="w-10 h-10 rounded-lg glass glass-hover flex items-center justify-center text-white/60 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Slider */}
              <input
                type="range"
                min={minHours}
                max={maxHours}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full mt-3 accent-purple-600"
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>{minHours}h min</span>
                <span>{maxHours}h max</span>
              </div>
            </div>

            {/* Total */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">Total Cost</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{totalCost} SOL</div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Rent button */}
            <button
              onClick={handleRent}
              className="w-full btn-primary text-base flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Rent Now
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-white/20 text-center mt-3">
                <Link href="/login" className="text-purple-400 hover:text-purple-300">Login</Link> to rent this agent.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        listing={listing}
        hours={hours}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
