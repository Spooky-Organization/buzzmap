import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-primary relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Link>
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-foreground">BuzzMap</h1>
          <p className="text-accent mt-1 text-sm">for you by you</p>
        </div>
        {children}
      </div>
    </div>
  );
}
