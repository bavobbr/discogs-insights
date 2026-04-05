import { Metadata } from 'next';
import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Vinyl Pulse — Crate Digger Dashboard',
  description: 'A deep groove vinyl collection dashboard. Explore your records, genres, artists and decades.',
  openGraph: {
    title: 'Vinyl Pulse — Crate Digger Dashboard',
    description: 'A deep groove vinyl collection dashboard. Explore your records, genres, artists and decades.',
    url: 'https://vinyl-pulse.app',
    images: [{ url: '/api/og?type=collection&title=Vinyl+Pulse&description=A+deep+groove+crate+digger+dashboard.', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'Vinyl Pulse — Crate Digger Dashboard',
    description: 'A deep groove vinyl collection dashboard.',
    images: ['/api/og?type=collection&title=Vinyl+Pulse&description=A+deep+groove+crate+digger+dashboard.'],
  },
};

export default function DashboardPage() {
  return (
    <>
      <TopAppBar />
      <DashboardClient />
      <BottomNavBar />
    </>
  );
}
