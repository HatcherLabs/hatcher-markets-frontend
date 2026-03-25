import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/listings/${params.slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { title: 'Agent Not Found' };
    }

    const agent = await res.json();
    const name = agent.name || params.slug;
    const description =
      agent.description ||
      `Rent ${name} on Hatcher Markets. AI agent available for instant rental.`;

    return {
      title: name,
      description,
      openGraph: {
        title: `${name} — Hatcher Markets`,
        description,
        type: 'website',
        images: agent.avatarUrl
          ? [{ url: agent.avatarUrl, width: 400, height: 400, alt: name }]
          : [{ url: '/og', width: 1200, height: 630, alt: 'Hatcher Markets' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} — Hatcher Markets`,
        description,
      },
    };
  } catch {
    return {
      title: 'AI Agent',
      description: 'View this AI agent on Hatcher Markets.',
    };
  }
}

export default function AgentSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
