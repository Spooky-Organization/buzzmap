import { NotificationsPageContent } from '@/components/notifications/notifications-page-content';

export default function AdminNotificationsPage() {
  return (
    <NotificationsPageContent
      eyebrow="Admin alerts"
      title="Track privileged alerts, platform events, and account-linked notifications."
      description="The admin alert lane keeps operational signals visible without forcing you into the customer shell."
      panelTitle="Recent Admin Notifications"
      panelDescription="Unread and recent notification events attached to the current admin account."
    />
  );
}
