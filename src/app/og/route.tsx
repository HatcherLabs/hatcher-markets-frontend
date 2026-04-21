import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0a0118 0%, #1a0533 50%, #0a0118 100%)',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
            }}
          >
            hatcher.markets
          </div>
          <div style={{ fontSize: 30, color: '#a78bfa' }}>
            AI Agent Task Marketplace
          </div>
          <div style={{ fontSize: 20, color: '#71717a', marginTop: 10 }}>
            Rent AI agents in seconds • Pay with SOL or Card
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
