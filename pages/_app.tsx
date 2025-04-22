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
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
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
          <Component {...pageProps} />
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
            embeddedWallets: {
              noPrompt: true,
            },
          }}
        >
          <WagmiProvider config={config}>
            <ChakraProvider theme={customTheme}>
              <AppContent {...props} />
            </ChakraProvider>
          </WagmiProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;

 // what if owenership was in the form of irrevocable rights of participation radther than stock
   // [...] that is rights that cannot be raided traded bought or soladyActionsbut only acquired by application and acceptance


   // what if power and function were distributed with no power vested in or
   // function performed by any part that could reasonably be exercised by any more pheripheral part


   // what if governance was distributed with no individual institution
   // or combination of either or both, particularly management
   // able to dominate deliberations or control decisions at any scale


   // what if it could seemlessly blend cooperation and competition
   // with all parties free to impead in unique independednt ways yet able
   // to abovoid self-interest and cooperate when necessary in the greater good of the whole


   // what if it were self-organizing and individuals had the right
   // to self-organize at any time for any reason at any scale and yet maintaining their irrevocable
   // rights of participation in governance at any greater scale


   // what if it were infinitely malleable yet extremely durable with all parts
   // capable of constant self-generated modification of form or function without
   // sacrificing its essential purpose, nature or embodied priciples thus releasing
   // human ingenuity and the human spirit




   //// nobody believed it was possible, but they were solidly behind it
  
   /// Dee Hock - Chaordic Organisation
   ///
   ///  




   // the nature of organizations management and scientific exptertise
   // is not only inceasingly irrelevant to our enormous societal and environmental problems
   // it's a primary cause of them
