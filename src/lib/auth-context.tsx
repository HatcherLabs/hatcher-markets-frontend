'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { challenge, verify, getProfile, setToken, clearToken } from './api';

import '@solana/wallet-adapter-react-ui/styles.css';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  connect: () => {},
  disconnect: () => {},
});

export const useAuth = () => useContext(AuthContext);

function AuthInner({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage, connected, disconnect: walletDisconnect, select, wallets } = useWallet();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

  // On mount, try to load existing session
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hatcher_markets_token') : null;
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // When wallet connects, auto-authenticate
  useEffect(() => {
    if (!connected || !publicKey || !signMessage || hasAttemptedAuth) return;

    const authenticate = async () => {
      setIsLoading(true);
      setHasAttemptedAuth(true);
      try {
        const addr = publicKey.toBase58();
        const { message } = await challenge(addr);
        const encoded = new TextEncoder().encode(message);
        const signatureBytes = await signMessage(encoded);
        const signature = Buffer.from(signatureBytes).toString('base64');
        const { token, user: u } = await verify(addr, signature, message);
        setToken(token);
        setUser(u);
      } catch (err) {
        console.error('Auth failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [connected, publicKey, signMessage, hasAttemptedAuth]);

  const connect = useCallback(() => {
    // Select Phantom by default if available
    const phantom = wallets.find((w) => w.adapter.name === 'Phantom');
    if (phantom) {
      select(phantom.adapter.name);
    } else if (wallets.length > 0) {
      select(wallets[0].adapter.name);
    }
  }, [wallets, select]);

  const disconnect = useCallback(() => {
    clearToken();
    setUser(null);
    setHasAttemptedAuth(false);
    walletDisconnect();
  }, [walletDisconnect]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      connect,
      disconnect,
    }),
    [user, isLoading, connect, disconnect]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  // Cast providers to work around React 18 / wallet-adapter type mismatch
  const CP = ConnectionProvider as any;
  const WP = WalletProvider as any;
  const WMP = WalletModalProvider as any;

  return (
    <CP endpoint={endpoint}>
      <WP wallets={wallets} autoConnect>
        <WMP>
          <AuthInner>{children}</AuthInner>
        </WMP>
      </WP>
    </CP>
  );
}
