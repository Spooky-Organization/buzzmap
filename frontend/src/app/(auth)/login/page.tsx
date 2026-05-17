'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { LogInIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-react';

import { AuthShell } from '@/components/auth/auth-shell';
import type { AuthAudience } from '@/components/auth/auth-audience-tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { appRoutes } from '@/lib/routes';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const audience = searchParams.get('audience') === 'business' ? 'business' : 'customer';
  const registerHref = appRoutes.auth.registerFor(audience as AuthAudience);
  const forgotPasswordHref = appRoutes.auth.forgotPasswordFor(audience as AuthAudience);
  const authLinkClass =
    'inline-flex items-center gap-1 font-semibold text-[oklch(0.68_0.17_65)] underline-offset-4 transition-colors hover:text-[oklch(0.62_0.18_58)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.15_67)] rounded-sm';

  function validate() {
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email.';
    if (!password) next.password = 'Password is required.';
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password. Please try again.');
        return;
      }

      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      const role = session?.user?.role;

      if (audience === 'customer' && role !== 'CUSTOMER') {
        await signOut({ redirect: false });
        toast.error('This account cannot access the selected sign-in lane.');
        return;
      }

      if (audience === 'business' && role === 'CUSTOMER') {
        await signOut({ redirect: false });
        toast.error('This account cannot access the selected sign-in lane.');
        return;
      }

      toast.success('Welcome back!');

      if (role === 'ADMIN') {
        router.push(appRoutes.admin.overview);
      } else if (role === 'BUSINESS_OWNER') {
        router.push(appRoutes.business.dashboard);
      } else {
        router.push(appRoutes.customer.feed);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      audience={audience}
      eyebrow={audience === 'business' ? 'Business access' : 'Customer access'}
      title={audience === 'business' ? 'Sign in to manage your business presence.' : 'Sign in to explore and shop local with confidence.'}
      description={
        audience === 'business'
          ? 'Access orders, shelf updates, analytics, and customer conversations from one business workspace.'
          : 'Continue discovering trusted businesses, POV reviews, orders, messages, and saved marketplace activity.'
      }
      footer={
        <p className="w-full text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={registerHref} className={authLinkClass}>
            <ArrowLeftIcon className="size-3 rotate-180" />
            {audience === 'business' ? 'Register your business' : 'Create a customer account'}
          </Link>
        </p>
      }
    >
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email || undefined}
                disabled={isLoading}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            <Field data-invalid={!!errors.password || undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password || undefined}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <FieldError>{errors.password}</FieldError>
            </Field>

            <div className="flex justify-end -mt-2">
              <Link
                href={forgotPasswordHref}
                className={`${authLinkClass} text-sm`}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent text-white font-semibold shadow-sm hover:bg-[oklch(0.68_0.17_65)] hover:shadow-md active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogInIcon data-icon="inline-start" />
                  Sign in
                </>
              )}
            </Button>
          </FieldGroup>
        </form>
    </AuthShell>
  );
}
