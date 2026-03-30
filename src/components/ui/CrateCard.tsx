import Image from 'next/image';

export function CrateCard({
  title,
  artist,
  imageUrl,
  releaseId,
  year,
  genres = [],
  styles = [],
  offset = false,
  onClick,
}: {
  title: string;
  artist: string;
  imageUrl?: string;
  releaseId?: number;
  year?: number;
  genres?: string[];
  styles?: string[];
  offset?: boolean;
  onClick?: () => void;
}) {
  const decadeStr = year && year > 0 ? `${Math.floor(year / 10) * 10}s` : null;

  const handlePress = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    onClick?.();
  };

  const CardContent = (
    <div className={`flex flex-col gap-2 ${offset ? 'mt-8' : ''}`}>
      <div className="aspect-square bg-surface-container-high relative overflow-hidden group rounded-sm hover:-translate-y-1 transition-transform duration-300">
        {imageUrl ? (
          <Image
            alt="Album art"
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            src={imageUrl}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-outline opacity-40 text-4xl">album</span>
          </div>
        )}

        {/* Hover Overlay containing meta-data (Desktop Only) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 hidden md:flex flex-col justify-between cursor-pointer">

          <div className="flex flex-col gap-1 text-[#E5E2E1] opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
            {decadeStr && <span className="font-headline font-bold text-[10px] tracking-widest text-primary uppercase drop-shadow-md">{decadeStr}</span>}
            {genres.length > 0 && <span className="font-headline font-bold text-xs uppercase drop-shadow-md">{genres.join(' / ')}</span>}
            {styles.length > 0 && <span className="font-body italic text-[11px] opacity-70 leading-tight drop-shadow-md">{styles.slice(0, 3).join(' • ')}</span>}
          </div>

          <div className="self-end text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
            <span className="material-symbols-outlined text-lg">info</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface truncate">
          {title}
        </span>
        <span className="font-body italic text-sm text-on-surface-variant truncate">
          {artist}
        </span>
        
        {/* Mobile Metadata: Visible directly but subtle */}
        <div className="flex flex-col mt-1 md:hidden opacity-60">
           {decadeStr && <span className="font-headline font-bold text-[8px] tracking-[0.2em] text-primary uppercase">{decadeStr}</span>}
           {genres.length > 0 && (
             <span className="font-body italic text-[9px] text-on-surface-variant truncate leading-tight mt-0.5">
               {genres[0]} {styles.length > 0 ? `• ${styles[0]}` : ''}
             </span>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <button
      onClick={handlePress}
      className="block w-full text-left appearance-none"
    >
      {CardContent}
    </button>
  );
}
