import { NotificationsPageContent } from '@/components/notifications/notifications-page-content';

export default function BusinessNotificationsPage() {
  return (
    <NotificationsPageContent
      eyebrow="Business notifications"
      title="Stay on top of customer activity, order changes, and account alerts."
      description="The business notification lane keeps commerce events and account signals in your management workspace."
      panelTitle="Recent Business Notifications"
      panelDescription="Unread and recent notification events tied to the signed-in business account."
    />
  );
}
