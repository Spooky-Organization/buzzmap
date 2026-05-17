'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  Building2Icon,
  MapPinIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from 'lucide-react';

import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

const BUSINESS_CATEGORIES = [
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'retail', label: 'Retail & Shopping' },
  { value: 'health_wellness', label: 'Health & Wellness' },
  { value: 'beauty_personal', label: 'Beauty & Personal Care' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'education', label: 'Education & Training' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'other', label: 'Other' },
];

interface FormErrors {
  // Account tab
  ownerName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  // Business tab
  businessName?: string;
  description?: string;
  category?: string;
  location?: string;
}

export default function BusinessRegisterPage() {
  const router = useRouter();

  // Account fields
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const authLinkClass =
    'inline-flex items-center gap-1 font-semibold text-[oklch(0.68_0.17_65)] underline-offset-4 transition-colors hover:text-[oklch(0.62_0.18_58)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.15_67)] rounded-sm';

  function validateAccount(): FormErrors {
    const next: FormErrors = {};
    if (!ownerName.trim()) next.ownerName = 'Name is required.';
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

  function validateBusiness(): FormErrors {
    const next: FormErrors = {};
    if (!businessName.trim()) next.businessName = 'Business name is required.';
    if (!description.trim()) next.description = 'A brief description is required.';
    if (!category) next.category = 'Please select a category.';
    if (!location.trim()) next.location = 'Location is required.';
    return next;
  }

  function handleNextTab() {
    const v = validateAccount();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setActiveTab('business');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const accountErrors = validateAccount();
    const businessErrors = validateBusiness();
    const allErrors = { ...accountErrors, ...businessErrors };

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      // Go to whichever tab has errors
      if (Object.keys(accountErrors).length) {
        setActiveTab('account');
      } else {
        setActiveTab('business');
      }
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const contactInfo = [
        contactEmail.trim() || email.trim(),
        contactPhone.trim() || phone.trim(),
      ]
        .filter(Boolean)
        .join(' | ');
      const hoursText = operatingHours.trim();

      await api.post(apiRoutes.auth.registerBusiness, {
        name: ownerName.trim(),
        email,
        phone: phone.trim(),
        password,
        businessName: businessName.trim(),
        description: description.trim(),
        category,
        type: businessType[0] || undefined,
        location: location.trim(),
        contactInfo,
        operatingHours: hoursText ? { description: hoursText } : {},
      });

      toast.success('Business registered! Signing you in…');

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Registered but could not sign in automatically. Please log in.');
        router.push(appRoutes.auth.login);
        return;
      }

      router.push(appRoutes.business.dashboard);
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
    <AuthShell
      mode="register"
      audience="business"
      eyebrow="Business registration"
      title="Launch your business profile where trust is earned in public."
      description="Create the owner account first, then configure the business details customers will discover, review, and order from."
      footer={
        <p className="w-full text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={appRoutes.auth.loginFor('business')} className={authLinkClass}>
            <ArrowLeftIcon className="size-3" />
            Sign in as a business
          </Link>
        </p>
      }
    >
        <form onSubmit={handleSubmit} noValidate>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-5 grid w-full grid-cols-2 rounded-2xl border border-border/70 bg-muted/35 p-1">
              <TabsTrigger value="account" className="flex-1">
                Account
              </TabsTrigger>
              <TabsTrigger value="business" className="flex-1">
                Business
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Account ── */}
            <TabsContent value="account">
              <FieldGroup>
                <Field data-invalid={!!errors.ownerName || undefined}>
                  <FieldLabel htmlFor="owner-name">
                    <UserIcon data-icon="inline-start" />
                    Your Full Name
                  </FieldLabel>
                  <Input
                    id="owner-name"
                    type="text"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    aria-invalid={!!errors.ownerName || undefined}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.ownerName}</FieldError>
                </Field>

                <Field data-invalid={!!errors.email || undefined}>
                  <FieldLabel htmlFor="biz-email">
                    <MailIcon data-icon="inline-start" />
                    Email
                  </FieldLabel>
                  <Input
                    id="biz-email"
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

                <Field data-invalid={!!errors.phone || undefined}>
                  <FieldLabel htmlFor="biz-phone">
                    <PhoneIcon data-icon="inline-start" />
                    Phone Number
                  </FieldLabel>
                  <Input
                    id="biz-phone"
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

                <Field data-invalid={!!errors.password || undefined}>
                  <FieldLabel htmlFor="biz-password">
                    <LockIcon data-icon="inline-start" />
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="biz-password"
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

                <Field data-invalid={!!errors.confirmPassword || undefined}>
                  <FieldLabel htmlFor="biz-confirm-password">
                    <LockIcon data-icon="inline-start" />
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="biz-confirm-password"
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

                <Button
                  type="button"
                  className="w-full bg-accent text-white font-semibold shadow-sm hover:bg-[oklch(0.68_0.17_65)] hover:shadow-md active:scale-[0.98] transition-all"
                  onClick={handleNextTab}
                  disabled={isLoading}
                >
                  <Building2Icon data-icon="inline-start" />
                  Next: Business Details
                </Button>
              </FieldGroup>
            </TabsContent>

            {/* ── Tab 2: Business ── */}
            <TabsContent value="business">
              <FieldGroup>
                <Field data-invalid={!!errors.businessName || undefined}>
                  <FieldLabel htmlFor="business-name">
                    <Building2Icon data-icon="inline-start" />
                    Business Name
                  </FieldLabel>
                  <Input
                    id="business-name"
                    type="text"
                    placeholder="Acme Coffee Co."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    aria-invalid={!!errors.businessName || undefined}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.businessName}</FieldError>
                </Field>

                <Field data-invalid={!!errors.description || undefined}>
                  <FieldLabel htmlFor="biz-description">Description</FieldLabel>
                  <Textarea
                    id="biz-description"
                    placeholder="Briefly describe your business…"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    aria-invalid={!!errors.description || undefined}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.description}</FieldError>
                </Field>

                <Field data-invalid={!!errors.category || undefined}>
                  <FieldLabel htmlFor="biz-category">Category</FieldLabel>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val as string)}
                  >
                    <SelectTrigger id="biz-category" className="w-full" aria-invalid={!!errors.category || undefined}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {BUSINESS_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.category}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Business Type</FieldLabel>
                  <ToggleGroup
                    value={businessType}
                    onValueChange={(val) => setBusinessType(val)}
                    variant="outline"
                    spacing={0}
                    className="w-full"
                  >
                    <ToggleGroupItem value="PRODUCTS" className="flex-1">
                      Products
                    </ToggleGroupItem>
                    <ToggleGroupItem value="SERVICES" className="flex-1">
                      Services
                    </ToggleGroupItem>
                  </ToggleGroup>
                </Field>

                <Field data-invalid={!!errors.location || undefined}>
                  <FieldLabel htmlFor="biz-location">
                    <MapPinIcon data-icon="inline-start" />
                    Location
                  </FieldLabel>
                  <Input
                    id="biz-location"
                    type="text"
                    placeholder="123 Main St, City, State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    aria-invalid={!!errors.location || undefined}
                    disabled={isLoading}
                  />
                  <FieldError>{errors.location}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-email">
                    <MailIcon data-icon="inline-start" />
                    Contact Email{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Business contact email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-phone">
                    <PhoneIcon data-icon="inline-start" />
                    Contact Phone{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="operating-hours">
                    Operating Hours{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="operating-hours"
                    type="text"
                    placeholder="Mon–Fri 9am–5pm"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>

                <Button
                  type="submit"
                  className="w-full bg-accent text-white font-semibold shadow-sm hover:bg-[oklch(0.68_0.17_65)] hover:shadow-md active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Registering…
                    </>
                  ) : (
                    <>
                      <Building2Icon data-icon="inline-start" />
                      Register Business
                    </>
                  )}
                </Button>
              </FieldGroup>
            </TabsContent>
          </Tabs>
        </form>
    </AuthShell>
  );
}
