import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import { 
  localhost, 
  base, 
  optimismSepolia, 
  optimism, 
  baseSepolia, 
  taikoHekla, 
  taiko 
} from 'viem/chains';
import { TransactionProvider } from '../contexts/TransactionContext';
import { NodeProvider } from '../contexts/NodeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

// App wrapper to provide toast context
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const toast = useToast();

  return (
    <ErrorBoundary>
      <TransactionProvider toast={toast}>
        <NodeProvider>
          <Component {...pageProps} />
        </NodeProvider>
      </TransactionProvider>
    </ErrorBoundary>
  );
}

function MyApp(props: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        {/* Preload fonts */}
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" crossOrigin="" />

        {/* Favicon and manifest configuration */}
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        {/* Meta tags */}
        <title>WillWe</title>
        <meta name="description" content="Token Coordination Protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Any additional meta tags or SEO configuration */}
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WillWe" />
        <meta property="og:description" content="Token Coordination Protocol" />
        <meta property="og:site_name" content="WillWe" />
      </Head>
      
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        config={{
          loginMethods: ['wallet', 'farcaster', 'email'],
          defaultChain: taikoHekla,
          supportedChains: [
            localhost,
            baseSepolia,
            base,
            taikoHekla,
            taiko,
            optimismSepolia,
            optimism
          ],
          appearance: {
            theme: 'light',
            accentColor: '#7C3AED', // Purple color matching your theme
            showWalletLoginFirst: true,
          },
        }}
        onSuccess={() => router.push('/dashboard')}
      >
        <ChakraProvider>
          <AppContent {...props} />
        </ChakraProvider>
      </PrivyProvider>
    </>
  );
}

export default MyApp;

// Add custom theme configuration
const theme = {
  styles: {
    global: {
      'html, body': {
        minHeight: '100vh',
        backgroundColor: 'gray.50',
        color: 'gray.900',
      },
    },
  },
  fonts: {
    body: "'AdelleSans-Regular', -apple-system, system-ui, sans-serif",
    heading: "'AdelleSans-Semibold', -apple-system, system-ui, sans-serif",
  },
  colors: {
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
};

// Extend Chakra theme
import { extendTheme } from '@chakra-ui/react';
export const customTheme = extendTheme(theme);