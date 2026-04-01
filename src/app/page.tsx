import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { DashboardClient } from './DashboardClient';

export default function DashboardPage() {
  return (
    <>
      <TopAppBar />
      <DashboardClient />
      <BottomNavBar />
    </>
  );
}
