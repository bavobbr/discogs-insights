import { Metadata } from 'next';
import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { GenreClient } from './GenreClient';

export const metadata: Metadata = {
  title: 'Genre Matrix | Vinyl Pulse',
  description: 'A deep dive into the specific vibrations and styles that define your rotation.',
  openGraph: {
    title: 'Genre Matrix | Vinyl Pulse',
    description: 'A deep dive into the specific vibrations and styles that define your rotation.',
    url: 'https://vinyl-pulse.app/genre',
    images: [{ url: '/api/og?type=genre&title=Genre+Matrix&description=A+deep+dive+into+the+specific+vibrations+and+styles+that+define+your+rotation.', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'Genre Matrix | Vinyl Pulse',
    description: 'A deep dive into the specific vibrations and styles that define your rotation.',
    images: ['/api/og?type=genre&title=Genre+Matrix&description=A+deep+dive+into+the+specific+vibrations+and+styles+that+define+your+rotation.'],
  },
};

export default function GenrePage() {
  return (
    <>
      <TopAppBar />
      <GenreClient />
      <BottomNavBar />
    </>
  );
}
