/**
 * Structured Data Component
 * Generates JSON-LD structured data for search engines
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEO_CONFIG, getCanonicalUrl } from '@/utils/seo';

interface StructuredDataProps {
  type?: 'organization' | 'website' | 'breadcrumb' | 'webpage';
  breadcrumbs?: Array<{ name: string; url: string }>;
  pageTitle?: string;
  pageDescription?: string;
}

export const StructuredData = ({
  type = 'website',
  breadcrumbs,
  pageTitle,
  pageDescription,
}: StructuredDataProps) => {
  const location = useLocation();
  const canonicalUrl = getCanonicalUrl(location.pathname);

  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SEO_CONFIG.organization.name,
          url: SEO_CONFIG.organization.url,
          founder: {
            '@type': 'Person',
            name: SEO_CONFIG.author,
            url: `https://${SEO_CONFIG.linkedIn}`,
          },
          contactPoint: {
            '@type': 'ContactPoint',
            email: SEO_CONFIG.contactEmail,
            contactType: 'Customer Service',
          },
          sameAs: [
            SEO_CONFIG.organization.url,
            `https://${SEO_CONFIG.linkedIn}`,
            SEO_CONFIG.github,
          ],
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SEO_CONFIG.siteName,
          url: SEO_CONFIG.baseUrl,
          description: SEO_CONFIG.siteDescription,
          publisher: {
            '@type': 'Organization',
            name: SEO_CONFIG.organization.name,
            url: SEO_CONFIG.organization.url,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SEO_CONFIG.baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'breadcrumb':
        if (!breadcrumbs || breadcrumbs.length === 0) {
          return null;
        }
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        };

      case 'webpage':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: pageTitle || SEO_CONFIG.siteName,
          description: pageDescription || SEO_CONFIG.siteDescription,
          url: canonicalUrl,
          publisher: {
            '@type': 'Organization',
            name: SEO_CONFIG.organization.name,
            url: SEO_CONFIG.organization.url,
          },
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

/**
 * Organization structured data (for homepage)
 */
export const OrganizationStructuredData = () => (
  <StructuredData type="organization" />
);

/**
 * Website structured data (for homepage)
 */
export const WebsiteStructuredData = () => (
  <StructuredData type="website" />
);

/**
 * Breadcrumb structured data
 */
export const BreadcrumbStructuredData = ({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ name: string; url: string }>;
}) => <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />;

/**
 * WebPage structured data
 */
export const WebPageStructuredData = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => (
  <StructuredData type="webpage" pageTitle={title} pageDescription={description} />
);

