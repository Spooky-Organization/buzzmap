import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
};

