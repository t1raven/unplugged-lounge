import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google';
import { getSiteSettings } from '@/lib/siteSettings';

export default async function GoogleTagManager() {
  const siteSettings = await getSiteSettings();

  const gtmId = siteSettings?.thirdParty?.gtm;

  if (!gtmId) return null;

  return <NextGoogleTagManager gtmId={gtmId} />;
}
