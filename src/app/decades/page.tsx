import { Metadata } from 'next';
import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { DecadesClient } from './DecadesClient';

export const metadata: Metadata = {
  title: 'Decade Heatmap | Vinyl Pulse',
  description: 'A visual archeology of sound, tracing the evolution of your collection from mid-century jazz to contemporary digital-analog hybrids.',
  openGraph: {
    title: 'Decade Heatmap | Vinyl Pulse',
    description: 'A visual archeology of sound, tracing the evolution of your collection across decades.',
    url: 'https://vinyl-pulse.app/decades',
    images: [{ url: '/api/og?type=decades&title=Decade+Heatmap&description=A+visual+archeology+of+sound+across+your+collection.', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'Decade Heatmap | Vinyl Pulse',
    description: 'A visual archeology of sound across your collection.',
    images: ['/api/og?type=decades&title=Decade+Heatmap&description=A+visual+archeology+of+sound+across+your+collection.'],
  },
};

export default function DecadesPage() {
  return (
    <>
      <TopAppBar />
      <DecadesClient />
      <BottomNavBar />
    </>
  );
}
