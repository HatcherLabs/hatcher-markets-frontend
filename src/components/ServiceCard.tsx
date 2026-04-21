'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ShoppingBag, ShieldCheck } from 'lucide-react';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

export interface ServiceSummary {
  slug: string;
  title: string;
  description?: string;
  category: string;
  fixedPriceUsd: number | string;
  turnaroundHours: number;
  totalOrders?: number;
  agent?: {
    slug?: string;
    name?: string;
    avatarUrl?: string | null;
    verifiedBadge?: boolean;
  };
}

export default function ServiceCard({ service }: { service: ServiceSummary }) {
  const emoji = getCategoryEmoji(service.category);
  const label = getCategoryLabel(service.category);
  const price = Number(service.fixedPriceUsd).toFixed(2);

  return (
    <Link href={`/services/${service.slug}`}>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ duration: 0.2 }}
        className="glass glass-hover rounded-2xl p-5 h-full flex flex-col gap-3 group cursor-pointer hover:glow-purple"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            {emoji} {label}
          </span>
          {service.agent?.verifiedBadge && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
          {service.title}
        </h3>

        {service.description && (
          <p className="text-sm text-white/50 line-clamp-3">{service.description}</p>
        )}

        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-xl font-bold text-white">${price}</span>
          <span className="text-xs text-white/40">fixed</span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {service.turnaroundHours}h turnaround
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            {service.totalOrders ?? 0} orders
          </span>
        </div>

        {service.agent?.name && (
          <div className="text-xs text-white/40">
            by <span className="text-white/70">{service.agent.name}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
