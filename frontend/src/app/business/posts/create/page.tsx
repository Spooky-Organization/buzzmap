'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { api } from '@/lib/api';

type PostType = 'TEXT' | 'IMAGE' | 'VIDEO';

export default function CreatePostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', postType);
      formData.append('content', content);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      await api.post('/api/v1/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Post published!');
      router.push('/business/dashboard');
    } catch {
      toast.error('Failed to publish post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Create Post</h1>
        <p className="text-muted-foreground">Share updates with your followers</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Post</CardTitle>
          <CardDescription>Choose a post type and add your content</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Post Type</FieldLabel>
              <ToggleGroup
                value={[postType]}
                onValueChange={(vals) => {
                  const last = (vals as PostType[])[vals.length - 1];
                  if (last) setPostType(last);
                }}
                variant="outline"
                spacing={1}
              >
                <ToggleGroupItem value="TEXT">Text</ToggleGroupItem>
                <ToggleGroupItem value="IMAGE">Image</ToggleGroupItem>
                <ToggleGroupItem value="VIDEO">Video</ToggleGroupItem>
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel>Content</FieldLabel>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32"
              />
            </Field>

            {(postType === 'IMAGE' || postType === 'VIDEO') && (
              <Field>
                <FieldLabel>
                  {postType === 'IMAGE' ? 'Upload Image' : 'Upload Video'}
                </FieldLabel>
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8">
                  {mediaFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium">{mediaFile.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMediaFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Drag & drop or click to upload
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('media-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </>
                  )}
                  <input
                    id="media-upload"
                    type="file"
                    className="hidden"
                    accept={postType === 'IMAGE' ? 'image/*' : 'video/*'}
                    onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </Field>
            )}

            <Button
              disabled={submitting || !content.trim()}
              onClick={handleSubmit}
            >
              {submitting && <Spinner data-icon="inline-start" />}
              {submitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
