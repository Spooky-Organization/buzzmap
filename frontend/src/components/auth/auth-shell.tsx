import type { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AuthAudienceTabs, type AuthAudience, type AuthMode } from '@/components/auth/auth-audience-tabs';
import { AuthPageHeader } from '@/components/auth/auth-page-header';
import { AuthLegalLinks } from '@/components/legal/auth-legal-links';

export function AuthShell({
  mode,
  audience,
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  mode: AuthMode;
  audience: AuthAudience;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-white/50 bg-background/95 py-0 shadow-[0_38px_80px_-38px_rgba(15,37,64,0.55)] backdrop-blur">
      <div className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-5 py-5 sm:px-6">
        <CardHeader className="space-y-5 px-0">
          <AuthAudienceTabs mode={mode} activeAudience={audience} />
          <AuthPageHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </CardHeader>
      </div>
      <CardContent className="px-5 py-5 sm:px-6 sm:py-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="border-t border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex w-full flex-col gap-3">
            {footer}
            <AuthLegalLinks />
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
