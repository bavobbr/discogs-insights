import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const BASE = 'https://vinyl-pulse.app';

// Colours
const SURFACE  = '#131313';
const PRIMARY  = '#FF4F00';
const WHITE    = '#E5E2E1';
const MUTED    = 'rgba(229,226,225,0.45)';
const CARD_BG  = '#1E1E1E';

async function loadFont(weight: 400 | 700 | 900): Promise<ArrayBuffer> {
  const axes = `ital,opsz,wght@0,14..32,${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=Inter:${axes}&display=swap`;
  const css = await fetch(url).then(r => r.text());
  const match = css.match(/src: url\(([^)]+)\) format\('woff2'\)/);
  if (!match) throw new Error('Could not parse Google Fonts CSS');
  return fetch(match[1]).then(r => r.arrayBuffer());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type        = searchParams.get('type') || 'default';
  const title       = searchParams.get('title') || 'Vinyl Pulse';
  const description = searchParams.get('description') || 'A deep groove crate digger dashboard.';
  const image       = searchParams.get('image');   // persona portrait URL

  const [boldFont, blackFont] = await Promise.all([
    loadFont(700),
    loadFont(900),
  ]);

  const fonts = [
    { name: 'Inter', data: boldFont,  weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: blackFont, weight: 900 as const, style: 'normal' as const },
  ];

  // ─── Persona card ────────────────────────────────────────────────────────────
  if (type === 'persona') {
    return new ImageResponse(
      <div
        style={{
          display: 'flex', width: '100%', height: '100%',
          background: SURFACE, fontFamily: 'Inter',
        }}
      >
        {/* Portrait — right half */}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute', right: 0, top: 0,
              width: '50%', height: '100%', objectFit: 'cover',
            }}
          />
        )}
        {/* Gradient fade over portrait */}
        <div style={{
          position: 'absolute', inset: 0,
          background: image
            ? 'linear-gradient(90deg, #131313 45%, rgba(19,19,19,0.6) 70%, rgba(19,19,19,0.1) 100%)'
            : 'none',
          display: 'flex',
        }} />

        {/* Left content */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '56px 64px', width: image ? '60%' : '100%', position: 'relative',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, background: PRIMARY,
              transform: 'rotate(45deg)', flexShrink: 0,
            }} />
            <span style={{
              fontSize: 14, fontWeight: 900, color: WHITE,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginLeft: 8,
            }}>
              VINYL PULSE
            </span>
          </div>

          {/* Persona content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: PRIMARY,
              letterSpacing: '0.35em', textTransform: 'uppercase',
            }}>
              SONIC PERSONA
            </span>
            <span style={{
              fontSize: title.length > 30 ? 44 : 56,
              fontWeight: 900, color: WHITE,
              letterSpacing: '-0.03em', lineHeight: 1.0,
              textTransform: 'uppercase',
            }}>
              {title}
            </span>
            <span style={{
              fontSize: 18, fontWeight: 400, color: MUTED,
              lineHeight: 1.5, maxWidth: 500,
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {description}
            </span>
          </div>

          {/* Footer */}
          <span style={{
            fontSize: 12, fontWeight: 700, color: MUTED,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            vinyl-pulse.app
          </span>
        </div>
      </div>,
      { width: 1200, height: 630, fonts }
    );
  }

  // ─── Default branded card ─────────────────────────────────────────────────
  const pageLabels: Record<string, string> = {
    collection: 'COLLECTION',
    genre:      'GENRE MATRIX',
    artists:    'TOP ARTISTS',
    decades:    'DECADE HEATMAP',
    vault:      'THE VAULT',
  };
  const pageLabel = pageLabels[type] || null;

  return new ImageResponse(
    <div
      style={{
        display: 'flex', width: '100%', height: '100%',
        background: SURFACE, fontFamily: 'Inter',
        padding: '56px 72px',
      }}
    >
      {/* Decorative vinyl rings — top right */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        border: '1px solid rgba(255,79,0,0.12)', display: 'flex',
      }} />
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 280, height: 280, borderRadius: '50%',
        border: '1px solid rgba(255,79,0,0.08)', display: 'flex',
      }} />
      <div style={{
        position: 'absolute', top: 80, right: 80,
        width: 120, height: 120, borderRadius: '50%',
        background: CARD_BG, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#0E0E0E', border: '4px solid #2A2A2A', display: 'flex',
        }} />
      </div>

      {/* Left: content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', flex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, background: PRIMARY,
            transform: 'rotate(45deg)', flexShrink: 0,
          }} />
          <span style={{
            fontSize: 16, fontWeight: 900, color: WHITE,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginLeft: 10,
          }}>
            VINYL PULSE
          </span>
        </div>

        {/* Main text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {pageLabel && (
            <span style={{
              fontSize: 12, fontWeight: 700, color: PRIMARY,
              letterSpacing: '0.4em', textTransform: 'uppercase',
            }}>
              {pageLabel}
            </span>
          )}
          <span style={{
            fontSize: title === 'Vinyl Pulse' ? 80 : 60,
            fontWeight: 900, color: WHITE,
            letterSpacing: '-0.03em', lineHeight: 1.0,
            textTransform: 'uppercase',
          }}>
            {title}
          </span>
          <span style={{
            fontSize: 22, fontWeight: 400, color: MUTED,
            lineHeight: 1.5, maxWidth: 620,
          }}>
            {description}
          </span>
        </div>

        {/* Footer */}
        <span style={{
          fontSize: 13, fontWeight: 700, color: MUTED,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          vinyl-pulse.app
        </span>
      </div>
    </div>,
    { width: 1200, height: 630, fonts }
  );
}
