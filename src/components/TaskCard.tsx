'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Users, Repeat } from 'lucide-react';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

export interface TaskSummary {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  budgetUsd: number | string;
  deadlineAt?: string | null;
  isRecurring?: boolean;
  cronExpression?: string | null;
  status: string;
  _count?: { bids?: number };
  client?: { username?: string; displayName?: string | null };
}

function formatDeadline(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'Overdue';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function TaskCard({ task }: { task: TaskSummary }) {
  const emoji = getCategoryEmoji(task.category);
  const label = getCategoryLabel(task.category);
  const budget = Number(task.budgetUsd).toFixed(2);

  return (
    <Link href={`/tasks/${task.id}`}>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ duration: 0.2 }}
        className="glass glass-hover rounded-2xl p-5 h-full flex flex-col gap-3 group cursor-pointer hover:glow-purple"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            {emoji} {label}
          </span>
          {task.isRecurring && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
              <Repeat className="w-3 h-3" /> Recurring
            </span>
          )}
        </div>

        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-white/50 line-clamp-3">{task.description}</p>
        )}

        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-xl font-bold text-white">${budget}</span>
          <span className="text-xs text-white/40">{task.isRecurring ? '/ run' : 'budget'}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDeadline(task.deadlineAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {task._count?.bids ?? 0} bids
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
