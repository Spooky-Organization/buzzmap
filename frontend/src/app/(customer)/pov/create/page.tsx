'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Star, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { DashboardHero, DashboardHeroPill } from '@/components/dashboard/dashboard-surfaces';

export default function CreatePOVPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  // ToggleGroup (Base UI) uses readonly string[] for value
  const [ratingArr, setRatingArr] = useState<readonly string[]>([]);
  const [recommendedArr, setRecommendedArr] = useState<readonly string[]>([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedBusinessName, setSelectedBusinessName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived single values — take the last element for "single-select" semantics
  const rating = ratingArr[ratingArr.length - 1] ?? '';
  const recommended = recommendedArr[recommendedArr.length - 1] ?? '';

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error('Video must be under 200 MB.');
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select a star rating.');
      return;
    }
    if (!recommended) {
      toast.error('Please indicate if you recommend this business.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('rating', rating);
      formData.append('recommended', recommended);
      if (selectedBusinessId) formData.append('businessId', selectedBusinessId);
      if (videoFile) formData.append('video', videoFile);

      await api.post(apiRoutes.pov.root, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('POV posted successfully!');
      router.push(appRoutes.customer.feed);
    } catch {
      toast.error('Failed to post POV. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-6">
      <DashboardHero
        eyebrow="POV creation"
        title="Turn a customer experience into a useful trust signal."
        description="A good POV helps the next buyer see what the business actually feels like. Add honest detail, a fair rating, and enough context to be useful."
        icon={Camera}
      >
        <DashboardHeroPill
          icon={Video}
          label="Format"
          value="Video-first"
          note="Short-form video remains the highest-signal review format on BuzzMap."
        />
        <DashboardHeroPill
          icon={Star}
          label="Review quality"
          value="Rating required"
          note="A star rating and recommendation help make the POV actionable."
        />
      </DashboardHero>

      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <CardTitle>Create a Point of View</CardTitle>
          <CardDescription>
            Share your honest experience at a business with video, a rating, and a caption.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              {/* Video Upload */}
              <div className="space-y-6">
              <Field>
                <FieldLabel>Video</FieldLabel>
                <FieldDescription>Upload a short video of your experience (max 200 MB).</FieldDescription>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                {videoPreview ? (
                  <div className="flex flex-col gap-2">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full rounded-lg aspect-video bg-black object-contain"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remove video
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border py-10',
                      'text-muted-foreground transition-colors hover:border-ring hover:bg-muted/30',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <Video className="size-10 opacity-60" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-foreground">Click to upload video</span>
                      <span className="text-xs">MP4, MOV, WebM up to 200 MB</span>
                    </div>
                    <span className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      <Upload />
                      Choose file
                    </span>
                  </button>
                )}
              </Field>

              {/* Business search */}
              <Field>
                <FieldLabel>Business (optional)</FieldLabel>
                <FieldDescription>Tag the business your POV is about.</FieldDescription>
                {selectedBusinessId ? (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <span className="flex-1 font-medium">{selectedBusinessName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBusinessId('');
                        setSelectedBusinessName('');
                        setBusinessSearch('');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Input
                    placeholder="Search business name…"
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                  />
                )}
              </Field>
              </div>

              {/* Star Rating — single-select via ToggleGroup */}
              <div className="space-y-6">
              <Field>
                <FieldLabel>Rating</FieldLabel>
                <FieldDescription>How would you rate this business out of 5 stars?</FieldDescription>
                <ToggleGroup
                  value={ratingArr}
                  onValueChange={(val) => {
                    // Keep only the most recently toggled value (single-select semantics)
                    const next = val.filter((v) => !ratingArr.includes(v));
                    setRatingArr(next.length > 0 ? [next[next.length - 1]] : val.slice(-1));
                  }}
                  spacing={1}
                  aria-label="Star rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <ToggleGroupItem
                      key={star}
                      value={String(star)}
                      aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <Star
                        className={cn(
                          parseInt(rating) >= star
                            ? 'fill-accent text-accent'
                            : 'fill-muted text-muted-foreground'
                        )}
                      />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              {/* Recommend — single-select via ToggleGroup */}
              <Field>
                <FieldLabel>Would you recommend this business?</FieldLabel>
                <ToggleGroup
                  value={recommendedArr}
                  onValueChange={(val) => {
                    const next = val.filter((v) => !recommendedArr.includes(v));
                    setRecommendedArr(next.length > 0 ? [next[next.length - 1]] : val.slice(-1));
                  }}
                  spacing={1}
                  aria-label="Recommend"
                >
                  <ToggleGroupItem value="true" aria-label="Yes, recommend">
                    Yes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="false" aria-label="No, do not recommend">
                    No
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>

              {/* Caption */}
              <Field>
                <FieldLabel>Caption</FieldLabel>
                <FieldDescription>Share your thoughts about this experience.</FieldDescription>
                <Textarea
                  placeholder="What did you think? Share the details…"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{caption.length}/500</p>
              </Field>

              {/* Submit */}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner /> : null}
                {isSubmitting ? 'Posting…' : 'Post POV'}
              </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
