'use client';

import CartProvider from './CartProvider';
import DeviceProvider from './DeviceProvider';
import ThemeProvider from './ThemeProvider';
import LenisProvider from './LenisProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DeviceProvider>
      <LenisProvider>
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </LenisProvider>
    </DeviceProvider>
  );
}
