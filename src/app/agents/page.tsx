'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AgentCard from '@/components/AgentCard';
import { getListings } from '@/lib/api';

const categories = ['All', 'Trading', 'Research', 'Support', 'Creative', 'Dev', 'General'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Cheapest' },
  { value: 'rating', label: 'Highest Rated' },
];

function BrowseAgentsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');

  const fetchListings = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const params: any = { page: pageNum, limit: 12, sort };
        if (category !== 'All') params.category = category.toLowerCase();
        if (search) params.search = search;

        const data = await getListings(params);
        if (append) {
          setListings((prev) => [...prev, ...(data.listings || [])]);
        } else {
          setListings(data.listings || []);
        }
        setTotal(data.pagination?.total || data.total || 0);
      } catch {
        // API not available yet — show empty state
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, sort, search]
  );

  useEffect(() => {
    setPage(1);
    fetchListings(1);
  }, [fetchListings]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchListings(next, true);
  };

  const hasMore = listings.length < total;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Browse Agents</h1>
        <p className="text-white/40 mb-8">Discover and rent AI agents from top creators.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass border-0 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-purple-600 text-white'
                  : 'glass text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3 rounded-xl glass text-white/80 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-transparent cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1a0b2e] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing: any, i: number) => (
              <motion.div
                key={listing.slug || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AgentCard listing={listing} />
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <SlidersHorizontal className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/40">No agents found</h3>
          <p className="text-sm text-white/20 mt-2 mb-6">
            {search || category !== 'All'
              ? 'Try adjusting your search or filters.'
              : 'The marketplace is brand new — be the first to list an agent!'}
          </p>
          {!search && category === 'All' && (
            <Link href="/creator" className="btn-primary inline-flex items-center gap-2 text-sm">
              List Your Agent
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function BrowseAgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <BrowseAgentsContent />
    </Suspense>
  );
}
