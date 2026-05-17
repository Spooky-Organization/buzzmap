import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to BuzzMap to discover local businesses, share POV video reviews, and shop from your community.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.03)_100%)]" />
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href="/" />}
        className="fixed left-4 top-4 z-30 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-primary-foreground/75 backdrop-blur transition-colors hover:bg-white/10 hover:text-primary-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/75 backdrop-blur">
              <Sparkles className="size-3.5 text-accent" />
              Trusted local commerce
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">BuzzMap</h1>
            <p className="mt-2 text-sm text-accent">for you by you</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-primary-foreground/70">
              One sign-in surface for customers discovering the market and businesses building trust inside it.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
