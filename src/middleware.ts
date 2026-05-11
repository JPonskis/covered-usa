import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - /api routes
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /monitoring (Sentry)
  // - static files (e.g. /favicon.ico, /robots.txt, /sitemap.xml)
  matcher: ['/((?!api|_next|_vercel|monitoring|.*\\..*).*)']
};
