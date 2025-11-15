/**
 * SEO Component
 * Reusable component for managing page meta tags, Open Graph, and Twitter Cards
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEO_CONFIG, getCanonicalUrl, getPageSEO } from '@/utils/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  canonical?: string;
  author?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  noindex = false,
  canonical,
  author,
}: SEOProps) => {
  const location = useLocation();
  
  // Use provided values or fallback to defaults
  const pageTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.siteName;
  
  const pageDescription = description || SEO_CONFIG.siteDescription;
  const pageKeywords = keywords || SEO_CONFIG.defaultKeywords;
  const pageOgImage = ogImage || `${SEO_CONFIG.baseUrl}${SEO_CONFIG.defaultOgImage}`;
  const pageCanonical = canonical || getCanonicalUrl(location.pathname);
  const pageAuthor = author || SEO_CONFIG.author;
  
  // Build full OG image URL if it's a relative path
  const fullOgImageUrl = pageOgImage.startsWith('http')
    ? pageOgImage
    : `${SEO_CONFIG.baseUrl}${pageOgImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={pageAuthor} />
      
      {/* Robots Meta Tag */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageCanonical} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullOgImageUrl} />
      <meta property="og:url" content={pageCanonical} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullOgImageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SEO_CONFIG.siteName} />
    </Helmet>
  );
};

/**
 * SEO component that automatically gets metadata from route
 */
export const AutoSEO = () => {
  const location = useLocation();
  const pageSEO = getPageSEO(location.pathname);
  
  return (
    <SEO
      title={pageSEO.title}
      description={pageSEO.description}
      keywords={pageSEO.keywords}
      ogImage={pageSEO.ogImage}
      ogType={pageSEO.ogType}
      noindex={pageSEO.noindex}
      canonical={pageSEO.canonical}
    />
  );
};

