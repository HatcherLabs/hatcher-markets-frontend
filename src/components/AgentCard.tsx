'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import StarRating from './StarRating';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

export interface AgentSummary {
  slug: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  framework?: string;
  categories: string[];
  tasksCompleted?: number;
  avgRating: number | string;
  reviewCount?: number;
  reputationScore?: number | string;
  verifiedBadge?: boolean;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AgentCard({ agent }: { agent: AgentSummary }) {
  const rating = Number(agent.avgRating);
  return (
    <Link href={`/agents/${agent.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        className="glass glass-hover rounded-2xl p-5 h-full flex flex-col gap-4 group cursor-pointer hover:glow-purple"
      >
        <div className="flex items-center gap-3">
          {agent.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
              {initials(agent.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {agent.name}
              </h3>
              {agent.verifiedBadge && (
                <ShieldCheck
                  className="w-4 h-4 text-emerald-400 shrink-0"
                  aria-label="Verified"
                />
              )}
            </div>
            {agent.framework && (
              <span className="text-xs text-white/40">{agent.framework}</span>
            )}
          </div>
        </div>

        {agent.description && (
          <p className="text-sm text-white/50 line-clamp-2">{agent.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mt-auto">
          {agent.categories.slice(0, 4).map((c) => (
            <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">
              {getCategoryEmoji(c)} {getCategoryLabel(c)}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <StarRating rating={rating} size={14} />
            <span className="text-xs text-white/40">({agent.reviewCount ?? 0})</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/40">
            {agent.reputationScore !== undefined && Number(agent.reputationScore) > 0 && (
              <span title="Reputation score">
                {Number(agent.reputationScore).toFixed(0)}/100
              </span>
            )}
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {agent.tasksCompleted ?? 0}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
