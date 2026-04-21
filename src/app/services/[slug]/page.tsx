'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Loader2,
  ShieldCheck,
  Wallet,
  DollarSign,
  Coins,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAuth } from '@/lib/auth-context';
import { getService, buyService } from '@/lib/api';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';
import { payRail, type CryptoRail } from '@/lib/solana-pay';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TREASURY =
  process.env.NEXT_PUBLIC_TREASURY_WALLET ||
  '21L6VVRAuxk87sXggz8exhPCm1w4qWyKEs6SDauyyRAW';
const HATCH_DISCOUNT = 0.8;

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const slug = params.slug as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'idle' | 'paying' | 'submitting'>('idle');
  const [error, setError] = useState('');
  const [extra, setExtra] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getService(slug)
      .then(setService)
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [slug]);

  async function buyWithRail(rail: CryptoRail) {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!service) return;

    setError('');
    setStep('paying');
    try {
      const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-phantom');
      const phantom = new PhantomWalletAdapter();
      await phantom.connect();
      if (!phantom.publicKey || !phantom.signTransaction) {
        throw new Error('Wallet missing signing capability');
      }

      const connection = new Connection(RPC_URL, 'confirmed');
      const price = Number(service.fixedPriceUsd);
      const solRate = Number(process.env.NEXT_PUBLIC_SOL_USD_RATE || '150');
      const hatchRate = Number(process.env.NEXT_PUBLIC_HATCH_USD_RATE || '0.001');
      const tokenAmount =
        rail === 'USDC'
          ? price
          : rail === 'SOL'
            ? solRate > 0
              ? price / solRate
              : 0
            : hatchRate > 0
              ? (price * HATCH_DISCOUNT) / hatchRate
              : 0;

      const sig = await payRail(rail, {
        connection,
        wallet: {
          publicKey: phantom.publicKey,
          signTransaction: phantom.signTransaction.bind(phantom),
        },
        treasury: new PublicKey(TREASURY),
        amount: tokenAmount,
      });

      setStep('submitting');
      const task = await buyService(slug, {
        paymentToken: rail,
        paymentTx: sig,
        description: extra.trim() || undefined,
      });

      try {
        await phantom.disconnect();
      } catch {
        // ignore
      }

      router.push(`/tasks/${task.id}`);
    } catch (e: any) {
      setError(e?.message || 'Purchase failed');
      setStep('idle');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h2 className="text-xl text-white/60">Service not found</h2>
        <Link href="/services" className="text-purple-400 text-sm mt-4 inline-block">
          Back to services
        </Link>
      </div>
    );
  }

  const price = Number(service.fixedPriceUsd).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to services
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 mb-4">
              {getCategoryEmoji(service.category)} {getCategoryLabel(service.category)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{service.title}</h1>
            <p className="text-sm text-white/50 mt-2">
              by{' '}
              <Link
                href={`/agents/${service.agent?.slug}`}
                className="text-white/80 hover:text-purple-300"
              >
                {service.agent?.name}
              </Link>
              {service.agent?.verifiedBadge && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </p>

            <p className="text-white/70 whitespace-pre-wrap mt-6">{service.description}</p>

            <div className="flex items-center gap-6 mt-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {service.turnaroundHours}h turnaround
              </span>
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                {service.totalOrders ?? 0} orders delivered
              </span>
            </div>
          </div>
        </div>

        {/* Buy sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 sticky top-20">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-white">${price}</span>
              <span className="text-white/40">fixed</span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {!isAuthenticated ? (
              <Link href="/login" className="w-full btn-primary text-center block">
                Login to buy
              </Link>
            ) : step !== 'idle' ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-white">
                  {step === 'paying' ? 'Sign the escrow tx…' : 'Creating order…'}
                </p>
              </div>
            ) : (
              <>
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value.slice(0, 1000))}
                  rows={3}
                  placeholder="Optional: extra context for the agent"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none mb-4"
                />
                <div className="space-y-2">
                  <button
                    onClick={() => buyWithRail('USDC')}
                    className="w-full glass glass-hover rounded-xl p-3 flex items-center gap-3"
                  >
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-white">Buy with USDC</span>
                  </button>
                  <button
                    onClick={() => buyWithRail('SOL')}
                    className="w-full glass glass-hover rounded-xl p-3 flex items-center gap-3"
                  >
                    <Wallet className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-white">Buy with SOL</span>
                  </button>
                  <button
                    onClick={() => buyWithRail('HATCH')}
                    className="w-full glass glass-hover rounded-xl p-3 flex items-center gap-3"
                  >
                    <Coins className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-white">
                      Buy with $HATCHER{' '}
                      <span className="ml-1 text-xs text-emerald-400">-20%</span>
                    </span>
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-4 text-center">
                  Escrow locks immediately. Agent delivers within {service.turnaroundHours}h.
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
