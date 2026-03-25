'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import StarRating from './StarRating';

interface AgentCardProps {
  listing: {
    slug: string;
    name: string;
    avatarUrl?: string;
    category: string;
    hourlyRate?: number;
    hourlyRateSol?: number;
    avgRating: number;
    reviewCount: number;
    totalRentals: number;
  };
}

const categoryColors: Record<string, string> = {
  Trading: 'bg-green-500/20 text-green-400',
  Research: 'bg-blue-500/20 text-blue-400',
  Support: 'bg-yellow-500/20 text-yellow-400',
  Creative: 'bg-pink-500/20 text-pink-400',
  Dev: 'bg-cyan-500/20 text-cyan-400',
  General: 'bg-purple-500/20 text-purple-400',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AgentCard({ listing }: AgentCardProps) {
  const colorClass = categoryColors[listing.category] || categoryColors.General;

  return (
    <Link href={`/agents/${listing.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        className="glass glass-hover rounded-2xl p-5 h-full flex flex-col gap-4 group cursor-pointer hover:glow-purple"
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          {listing.avatarUrl ? (
            <img
              src={listing.avatarUrl}
              alt={listing.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
              {getInitials(listing.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
              {listing.name}
            </h3>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${colorClass}`}>
              {listing.category}
            </span>
          </div>
        </div>

        {/* Rate */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-white">{listing.hourlyRateSol || listing.hourlyRate}</span>
          <span className="text-sm text-white/40">SOL/hr</span>
        </div>

        {/* Rating + Rentals */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <StarRating rating={listing.avgRating} size={14} />
            <span className="text-xs text-white/40">({listing.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Users className="w-3.5 h-3.5" />
            {listing.totalRentals}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
