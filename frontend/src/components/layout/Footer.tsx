import { Shield } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-4 px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-[var(--glass-border)]">
      <div className="container-custom max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">
              DashLabs
            </span>
          </div>

          <p className="text-xs text-[var(--foreground-muted)]">
            © {currentYear} Matthew Makundi, SpookieLabsInc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
