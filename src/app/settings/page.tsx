'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Save, User, Mail, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { updateProfile } from '@/lib/api';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  async function handleSave() {
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your profile and account</p>
      </motion.div>

      {/* Account Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Account</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/40 mb-1">Email</label>
            <p className="text-white font-mono text-sm">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-1">Username</label>
            <p className="text-white font-mono text-sm">{user.username}</p>
          </div>
          {user.walletAddress && (
            <div>
              <label className="block text-sm text-white/40 mb-1">Linked Wallet</label>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-sm">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(user.walletAddress!)}
                  className="text-xs px-2 py-1 rounded-lg glass glass-hover text-white/40 hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm mb-4">
            Profile saved successfully!
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {avatarUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-xs text-white/40">Preview</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Profile
          </button>
        </div>
      </motion.div>

      {/* Creator Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Account Status</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">Creator:</span>
          {user.isCreator ? (
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Creator
            </span>
          ) : (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
              Not a creator
            </span>
          )}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-medium px-6 py-3 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </motion.div>
    </div>
  );
}
