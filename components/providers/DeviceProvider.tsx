'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'unknown';
export type OperatingSystem =
  'windows' | 'macos' | 'ios' | 'android' | 'chromeos' | 'linux' | 'unknown';
export type Browser =
  'edge' | 'opera' | 'samsung' | 'firefox' | 'chrome' | 'safari' | 'ie' | 'unknown';

export interface DeviceInfo {
  deviceType: DeviceType;
  userAgentDeviceType: DeviceType;
  os: OperatingSystem;
  browser: Browser;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isTouchDevice: boolean;
  isReady: boolean;
}

const serverSnapshot: DeviceInfo = {
  deviceType: 'unknown',
  userAgentDeviceType: 'unknown',
  os: 'unknown',
  browser: 'unknown',
  isIOS: false,
  isAndroid: false,
  isDesktop: false,
  isTablet: false,
  isMobile: false,
  isTouchDevice: false,
  isReady: false,
};

const DeviceContext = createContext<DeviceInfo | undefined>(undefined);
let clientSnapshot: DeviceInfo | undefined;

function getClientSnapshot(): DeviceInfo {
  const width = window.innerWidth;
  const deviceType: DeviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  if (clientSnapshot) {
    if (clientSnapshot.deviceType !== deviceType) {
      clientSnapshot = {
        ...clientSnapshot,
        deviceType,
        isDesktop: deviceType === 'desktop',
        isTablet: deviceType === 'tablet',
        isMobile: deviceType === 'mobile',
      };
    }
    return clientSnapshot;
  }

  const ua = navigator.userAgent;
  // iPadOS can report a desktop Macintosh user agent.
  const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const userAgentDeviceType: DeviceType =
    isIPad || /Tablet|PlayBook|Silk/i.test(ua) || (isAndroid && !/Mobile/i.test(ua))
      ? 'tablet'
      : /Mobi|iPhone|iPod|Windows Phone/i.test(ua)
        ? 'mobile'
        : 'desktop';

  let os: OperatingSystem = 'unknown';
  if (/Windows Phone/i.test(ua)) os = 'windows';
  else if (isIPad || /iPhone|iPod/i.test(ua)) os = 'ios';
  else if (isAndroid) os = 'android';
  else if (/Windows/i.test(ua)) os = 'windows';
  else if (/CrOS/i.test(ua)) os = 'chromeos';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macos';
  else if (/Linux/i.test(ua)) os = 'linux';

  // More specific Chromium browser tokens must precede Chrome and Safari.
  let browser: Browser = 'unknown';
  if (/EdgA?\/|EdgiOS\/|Edge\//i.test(ua)) browser = 'edge';
  else if (/OPR\/|OPiOS\/|Opera/i.test(ua)) browser = 'opera';
  else if (/SamsungBrowser\//i.test(ua)) browser = 'samsung';
  else if (/Firefox\/|FxiOS\//i.test(ua)) browser = 'firefox';
  else if (/Chrome\/|CriOS\//i.test(ua)) browser = 'chrome';
  else if (/Safari\//i.test(ua)) browser = 'safari';
  else if (/MSIE|Trident/i.test(ua)) browser = 'ie';

  clientSnapshot = {
    deviceType,
    userAgentDeviceType,
    os,
    browser,
    isIOS: os === 'ios',
    isAndroid: os === 'android',
    isDesktop: deviceType === 'desktop',
    isTablet: deviceType === 'tablet',
    isMobile: deviceType === 'mobile',
    isTouchDevice: navigator.maxTouchPoints > 0,
    isReady: true,
  };
  return clientSnapshot;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}
const getServerSnapshot = () => serverSnapshot;

export default function DeviceProvider({ children }: { children: ReactNode }) {
  const device = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceInfo {
  const device = useContext(DeviceContext);
  if (!device) throw new Error('useDevice must be used within DeviceProvider');
  return device;
}
