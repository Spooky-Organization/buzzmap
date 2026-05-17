import type { Metadata } from 'next';
import { CustomerLayoutShell } from '@/components/shared/customer-layout-shell';

export const metadata: Metadata = {
  title: {
    template: '%s | BuzzMap',
    default: 'BuzzMap',
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayoutShell>{children}</CustomerLayoutShell>;
}
