import { AdminPlaceholderSection } from '@/components/admin/admin-placeholder-section';

export default function AdminMessagesPage() {
  return (
    <AdminPlaceholderSection
      title="Messages"
      description="Inspect flagged conversations, abuse signals, and support escalations in platform messaging."
      capabilities={[
        'Review escalated or reported conversations',
        'Link conversation issues back to the customer, business, and order context',
        'Mark safe, escalate, or annotate sensitive messaging incidents',
      ]}
    />
  );
}
