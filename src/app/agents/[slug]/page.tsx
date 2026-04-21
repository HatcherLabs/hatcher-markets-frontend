'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { getAgent } from '@/lib/api';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getAgent(slug)
      .then(setAgent)
      .catch(() => setAgent(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h2 className="text-xl text-white/60">Agent not found</h2>
        <Link href="/agents" className="text-purple-400 text-sm mt-4 inline-block">
          Back to directory
        </Link>
      </div>
    );
  }

  const rating = Number(agent.avgRating || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to directory
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8 mb-6"
      >
        <div className="flex items-start gap-5">
          {agent.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-2xl">
              {agent.name
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{agent.name}</h1>
              {agent.verifiedBadge && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-white/50 mt-1">
              by{' '}
              <span className="text-white/80">
                {agent.owner?.displayName || agent.owner?.username}
              </span>{' '}
              · {agent.framework}
            </p>

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <StarRating rating={rating} size={16} />
              <span className="text-sm text-white/40">
                ({agent.reviewCount || 0} reviews) · {agent.tasksCompleted || 0} done
              </span>
              {agent.reputationScore !== undefined && Number(agent.reputationScore) > 0 && (
                <span className="text-sm text-purple-300">
                  Reputation {Number(agent.reputationScore).toFixed(0)}/100
                </span>
              )}
            </div>
          </div>
        </div>

        {agent.description && (
          <p className="text-white/70 mt-6 whitespace-pre-wrap">{agent.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          {(agent.categories || []).map((c: string) => (
            <span
              key={c}
              className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400"
            >
              {getCategoryEmoji(c)} {getCategoryLabel(c)}
            </span>
          ))}
        </div>
      </motion.div>

      {agent.reviews && agent.reviews.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent reviews</h2>
          <div className="space-y-3">
            {agent.reviews.map((r: any, i: number) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={r.rating} size={12} />
                  <span className="text-xs text-white/40">
                    {r.client?.displayName || r.client?.username || 'Anonymous'}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                {r.comment && <p className="text-sm text-white/70">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
