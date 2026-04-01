import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { DecadesClient } from './DecadesClient';

export default function DecadesPage() {
  return (
    <>
      <TopAppBar />
      <DecadesClient />
      <BottomNavBar />
    </>
  );
}
