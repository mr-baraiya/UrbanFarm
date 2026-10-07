import { useEffect } from 'react';

const PRODUCTION_ORIGIN = 'https://urbanfarm.baraiyavishalbhai32.workers.dev';

/**
 * Dynamic SEO metadata component that sets document title, meta descriptions,
 * OpenGraph tags, canonical links, and html lang attributes per page.
 */
const SEO = ({
  title = 'UrbanFarm - AI Powered Smart Urban Agriculture Platform',
  description = 'Manage your urban garden with AI-powered plant disease detection, weather-based smart watering, crop recommendations, and a community of urban farmers.',
  keywords = 'urban farming, AI plant diagnosis, smart watering, garden tracker, plant disease detection, urban crops, balcony farming, organic agriculture',
  canonical = null,
  ogImage = 'https://urbanfarm.baraiyavishalbhai32.workers.dev/favicon.png',
  lang = 'en',
}) => {
  useEffect(() => {
    // 1. Determine clean canonical URL
    let cleanCanonical = canonical;
    if (!cleanCanonical) {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      cleanCanonical = `${PRODUCTION_ORIGIN}${path === '/' ? '/' : path}`;
    }

    // 2. Update Document Title
    const formattedTitle = title.includes('UrbanFarm') ? title : `${title} | UrbanFarm`;
    document.title = formattedTitle;

    // 3. Update HTML Lang attribute
    document.documentElement.lang = lang || 'en';

    // 4. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 5. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // 6. Update Open Graph Meta Tags
    const ogTags = {
      'og:title': formattedTitle,
      'og:description': description,
      'og:url': cleanCanonical,
      'og:image': ogImage,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`);
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', property);
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute('content', content);
    });

    // 7. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', cleanCanonical);

  }, [title, description, keywords, canonical, ogImage, lang]);

  return null;
};

export default SEO;

