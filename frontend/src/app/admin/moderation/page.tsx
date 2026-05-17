import { AdminPlaceholderSection } from '@/components/admin/admin-placeholder-section';

export default function AdminModerationPage() {
  return (
    <AdminPlaceholderSection
      title="Moderation"
      description="Moderate POVs, posts, comments, and user reports from one queue-driven review surface."
      capabilities={[
        'Review flagged POVs, posts, comments, and report volumes',
        'Remove, restore, warn, suspend, and escalate with a visible audit trail',
        'Track moderation throughput, unresolved cases, and repeat offenders',
      ]}
    />
  );
}
