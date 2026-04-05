'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
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

interface BusinessProfile {
  name: string;
  description: string;
  category: string;
  type: string;
  location: string;
  contact: string;
  website: string;
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

const BUSINESS_TYPES = ['PHYSICAL', 'ONLINE', 'HYBRID'];

const emptyProfile: BusinessProfile = {
  name: '',
  description: '',
  category: '',
  type: 'PHYSICAL',
  location: '',
  contact: '',
  website: '',
  operatingHours: '',
};

export default function BusinessSettingsPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState<BusinessProfile>(emptyProfile);

  const { data, isLoading } = useQuery<BusinessProfile>({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const res = await api.get('/api/v1/business/profile');
      return res.data;
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      await api.patch('/api/v1/business/profile', form);
    },
    onSuccess: () => toast.success('Profile saved'),
    onError: () => toast.error('Failed to save profile'),
  });

  const update = (key: keyof BusinessProfile, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Update your public business information</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Business Name</FieldLabel>
              <Input
                placeholder="Your business name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
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
                <SelectTrigger className="w-full">
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
              <FieldLabel>Contact Number</FieldLabel>
              <Input
                placeholder="+63 900 000 0000"
                value={form.contact}
                onChange={(e) => update('contact', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel>Website</FieldLabel>
              <Input
                placeholder="https://yourbusiness.com"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel>Operating Hours</FieldLabel>
              <Input
                placeholder="e.g. Mon–Fri 9AM–6PM"
                value={form.operatingHours}
                onChange={(e) => update('operatingHours', e.target.value)}
                disabled={isLoading}
              />
            </Field>

            <Button
              disabled={saveProfile.isPending || isLoading}
              onClick={() => saveProfile.mutate()}
            >
              {saveProfile.isPending && <Spinner data-icon="inline-start" />}
              {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
