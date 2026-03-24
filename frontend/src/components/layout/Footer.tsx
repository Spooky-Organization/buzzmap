import { Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isDark } = useTheme();

  return (
    <footer className={cn(
      'border-t py-4 px-6',
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    )}>
      <div className="container-custom max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-6 h-6 rounded flex items-center justify-center',
              'bg-gradient-to-br from-primary-500 to-secondary-600'
            )}>
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className={cn(
              'text-sm font-medium',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              DashLabs
            </span>
          </div>
          
          <p className={cn(
            'text-xs',
            isDark ? 'text-gray-400' : 'text-gray-500'
          )}>
            © {currentYear} Matthew Makundi, SpookieLabsInc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
