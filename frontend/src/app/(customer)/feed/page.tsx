import { POVFeed } from '@/components/feed/pov-feed';

export const metadata = {
  title: 'Feed',
  description: 'Discover authentic POV video reviews from your community on BuzzMap.',
};

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold">Your Feed</h1>
      <POVFeed />
    </div>
  );
}
