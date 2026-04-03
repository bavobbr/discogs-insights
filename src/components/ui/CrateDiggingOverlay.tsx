"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { DiscogsRelease } from '@/lib/discogs';

export interface CrateDiggingOverlayProps {
  title?: string;
  subtitle: string;
  releases: DiscogsRelease[];
  onClose: () => void;
}

export function CrateDiggingOverlay({ title = "Crate Digging", subtitle, releases, onClose }: CrateDiggingOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFlip = (dir: 'next' | 'prev') => {
    if (isFlipping || releases.length <= 1) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    setIsFlipping(true);
    setDirection(dir);

    setTimeout(() => {
      if (dir === 'next') {
        setActiveIndex((prev) => (prev + 1) % releases.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + releases.length) % releases.length);
      }
      setIsFlipping(false);
    }, 300); // Matched with transition duration
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      handleFlip('next');
    } else if (isDownSwipe) {
      handleFlip('prev');
    }
  };

  if (!releases || releases.length === 0) {
    return null;
  }

  const currentRelease = releases[activeIndex];
  
  // Calculate next image index
  let nextImgIndex = activeIndex;
  if (isFlipping) {
    nextImgIndex = direction === 'next' 
      ? (activeIndex + 1) % releases.length 
      : (activeIndex - 1 + releases.length) % releases.length;
  }

  const overlay = (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-2xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Centering wrapper — min-h-full so short content stays centered, scrolls when tall */}
      <div className="relative min-h-full flex items-center justify-center p-6 pt-16 sm:p-12">
      <div className="relative w-full max-w-lg z-10 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-4 w-10 h-10 bg-black/40 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all z-50 group"
          aria-label="Close overlay"
        >
          <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:opacity-100 transition-opacity">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="font-headline font-black text-xs tracking-widest text-primary uppercase">{subtitle}</span>
          <h3 className="font-headline font-black text-3xl text-white uppercase tracking-tighter">{title}</h3>
        </div>

        {/* The "Crate" Visualizer */}
        <div
          className="relative w-full aspect-square flex items-center justify-center mb-8 touch-none pointer-events-auto"
          style={{ perspective: '1200px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Stack Background (Faint record behind) */}
          <div
            className="absolute inset-0 scale-[0.98] translate-y-2 bg-surface-container-highest rounded-sm opacity-40 shadow-inner"
            style={{ transform: 'translateZ(-20px)' }}
          ></div>

          {/* Active Record Card */}
          <div
            onClick={() => handleFlip('next')}
            className={`relative w-full aspect-square bg-surface shadow-2xl rounded-sm overflow-hidden cursor-pointer group/card
              ${isFlipping ? 'transition-all duration-300 ease-in' : 'transition-none'}
              ${isFlipping ? (direction === 'next' ? '[transform:rotateX(-90deg)_translateY(-80px)] opacity-0' : '[transform:rotateX(90deg)_translateY(80px)] opacity-0') : '[transform:rotateX(0deg)_translateY(0)] opacity-100'}
            `}
            style={{
              transformOrigin: direction === 'next' ? 'bottom' : 'top',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            {currentRelease?.basic_information.cover_image ? (
              <Image
                src={currentRelease.basic_information.cover_image}
                alt="Album cover"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 512px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-variant/20">
                <span className="material-symbols-outlined text-outline text-6xl opacity-20">album</span>
              </div>
            )}

            {/* Vinyl Grooves Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>

          {/* Next Record Preview (Behind active) */}
          {(isFlipping || true) && releases.length > 1 && (
            <div
              className={`absolute inset-0 bg-surface shadow-xl rounded-sm overflow-hidden z-[-1] transition-transform duration-300 
                ${isFlipping ? 'scale-100' : 'scale-[0.98] translate-y-1'}`}
            >
              <Image
                src={releases[nextImgIndex]?.basic_information.cover_image}
                alt="Album cover"
                className="object-cover opacity-80"
                fill
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          )}
        </div>

        {/* Record Info */}
        <div className="text-center w-full min-h-[100px] flex flex-col items-center">
          <h4 className="font-headline font-black text-xl text-white uppercase tracking-tight leading-none mb-1">
            {currentRelease?.basic_information.title}
          </h4>
          <p className="font-body italic text-[#76D6D5] mb-6">
            {currentRelease?.basic_information.artists[0]?.name}
          </p>

          {/* Navigation Controls */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleFlip('prev')}
              className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all ${releases.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFlipping || releases.length <= 1}
            >
              <span className="material-symbols-outlined text-white">chevron_left</span>
            </button>

            <a
              href={`https://www.discogs.com/release/${currentRelease?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-primary text-black font-headline font-black uppercase text-xs tracking-widest rounded-full hover:bg-primary/80 transition-colors"
            >
              DISCOGS INFO
            </a>

            <button
              onClick={() => handleFlip('next')}
              className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all ${releases.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFlipping || releases.length <= 1}
            >
              <span className="material-symbols-outlined text-white">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Pagination State */}
        <div className="mt-8 flex gap-1">
          <span className="font-headline font-black text-[10px] text-white/40 tracking-[0.3em] uppercase">
            {activeIndex + 1} / {releases.length}
          </span>
        </div>
      </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
