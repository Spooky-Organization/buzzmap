'use client';

import { LegalDocumentDialog } from '@/components/legal/legal-document-dialog';

export function AuthLegalLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
      <LegalDocumentDialog kind="terms" />
    </div>
  );
}
