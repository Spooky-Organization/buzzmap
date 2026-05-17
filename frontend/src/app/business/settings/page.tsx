'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { MapPinned, Save, Settings2, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';
import { DashboardHero, DashboardHeroPill } from '@/components/dashboard/dashboard-surfaces';

interface BusinessProfileForm {
  businessName: string;
  description: string;
  category: string;
  type: string;
  location: string;
  coordinates: string;
  contactInfo: string;
  operatingHours: string;
}

const CATEGORIES = [
  'FOOD_AND_BEVERAGE',
  'RETAIL',
  'SERVICES',
  'HEALTH_AND_WELLNESS',
  'ENTERTAINMENT',
  'OTHER',
];

const BUSINESS_TYPES = ['PRODUCTS', 'SERVICES'];

const emptyProfile: BusinessProfileForm = {
  businessName: '',
  description: '',
  category: '',
  type: 'PRODUCTS',
  location: '',
  coordinates: '',
  contactInfo: '',
  operatingHours: '',
};

interface BackendBusinessProfile {
  businessName: string;
  description: string | null;
  category: string | null;
  type: string | null;
  location: string | null;
  coordinates: string | null;
  contactInfo: string | null;
  operatingHours: Record<string, unknown> | null;
}

function formatOperatingHoursForEditor(
  operatingHours: BackendBusinessProfile['operatingHours']
): string {
  if (!operatingHours) return '';

  try {
    return JSON.stringify(operatingHours, null, 2);
  } catch {
    return '';
  }
}

function toBusinessProfileForm(
  profile?: BackendBusinessProfile | null
): BusinessProfileForm {
  if (!profile) {
    return emptyProfile;
  }

  return {
    businessName: profile.businessName ?? '',
    description: profile.description ?? '',
    category: profile.category ?? '',
    type: profile.type ?? 'PRODUCTS',
    location: profile.location ?? '',
    coordinates: profile.coordinates ?? '',
    contactInfo: profile.contactInfo ?? '',
    operatingHours: formatOperatingHoursForEditor(profile.operatingHours),
  };
}

export default function BusinessSettingsPage() {
  const { data: session } = useSession();
  const isBusinessOwner = session?.user.role === 'BUSINESS_OWNER';
  const [draft, setDraft] = useState<BusinessProfileForm | null>(null);

  const { data, isLoading } = useQuery<BackendBusinessProfile>({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.business.profile);
      return res.data;
    },
    enabled: isBusinessOwner,
  });

  const form = draft ?? toBusinessProfileForm(data);

  const saveProfile = useMutation({
    mutationFn: async () => {
      let operatingHours: Record<string, unknown> | undefined;

      if (form.operatingHours.trim()) {
        operatingHours = JSON.parse(form.operatingHours) as Record<string, unknown>;
      }

      await api.patch(apiRoutes.business.profile, {
        businessName: form.businessName,
        description: form.description,
        category: form.category,
        type: form.type,
        location: form.location,
        coordinates: form.coordinates,
        contactInfo: form.contactInfo,
        ...(operatingHours ? { operatingHours } : {}),
      });
    },
    onSuccess: () => toast.success('Profile saved'),
    onError: (error) => {
      if (error instanceof SyntaxError) {
        toast.error('Operating hours must be valid JSON');
        return;
      }
      toast.error('Failed to save profile');
    },
  });

  const update = (key: keyof BusinessProfileForm, value: string) =>
    setDraft((current) => ({ ...(current ?? form), [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Business settings"
        title="Shape how the public business profile appears."
        description="This profile drives directory visibility, public trust, contact clarity, and map presence. Keep the essentials current so discovery converts into confidence."
        icon={Settings2}
      >
        <DashboardHeroPill
          icon={Store}
          label="Public profile"
          value="Directory-facing"
          note="Business name, description, category, and type drive how the profile reads."
        />
        <DashboardHeroPill
          icon={MapPinned}
          label="Location layer"
          value="Map enabled"
          note="Coordinates or a place query improve the embedded location experience."
        />
      </DashboardHero>

      <Card className="w-full max-w-none border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Update your public business information</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-6 xl:grid-cols-2">
            <Field>
              <FieldLabel>Business Name</FieldLabel>
                <Input
                  placeholder="Your business name"
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  disabled={isLoading}
                />
              </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                placeholder="Tell customers about your business..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                disabled={isLoading}
                className="min-h-24"
              />
            </Field>

            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(val) => update('category', val ?? '')}
              >
                <SelectTrigger className="w-full rounded-2xl border-border/70 bg-background/90">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Business Type</FieldLabel>
              <ToggleGroup
                value={form.type ? [form.type] : []}
                onValueChange={(vals) => {
                  const last = vals[vals.length - 1];
                  if (last) update('type', last);
                }}
                variant="outline"
                spacing={1}
                className="rounded-2xl"
              >
                {BUSINESS_TYPES.map((t) => (
                  <ToggleGroupItem key={t} value={t}>
                    {t}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel>Location</FieldLabel>
              <Input
                placeholder="Business address"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel>Map Coordinates Or Place Query</FieldLabel>
              <Input
                placeholder="e.g. -0.5143,35.2698 or Eldoret Town, Uasin Gishu"
                value={form.coordinates}
                onChange={(e) => update('coordinates', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel>Contact Info</FieldLabel>
              <Input
                placeholder="+254 700 000000 | hello@business.com"
                value={form.contactInfo}
                onChange={(e) => update('contactInfo', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel>Operating Hours JSON</FieldLabel>
              <Textarea
                className="min-h-32 font-mono text-xs"
                placeholder='{"monday":"08:00-17:00","tuesday":"08:00-17:00"}'
                value={form.operatingHours}
                onChange={(e) => update('operatingHours', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Button
              className="rounded-2xl"
              disabled={saveProfile.isPending || isLoading}
              onClick={() => saveProfile.mutate()}
            >
              {saveProfile.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving...
                </>
              ) : (
                <>
                  <Save data-icon="inline-start" />
                  Save Changes
                </>
              )}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
