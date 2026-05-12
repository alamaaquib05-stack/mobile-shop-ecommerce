import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  author = 'MobileShop'
}) => {
  const siteTitle = 'MobileShop - Premium Mobile Accessories';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'Shop premium mobile accessories including phone cases, chargers, cables, screen protectors, earphones, and power banks. Fast delivery, genuine products, easy returns.';
  const metaDescription = description || defaultDescription;
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://mobileshop.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/og-image.jpg`;
  const metaImage = image || defaultImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string
};

export default SEO;

// Made with Bob
