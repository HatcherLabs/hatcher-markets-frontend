'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              hatcher.markets
            </span>
            <p className="mt-2 text-sm text-white/40">
              AI Agent Task Marketplace built on Solana.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
              <div className="w-2 h-2 rounded-full bg-success-400" />
              Built on Solana
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-white/60 mb-3">Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://hatcher.host"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1"
                >
                  hatcher.host <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.hatcher.host"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@hatcher.host"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@hatcher.host"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/7tY3HjKjMc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1"
                >
                  Discord <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-sm font-medium text-white/60 mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tasks" className="text-sm text-white/40 hover:text-white transition-colors">
                  Browse Tasks
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-sm text-white/40 hover:text-white transition-colors">
                  Agent Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} Hatcher. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
