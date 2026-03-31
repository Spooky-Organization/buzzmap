import { cn } from '@/lib/utils';
import { CheckCircleIcon } from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

interface InterestPickerProps {
  interests: Interest[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  minRequired?: number;
  className?: string;
}

export function InterestPicker({
  interests,
  selectedIds,
  onToggle,
  minRequired = 3,
  className
}: InterestPickerProps) {
  const isValid = selectedIds.length >= minRequired;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-3">
        {interests.map((interest) => {
          const isSelected = selectedIds.includes(interest.id);
          
          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => onToggle(interest.id)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border transition-all text-left',
                'hover:border-primary/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div
                className={cn(
                  'size-10 rounded-full flex items-center justify-center text-lg',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {interest.icon}
              </div>
              <span className="font-medium flex-1">{interest.name}</span>
              {isSelected && (
                <CheckCircleIcon className="size-5 text-primary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        {isValid ? (
          <span className="text-green-600">
            {selectedIds.length} selected — you're all set!
          </span>
        ) : (
          <span>
            Select at least {minRequired - selectedIds.length} more to continue
          </span>
        )}
      </p>
    </div>
  );
}
