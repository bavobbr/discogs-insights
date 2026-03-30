"use client";

import React, { useEffect, useMemo } from 'react';
import { useDiscogsSync } from '@/context/DiscogsSyncContext';
import { identifyVaultCandidates, DiscogsRelease } from '@/lib/discogs';
import { VaultPedestal } from '@/components/visualizations/VaultPedestal';
import { RecordOverlay } from '@/components/ui/RecordOverlay';
import { LightweightRelease } from '@/components/ui/RecentGrid';

interface VaultClientProps {
  initialReleases: DiscogsRelease[];
}

export function VaultClient({ initialReleases }: VaultClientProps) {
  const { 
    releases: contextReleases, 
    vaultMetadata, 
    isSyncingVault, 
    syncVaultData, 
    isSyncing, 
    progress, 
    vaultScannedCount, 
    vaultTotalCount 
  } = useDiscogsSync();
  const [selectedRelease, setSelectedRelease] = React.useState<DiscogsRelease | null>(null);

  const releases = contextReleases.length > 0 ? contextReleases : initialReleases;

  // Identify candidates for the vault
  const candidates = useMemo(() => identifyVaultCandidates(releases), [releases]);

  // Trigger a full collection scan for the vault
  useEffect(() => {
    // Only start the Vault sync once the main collection sync is finished (!isSyncing)
    if (releases.length > 0 && !isSyncing && !isSyncingVault && Object.keys(vaultMetadata).length < releases.length) {
      const allIds = releases.map(r => r.id);
      syncVaultData(allIds);
    }
  }, [releases, isSyncing, isSyncingVault, syncVaultData, vaultMetadata]);

  // Derived Categories
  const grails = useMemo(() => {
    return [...releases]
      .filter(r => vaultMetadata[r.id]?.lowest_price !== undefined || r.rating === 5)
      .sort((a, b) => {
        const priceA = vaultMetadata[a.id]?.lowest_price || 0;
        const priceB = vaultMetadata[b.id]?.lowest_price || 0;
        if (priceB !== priceA) return priceB - priceA;
        return (b.rating || 0) - (a.rating || 0); // Fallback to rating
      })
      .slice(0, 11);
  }, [releases, vaultMetadata]);
  
  const mostCoveted = useMemo(() => {
    return releases
      .filter(c => vaultMetadata[c.id])
      .sort((a, b) => {
        const d_a = vaultMetadata[a.id];
        const d_b = vaultMetadata[b.id];
        const ratioA = d_a.community.want / Math.max(1, d_a.community.have);
        const ratioB = d_b.community.want / Math.max(1, d_b.community.have);
        return ratioB - ratioA;
      })
      .slice(0, 8);
  }, [releases, vaultMetadata]);

  const hiddenGems = useMemo(() => {
    const grailIds = new Set(grails.map(g => g.id));
    return releases
      .filter(c => !grailIds.has(c.id) && c.rating === 5)
      .sort((a, b) => {
        const haveA = vaultMetadata[a.id]?.community.have || 999999;
        const haveB = vaultMetadata[b.id]?.community.have || 999999;
        return haveA - haveB; // Lower "have" count = more of a "gem"
      })
      .slice(0, 8);
  }, [releases, grails, vaultMetadata]);

  // Utility to map DiscogsRelease to LightweightRelease for the overlay
  const mapToLightweight = (r: DiscogsRelease): LightweightRelease => ({
    id: r.id,
    title: r.basic_information.title,
    artist: r.basic_information.artists[0]?.name || 'Unknown Artist',
    imageUrl: r.basic_information.cover_image,
    releaseId: r.id,
    year: r.basic_information.year,
    genres: r.basic_information.genres || [],
    styles: r.basic_information.styles || [],
    label: r.basic_information.labels[0]?.name,
    catno: r.basic_information.labels[0]?.catno,
    formats: r.basic_information.formats?.map(f => 
      f.name + (f.descriptions ? ` (${f.descriptions.join(', ')})` : '')
    ).join(', '),
    dateAdded: r.date_added
  });

  return (
    <main className="pt-24 pb-32 px-6 min-h-screen max-w-6xl mx-auto bg-[#090909] text-on-surface">
      {/* Header */}
      <section className="mb-20 text-center">
        <span className="font-headline font-bold uppercase text-[10px] tracking-[0.5em] text-primary mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-700">PRIVATE ARCHIVE</span>
        <h1 className="text-6xl lg:text-8xl font-black font-headline tracking-tighter uppercase leading-none mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           The Vault
        </h1>
        
        {/* Progress Header / Integrity Meter */}
        <div className="max-w-xl mx-auto mt-12 p-6 rounded-2xl bg-surface-container-low/30 border border-white/5 backdrop-blur-sm">
           <div className="flex justify-between items-center mb-4">
              <span className="font-headline font-bold text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">Archive Integrity</span>
              <span className="font-headline font-black text-sm text-primary">
                 {vaultTotalCount > 0 ? Math.round((vaultScannedCount / vaultTotalCount) * 100) : 0}%
              </span>
           </div>
           
           <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_12px_rgba(255,79,0,0.5)]" 
                style={{ width: `${vaultTotalCount > 0 ? (vaultScannedCount / vaultTotalCount) * 100 : 0}%` }} 
              />
              {isSyncingVault && (
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
           </div>

           <div className="mt-4 flex justify-between items-center text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/60">
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${isSyncingVault ? 'bg-primary animate-pulse' : 'bg-green-500'}`} />
                 {isSyncingVault ? 'Decrypting Records...' : 'Archive Fully Scanned'}
              </div>
              <span>{vaultScannedCount} / {vaultTotalCount} Records</span>
           </div>
        </div>
      </section>

      {/* The Grails Section - Focus 3 */}
      <section className="mb-32">
        <div className="flex items-center gap-4 mb-16 px-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary/30" />
          <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-primary">The Grails</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 px-4 lg:px-12 mb-20">
          {grails.slice(0, 3).map((release, i) => (
              <VaultPedestal 
                key={release.id} 
                release={release} 
                rank={i + 1}
                details={vaultMetadata[release.id]}
                variant="large"
                onClick={() => setSelectedRelease(release)}
              />
            ))}
          </div>

          {grails.length > 3 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 px-4 lg:px-24">
              {grails.slice(3, 11).map((release, i) => (
                <VaultPedestal 
                  key={release.id} 
                  release={release} 
                  rank={i + 4}
                  details={vaultMetadata[release.id]}
                  variant="small"
                  onClick={() => setSelectedRelease(release)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Rarity & Demand Matrix */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
           {/* Most Coveted - High Want/Have Ratio */}
           <div className="bg-surface-container-low/20 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline font-black text-xl uppercase tracking-tighter text-secondary">Most Coveted</h3>
                  <span className="font-headline font-semibold text-[10px] text-secondary/60 tracking-widest uppercase italic">WANT/HAVE RATIO</span>
              </div>
              
              <div className="space-y-6">
                  {isSyncingVault && mostCoveted.length === 0 ? (
                    <div className="py-20 text-center opacity-40 italic font-body">Scanning archives...</div>
                  ) : (
                    mostCoveted.map((c) => {
                      const d = vaultMetadata[c.id];
                      const ratio = d ? (d.community.want / d.community.have).toFixed(1) : '?';
                      return (
                        <div key={c.id} className="flex items-center gap-6 group cursor-pointer" onClick={() => setSelectedRelease(c)}>
                          <div className="w-16 h-16 relative flex-shrink-0 bg-surface-container overflow-hidden rounded-sm group-hover:scale-105 transition-transform">
                             {c.basic_information.cover_image && (
                               <img src={c.basic_information.cover_image} alt="" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" />
                             )}
                          </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-headline font-bold text-sm uppercase truncate text-on-surface">{c.basic_information.title}</p>
                           <p className="font-body text-xs italic text-on-surface-variant truncate">{c.basic_information.artists[0]?.name}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-headline font-black text-xl text-secondary">{ratio}x</p>
                           <p className="font-headline font-bold text-[8px] text-secondary/40 tracking-widest leading-none">DEMAND</p>
                        </div>
                      </div>
                    );
                  })
                )}
            </div>
         </div>

         {/* Hidden Gems - High Rating, Low Have */}
         <div className="bg-surface-container-low/20 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline font-black text-xl uppercase tracking-tighter text-tertiary">Hidden Gems</h3>
                <span className="font-headline font-semibold text-[10px] text-tertiary/60 tracking-widest uppercase italic">RARE PERSONAL FAVORITES</span>
            </div>
            <div className="space-y-6">
                {hiddenGems.length > 0 ? (
                  hiddenGems.map(c => (
                    <div key={c.id} className="flex items-center gap-6 group cursor-pointer" onClick={() => setSelectedRelease(c)}>
                      <div className="w-16 h-16 relative flex-shrink-0 bg-surface-container overflow-hidden rounded-sm group-hover:scale-105 transition-transform">
                         {c.basic_information.cover_image && (
                           <img src={c.basic_information.cover_image} alt="" className="object-cover w-full h-full opacity-40 group-hover:opacity-80 transition-opacity" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="font-headline font-bold text-sm uppercase truncate text-on-surface">{c.basic_information.title}</p>
                         <p className="font-body text-xs italic text-on-surface-variant truncate">{c.basic_information.artists[0]?.name}</p>
                      </div>
                      <div className="flex gap-1">
                         {[...Array(Math.max(1, c.rating || 1))].map((_, i) => (
                           <span key={i} className="material-symbols-outlined text-[12px] text-tertiary">star</span>
                         ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="font-body italic text-sm text-on-surface-variant/60">No hidden gems identified yet.<br/>Rate your records 5 stars to unlock this section.</p>
                  </div>
                )}
            </div>
         </div>
      </section>

      {/* Sync Status Footer */}
      <div className="fixed bottom-8 right-8 z-50">
        {isSyncingVault && (
          <div className="bg-surface-container-highest/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-right-4">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]" />
             <span className="font-headline font-bold text-[9px] tracking-widest uppercase text-on-surface">Decrypting Extended Data</span>
          </div>
        )}
      </div>

      {/* Detail Overlay */}
      {selectedRelease && (
        <RecordOverlay 
          release={mapToLightweight(selectedRelease)} 
          onClose={() => setSelectedRelease(null)} 
        />
      )}
    </main>
  );
}
