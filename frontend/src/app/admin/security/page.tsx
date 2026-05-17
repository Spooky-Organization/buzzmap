import { AdminPlaceholderSection } from '@/components/admin/admin-placeholder-section';

export default function AdminSecurityPage() {
  return (
    <AdminPlaceholderSection
      title="Security"
      description="Monitor authentication anomalies, suspicious accounts, uploads, and abuse-related security signals."
      capabilities={[
        'Inspect login anomalies, refresh-token failures, and rate-limit incidents',
        'Review suspicious upload events and abuse-linked account patterns',
        'Escalate, lock, resolve, and annotate security incidents',
      ]}
    />
  );
}
