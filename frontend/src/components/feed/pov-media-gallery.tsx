'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface POVMediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl: string | null;
  position: number;
}

interface POVMediaGalleryProps {
  media: POVMediaItem[];
  className?: string;
}

/**
 * Renders a POV's mixed image/video gallery as a single-item carousel.
 * Shows arrows + dot indicators only when there is more than one item.
 */
export function POVMediaGallery({ media, className }: POVMediaGalleryProps) {
  const [index, setIndex] = useState(0);

  if (media.length === 0) return null;

  const safeIndex = Math.min(index, media.length - 1);
  const current = media[safeIndex];
  const hasMultiple = media.length > 1;

  function go(delta: number) {
    setIndex((i) => {
      const next = (i + delta + media.length) % media.length;
      return next;
    });
  }

  return (
    <div className={cn('relative aspect-video w-full bg-black', className)}>
      {current.type === 'video' ? (
        <video
          key={current.id}
          src={current.url}
          poster={current.thumbnailUrl ?? undefined}
          controls
          playsInline
          className="size-full object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current.id}
          src={current.url}
          alt="POV media"
          className="size-full object-contain"
        />
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous media"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next media"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {media.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to media ${i + 1}`}
                aria-current={i === safeIndex}
                className={cn(
                  'size-1.5 rounded-full transition-all',
                  i === safeIndex ? 'w-4 bg-white' : 'bg-white/50 hover:bg-white/80'
                )}
              />
            ))}
          </div>

          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
            {safeIndex + 1}/{media.length}
          </span>
        </>
      )}
    </div>
  );
}
