import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownViewerProps {
  markdown: string;
  title: string;
  onClose: () => void;
  copyrightYear: number;
}

export const MarkdownViewer = ({
  markdown,
  title,
  onClose,
  copyrightYear,
}: MarkdownViewerProps) => {
  const [processedMarkdown, setProcessedMarkdown] = useState(markdown);

  useEffect(() => {
    // Replace copyright year placeholder
    const processed = markdown.replace(
      /<span id="copyright-year"><\/span>/g,
      copyrightYear.toString()
    );
    setProcessedMarkdown(processed);
  }, [markdown, copyrightYear]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="ghost" size="sm" icon={<X className="h-5 w-5" />} onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="prose prose-lg max-w-none markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{processedMarkdown}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 text-center text-sm text-gray-600">
          <p>
            <strong>
              © {copyrightYear} Matthew Makundi, Founder{' '}
              <a
                href="https://www.spookielabsinc.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                SpookieLabsInc
              </a>
            </strong>
          </p>
          <p className="mt-1">
            <em>All rights reserved.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

