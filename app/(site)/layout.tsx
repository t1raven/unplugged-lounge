import localFont from 'next/font/local';
const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '45 920',
  display: 'swap',
});
import '@/styles/globals.scss';

import type { Metadata, Viewport } from 'next';
import { getSiteSettings } from '@/lib/siteSettings';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteName = settings?.general?.siteName ?? 'UNPLUGGED LOUNGE';
  const title = settings?.seo?.title ?? siteName;
  const description = settings?.seo?.description ?? '';
  const keywords = settings?.seo?.keywords ?? [];
  const ogImage = settings?.seo?.ogImage
    ? urlFor(settings.seo.ogImage).width(400).height(400).url()
    : undefined;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unplugged-lounge.com'),

    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,
    keywords,

    openGraph: {
      type: 'website',
      locale: 'ko_KR',

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
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={pretendard.variable} suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          <Gnb />
          <Footer data={siteInfo?.general ?? {}} />
        </Providers>
      </body>
    </html>
  );
}
