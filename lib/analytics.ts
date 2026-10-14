import { sendGTMEvent } from '@next/third-parties/google';
import { getSiteSettings } from '@/lib/siteSettings';

export async function trackEvent(
  event: string,
  params: Record<string, string | number | boolean> = {},
) {
  const siteSettings = await getSiteSettings();

  if (!siteSettings?.thirdParty?.gtm) return;

  sendGTMEvent({
    event,
    ...params,
  });
}
