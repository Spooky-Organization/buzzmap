'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { UserIcon, MailIcon, PhoneIcon, LockIcon, MapPinIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
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
  FieldSet,
  FieldLegend,
} from '@/components/ui/field';

const INTEREST_OPTIONS = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'technology', label: 'Technology' },
  { value: 'education', label: 'Education' },
  { value: 'home', label: 'Home & Garden' },
];

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email.';
    if (!phone.trim()) next.phone = 'Phone number is required.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 8)
      next.password = 'Password must be at least 8 characters.';
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match.';
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
      await api.post('/api/v1/auth/register/customer', {
        name: name.trim(),
        email,
        phone: phone.trim(),
        password,
        location: location.trim() || undefined,
        interests,
      });

      toast.success('Account created! Signing you in…');

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Registered but could not sign in automatically. Please log in.');
        router.push('/login');
        return;
      }

      router.push('/feed');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join BuzzMap and discover local businesses near you.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            {/* Name */}
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="name">
                <UserIcon data-icon="inline-start" />
                Full Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name || undefined}
                disabled={isLoading}
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            {/* Email */}
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="reg-email">
                <MailIcon data-icon="inline-start" />
                Email
              </FieldLabel>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email || undefined}
                disabled={isLoading}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            {/* Phone */}
            <Field data-invalid={!!errors.phone || undefined}>
              <FieldLabel htmlFor="phone">
                <PhoneIcon data-icon="inline-start" />
                Phone Number
              </FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone || undefined}
                disabled={isLoading}
              />
              <FieldError>{errors.phone}</FieldError>
            </Field>

            {/* Password */}
            <Field data-invalid={!!errors.password || undefined}>
              <FieldLabel htmlFor="reg-password">
                <LockIcon data-icon="inline-start" />
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <Field data-invalid={!!errors.confirmPassword || undefined}>
              <FieldLabel htmlFor="confirm-password">
                <LockIcon data-icon="inline-start" />
                Confirm Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={!!errors.confirmPassword || undefined}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <FieldError>{errors.confirmPassword}</FieldError>
            </Field>

            {/* Location (optional) */}
            <Field>
              <FieldLabel htmlFor="location">
                <MapPinIcon data-icon="inline-start" />
                Location{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FieldLabel>
              <Input
                id="location"
                type="text"
                placeholder="City, State"
                autoComplete="address-level2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </Field>

            {/* Interests */}
            <FieldSet>
              <FieldLegend variant="label">
                Interests{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FieldLegend>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={interests.includes(opt.value)}
                      onCheckedChange={() => toggleInterest(opt.value)}
                      disabled={isLoading}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FieldSet>

            <Button
              type="submit"
              className="w-full bg-accent text-white font-semibold shadow-sm hover:bg-[oklch(0.68_0.17_65)] hover:shadow-md active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline inline-flex items-center gap-1">
            <ArrowLeftIcon className="size-3" />
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
