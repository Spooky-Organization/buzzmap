'use client';

import { NotificationsPageContent } from '@/components/notifications/notifications-page-content';

export default function NotificationsPage() {
  return (
    <NotificationsPageContent
      eyebrow="Customer notifications"
      title="Stay ahead of orders, follows, messages, and community activity."
      description="Notifications connect the moving parts of the marketplace so you can react quickly without checking every page manually."
      panelTitle="Recent Notifications"
      panelDescription="The latest platform and commerce events currently tied to this account."
    />
  );
}
