import { useEffect } from 'react';

/**
 * Dynamic SEO metadata component that sets document title, meta descriptions,
 * OpenGraph tags, canonical links, and html lang attributes per page.
 */
const SEO = ({
  title = 'UrbanFarm – Next-Gen Smart Urban Agriculture & AI Plant Guide',
  description = 'Manage your urban garden with AI-powered plant disease detection, weather-based smart watering, crop recommendations, and a community of urban farmers.',
  keywords = 'urban farming, AI plant diagnosis, smart watering, garden tracker, plant disease detection, urban crops, balcony farming, organic agriculture',
  canonical = window.location.href,
  ogImage = 'https://urbanfarm.baraiyavishalbhai32.workers.dev/favicon.png',
  lang = 'en',
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes('UrbanFarm') ? title : `${title} | UrbanFarm`;
    document.title = formattedTitle;

    // 2. Update HTML Lang attribute
    document.documentElement.lang = lang || 'en';

    // 3. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 4. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // 5. Update Open Graph Meta Tags
    const ogTags = {
      'og:title': formattedTitle,
      'og:description': description,
      'og:url': canonical,
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

    // 6. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

  }, [title, description, keywords, canonical, ogImage, lang]);

  return null;
};

export default SEO;
