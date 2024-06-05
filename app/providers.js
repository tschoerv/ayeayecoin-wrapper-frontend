"use client";
import '@rainbow-me/rainbowkit/styles.css';
import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { classic, mainnet } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { cookieStorage, createStorage, http, fallback} from 'wagmi'
import { useState, useEffect } from 'react'


export const config = getDefaultConfig({
  appName: 'AyeAyeCoin Wrapper',
  projectId: '71bffa11dcde4c9ad42c56c6c9e29bab',
  chains: [ mainnet ],
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [mainnet.id]:
      http()
  },
});

const client = new QueryClient();

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
        <NextUIProvider>
        {mounted && children}
        </NextUIProvider>
        </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  );
}

