'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Wallet, CreditCard, Coins, CheckCircle } from 'lucide-react';
import { createRental, createStripeCheckout } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  hours: number;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, listing, hours, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'select' | 'connecting' | 'signing' | 'submitting' | 'redirecting' | 'success'>('select');
  const [error, setError] = useState('');

  const hourlyRate = listing?.hourlyRateSol || listing?.hourlyRate || 0;
  const totalSol = (hourlyRate * hours).toFixed(4);
  const totalHatch = (hourlyRate * hours * 0.8).toFixed(4); // 20% discount

  async function handlePayWithSol() {
    setError('');
    setStep('connecting');

    try {
      // Dynamically import wallet adapter only when needed
      const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-wallets');
      const phantom = new PhantomWalletAdapter();

      await phantom.connect();
      setStep('signing');

      // In production, you would create and sign a Solana transaction here
      // For now, we simulate the flow
      const walletAddress = phantom.publicKey?.toBase58() || '';

      setStep('submitting');

      // Create the rental via API
      await createRental({
        listingId: listing.id,
        hours,
        paymentTx: `pending_sol_${walletAddress}_${Date.now()}`,
      });

      await phantom.disconnect();
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('select');
    }
  }

  async function handlePayWithHatch() {
    setError('');
    setStep('connecting');

    try {
      const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-wallets');
      const phantom = new PhantomWalletAdapter();

      await phantom.connect();
      setStep('signing');

      const walletAddress = phantom.publicKey?.toBase58() || '';

      setStep('submitting');

      await createRental({
        listingId: listing.id,
        hours,
        paymentTx: `pending_hatch_${walletAddress}_${Date.now()}`,
        paymentToken: 'HATCH',
      });

      await phantom.disconnect();
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('select');
    }
  }

  async function handlePayWithCard() {
    setError('');
    setStep('submitting');

    try {
      const { url } = await createStripeCheckout({
        listingId: listing.id,
        hours,
        returnUrl: window.location.origin,
      });

      if (url) {
        setStep('redirecting');
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create checkout session. Please try again.');
      setStep('select');
    }
  }

  function handleClose() {
    if (step === 'submitting' || step === 'signing') return; // Don't close during transaction
    setStep('select');
    setError('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass rounded-2xl p-6 w-full max-w-md glow-purple"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {step === 'success' ? 'Payment Successful' : 'Choose Payment Method'}
              </h3>
              {step !== 'submitting' && step !== 'signing' && (
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Success state */}
            {step === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Rental created successfully!</p>
                <p className="text-sm text-white/40">Redirecting to dashboard...</p>
              </div>
            )}

            {/* Loading states */}
            {(step === 'connecting' || step === 'signing' || step === 'submitting' || step === 'redirecting') && (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">
                  {step === 'connecting' && 'Connecting wallet...'}
                  {step === 'signing' && 'Please sign the transaction in your wallet...'}
                  {step === 'submitting' && 'Processing payment...'}
                  {step === 'redirecting' && 'Redirecting to Stripe Checkout...'}
                </p>
              </div>
            )}

            {/* Selection state */}
            {step === 'select' && (
              <>
                {/* Cost summary */}
                <div className="glass rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/40">Agent</span>
                    <span className="text-sm text-white">{listing?.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/40">Duration</span>
                    <span className="text-sm text-white">{hours} hour{hours !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/40">Rate</span>
                    <span className="text-sm text-white">{hourlyRate} SOL/hr</span>
                  </div>
                  <div className="border-t border-white/5 mt-3 pt-3 flex items-center justify-between">
                    <span className="text-sm text-white/60 font-medium">Total</span>
                    <span className="text-lg font-bold text-white">{totalSol} SOL</span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                    {error}
                  </div>
                )}

                {/* Payment buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePayWithSol}
                    className="w-full flex items-center gap-3 p-4 rounded-xl glass glass-hover transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                        Pay with SOL
                      </p>
                      <p className="text-xs text-white/40">{totalSol} SOL</p>
                    </div>
                  </button>

                  <button
                    onClick={handlePayWithHatch}
                    className="w-full flex items-center gap-3 p-4 rounded-xl glass glass-hover transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                        Pay with Tokens
                        <span className="ml-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          20% off
                        </span>
                      </p>
                      <p className="text-xs text-white/40">{totalHatch} tokens</p>
                    </div>
                  </button>

                  <button
                    onClick={handlePayWithCard}
                    className="w-full flex items-center gap-3 p-4 rounded-xl glass glass-hover transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                        Pay with Card
                      </p>
                      <p className="text-xs text-white/40">~${(parseFloat(totalSol) * 150).toFixed(2)} USD via Stripe</p>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-white/20 text-center mt-4">
                  Your wallet will open in a popup to sign the transaction.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
