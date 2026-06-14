import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Blake Aitken'
  const subtitle = searchParams.get('subtitle') ?? 'Public Artist & Architectural Designer'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          backgroundColor: '#f5f5f5',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#000000',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p
            style={{
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#888888',
              margin: 0,
            }}
          >
            — Blake Aitken
          </p>
          <h1
            style={{
              fontSize: title.length > 40 ? '36px' : '52px',
              fontWeight: 500,
              color: '#1a1a1a',
              margin: 0,
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          {subtitle && subtitle !== title && (
            <p
              style={{
                fontSize: '18px',
                color: '#888888',
                margin: 0,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Bottom location */}
        <p
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '60px',
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#888888',
            margin: 0,
          }}
        >
          Kirikiriroa, Aotearoa NZ
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
