// File: ./pages/_app.tsx

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import { TransactionProvider } from '../contexts/TransactionContext';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { customTheme } from '../config/theme';
import { Toaster } from 'react-hot-toast';
import { AppKit } from '@/contexts/appkit';
import { AppKitProvider } from '@/components/AppKitProvider';
import { Suspense } from 'react';

// App wrapper to provide toast context
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const toast = useToast();

  if (!Component) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <>
      <Head>
        {/* Preload fonts */}
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" type="font/woff" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" type="font/woff" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" type="font/woff2" crossOrigin="" />

        {/* Favicon and manifest configuration */}
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        {/* Meta tags */}
        <title>WillWe · Token Coordination Protocol</title>
        <meta name="description" content="Decentralized Token Coordination Protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WillWe" />
        <meta property="og:description" content="Token Coordination Protocol" />
        <meta property="og:site_name" content="WillWe" />
      </Head>
      
      <Toaster position="top-right" />
      <Suspense fallback={null}>
        <AppKit cookies={props.pageProps.cookies || ''}>
          <AppKitProvider>
            <ChakraProvider theme={customTheme}>
              <TransactionProvider>
                <AppContent {...props} />
              </TransactionProvider>
            </ChakraProvider>
          </AppKitProvider>
        </AppKit>
      </Suspense>
    </>
  );
}