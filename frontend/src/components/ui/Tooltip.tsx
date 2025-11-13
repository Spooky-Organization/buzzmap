import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
}

/**
 * Tooltip Component
 * Displays a tooltip on hover for the wrapped element
 */
export const Tooltip = ({ 
  children, 
  content, 
  position = 'right',
  className 
}: TooltipProps) => {
  const positionClasses = {
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn('relative group/tooltip w-full', className)}>
      <div className="w-full group-hover/tooltip:block">
        {children}
      </div>
      <div
        className={cn(
          'absolute z-[100] px-2 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg',
          'opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible',
          'transition-all duration-200 ease-in-out whitespace-nowrap',
          'pointer-events-none',
          positionClasses[position]
        )}
        style={{
          willChange: 'opacity, visibility'
        }}
      >
        {content}
        {/* Arrow */}
        <div
          className={cn(
            'absolute w-2 h-2 bg-gray-900 transform rotate-45',
            position === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
            position === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
            position === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
            position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
          )}
        />
      </div>
    </div>
  );
};

