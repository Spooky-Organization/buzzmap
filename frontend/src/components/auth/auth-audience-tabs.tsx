import Link from 'next/link';
import { Building2, UserRound } from 'lucide-react';
import { appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

export type AuthAudience = 'customer' | 'business';
export type AuthMode = 'login' | 'register' | 'reset';

const AUDIENCE_META = {
  customer: {
    label: 'Customer',
    icon: UserRound,
  },
  business: {
    label: 'Business',
    icon: Building2,
  },
} satisfies Record<AuthAudience, { label: string; icon: React.ElementType }>;

function getAudienceHref(mode: AuthMode, audience: AuthAudience) {
  if (mode === 'login') return appRoutes.auth.loginFor(audience);
  if (mode === 'reset') return appRoutes.auth.forgotPasswordFor(audience);
  return appRoutes.auth.registerFor(audience);
}

export function AuthAudienceTabs({
  mode,
  activeAudience,
}: {
  mode: AuthMode;
  activeAudience: AuthAudience;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
        {mode === 'login'
          ? 'Choose sign-in lane'
          : mode === 'register'
            ? 'Choose account type'
            : 'Choose reset lane'}
      </p>
      <div className="grid grid-cols-2 rounded-2xl border border-border/70 bg-muted/35 p-1">
        {(['customer', 'business'] as const).map((audience) => {
          const Icon = AUDIENCE_META[audience].icon;
          const isActive = audience === activeAudience;

          return (
            <Link
              key={`${mode}-${audience}`}
              href={getAudienceHref(mode, audience)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-[14px] px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-background text-primary shadow-[0_10px_24px_-16px_rgba(15,37,64,0.9)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-4" />
              {AUDIENCE_META[audience].label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
