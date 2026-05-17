import { Compass, PlayCircle, ShieldCheck } from 'lucide-react';
import { POVFeed } from '@/components/feed/pov-feed';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';

export const metadata = {
  title: 'Feed',
  description: 'Discover authentic POV video reviews from your community on BuzzMap.',
};

export default function FeedPage() {
  return (
    <div className="flex w-full max-w-none flex-col gap-6">
      <DashboardHero
        eyebrow="Customer feed"
        title="Discover businesses through authentic customer perspective."
        description="The feed is where BuzzMap stops feeling like a static directory and starts feeling alive. Scan POVs, compare experiences, and decide what feels trustworthy."
        icon={Compass}
      >
        <DashboardHeroPill
          icon={PlayCircle}
          label="Format"
          value="POV-first"
          note="Short-form customer perspective is the core trust signal."
        />
        <DashboardHeroPill
          icon={ShieldCheck}
          label="Intent"
          value="Trust before purchase"
          note="Use reviews to validate businesses before you spend."
        />
      </DashboardHero>

      <DashboardPanel
        title="Community Feed"
        description="Recent POV content from across the marketplace, optimized for scanning and discovery."
        icon={PlayCircle}
      >
        <div className="mx-auto w-full max-w-5xl">
          <POVFeed />
        </div>
      </DashboardPanel>
    </div>
  );
}
