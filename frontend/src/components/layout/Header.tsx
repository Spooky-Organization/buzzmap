import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, User, Settings, ChevronDown, Menu, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { SessionManager } from '@/auth/sessionManager';
import { toast } from 'sonner';

export interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const Header = ({ user, onLogout, onMenuToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await sessionManager.logout();
      }
      toast.success('Logged out successfully', {
        icon: <LogOut className="h-5 w-5" />,
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {user && onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 text-gray-300" />
              </button>
            )}
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">DashLabs</h1>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  aria-label="User menu"
                  aria-expanded={isMenuOpen}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left min-w-0 hidden md:block">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700 md:hidden">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to={ROUTES.CHANGE_PASSWORD}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-gray-700 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
