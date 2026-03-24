import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Security', href: '#security' },
  { name: 'Architecture', href: '#architecture' },
  { name: 'Docs', href: '#docs' },
];

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 group"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-primary-500 to-secondary-600`}
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DashLabs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg transition-all duration-200 hover:bg-white/10"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to={ROUTES.LOGIN}>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button
                variant="primary"
                size="sm"
                className="shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div
            className="py-4 space-y-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl mt-2 shadow-lg border border-white/10"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg mx-2 transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="border-t border-white/10 mt-2 pt-4 px-4 space-y-2">
              <Link to={ROUTES.LOGIN} className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
