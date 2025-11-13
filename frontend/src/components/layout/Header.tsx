import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, User, Home, Settings, ChevronDown, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, ROUTES } from '@/utils/constants';
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

  // Close menu when clicking outside
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
      // Still navigate to login even if logout fails
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button (Mobile Only) */}
            {user && onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            )}
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Home className="h-5 w-5 text-primary-600" />
              <h1 className="text-xl font-bold text-primary-600">{APP_NAME}</h1>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Profile Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="User menu"
                  aria-expanded={isMenuOpen}
                >
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-left min-w-0 hidden md:block">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${isMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200 md:hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to={ROUTES.CHANGE_PASSWORD}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

