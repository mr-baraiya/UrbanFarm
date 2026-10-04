/**
 * Utility to generate public, cross-device shareable URLs.
 * When running on localhost/dev server, defaults to the deployed production origin so links work on all devices.
 */
export const PUBLIC_FRONTEND_ORIGIN = 'https://urbanfarm.baraiyavishalbhai32.workers.dev';

export const getPublicShareUrl = (path = '') => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : PUBLIC_FRONTEND_ORIGIN;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  let baseOrigin = currentOrigin;

  // If running on local dev server or internal network IP, fallback to production origin
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  ) {
    baseOrigin = PUBLIC_FRONTEND_ORIGIN;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseOrigin}${cleanPath}`;
};
