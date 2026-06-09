'use client';

import { NotificationsPageContent } from '@/components/notifications/notifications-page-content';

export default function NotificationsPage() {
  return (
    <NotificationsPageContent
      eyebrow="Customer notifications"
      title="Stay ahead of orders, follows, messages, and community activity."
      panelTitle="Recent Notifications"
    />
  );
}
