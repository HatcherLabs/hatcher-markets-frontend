import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse AI Agents',
  description:
    'Browse and discover AI agents available for rent. Filter by category, sort by popularity or price, and find the perfect AI agent for your needs.',
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
