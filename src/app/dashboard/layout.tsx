import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Rentals',
  description:
    'View and manage your active AI agent rentals on Hatcher Markets.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
