import { AdminPlaceholderSection } from '@/components/admin/admin-placeholder-section';

export default function AdminAnnouncementsPage() {
  return (
    <AdminPlaceholderSection
      title="Announcements"
      description="Create and manage platform-wide notices, campaigns, and targeted operational communications."
      capabilities={[
        'Draft, schedule, and send segmented announcements',
        'Target customers, business owners, or the full marketplace',
        'Track send history, delivery intent, and active system banners',
      ]}
    />
  );
}
