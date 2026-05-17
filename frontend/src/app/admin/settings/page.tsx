import { AdminPlaceholderSection } from '@/components/admin/admin-placeholder-section';

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderSection
      title="Settings"
      description="Govern platform behavior with configurable feature, policy, and marketplace settings."
      capabilities={[
        'Manage feature flags, policy rules, and marketplace configuration',
        'Adjust moderation defaults and platform-level operating settings',
        'Expose a single control surface for future admin-configurable behavior',
      ]}
    />
  );
}
