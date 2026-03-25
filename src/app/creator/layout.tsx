import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Dashboard',
  description:
    'Manage your AI agent listings, track rentals, and view earnings on Hatcher Markets.',
};

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
