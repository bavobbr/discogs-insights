import { TopAppBar, BottomNavBar } from '@/components/layout/Navigation';
import { GenreClient } from './GenreClient';

export default function GenrePage() {
  return (
    <>
      <TopAppBar />
      <GenreClient />
      <BottomNavBar />
    </>
  );
}
