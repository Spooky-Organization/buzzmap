import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { AutoSEO } from '@/components/seo/SEO';

export const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const copyrightYear = new Date().getFullYear();

  useEffect(() => {
    const loadDocument = async () => {
      setIsLoading(true);
      try {
        const pathsToTry = [
          '/docs/TERMS_AND_CONDITIONS.md',
          '../docs/TERMS_AND_CONDITIONS.md',
          '../../docs/TERMS_AND_CONDITIONS.md',
        ];

        let found = false;
        for (const path of pathsToTry) {
          try {
            const response = await fetch(path, {
              headers: { Accept: 'text/markdown, text/plain, */*' },
            });
            if (response.ok) {
              const content = await response.text();
              // Replace copyright year placeholder
              const processed = content.replace(
                /<span id="copyright-year"><\/span>/g,
                copyrightYear.toString()
              );
              setMarkdown(processed);
              found = true;
              break;
            }
          } catch {
            continue;
          }
        }

        if (!found) {
          setMarkdown('# Terms and Conditions\n\nUnable to load document. Please try again later.');
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setMarkdown('# Terms and Conditions\n\nError loading document.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [copyrightYear]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AutoSEO />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container-custom max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading document...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="prose prose-lg max-w-none markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

