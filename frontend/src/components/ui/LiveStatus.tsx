import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface LiveStatusProps {
  className?: string;
  showLabel?: boolean;
}

export const LiveStatus = ({ className, showLabel = true }: LiveStatusProps) => {
  const { sseConnected } = useNotifications();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors duration-300',
            sseConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        {sseConnected && (
          <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      {showLabel && (
        <span
          className={cn(
            'text-xs font-medium transition-colors duration-300',
            sseConnected ? 'text-green-500' : 'text-red-500'
          )}
        >
          {sseConnected ? 'Live' : 'Disconnected'}
        </span>
      )}
    </div>
  );
};

export default LiveStatus;
