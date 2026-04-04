import PersonaClient from './PersonaClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sonic Persona | Vinyl Pulse',
  description: 'AI-driven musical identity analysis.',
};

export default function PersonaPage() {
  return <PersonaClient />;
}
