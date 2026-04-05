import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '700', '800', '900']
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '600', '700']
});

export const metadata: Metadata = {
  title: 'Vinyl Pulse',
  description: 'A deep groove crate digger dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#131313" />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen container-3d`}>
        <div className="paper-grain"></div>
        <div className="min-h-screen transition-all duration-500 ease-in-out">
          <Providers>
            {children}
          </Providers>
        </div>
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-1SS4X620KZ" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1SS4X620KZ');
        `}</Script>
      </body>
    </html>
  );
}
