// File: ./pages/_app.tsx

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
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import { TransactionProvider } from '../contexts/TransactionContext';
import { NodeProvider } from '../contexts/NodeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { customTheme } from '../config/theme';

// Create a client
const queryClient = new QueryClient();

// App wrapper to provide toast context
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const toast = useToast();

  return (
    <ErrorBoundary>
      <TransactionProvider>
        <NodeProvider>
          <Component {...pageProps} />
        </NodeProvider>
      </TransactionProvider>
    </ErrorBoundary>
  );
}

function MyApp(props: AppProps) {
  const router = useRouter();
  const toast = useToast();

  // Configure Privy login success callback
  const handlePrivyLoginSuccess = async () => {
    await router.push('/dashboard');
    toast({
      title: "Welcome!",
      description: "You've successfully logged in",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  // Configure Privy login error handling
  const handlePrivyLoginError = (error: Error) => {
    toast({
      title: "Login Failed",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

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
        <title>WillWe · Token Coordination Protocol</title>
        <meta name="description" content="Decentralized Token Coordination Protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WillWe" />
        <meta property="og:description" content="Token Coordination Protocol" />
        <meta property="og:site_name" content="WillWe" />
      </Head>
      
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
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
                accentColor: customTheme.colors.brand[600],
                showWalletLoginFirst: true,
              },
            }}
          >
            <ChakraProvider theme={customTheme}>
              <AppContent {...props} />
            </ChakraProvider>
          </PrivyProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;