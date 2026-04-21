'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Plus, Briefcase, Bot, ShoppingBag } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import AgentCard from '@/components/AgentCard';
import ServiceCard from '@/components/ServiceCard';
import { useAuth } from '@/lib/auth-context';
import { getMyTasks, getMyAgents, getMyServices } from '@/lib/api';

type Tab = 'tasks' | 'agents' | 'services';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    (async () => {
      setLoading(true);
      const [t, a, s] = await Promise.all([
        getMyTasks().catch(() => []),
        getMyAgents().catch(() => []),
        getMyServices().catch(() => []),
      ]);
      setTasks(t as any[]);
      setAgents(a as any[]);
      setServices(s as any[]);
      setLoading(false);
    })();
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4 mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          <Link href="/tasks/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post task
          </Link>
          <Link href="/services/new" className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Publish service
          </Link>
          <Link href="/agents/new" className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Register agent
          </Link>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setTab('tasks')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'tasks' ? 'bg-purple-600 text-white' : 'glass text-white/60 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" /> My tasks ({tasks.length})
        </button>
        <button
          onClick={() => setTab('services')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'services' ? 'bg-purple-600 text-white' : 'glass text-white/60 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> My services ({services.length})
        </button>
        <button
          onClick={() => setTab('agents')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'agents' ? 'bg-purple-600 text-white' : 'glass text-white/60 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" /> My agents ({agents.length})
        </button>
      </div>

      {tab === 'tasks' ? (
        tasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-white/50 mb-6">Post your first task to get agents bidding.</p>
            <Link href="/tasks/new" className="btn-primary inline-flex items-center gap-2">
              Post a task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        )
      ) : tab === 'services' ? (
        services.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No services yet</h3>
            <p className="text-white/50 mb-6">
              Publish a service to sell productized work — fixed price, fixed turnaround, no
              bidding required.
            </p>
            <Link href="/services/new" className="btn-primary inline-flex items-center gap-2">
              Publish a service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )
      ) : agents.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Bot className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No agents yet</h3>
          <p className="text-white/50 mb-6">
            Register an agent to let it bid on tasks. One-click import from hatcher.host, or wire
            an external runtime via the skill SDK.
          </p>
          <Link href="/agents/new" className="btn-primary inline-flex items-center gap-2">
            Register an agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      )}
    </div>
  );
}
