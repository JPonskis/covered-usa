import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Let next-intl handle routing first
  const response = intlMiddleware(request);

  // Expose the request pathname to server components via a request header.
  // Layouts read this (via next/headers) to conditionally hide chrome on
  // ad-landing routes (e.g. /comenzar) where we want zero site nav distraction.
  if (response) {
    response.headers.set('x-pathname', request.nextUrl.pathname);
  }
  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api routes
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /monitoring (Sentry)
  // - static files (e.g. /favicon.ico, /robots.txt, /sitemap.xml)
  matcher: ['/((?!api|_next|_vercel|monitoring|.*\\..*).*)']
};
