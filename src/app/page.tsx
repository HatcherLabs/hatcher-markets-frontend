'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bot,
  TrendingUp,
  Search,
  Palette,
  Code,
  MessageSquare,
  Layers,
  ArrowRight,
  Zap,
  CreditCard,
  Play,
} from 'lucide-react';
import AgentCard from '@/components/AgentCard';
import { getFeatured, getStats } from '@/lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const categories = [
  { name: 'Trading', icon: TrendingUp, count: 0, color: 'from-green-500/20 to-green-600/5' },
  { name: 'Research', icon: Search, count: 0, color: 'from-blue-500/20 to-blue-600/5' },
  { name: 'Support', icon: MessageSquare, count: 0, color: 'from-yellow-500/20 to-yellow-600/5' },
  { name: 'Creative', icon: Palette, count: 0, color: 'from-pink-500/20 to-pink-600/5' },
  { name: 'Dev', icon: Code, count: 0, color: 'from-cyan-500/20 to-cyan-600/5' },
  { name: 'General', icon: Layers, count: 0, color: 'from-purple-500/20 to-purple-600/5' },
];

const steps = [
  {
    icon: Search,
    title: 'Browse',
    description: 'Explore AI agents across categories — trading, research, support, and more.',
  },
  {
    icon: CreditCard,
    title: 'Pay',
    description: 'Pay hourly in SOL or $HATCH. Sign up and rent instantly.',
  },
  {
    icon: Play,
    title: 'Use',
    description: 'Your agent is live immediately. Chat, integrate, or let it run autonomously.',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAgents: 42, totalRentals: 156, activeCreators: 12 });

  useEffect(() => {
    getFeatured()
      .then(setFeatured)
      .catch(() => {});
    getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 bg-hero-glow pointer-events-none" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-purple-300 mb-6">
              <Zap className="w-4 h-4" />
              Powered by Solana
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            Rent AI Agents{' '}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              in Seconds
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-white/50 max-w-xl mx-auto"
          >
            Pay with SOL or $HATCH. No setup needed. Browse, rent, and use AI agents from top
            creators instantly.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/agents" className="btn-primary flex items-center gap-2 text-base">
              Browse Agents <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/creator" className="btn-secondary flex items-center gap-2 text-base">
              List Your Agent
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 grid grid-cols-3 gap-4 text-center"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalAgents}</div>
            <div className="text-sm text-white/40 mt-1">AI Agents</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalRentals}</div>
            <div className="text-sm text-white/40 mt-1">Total Rentals</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.activeCreators}</div>
            <div className="text-sm text-white/40 mt-1">Active Creators</div>
          </div>
        </motion.div>
      </section>

      {/* ── Featured Agents ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Agents</h2>
            <Link
              href="/agents"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 6).map((listing: any) => (
                <AgentCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Placeholder cards */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-5 h-40 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-white/5 rounded" />
                      <div className="h-3 w-16 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} href={`/agents?category=${cat.name}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`glass glass-hover rounded-xl p-4 text-center bg-gradient-to-b ${cat.color}`}
                  >
                    <Icon className="w-8 h-8 mx-auto text-white/60 mb-2" />
                    <div className="text-sm font-medium text-white">{cat.name}</div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="text-xs text-purple-400 font-medium mb-2">Step {i + 1}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-10 text-center glow-purple"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Whether you want to rent an AI agent or list your own creation, Hatcher Markets makes
            it simple.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/agents" className="btn-primary flex items-center gap-2">
              Start Renting <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/creator" className="btn-secondary flex items-center gap-2">
              <Bot className="w-4 h-4" />
              List Your Agent
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
