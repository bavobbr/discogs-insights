'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { DiscogsRelease } from '@/lib/discogs';
import { TopAppBar } from '@/components/layout/Navigation';
import { CrateDiggingOverlay } from '@/components/ui/CrateDiggingOverlay';
import Image from 'next/image';
import { trackPersonaGenerated, trackPersonaRefreshed } from '@/lib/analytics';

interface MicroScene {
  id: number;
  title: string;
  description: string;
  tags: string[];
  color: 'primary' | 'secondary' | 'tertiary';
  signatureRecordId?: number;
  signatureRecord?: { artist: string; title: string } | null;
  signatureCover?: string | null;
}

interface PersonaData {
  title: string;
  description: string;
  microScenes: MicroScene[];
  signatureRecordId?: number;
  signatureRecord?: { artist: string; title: string };
  signatureCover?: string | null;
  images: { male: string | null; female: string | null };
  imagesReady: boolean;
  lastGenerated: string;
  cached?: boolean;
}

export default function PersonaClient() {
  const { releases, isSyncing, isAuthReady, user } = useDiscogsSync();
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [overlayRelease, setOverlayRelease] = useState<DiscogsRelease | null>(null);
  const hasTriggered = useRef(false);

  const openRelease = (id?: number) => {
    if (!id) return;
    const match = releases.find(r => r.id === id);
    if (match) setOverlayRelease(match);
  };

  useEffect(() => {
    if (!isAuthReady || isSyncing || releases.length === 0 || hasTriggered.current) return;
    hasTriggered.current = true;
    generatePersona();
  }, [releases, isSyncing, isAuthReady]);

  const generatePersona = async () => {
    setIsLoadingText(true);
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releases: releases.slice(0, 300),
          username: user?.username || 'guest',
        }),
      });

      if (!res.ok) return;

      const data: PersonaData = await res.json();
      setPersona(data);
      setIsLoadingText(false);

      if (!data.cached) {
        trackPersonaGenerated(user?.username || 'guest');
      }

      if (data.cached && data.imagesReady) return;
      generateImages(user?.username || 'guest');

    } catch (error) {
      console.error('Persona generation error:', error);
      setIsLoadingText(false);
    }
  };

  const generateImages = async (username: string) => {
    setIsLoadingImages(true);
    try {
      const res = await fetch('/api/persona/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        const { images } = await res.json();
        setPersona(prev => prev ? { ...prev, images, imagesReady: true } : prev);
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const isStubMode = !isAuthReady || isSyncing || isLoadingText || !persona;
  const generationDate = persona ? new Date(persona.lastGenerated) : null;
  const timeSinceGen = generationDate
    ? Math.round((Date.now() - generationDate.getTime()) / (1000 * 60))
    : 0;

  return (
    <>
      <TopAppBar />
      {overlayRelease && (
        <CrateDiggingOverlay
          subtitle={`${overlayRelease.basic_information.artists[0]?.name} — ${overlayRelease.basic_information.title}`}
          releases={[overlayRelease]}
          onClose={() => setOverlayRelease(null)}
        />
      )}
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-16">

        {/* Loading skeleton — nav stays visible, only content area spins */}
        {isStubMode && (
          <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center animate-in fade-in duration-500">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin-slow" />
            <div className="space-y-2 animate-pulse">
              <p className="font-headline font-black text-2xl uppercase tracking-tighter">Capturing the Pulse...</p>
              <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">Synthesizing your musical identity</p>
            </div>
          </div>
        )}

        {/* Full content — rendered once text is ready */}
        {!isStubMode && (
          <div className="space-y-16 animate-in fade-in duration-1000">

            {/* Hero */}
            <section className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="h-[2px] w-12 bg-primary" />
                    <span className="font-label font-bold text-xs tracking-widest uppercase text-secondary">ARCHIVE NO. 842-EP</span>
                  </div>
                  <h2 className="font-headline font-black text-3xl sm:text-5xl md:text-7xl uppercase tracking-tighter leading-none max-w-3xl break-words">
                    {persona!.title}
                  </h2>
                </div>
                {persona!.cached && (
                  <div className="hidden md:flex flex-col items-end text-right">
                    <div className="px-3 py-1 bg-surface-container-high border border-outline-variant/10 rounded-sm">
                      <span className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant/60">Profile Cached</span>
                    </div>
                    <p className="text-[10px] font-body italic text-on-surface-variant/40 mt-1">Generated {timeSinceGen}m ago</p>
                  </div>
                )}
              </div>
            </section>

            {/* Signature Record */}
            {(persona!.signatureCover || persona!.signatureRecord) && (
              <section
                className={`flex items-center gap-6 ${persona!.signatureRecordId ? 'cursor-pointer group/sig' : ''}`}
                onClick={() => openRelease(persona!.signatureRecordId)}
              >
                <div className="relative shrink-0 w-20 h-20 rounded-sm overflow-hidden shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform duration-300 group-hover/sig:scale-105">
                  {persona!.signatureCover ? (
                    <Image
                      src={persona!.signatureCover}
                      alt={persona!.signatureRecord?.title ?? 'Signature record'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface/20 text-3xl">album</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-label font-bold text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">Signature Record</p>
                  <p className="font-headline font-bold text-lg leading-tight tracking-tight group-hover/sig:text-primary transition-colors duration-200">{persona!.signatureRecord?.title}</p>
                  <p className="font-body text-sm text-on-surface-variant/70">{persona!.signatureRecord?.artist}</p>
                </div>
              </section>
            )}

            {/* Avatars */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['male', 'female'] as const).map(gender => (
                <div
                  key={gender}
                  className={`relative group aspect-[4/5] bg-surface-container-low overflow-hidden rounded-lg shadow-2xl transition-all duration-500 hover:shadow-${gender === 'male' ? 'primary' : 'secondary'}/5`}
                >
                  {persona!.images[gender] ? (
                    <Image
                      src={persona!.images[gender]!}
                      alt={gender === 'male' ? 'Masculine Identity' : 'Feminine Identity'}
                      fill
                      className="object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000 animate-in zoom-in-105 scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-lowest/50 animate-pulse flex items-center justify-center">
                      {isLoadingImages
                        ? <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/20">Generating...</span>
                        : <span className="material-symbols-outlined text-on-surface/5 text-6xl">person</span>
                      }
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* AI Narrative */}
            <section className="bg-surface-container-high p-8 md:p-16 relative overflow-hidden rounded-sm group border border-outline-variant/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700">
                <span className="material-symbols-outlined text-9xl scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              </div>
              <div className="relative z-10 space-y-8 max-w-3xl">
                <h3 className="font-headline font-bold text-xs uppercase tracking-[0.4em] text-tertiary">THE COLLECTOR&apos;S ARCHETYPE</h3>
                <p className="font-body text-2xl md:text-4xl italic leading-relaxed text-on-surface tracking-tight">
                  &quot;{persona!.description}&quot;
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="bg-primary-container text-on-primary-container px-8 py-4 font-label font-bold uppercase text-[10px] tracking-[0.2em] rounded-sm hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/10">
                    SHARE IDENTITY
                  </button>
                  {user && (
                    <button
                      onClick={() => {
                        if (!persona!.cached || Date.now() - generationDate!.getTime() > 60 * 60 * 1000) {
                          trackPersonaRefreshed();
                          hasTriggered.current = false;
                          setPersona(null);
                          generatePersona();
                        }
                      }}
                      disabled={!!persona!.cached && timeSinceGen < 60}
                      className="border border-outline-variant/30 text-on-surface px-8 py-4 font-label font-bold uppercase text-[10px] tracking-[0.2em] rounded-sm hover:bg-surface-bright transition-all disabled:opacity-30 disabled:cursor-not-allowed group relative"
                    >
                      <span className="group-disabled:opacity-40">REFRESH ANALYSIS</span>
                      {persona!.cached && timeSinceGen < 60 && (
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 bg-surface-container-highest p-2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity rounded-sm pointer-events-none">
                          Cooldown active. {60 - timeSinceGen}m remaining.
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Micro-Scenes */}
            <section className="space-y-12">
              <div className="space-y-4">
                <h3 className="font-headline font-black text-4xl uppercase tracking-tighter">Persona Sub-Strata</h3>
                <div className="h-[1px] w-24 bg-outline-variant/30" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 ring-1 ring-outline-variant/10 rounded-sm overflow-hidden">
                {persona!.microScenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="relative bg-surface-container-low/50 p-10 space-y-8 group hover:bg-surface-container-high transition-all duration-500 overflow-hidden"
                  >
                    {/* Cover as a very faint full-bleed background texture */}
                    {scene.signatureCover && (
                      <div className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.11] transition-opacity duration-700 pointer-events-none">
                        <Image src={scene.signatureCover} alt="" fill className="object-cover grayscale" aria-hidden />
                      </div>
                    )}

                    <div className="relative flex justify-between items-start">
                      <span className={`font-headline font-black text-7xl text-on-surface/5 transition-all duration-700 ${
                        scene.color === 'primary' ? 'group-hover:text-primary/10' :
                        scene.color === 'secondary' ? 'group-hover:text-secondary/10' : 'group-hover:text-tertiary/10'
                      }`}>
                        0{idx + 1}
                      </span>
                      <div className={`w-8 h-[2px] mt-8 ${
                        scene.color === 'primary' ? 'bg-primary' :
                        scene.color === 'secondary' ? 'bg-secondary' : 'bg-tertiary'
                      }`} />
                    </div>
                    <div className="relative space-y-4">
                      <h4 className="font-headline font-bold text-2xl leading-tight tracking-tighter">{scene.title}</h4>
                      <p className="font-body text-on-surface-variant/80 text-base leading-relaxed h-24 overflow-hidden">
                        {scene.description}
                      </p>
                    </div>
                    <div className="relative pt-4 flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {scene.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-surface-container-highest/50 text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant/60 border border-outline-variant/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {scene.signatureCover && (
                        <button
                          onClick={() => openRelease(scene.signatureRecordId)}
                          className="shrink-0 relative w-10 h-10 rounded-sm overflow-hidden opacity-50 hover:opacity-100 transition-all duration-300 ring-1 ring-white/10 hover:ring-white/30 hover:scale-110 focus:outline-none"
                          title={scene.signatureRecord ? `${scene.signatureRecord.artist} — ${scene.signatureRecord.title}` : undefined}
                        >
                          <Image src={scene.signatureCover} alt={scene.signatureRecord?.title ?? ''} fill className="object-cover" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        <div className="h-16" />
      </main>
    </>
  );
}
