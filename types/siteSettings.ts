import type { SanityImage } from './images';

export interface General {
  siteName: string;
  siteUrl: string;
  businessName: string;
  phone?: string;
  address: string;
  businessHours: string;
}

export interface OrderDelivery {
  deliveryFee: number;
  depositAccount?: string;
  pickupAddress?: string;
  pickupHours?: string;
}

export interface SEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: SanityImage;
}

export interface ThirdParty {
  siteVerifications?: { key: string; value: string }[];
  gtm?: string;
}

export interface SiteSettings {
  general?: General;
  orderDelivery?: OrderDelivery;
  seo?: SEO;
  thirdParty?: ThirdParty;
}
