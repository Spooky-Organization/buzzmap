'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TERMS_OF_SERVICE_CONTENT } from '@/components/legal/terms-of-service-content';

type LegalDocumentKind = 'terms';

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
    title: 'Terms of Service',
    description: 'The BuzzMap Terms of Service governing customer, business, and platform use.',
    icon: FileText,
    content: TERMS_OF_SERVICE_CONTENT,
  },
};

function getTodayLabel() {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

// Lightweight inline markdown: bold-italic (***x***), bold (**x**), italic (*x*),
// and links ([text](url)). Returns React nodes so we never render raw markers.
function parseInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let token = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyBase}-i${token++}`;
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold italic text-foreground">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <em key={key} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <a
          key={key}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {match[4]}
        </a>
      );
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderMarkdown(markdown: string) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const key = `legal-block-${index}`;
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

    if (block.startsWith('### ')) {
      return (
        <h4 key={key} className="pt-1 text-base font-semibold text-foreground">
          {parseInline(block.slice(4), key)}
        </h4>
      );
    }

    if (block.startsWith('## ')) {
      return (
        <h3 key={key} className="pt-3 text-lg font-semibold text-foreground">
          {parseInline(block.slice(3), key)}
        </h3>
      );
    }

    if (block.startsWith('# ')) {
      return (
        <h2 key={key} className="text-2xl font-semibold tracking-tight text-primary">
          {parseInline(block.slice(2), key)}
        </h2>
      );
    }

    if (lines.every((line) => line.startsWith('- '))) {
      return (
        <ul key={key} className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          {lines.map((line, lineIndex) => (
            <li key={`${key}-${lineIndex}`}>{parseInline(line.slice(2), `${key}-${lineIndex}`)}</li>
          ))}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s/.test(line))) {
      return (
        <ol key={key} className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          {lines.map((line, lineIndex) => (
            <li key={`${key}-${lineIndex}`}>
              {parseInline(line.replace(/^\d+\.\s/, ''), `${key}-${lineIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={key} className="text-sm leading-7 text-muted-foreground">
        {parseInline(lines.join(' '), key)}
      </p>
    );
  });
}

export function LegalDocumentDialog({ kind = 'terms' }: { kind?: LegalDocumentKind }) {
  const [open, setOpen] = useState(false);
  const doc = LEGAL_DOCS[kind];
  const Icon = doc.icon;
  const updatedAt = useMemo(() => getTodayLabel(), []);
  const rendered = useMemo(() => renderMarkdown(doc.content), [doc.content]);

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
          <div className="space-y-4">{rendered}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
