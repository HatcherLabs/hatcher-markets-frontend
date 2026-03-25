'use client';

import { motion } from 'framer-motion';
import { Clock, ExternalLink, XCircle, Star, RefreshCw } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import Link from 'next/link';

interface Rental {
  id: string;
  agentName: string;
  agentAvatar?: string;
  status: 'active' | 'expired' | 'cancelled';
  startTime: string;
  endTime: string;
  hourlyRate: number;
  totalPaid: number;
  accessUrl?: string;
  listingId?: string;
  reviewed?: boolean;
}

interface RentalCardProps {
  rental: Rental;
  onExtend?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function RentalCard({ rental, onExtend, onCancel }: RentalCardProps) {
  const status = statusConfig[rental.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {rental.agentAvatar ? (
            <img src={rental.agentAvatar} alt={rental.agentName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-purple-400 text-lg font-bold">
              {rental.agentName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href={`/dashboard/rental/${rental.id}`}
              className="text-white font-semibold hover:text-purple-400 transition-colors truncate"
            >
              {rental.agentName}
            </Link>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {rental.status === 'active' ? (
                <CountdownTimer endTime={rental.endTime} />
              ) : (
                <span>Ended {new Date(rental.endTime).toLocaleDateString()}</span>
              )}
            </span>
            <span>{rental.hourlyRate} SOL/hr</span>
            <span className="text-purple-400 font-medium">{rental.totalPaid} SOL total</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {rental.status === 'active' && (
              <>
                {rental.accessUrl && (
                  <a
                    href={rental.accessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Access
                  </a>
                )}
                {onExtend && (
                  <button
                    onClick={() => onExtend(rental.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Extend
                  </button>
                )}
                {onCancel && (
                  <button
                    onClick={() => onCancel(rental.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                )}
              </>
            )}
            {rental.status === 'expired' && !rental.reviewed && (
              <Link
                href={`/agents/${rental.listingId}?review=true`}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
              >
                <Star className="w-3 h-3" /> Leave Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
