'use client';

import { useMemo, useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LEGAL_DOCUMENT_CONTENT } from '@/components/legal/legal-document-content';

type LegalDocumentKind = 'terms' | 'privacy';

const LEGAL_DOCS: Record<
  LegalDocumentKind,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    content: string;
  }
> = {
  terms: {
    title: 'Terms and Conditions',
    description: 'Rules for using BuzzMap across customer, business, and admin access.',
    icon: FileText,
    content: LEGAL_DOCUMENT_CONTENT.terms,
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How BuzzMap handles account, platform, and activity information.',
    icon: ShieldCheck,
    content: LEGAL_DOCUMENT_CONTENT.privacy,
  },
};

function getTodayLabel() {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function renderMarkdown(markdown: string) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

    if (block.startsWith('# ')) {
      return (
        <h2 key={`legal-block-${index}`} className="text-2xl font-semibold tracking-tight text-primary">
          {block.slice(2)}
        </h2>
      );
    }

    if (block.startsWith('## ')) {
      return (
        <h3 key={`legal-block-${index}`} className="pt-2 text-lg font-semibold text-foreground">
          {block.slice(3)}
        </h3>
      );
    }

    if (lines.every((line) => line.startsWith('- '))) {
      return (
        <ul key={`legal-block-${index}`} className="space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          {lines.map((line, lineIndex) => (
            <li key={`legal-line-${index}-${lineIndex}`} className="list-disc">
              {line.slice(2)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`legal-block-${index}`} className="text-sm leading-7 text-muted-foreground">
        {lines.join(' ')}
      </p>
    );
  });
}

export function LegalDocumentDialog({ kind }: { kind: LegalDocumentKind }) {
  const [open, setOpen] = useState(false);
  const doc = LEGAL_DOCS[kind];
  const Icon = doc.icon;
  const updatedAt = useMemo(() => getTodayLabel(), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="link"
            className="h-auto cursor-pointer px-0 py-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          />
        }
      >
        {doc.title}
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-hidden rounded-[28px] border border-border/70 bg-background p-0 shadow-[0_32px_90px_-40px_rgba(15,37,64,0.6)] sm:max-w-3xl">
        <div className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-6 py-5">
          <DialogHeader className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                <Icon className="size-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold tracking-tight text-primary">
                  {doc.title}
                </DialogTitle>
                <DialogDescription>{doc.description}</DialogDescription>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary/70">
              Updated at: {updatedAt}
            </p>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <div className="space-y-4">{renderMarkdown(doc.content)}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
