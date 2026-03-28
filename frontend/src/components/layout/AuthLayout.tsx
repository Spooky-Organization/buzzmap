import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary-500/15 rounded-full blur-[120px] animate-blob animation-delay-2000" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">DashLabs</span>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">{title}</h2>
          {subtitle && (
            <p className="text-sm text-[var(--foreground-muted)]">{subtitle}</p>
          )}
        </div>

        {/* Glass card */}
        <div className="glass-card p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
