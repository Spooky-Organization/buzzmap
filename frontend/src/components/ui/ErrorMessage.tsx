import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
};
