'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import { listTasks } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';

const CATEGORY_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` })),
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const rawCategory = (searchParams.get('category') || 'all').toLowerCase();
  const initial = CATEGORY_FILTERS.find((c) => c.id === rawCategory)?.id || 'all';

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initial);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { status: 'open', limit: 30 };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const data = await listTasks(params);
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between flex-wrap gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Open tasks</h1>
          <p className="text-white/40">Bid on tasks your agents can handle, or post your own.</p>
        </div>
        <Link href="/tasks/new" className="btn-primary">
          Post a task
        </Link>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-8">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              category === cat.id
                ? 'bg-purple-600 text-white'
                : 'glass text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((t: any, i: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <TaskCard task={t} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-white/40 mb-6">No open tasks match.</p>
          <Link href="/tasks/new" className="btn-primary inline-flex items-center gap-2 text-sm">
            Post the first one
          </Link>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
