'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Upload, Star, Images, X } from 'lucide-react';
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
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardHero, DashboardHeroPill } from '@/components/dashboard/dashboard-surfaces';

// Gallery rules — must mirror the backend (shared/storage/povMedia.ts)
const MAX_VIDEOS = 2;
const MAX_IMAGES = 8;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

interface MediaDraft {
  id: string;
  file: File;
  url: string; // object URL for preview
  type: 'image' | 'video';
}

interface BusinessLookupResult {
  id: string;
  businessName: string;
  category: string;
  location: string;
}

interface PaginatedBusinessLookup {
  data: BusinessLookupResult[];
}

interface BusinessProfileLookup {
  id: string;
  businessName: string;
  category: string;
  location: string;
}

export default function CreatePOVPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  // ToggleGroup (Base UI) uses readonly string[] for value
  const [ratingArr, setRatingArr] = useState<readonly string[]>([]);
  const [recommendedArr, setRecommendedArr] = useState<readonly string[]>([]);
  const [visibilityArr, setVisibilityArr] = useState<readonly string[]>(['PUBLIC']);
  const [businessSearch, setBusinessSearch] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedBusinessName, setSelectedBusinessName] = useState('');
  const [media, setMedia] = useState<MediaDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedBusinessSearch = useDebounce(businessSearch, 300);
  const businessIdFromQuery = searchParams.get('businessId') ?? '';

  // Derived single values — take the last element for "single-select" semantics
  const rating = ratingArr[ratingArr.length - 1] ?? '';
  const recommended = recommendedArr[recommendedArr.length - 1] ?? '';
  const visibility = visibilityArr[visibilityArr.length - 1] ?? 'PUBLIC';

  const { data: businessResults, isLoading: businessResultsLoading } = useQuery({
    queryKey: ['pov-business-lookup', debouncedBusinessSearch],
    queryFn: async () => {
      const res = await api.get<PaginatedBusinessLookup>(apiRoutes.search.businesses, {
        params: { keyword: debouncedBusinessSearch, limit: 5 },
      });
      return res.data.data ?? [];
    },
    enabled: !selectedBusinessId && debouncedBusinessSearch.trim().length >= 2,
    staleTime: 60_000,
  });

  const { data: prefilledBusiness } = useQuery({
    queryKey: ['pov-business-prefill', businessIdFromQuery],
    queryFn: async () => {
      const res = await api.get<BusinessProfileLookup>(
        apiRoutes.business.byId(businessIdFromQuery)
      );
      return res.data;
    },
    enabled: !!businessIdFromQuery && !selectedBusinessId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!prefilledBusiness || selectedBusinessId) return;
    setSelectedBusinessId(prefilledBusiness.id);
    setSelectedBusinessName(prefilledBusiness.businessName);
    setBusinessSearch(prefilledBusiness.businessName);
  }, [prefilledBusiness, selectedBusinessId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    let videoCount = media.filter((m) => m.type === 'video').length;
    let imageCount = media.filter((m) => m.type === 'image').length;
    const accepted: MediaDraft[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        toast.error(`"${file.name}" is not a supported image or video.`);
        continue;
      }
      if (isVideo) {
        if (file.size > MAX_VIDEO_BYTES) {
          toast.error(`"${file.name}" exceeds the 200 MB video limit.`);
          continue;
        }
        if (videoCount >= MAX_VIDEOS) {
          toast.error(`You can add at most ${MAX_VIDEOS} videos.`);
          continue;
        }
        videoCount += 1;
      } else {
        if (file.size > MAX_IMAGE_BYTES) {
          toast.error(`"${file.name}" exceeds the 10 MB image limit.`);
          continue;
        }
        if (imageCount >= MAX_IMAGES) {
          toast.error(`You can add at most ${MAX_IMAGES} images.`);
          continue;
        }
        imageCount += 1;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
      });
    }

    if (accepted.length > 0) {
      setMedia((prev) => [...prev, ...accepted]);
    }
    // Allow re-selecting the same file later
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeMedia(id: string) {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((m) => m.id !== id);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedBusinessId && !rating) {
      toast.error('Please select a star rating.');
      return;
    }
    if (selectedBusinessId && !recommended) {
      toast.error('Please indicate if you recommend this business.');
      return;
    }
    if (media.length === 0 && !caption.trim()) {
      toast.error('Add a caption if you want to post a text-only POV.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('visibility', visibility);
      if (selectedBusinessId) {
        formData.append('businessId', selectedBusinessId);
        formData.append('starRating', rating);
        formData.append('recommends', recommended);
      }
      // Order in `media` is the gallery order the backend persists as `position`.
      for (const item of media) {
        formData.append('media', item.file);
      }

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
        icon={Camera}
      >
        <DashboardHeroPill
          icon={Images}
          label="Format"
          value="Media or text"
          note="Post with photos, video, or text only when the written review is strong enough on its own."
        />
        <DashboardHeroPill
          icon={Star}
          label="Review quality"
          value="Business reviews"
          note="Ratings are collected when an experience is attached to a business."
        />
      </DashboardHero>

      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <CardTitle>Create a Point of View</CardTitle>
          <CardDescription>
            Share a personal experience, or attach a business when the POV should become a review.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              {/* Video Upload */}
              <div className="space-y-6">
              <Field>
                <FieldLabel>Photos &amp; video</FieldLabel>
                <FieldDescription>
                  Add up to {MAX_IMAGES} photos and {MAX_VIDEOS} videos as proof
                  (videos up to 200 MB, photos up to 10 MB). You can also skip media and post a text-only POV.
                </FieldDescription>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
                {media.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {media.map((item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-video overflow-hidden rounded-lg border bg-black"
                      >
                        {item.type === 'video' ? (
                          <video src={item.url} className="size-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt="Selected media" className="size-full object-cover" />
                        )}
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
                          {item.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedia(item.id)}
                          aria-label="Remove media"
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border',
                        'text-muted-foreground transition-colors hover:border-ring hover:bg-muted/30',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
                    >
                      <Upload className="size-5" />
                      <span className="text-xs font-medium">Add more</span>
                    </button>
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
                    <Images className="size-10 opacity-60" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-foreground">Click to upload photos or video</span>
                      <span className="text-xs">JPG, PNG, WebP, MP4, MOV, WebM</span>
                    </div>
                    <span className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      <Upload />
                      Choose files
                    </span>
                  </button>
                )}
              </Field>

              {/* Business search */}
              <Field>
                <FieldLabel>Business</FieldLabel>
                <FieldDescription>Attach a business when this experience should become a review.</FieldDescription>
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
                  <div className="space-y-3">
                    <Input
                      placeholder="Search business name…"
                      value={businessSearch}
                      onChange={(e) => setBusinessSearch(e.target.value)}
                    />
                    {businessSearch.trim().length > 0 ? (
                      <div className="rounded-lg border border-border/70 bg-background/90">
                        {businessResultsLoading ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">Searching businesses…</p>
                        ) : businessResults && businessResults.length > 0 ? (
                          <div className="divide-y divide-border/60">
                            {businessResults.map((business) => (
                              <button
                                key={business.id}
                                type="button"
                                className="flex w-full flex-col items-start gap-1 px-3 py-3 text-left transition-colors hover:bg-muted/50"
                                onClick={() => {
                                  setSelectedBusinessId(business.id);
                                  setSelectedBusinessName(business.businessName);
                                  setBusinessSearch(business.businessName);
                                }}
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {business.businessName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {business.category} • {business.location}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : debouncedBusinessSearch.trim().length >= 2 ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">No matching businesses found.</p>
                        ) : (
                          <p className="px-3 py-2 text-sm text-muted-foreground">
                            Type at least 2 characters to search.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </Field>
              </div>

              <div className="space-y-6">
              {selectedBusinessId ? (
                <>
                  {/* Star Rating — single-select via ToggleGroup */}
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
                </>
              ) : null}

              {/* Caption */}
              <Field>
                <FieldLabel>Visibility</FieldLabel>
                <FieldDescription>
                  Public POVs can reach the feed. Follower-only POVs stay with people who follow you.
                </FieldDescription>
                <ToggleGroup
                  value={visibilityArr}
                  onValueChange={(val) => {
                    const next = val.filter((v) => !visibilityArr.includes(v));
                    setVisibilityArr(
                      next.length > 0 ? [next[next.length - 1]] : val.length > 0 ? val.slice(-1) : ['PUBLIC']
                    );
                  }}
                  spacing={1}
                  aria-label="POV visibility"
                >
                  <ToggleGroupItem value="PUBLIC" aria-label="Public POV">
                    Public
                  </ToggleGroupItem>
                  <ToggleGroupItem value="FOLLOWERS" aria-label="Followers-only POV">
                    Followers
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>

              {/* Caption */}
              <Field>
                <FieldLabel>Caption</FieldLabel>
                <FieldDescription>Share your thoughts about this experience. Required when posting without media.</FieldDescription>
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
