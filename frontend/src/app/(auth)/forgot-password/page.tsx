'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { MailIcon, ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): string {
    if (!email) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email.';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError('');
    setIsLoading(true);

    try {
      // Fire-and-forget — always show success to avoid email enumeration
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
    } catch {
      // Intentionally silent — we show success regardless
    } finally {
      setIsLoading(false);
      setSubmitted(true);
      toast.success('If an account exists, a reset link has been sent.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div className="flex flex-col gap-4 text-center py-4">
            <p className="text-sm text-muted-foreground">
              Check your inbox at <span className="font-medium text-foreground">{email}</span>.
              If an account exists, a reset link will arrive shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => setSubmitted(false)}
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!emailError || undefined}>
                <FieldLabel htmlFor="reset-email">
                  <MailIcon data-icon="inline-start" />
                  Email Address
                </FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError || undefined}
                  disabled={isLoading}
                />
                {emailError ? (
                  <FieldError>{emailError}</FieldError>
                ) : (
                  <FieldDescription>
                    We&apos;ll send a password reset link to this address.
                  </FieldDescription>
                )}
              </Field>

              <Button
                type="submit"
                className="w-full bg-accent text-white font-semibold shadow-sm hover:bg-[oklch(0.68_0.17_65)] hover:shadow-md active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Sending…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          <Link href="/login" className="text-accent hover:underline inline-flex items-center gap-1">
            <ArrowLeftIcon className="size-3" />
            Back to sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
