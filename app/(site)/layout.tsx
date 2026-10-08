import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import localFont from 'next/font/local';
const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '400 700',
  display: 'swap',
});
import '@/styles/globals.scss';

import type { Metadata, Viewport } from 'next';
import { getSiteSettings } from '@/lib/siteSettings';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();

  const siteName = siteSettings?.general?.siteName ?? 'UNPLUGGED LOUNGE';
  const title = siteSettings?.seo?.title ?? siteName;
  const description = siteSettings?.seo?.description ?? '';
  const keywords = siteSettings?.seo?.keywords ?? [];
  const ogImage = siteSettings?.seo?.ogImage
    ? urlFor(siteSettings.seo.ogImage).width(400).height(400).url()
    : undefined;
  const SITE_URL = siteSettings?.general?.siteUrl ?? 'https://unplugged-lounge.com';

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,
    keywords,

    alternates: {
      canonical: '/',
    },

    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName,
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 400,
              height: 400,
              alt: title,
            },
          ]
        : [{ url: '/images/common/og-image.png' }],
      url: SITE_URL,
    },

    robots: {
      index: true,
      follow: true,
    },

    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },

    verification: {
      other: {
        ...Object.fromEntries(
          siteSettings?.search?.siteVerifications?.map(({ key, value }) => [key, value]) ?? [],
        ),
      },
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import Providers from '@/components/providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Gnb from '@/components/layout/Gnb';

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteInfo = await getSiteSettings();

  return (
    <html
      lang="ko"
      className={pretendard.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          <Gnb />
          <Footer data={siteInfo?.general ?? {}} />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
