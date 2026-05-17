import { AdminPlaceholderSection } from '@/components/admin/admin-placeholder-section';

export default function AdminSystemPage() {
  return (
    <AdminPlaceholderSection
      title="System"
      description="Track application health, queues, runtime dependencies, and operational readiness across the stack."
      capabilities={[
        'Monitor API, websocket, storage, and queue health',
        'Review runtime incidents, degraded services, and maintenance context',
        'Expose environment-sensitive status needed for support and operations',
      ]}
    />
  );
}
