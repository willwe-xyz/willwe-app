import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { localhost, base, optimismSepolia, optimism, baseSepolia, taikoHekla, taiko } from 'viem/chains';
import { ChakraProvider } from '@chakra-ui/react';
import { AirstackProvider } from "@airstack/airstack-react";
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" crossOrigin="" />

        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        <title>WillWe</title>
        <meta name="description" content="Privy Auth Starter" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        config={{
          loginMethods: ['wallet', 'farcaster', 'email'],
          defaultChain: taikoHekla,
          supportedChains: [localhost, baseSepolia, base, taikoHekla, taiko, optimismSepolia, optimism]
        }}
        onSuccess={() => router.push('/dashboard')}
      >
        <ChakraProvider>
          {/* <AirstackProvider apiKey={process.env.NEXT_PUBLIC_AIRSTACK_API_KEY ?? ""}> */}
            {isClient ? <Component {...pageProps} /> : <></>}
          {/* </AirstackProvider> */}
        </ChakraProvider>
      </PrivyProvider>
    </>
  );
}

export default MyApp;