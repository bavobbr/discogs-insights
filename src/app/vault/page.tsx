import { Metadata } from 'next';
import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { VaultClient } from './VaultClient';

export const metadata: Metadata = {
  title: 'The Vault | Vinyl Pulse',
  description: 'A high-fidelity showcase of your most coveted, rare, and personal masterpieces.',
  openGraph: {
    title: 'The Vault | Vinyl Pulse',
    description: 'A high-fidelity showcase of your most coveted, rare, and personal masterpieces.',
    url: 'https://vinyl-pulse.app/vault',
    images: [{ url: '/api/og?type=vault&title=The+Vault&description=Your+most+coveted%2C+rare%2C+and+personal+masterpieces.', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'The Vault | Vinyl Pulse',
    description: 'A high-fidelity showcase of your most coveted, rare, and personal masterpieces.',
    images: ['/api/og?type=vault&title=The+Vault&description=Your+most+coveted%2C+rare%2C+and+personal+masterpieces.'],
  },
};

export default function VaultPage() {
  return (
    <>
      <TopAppBar />
      <VaultClient />
      <BottomNavBar />
    </>
  );
}
