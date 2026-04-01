"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';

export function TopAppBar() {
  const pathname = usePathname();
  const {
    isSyncing, progress, startSync, syncedCount, totalItems,
    isSyncingVault, vaultScannedCount, vaultTotalCount,
    isSyncingMasters, masterSyncedCount, masterTotalCount,
    user, logout
  } = useDiscogsSync();

  const isAnySyncing = isSyncing || isSyncingVault || isSyncingMasters;
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleRefresh = () => {
    // Start sync with force=true to bypass cache
    startSync([], 0, true);
  };

  const getDesktopNavClass = (path: string, colorCode: string) => {
    const isActive = pathname === path;
    
    let hoverClass = "hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(255,79,0,0.15)]";
    
    if (colorCode === 'teal') {
      hoverClass = "hover:text-[#76D6D5] hover:bg-[#76D6D5]/10 hover:shadow-[0_0_15px_rgba(118,214,213,0.15)]";
    } else if (colorCode === 'yellow') {
      hoverClass = "hover:text-[#E5C158] hover:bg-[#E5C158]/10 hover:shadow-[0_0_15px_rgba(229,193,88,0.15)]";
    } else if (colorCode === 'purple') {
      hoverClass = "hover:text-[#A855F7] hover:bg-[#A855F7]/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]";
    }

    const baseClass = "px-5 py-2 rounded-full transition-all duration-300 font-headline font-bold text-[10px] uppercase tracking-[0.2em] active:scale-95 block";
    
    if (isActive) {
      return `${baseClass} text-[#E5E2E1] ${hoverClass} cursor-default`;
    }
    return `${baseClass} text-[#E5E2E1]/50 ${hoverClass}`;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-[#E5E2E1]/5 text-shadow-sm">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-sm transform rotate-45 shadow-lg group-hover:scale-105 transition-transform">
               <span className="material-symbols-outlined text-surface text-xl -rotate-45 font-bold">graphic_eq</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-[#E5E2E1] uppercase font-headline">VINYL PULSE</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-2 pl-6 ml-2 h-8">
            <Link href="/" className={getDesktopNavClass("/", "primary")}>
               Collection
            </Link>
            <Link href="/genre" className={getDesktopNavClass("/genre", "teal")}>
               Genre Matrix
            </Link>
            <Link href="/decades" className={getDesktopNavClass("/decades", "yellow")}>
               Decade Heatmap
            </Link>
            <Link href="/vault" className={getDesktopNavClass("/vault", "purple")}>
               The Vault
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            {isAnySyncing && (
              <div className="flex flex-col items-end gap-1.5 mr-2">
                {isSyncing && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest animate-pulse">
                      Collection {syncedCount}/{totalItems}
                    </span>
                    <div className="w-16 h-0.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {isSyncingMasters && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest animate-pulse">
                      Origins {masterSyncedCount}/{masterTotalCount}
                    </span>
                    <div className="w-16 h-0.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${masterTotalCount > 0 ? (masterSyncedCount / masterTotalCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}
                {isSyncingVault && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#A855F7] uppercase tracking-widest animate-pulse">
                      Vault {vaultScannedCount}/{vaultTotalCount}
                    </span>
                    <div className="w-16 h-0.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-[#A855F7] transition-all duration-300" style={{ width: `${vaultTotalCount > 0 ? (vaultScannedCount / vaultTotalCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={handleRefresh}
              disabled={isAnySyncing}
              title="Force Refresh Collection"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 active:scale-95 transition-all group ${isAnySyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`material-symbols-outlined text-sm ${isAnySyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>sync</span>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Refresh</span>
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-surface-container-high border border-[#E5E2E1]/10 overflow-hidden ring-2 ring-primary/20 hover:ring-primary transition-all relative group"
            >
              {user ? (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-[#E5E2E1]/50 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">person</span>
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-[#E5E2E1]/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="text-[10px] text-[#E5E2E1]/50 uppercase tracking-widest font-bold">Authenticated as</p>
                      <p className="text-sm font-headline font-bold text-primary truncate">{user.username}</p>
                    </div>
                    <button 
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-xs font-bold text-[#E5E2E1]/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="text-xs font-bold text-[#E5E2E1]">Guest Mode</p>
                      <p className="text-[10px] text-[#E5E2E1]/50 leading-tight mt-1">Viewing default library. Connect your own Discogs for personalized insights.</p>
                    </div>
                    <Link 
                      href="/api/auth/login"
                      className="flex items-center gap-3 px-4 py-3 text-left bg-primary hover:bg-primary/90 text-surface rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">link</span>
                      <span className="text-xs font-black uppercase tracking-wider">Connect Discogs</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Pulse Line (Global Progress indicator) */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-transparent overflow-hidden">
        {isAnySyncing && (
          <div
            className="h-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(255,79,0,0.8)] transition-all duration-500 ease-out"
            style={{
              width: `${progress || (isSyncingMasters ? (masterSyncedCount / Math.max(1, masterTotalCount)) * 100 : 0) || (isSyncingVault ? (vaultScannedCount / Math.max(1, vaultTotalCount)) * 100 : 0)}%`,
              transform: `translateX(${-100 + (progress || (isSyncingMasters ? (masterSyncedCount / Math.max(1, masterTotalCount)) * 100 : 0) || (isSyncingVault ? (vaultScannedCount / Math.max(1, vaultTotalCount)) * 100 : 0))}%)`
            }}
          />
        )}
      </div>
    </header>
  );
}

export function BottomNavBar() {
  const pathname = usePathname();

  const getNavClass = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex flex-col items-center gap-1 text-[#76D6D5] scale-110 active:scale-90 transition-transform duration-200";
    }
    return "flex flex-col items-center gap-1 text-[#E5E2E1]/50 hover:text-[#FF4F00] transition-colors duration-300";
  };

  const getIconStyle = (path: string) => {
    return pathname === path ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  return (
    <nav className="lg:hidden fixed bottom-0 w-full flex justify-around items-center h-20 px-8 pb-safe bg-[#2A2A2A]/90 backdrop-blur-2xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#E5E2E1]/10">
      <Link href="/" className={getNavClass("/")}>
        <span className="material-symbols-outlined" style={getIconStyle("/")}>grid_view</span>
        <span className="font-headline font-bold uppercase text-[8px] tracking-widest">COLLECTION</span>
      </Link>
      <Link href="/genre" className={getNavClass("/genre")}>
        <span className="material-symbols-outlined" style={getIconStyle("/genre")}>pie_chart</span>
        <span className="font-headline font-bold uppercase text-[8px] tracking-widest">GENRE</span>
      </Link>
      <Link href="/decades" className={getNavClass("/decades")}>
        <span className="material-symbols-outlined" style={getIconStyle("/decades")}>layers</span>
        <span className="font-headline font-bold uppercase text-[8px] tracking-widest">DECADES</span>
      </Link>
      <Link href="/vault" className={getNavClass("/vault")}>
        <span className="material-symbols-outlined" style={getIconStyle("/vault")}>lock</span>
        <span className="font-headline font-bold uppercase text-[8px] tracking-widest">THE VAULT</span>
      </Link>
    </nav>
  );
}
