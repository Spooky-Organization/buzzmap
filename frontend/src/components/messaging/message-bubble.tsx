import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
}

export function MessageBubble({ content, timestamp, isOwn, isRead }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex max-w-[75%] flex-col gap-1',
        isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-3 py-2 text-sm',
          isOwn
            ? 'rounded-br-sm bg-accent text-accent-foreground'
            : 'rounded-bl-sm bg-muted text-foreground'
        )}
      >
        {content}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isOwn && (
          <Check
            className={cn(
              'size-3',
              isRead ? 'text-accent' : 'text-muted-foreground'
            )}
          />
        )}
      </div>
    </div>
  );
}
