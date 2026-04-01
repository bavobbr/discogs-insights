import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { VaultClient } from './VaultClient';

export const metadata = {
  title: 'The Vault | Vinyl Pulse',
  description: 'A high-fidelity showcase of your most coveted, rare, and personal masterpieces.',
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
