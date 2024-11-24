<documents><document index="1">
<source>frontend-context.tsx</source>
<document_content>
// File: package.json
{
  "private": true,
  "engines": {
    "npm": ">=8.0.0 <10.8.2",
    "node": ">=19.0.0 <20.18.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "format": "npx prettier --write \"{__tests__,components,pages,styles}/**/*.{ts,tsx,js,jsx}\"",
    "lint": "next lint && npx prettier --check \"{__tests__,components,pages,styles}/**/*.{ts,tsx,js,jsx}\" && npx tsc --noEmit",
    "context": "./create-context.sh"
  },
  "dependencies": {
    "@airstack/airstack-react": "^0.6.3",
    "@chakra-ui/icons": "^2.1.1",
    "@chakra-ui/next-js": "^2.2.0",
    "@chakra-ui/react": "^2.8.2",
    "@coinbase/onchainkit": "^0.21.0",
    "@covalenthq/client-sdk": "^1.0.2",
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.5",
    "@filebase/sdk": "^1.0.6",
    "@headlessui/react": "^1.7.3",
    "@helia/json": "^4.0.0",
    "@helia/strings": "^4.0.0",
    "@heroicons/react": "^2.0.12",
    "@privy-io/react-auth": "1.83.1",
    "@privy-io/server-auth": "^1.7.3",
    "@supabase/supabase-js": "^2.43.4",
    "@tailwindcss/forms": "^0.5.3",
    "@tanstack/react-query": "^5.45.1",
    "chroma-js": "^3.0.0",
    "color": "^4.2.3",
    "ethers": "^6.12.0",
    "framer-motion": "^11.2.12",
    "helia": "^5.0.1",
    "json-bigint": "^1.0.0",
    "json-bignum": "^0.0.3",
    "json-bignumber": "^1.1.1",
    "lucide-react": "^0.399.0",
    "next": "latest",
    "react": "^18.3.1",
    "react-force-graph": "^1.44.4",
    "react-force-graph-3d": "^1.24.3",
    "react-icons": "^5.2.1",
    "swr": "^2.2.5",
    "tailwind-scrollbar": "^3.1.0",
    "three": "^0.167.1",
    "viem": "^2.9.28"
  },
  "devDependencies": {
    "@tsconfig/next": "^2.0.0",
    "@tsconfig/node18": "^18.2.0",
    "@tsconfig/strictest": "^2.0.1",
    "@types/chroma-js": "^2.4.4",
    "@types/color": "^3.0.6",
    "@types/node": "^18",
    "@types/react": "18.2.0",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^5.62.0",
    "@typescript-eslint/parser": "^5.62.0",
    "autoprefixer": "^10.4.7",
    "dotenv-cli": "^6.0.0",
    "eslint": "^8.23.0",
    "eslint-config-next": "12.2.5",
    "postcss": "^8.4.14",
    "tailwindcss": "^3.4.4",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.6"
  }
}



// File: next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/nodes',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/nodes/:chainId/:nodeId',
        destination: '/nodes/[chainId]/[nodeId]',
      },
    ];
  },
};



// File: tsconfig.json
{
  "extends": [
    "@tsconfig/next/tsconfig"
  ],
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "allowUnusedLabels": true,
    "allowUnreachableCode": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "plugins": [
      { "name": "viem/ts-plugin" }
    ],
    "declaration": true,
    "sourceMap": true,
    "stripInternal": true,
    "allowJs": true,
    "noEmit": true,
    "noEmitOnError": false,
    "module": "esnext",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx"
  ],
  "exclude": [
    "node_modules"
  ]
}



// File: ./pages/dashboard.tsx
// File: ./pages/dashboard.tsx

import { useRouter } from 'next/router';
import { usePrivy } from "@privy-io/react-auth";
import { 
  Box, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  useToast 
} from '@chakra-ui/react';
import { MainLayout } from '../components/Layout/MainLayout';
import { RootNodeDetails } from '../components/RootNodeDetails';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import { useNode } from '../contexts/NodeContext';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import { useChainId } from '../hooks/useChainId';
import { useActivityFeed } from '../hooks/useActivityFeed';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  
  // Hooks
  const { colorState, cycleColors } = useColorManagement();
  const { user, ready, authenticated, logout, login } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const { chainId } = useChainId();
  const { activities, isLoading: activitiesLoading } = useActivityFeed(chainId);

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;

  // Fetch nodes data
  const { 
    data: nodes, 
    isLoading: nodesLoading, 
    error: nodesError, 
    refetch: refreshNodes 
  } = useRootNodes(
    chainId,
    tokenAddress,
    user?.wallet?.address || ''
  );

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    selectToken(tokenAddress);
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    }, undefined, { shallow: true });
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    router.push(`/nodes/${chainId}/${nodeId}`);
  };

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId,
    logout,
    login,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      handleNodeSelect(nodeId);
    },
  };

  // Empty dashboard state
  const renderEmptyDashboard = () => (
    <Box className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto w-full p-8">
      <Box className="w-full bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <Text className="text-2xl font-semibold mb-6 text-center">
          Welcome to WillWe
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Select a token from above to explore its value network
        </Text>
        
        <ActivityFeed
          activities={activities}
          isLoading={activitiesLoading}
          onRefresh={refreshNodes}
        />
      </Box>
    </Box>
  );

  // Loading state
  if (!ready || nodesLoading) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </MainLayout>
    );
  }

  // Authentication check
  if (!authenticated) {
    return (
      <MainLayout headerProps={headerProps}>
        <Alert status="warning" variant="subtle">
          <AlertIcon />
          Please connect your wallet to continue
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerProps={headerProps}>
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        {!tokenAddress ? (
          renderEmptyDashboard()
        ) : (
          <RootNodeDetails 
            nodes={nodes || []}
            isLoading={nodesLoading}
            error={nodesError}
            onRefresh={refreshNodes}
            selectedTokenColor={colorState.contrastingColor}
            chainId={chainId}
            selectedToken={tokenAddress}
            onNodeSelect={handleNodeSelect}
          />
        )}
      </Box>
    </MainLayout>
  );
}



// File: ./pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Roboto+Mono&family=Open+Sans&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}



// File: ./pages/index.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { Spinner, Heading, Text, Button, VStack, Box, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import DashboardPage from './dashboard';

const WideText = chakra(Text, {
  baseStyle: {
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  },
});

interface BackgroundLetterProps {
  children: React.ReactNode;
  color: string;
  x: number;
  y: number;
  z: number;
}

const BackgroundLetter = React.memo<BackgroundLetterProps>(({ children, color, x, y, z }) => (
  <motion.div
    style={{
      position: 'absolute',
      fontSize: '26vw',
      fontWeight: 'bold',
      color: color,
      opacity: 0.2,
      transformStyle: 'preserve-3d',
      transform: `translate3d(${x}px, ${y}px, ${z}px)`,
    }}
  >
    {children}
  </motion.div>
));

BackgroundLetter.displayName = 'BackgroundLetter';

const Home: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    handleResize();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleMouseMove]);

  const { centerX, centerY, maxDistance, rightShift } = useMemo(() => {
    const centerX = windowSize.width / 2;
    const centerY = windowSize.height / 2;
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const rightShift = windowSize.width * 0.18;
    return { centerX, centerY, maxDistance, rightShift };
  }, [windowSize]);

  const getTransform = useCallback((baseX: number, baseY: number, baseZ: number, letter: string) => {
    const dx = mousePosition.x - centerX;
    const dy = mousePosition.y - centerY;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const factor = distance / maxDistance;

    let x, y, z;

    switch (letter) {
      case 'X':
        x = baseX + dx * factor * 0.2;
        y = baseY + dy * factor * 0.05;
        z = baseZ - distance * 0.1;
        break;
      case 'Y':
        x = baseX + dx * factor * 0.05;
        y = baseY + dy * factor * 0.2;
        z = baseZ - distance * 0.15;
        break;
      case 'Z':
        x = baseX + dx * factor * 0.1;
        y = baseY + dy * factor * 0.1;
        z = baseZ - distance * 0.2;
        break;
      default:
        x = baseX + dx * factor * 0.1;
        y = baseY + dy * factor * 0.1;
        z = baseZ - distance * 0.1;
    }

    return { x, y, z };
  }, [mousePosition, centerX, centerY, maxDistance]);

  const squareDotPosition = useMemo(() => {
    if (windowSize.width === 0) return { x: 0, y: 0, z: 0 };
    const baseX = -windowSize.width * 0.3;
    const baseY = windowSize.height * 0.3;
    const { x, y, z } = getTransform(baseX, baseY, 0, 'dot');
    return { x: x * 0.2, y: y * 0.2, z: z * 0.2 };
  }, [getTransform, windowSize]);

  // Only render content when window size is available
  if (windowSize.width === 0) return null;

  if ( authenticated && ready) {
      return (
        <DashboardPage />
      );
    } else {
      return (
        <>
          <Head>
            <title>WillWe · Home</title>
          </Head>
    
          <motion.main
            className="flex min-h-screen min-w-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 overflow-hidden"
            style={{ perspective: 1000 }}
          >
            <BackgroundLetter color="yellow" {...getTransform(-100 + rightShift, -100, -200, 'Y')}>Y</BackgroundLetter>
            <BackgroundLetter color="cyan" {...getTransform(100 + rightShift, 100, -300, 'X')}>X</BackgroundLetter>
            <BackgroundLetter color="magenta" {...getTransform(0 + rightShift, 200, -250, 'Z')}>Z</BackgroundLetter>
    
            <motion.div
              style={{
                position: 'absolute',
                left: '10%',
                bottom: '20%',
                width: '36px',
                height: '36px',
                backgroundColor: 'black',
                transform: `translate3d(${squareDotPosition.x}px, ${squareDotPosition.y}px, ${squareDotPosition.z}px)`,
              }}
            />
    
            <Box className="flex flex-1 p-6 justify-center items-center backdrop-blur-sm bg-white/30 relative">
              <VStack spacing={8} align="center" maxWidth="400px">
                <Heading 
                  as="h1" 
                  size="3xl" 
                  mb={4} 
                  color="white" 
                  fontFamily="'Dancing Script', cursive"
                  textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                >
                  WillWe
                </Heading>
                <Text 
                  align="center" 
                  fontSize="2xl" 
                  lineHeight="tall" 
                  color="white"
                  fontFamily="'Roboto Mono', monospace"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ textShadow: '5px 20px 5px rgba(0,0,0,0.4)' }}>a</span>
                  <span style={{ textShadow: '5px 20px 5px rgba(0,0,0,0.4)' }}>token</span>
                  <span style={{ textShadow: '5px 20px 5px rgba(0,0,0,0.4)' }}>use pattern</span>
                  <span style={{ textShadow: '5px 20px 5px rgba(0,0,0,0.4)' }}>enabling safe</span>
                  <span style={{ textShadow: '5px 20px 5px rgba(0,0,0,0.4)' }}>self-explanatory</span>
                  <span style={{ textShadow: '5px 20px 5px rgba(0,0,0,0.4)' }}>co-operative efforts</span>
                </Text>
    
                <WideText 
                  fontWeight="bold" 
                  fontSize="3xl" 
                  color="white" 
                  mt={1}
                  fontFamily="'Open Sans', sans-serif"
                  textShadow="5px 20px 5px rgba(0,0,0,0.4)"
                  letterSpacing="0.2em"
                >
                  EVIDENTLY NEUTRAL
                </WideText>
                <VStack spacing={4} width="100%">
                  <Button
                    colorScheme="whiteAlpha"
                    size="lg"
                    onClick={login}
                    width="32%"
                    px={8}
                    py={6}
                    fontSize="lg"
                    boxShadow="5px 20px 5px rgba(0,0,0,0.4)"
                    _hover={{ boxShadow: "0 6px 8px rgba(0,0,0,0.4)", bg: "whiteAlpha.400" }}
                    fontFamily="'Open Sans', sans-serif"
                  >
                    Log in
                  </Button>
                  <Button
                    colorScheme="whiteAlpha"
                    size="lg"
                    width="32%"
                    px={8}
                    py={6}
                    fontSize="lg"
                    boxShadow="5px 20px 5px rgba(0,0,0,0.4)"
                    _hover={{ boxShadow: "0 6px 8px rgba(0,0,0,0.4)", bg: "whiteAlpha.400" }}
                    fontFamily="'Open Sans', sans-serif"
                  >
                   
                  </Button>
                  <Button
                    colorScheme="whiteAlpha"
                    size="lg"
                    width="32%"
                    px={8}
                    py={6}
                    fontSize="lg"
                    boxShadow="5px 20px 5px rgba(0,0,0,0.4)"
                    _hover={{ boxShadow: "0 6px 8px rgba(0,0,0,0.4)", bg: "whiteAlpha.400" }}
                    fontFamily="'Open Sans', sans-serif"
                  >
                    
                  </Button>
                  <Button
                    colorScheme="whiteAlpha"
                    size="lg"
                    width="32%"
                    px={8}
                    py={6}
                    fontSize="lg"
                    boxShadow="5px 20px 5px rgba(0,0,0,0.4)"
                    _hover={{ boxShadow: "0 6px 8px rgba(0,0,0,0.4)", bg: "whiteAlpha.400" }}
                    fontFamily="'Open Sans', sans-serif"
                  >
                    
                  </Button>
                </VStack>
              </VStack>
            </Box>
          </motion.main>
        </>
      );
    }
  }

  Home.displayName = 'Home';

  export default Home;

  







// File: ./pages/nodes/[chainId]/[nodeId].tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import AppLayout from '../../../components/Layout/AppLayout';
import NodeDetails from '../../../components/NodeDetails';
import { useNodeData } from '../../../hooks/useNodeData';
import { useColorManagement } from '../../../hooks/useColorManagement';

const NodePage = () => {
  const router = useRouter();
  const { colorState } = useColorManagement();
  const toast = useToast();

  const { chainId, nodeId } = router.query;

  useEffect(() => {
    if (router.isReady && (!chainId || !nodeId)) {
      toast({
        title: "Error",
        description: "Invalid node or chain ID",
        status: "error",
        duration: 5000,
      });
      router.push('/dashboard');
    }
  }, [router.isReady, chainId, nodeId, router, toast]);

  const { data: nodeData, isLoading, error } = useNodeData(
    chainId as string,
    nodeId as string
  );

  if (!router.isReady || !chainId || !nodeId) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        <NodeDetails
          chainId={chainId as string}
          nodeId={nodeId.toString()}
          selectedTokenColor={colorState.contrastingColor}
        />
      </Box>
    </AppLayout>
  );
};

export default NodePage;



// File: ./pages/api/upload-to-ipfs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectManager } from "@filebase/sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
console.log("uploadtoipfs, request:", req);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const objectManager = new ObjectManager(
      process.env.FILEBASE_S3_KEY!,
      process.env.FILEBASE_S3_SECRET!,
      {
        bucket: `${process.env.FILEBASE_BUCKET_NAME}`
      }
    );

    const objectName = `entity-${Date.now()}.json`;
    const uploadedObject = await objectManager.upload(
      objectName,
      Buffer.from(JSON.stringify(data)),
      'application/json',
      process.env.FILEBASE_BUCKET_NAME
    );

    res.status(200).json({ cid: uploadedObject.cid });
  } catch (error) {
    console.error('Error uploading to Filebase:', error);
    res.status(500).json({ message: 'Error uploading to IPFS' });
  }
}



// File: ./pages/404.js
// pages/404.js

import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Global, css } from '@emotion/react';

const Custom404 = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7fafc'
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        bgGradient="linear(to-r, #ff9a9e, #fad0c4, #fad0c4, #ffdde1)"
        animation="backgroundAnimation 15s ease infinite"
        zIndex={-1}
      />

      {/* Central 404 Title */}
      <Heading as="h1" size="4xl" mb={4} color="gray.800">
        404
      </Heading>

      <Heading as="h2" size="2xl" mb={4} color="gray.800">
        Can devs do something?
      </Heading>
      <Text fontSize="lg" mb={6} color="gray.600" maxW="600px">
        Okay, Okay, Okay, I need WillWe to work. I can’t take this anymore. Every day I’m checking the site and it’s broken.
        Every day I check the site, bad site. I can’t take this anymore man. I have over-committed, by a lot.
        It is what it is but I need the site to be fixed.
      </Text>
      <Button 
        colorScheme="teal" 
        onClick={() => window.location.reload()}
      >
        Try again
      </Button>

      {/* Add Global styles using Emotion */}
      <Global
        styles={css`
          @keyframes backgroundAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      />
    </div>
  );
};

Custom404.displayName = 'Custom404';

export default Custom404;



// File: ./pages/_app.tsx
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
import { TransactionProvider } from '../contexts/TransactionContext';
import { NodeProvider } from '../contexts/NodeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { customTheme } from '../config/theme';

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
    </>
  );
}

export default MyApp;



// File: ./components/Node/NodeOperations.tsx
import React, { useState, useCallback } from 'react';
import { ethers, ContractRunner } from 'ethers';
import {
  ButtonGroup,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Progress,
  useToast,
  Text,
  Alert,
  AlertIcon,
  Tooltip,
  Table,
  Tbody,
  Tr,
  Td,
  Box,
  Card,
  CardHeader,
  CardBody,
  Badge,
  HStack,
  Link,
  ToastId
} from '@chakra-ui/react';
import {
  GitBranch,
  Shield,
  UserPlus,
  RefreshCw,
  Plus,
  Trash,
  ChevronDown,
} from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { deployments, ABIs } from '../../config/contracts';
import { nodeIdToAddress } from '../../utils/formatters';
import { RequirementsTable } from '../TokenOperations/RequirementsTable';
import { MembraneMetadata, MembraneRequirement } from '../../types/chainData';
import { Link as ChakraLink } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';



const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

export type NodeOperationsProps = {
  nodeId: string;
  chainId: string;
  selectedTokenColor?: string;
  onSuccess?: () => void;
};

interface MembraneCharacteristic {
  title: string;
  description?: string;
  link?: string;
}

// Add this type definition near the top of the file
type ModalType = 'spawn' | 'membrane' | 'mint' | 'burn' | null;

export const NodeOperations = ({
  nodeId,
  chainId,
  selectedTokenColor,
  onSuccess
}: NodeOperationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [membraneId, setMembraneId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [burnAmount, setBurnAmount] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  
  // Fetch node data to check membership
  const { data: nodeData } = useNodeData(chainId, nodeId);
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address || '');

  const checkAllowance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address) {
        console.warn('Token address or user address not available');
        return;
      }

      const tokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];

      if (!willWeAddress) {
        console.warn('WillWe contract address not available');
        return;
      }

      const provider = await getEthersProvider();
      const signer = await provider.getSigner();

      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function allowance(address,address) view returns (uint256)',
          'function approve(address,uint256) returns (bool)'
        ],
        //@ts-ignore
        signer
      );

      const currentAllowance = await tokenContract.allowance(
        user.wallet.address,
        willWeAddress
      );
      
      setAllowance(currentAllowance.toString());
      const requiredAmount = ethers.parseUnits(mintAmount || '0', 18);
      setNeedsApproval(BigInt(currentAllowance) < BigInt(requiredAmount));
    } catch (error) {
      console.error('Error checking allowance:', error);
      toast({
        title: 'Error',
        description: 'Failed to check token allowance',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, user?.wallet?.address, mintAmount, getEthersProvider, toast]);

  const handleApprove = useCallback(async () => {
    if (!nodeData?.rootPath?.[0] || isProcessing) {
      return;
    }

    try {
      const tokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function approve(address,uint256) returns (bool)',
          'function allowance(address,address) view returns (uint256)'
        ],
        //@ts-ignore
        signer
      );

      await executeTransaction(
        chainId,
        async () => {
          const tx = await tokenContract.approve(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ethers.MaxUint256
          );
          return tx;
        },
        {
          successMessage: 'Approval granted successfully',
          onSuccess: async () => {
            await checkAllowance();
          }
        }
      );
    } catch (error) {
      console.error('Approval error:', error);
    }
  }, [chainId, nodeData?.rootPath, getEthersProvider, checkAllowance, isProcessing]);

  const checkNodeBalance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address) {
        console.warn('Token address or user address not available');
        return;
      }

      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      // Use WillWe contract address instead of token address
      const tokenContract = new ethers.Contract(
        contractAddress,
        [
          'function balanceOf(address account, uint256 id) view returns (uint256)'
        ],
        //@ts-ignore
        signer
      );

      console.log('Checking ERC1155 balance:', {
        userAddress: user.wallet.address,
        nodeId,
        contractAddress
      });

      const balance = await tokenContract.balanceOf(
        user.wallet.address,
        BigInt(nodeId)
      );
      
      console.log('Node token balance received:', balance.toString());
      setUserBalance(balance.toString());
    } catch (error) {
      console.error('Error checking node balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to check node token balance',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, user?.wallet?.address, nodeId, getEthersProvider, toast]);

  const handleSpawnNode = useCallback(async () => {
    if (isProcessing) return;
    
    let confirmToastId: ToastId | undefined;
    let pendingToastId: ToastId | undefined;
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      confirmToastId = toast({
        title: 'Confirm Transaction',
        description: 'Please sign the transaction in your wallet',
        status: 'info',
        duration: null
      });

      await executeTransaction(
        chainId,
        async () => {
          if (confirmToastId) toast.close(confirmToastId);
          
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer as unknown as ContractRunner
          );
          
          pendingToastId = toast({
            title: 'Transaction Pending',
            description: 'Your transaction is being processed',
            status: 'loading',
            duration: null
          });

          const tx = await contract.spawnBranch(nodeId, {
            gasLimit: BigInt(400000)
          });
          return tx;
        },
        {
          successMessage: 'Node spawned successfully',
          onSuccess: () => {
            if (pendingToastId) toast.close(pendingToastId);
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      if (confirmToastId) toast.close(confirmToastId);
      if (pendingToastId) toast.close(pendingToastId);
      
      console.error('Failed to spawn node:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, isProcessing, executeTransaction, getEthersProvider, toast, onSuccess, setActiveModal]);

  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isValidatingMembrane, setIsValidatingMembrane] = useState(false);
  const [membraneError, setMembraneError] = useState<string | null>(null);

  const validateMembrane = useCallback(async (membraneId: string) => {
    setIsValidatingMembrane(true);
    setMembraneError(null);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      
      if (!provider) {
        throw new Error('Provider not available');
      }
  
      const contract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        //@ts-ignore
        provider.getSigner()
      );
  
      const membrane = await contract.getMembraneById(membraneId);
      if (!membrane) throw new Error('Membrane not found');
  
      const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
      if (!response.ok) throw new Error('Failed to fetch membrane metadata');
      
      const metadata = await response.json();
      setMembraneMetadata(metadata);
  
      setIsLoadingTokens(true);
      const requirements = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
            //@ts-ignore  
            provider.getSigner()
          );
  
          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);
  
          return {
            tokenAddress,
            symbol,
            requiredBalance: membrane.balances[index].toString(),
            formattedBalance: ethers.formatUnits(membrane.balances[index], decimals)
          };
        })
      );
  
      setRequirements(requirements);
    } catch (error) {
      console.error('Error validating membrane:', error);
      setMembraneError('Invalid membrane ID');
      setMembraneMetadata(null);
      setRequirements([]);
    } finally {
      setIsValidatingMembrane(false);
      setIsLoadingTokens(false);
    }
  }, [
    chainId,
    getEthersProvider,
    setIsValidatingMembrane,
    setMembraneError,
    setMembraneMetadata,
    setRequirements,
    setIsLoadingTokens,
    IPFS_GATEWAY
  ]);


  const handleSpawnWithMembrane = useCallback(async () => {
    if (!membraneId) {
      toast({
        title: 'Error',
        description: 'Please enter a membrane ID',
        status: 'error',
        duration: 3000
      });
      return;
    }
  
    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
  
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            //@ts-ignore
            signer
          );
          return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
        },
        {
          successMessage: 'Node spawned with membrane successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to spawn node with membrane:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    chainId,
    nodeId,
    membraneId,
    executeTransaction,
    getEthersProvider,
    toast,
    onSuccess,
    setActiveModal,
    setIsProcessing
  ]);  

  const handleMintMembership = useCallback(async () => {
    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            //@ts-ignore
            signer
          );
          return contract.mintMembership(nodeId);
        },
        {
          successMessage: 'Membership minted successfully',
          onSuccess
        }
      );
    } catch (error) {
      console.error('Failed to mint membership:', error);
      toast({
        title: 'Error',
        //@ts-ignore
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, toast, onSuccess]);

  const handleRedistribute = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      toast({
        title: 'Confirm Transaction',
        description: 'Please sign the transaction in your wallet',
        status: 'info',
        duration: null
      });

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            //@ts-ignore
            signer
          );

          toast({
            title: 'Transaction Pending',
            description: 'Your transaction is being processed',
            status: 'loading',
            duration: null
          });

          return contract.redistributePath(nodeId, { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getEthersProvider, toast, onSuccess, isProcessing]);

  const handleMintPath = useCallback(async () => {
    if (!mintAmount || isProcessing) return;
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            //@ts-ignore
            signer
          );
          
          return await contract.mintPath(nodeId, ethers.parseUnits(mintAmount, 18), {
            gasLimit: BigInt(500000)
          });
        },
        {
          successMessage: 'Tokens minted successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to mint tokens:', error);
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing]);

  const handleBurnPath = useCallback(async () => {
    if (!burnAmount) return;
    
    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            [
              'function burnPath(uint256 target_, uint256 amount) external'
            ],
            //@ts-ignore
            signer
          );
          
          const nodeIdBigInt = BigInt(nodeId);
          const amountToBurn = ethers.parseUnits(burnAmount || '0', 18);
          return contract.burnPath(nodeIdBigInt, amountToBurn);
        },
        {
          successMessage: 'Path burned successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          } 
        }
      );
    } catch (error) {
      console.error('Failed to burn path:', error);
      toast({
        title: 'Error',
        //@ts-ignore
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, toast, onSuccess]);

  return (
    <>
      <ButtonGroup size="sm" spacing={2} flexWrap="wrap">
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
          >
            Actions
          </MenuButton>
          <MenuList>
            <MenuItem icon={<GitBranch size={16} />} onClick={() => setActiveModal('spawn')}>
              Spawn Node
            </MenuItem>
            <MenuItem icon={<Shield size={16} />} onClick={() => setActiveModal('membrane')}>
              Spawn with Membrane
            </MenuItem>
            <MenuItem 
              icon={<UserPlus size={16} />} 
              onClick={handleMintMembership}
              isDisabled={isMember}
            >
              Mint Membership
            </MenuItem>
            <MenuItem icon={<RefreshCw size={16} />} onClick={handleRedistribute}>
              Redistribute
            </MenuItem>
            <MenuItem icon={<Plus size={16} />} onClick={() => setActiveModal('mint')}>
              Mint Path
            </MenuItem>
            <MenuItem 
              icon={<Trash size={16} />} 
              onClick={() => {
                setActiveModal('burn');
                checkNodeBalance();
              }}
            >
              Burn Path
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>

      {/* Spawn Node Modal */}
      <Modal isOpen={activeModal === 'spawn'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Spawn New Node</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Text>This will create a new sub-node under the current node.</Text>
              </Alert>
              
              <Button
                colorScheme="purple"
                onClick={handleSpawnNode}
                isLoading={isProcessing}
                width="100%"
              >
                Spawn Node
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Membrane Modal */}
      <Modal 
        isOpen={activeModal === 'membrane'} 
        onClose={() => setActiveModal(null)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader>
            <Text>Spawn Node with Membrane</Text>
            <ModalCloseButton />
          </ModalHeader>
          
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Membrane ID</FormLabel>
                <Input
                  value={membraneId}
                  onChange={(e) => {
                    setMembraneId(e.target.value);
                    if (e.target.value) {
                      validateMembrane(e.target.value);
                    } else {
                      setMembraneMetadata(null);
                      setRequirements([]);
                      setMembraneError(null);
                    }
                  }}
                  placeholder="Enter membrane ID"
                  size="sm"
                  fontFamily="mono"
                  fontSize="sm"
                />
              </FormControl>

              {(isValidatingMembrane || isLoadingTokens) && (
                <Box py={2}>
                  <Progress size="xs" isIndeterminate colorScheme="purple" />
                  <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
                    {isValidatingMembrane ? 'Validating membrane...' : 'Loading token details...'}
                  </Text>
                </Box>
              )}

              {membraneError && (
                <Alert status="error" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">{membraneError}</Text>
                </Alert>
              )}

              {membraneMetadata && !membraneError && (
                <Box>
                  <Card variant="outline" bg="purple.50">
                    <CardBody p={4}>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="bold">{membraneMetadata.name}</Text>
                          <Badge colorScheme="purple" fontSize="xs">ID: {membraneId.slice(0, 8)}...</Badge>
                        </HStack>
                        
                        {membraneMetadata.characteristics?.map((char, idx) => (
                          <Box
                            key={idx}
                            p={2}
                            bg="white"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="purple.100"
                          >
                            <HStack justify="space-between">
                              <Text fontSize="sm">{char.title}</Text>
                              {char.link && (
                                <ChakraLink 
                                  href={char.link} 
                                  isExternal 
                                  color="purple.500"
                                  fontSize="xs"
                                >
                                  <HStack spacing={1}>
                                    <Text>Open</Text>
                                    <ExternalLinkIcon width={5} height={5} />
                                  </HStack>
                                </ChakraLink>
                              )}
                            </HStack>
                            {char.title && (
                              <Text fontSize="xs" color="gray.600" mt={1}>
                                {char.title}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Token Requirements:</Text>
                    <RequirementsTable
                      requirements={requirements}
                      chainId={chainId}
                    />
                  </Box>
                </Box>
              )}

              <Button
                colorScheme="purple"
                onClick={handleSpawnWithMembrane}
                isLoading={isProcessing}
                width="100%"
                mt={4}
                isDisabled={!membraneId || !!membraneError || isValidatingMembrane || isLoadingTokens}
              >
                Spawn Node with Membrane
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Mint Path Modal */}
      <Modal isOpen={activeModal === 'mint'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mint Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  value={mintAmount}
                  onChange={(e) => {
                    setMintAmount(e.target.value);
                    checkAllowance();
                  }}
                  placeholder="Enter amount to mint"
                  type="number"
                />
              </FormControl>

              {mintAmount && (
                <Alert status={needsApproval ? "warning" : "success"}>
                  <AlertIcon />
                  <Text>
                    {needsApproval 
                      ? "Approval required before minting" 
                      : "Ready to mint"}
                  </Text>
                </Alert>
              )}

              {needsApproval ? (
                <Button
                  colorScheme="blue"
                  onClick={handleApprove}
                  isLoading={isProcessing}
                  width="100%"
                >
                  Approve Tokens
                </Button>
              ) : (
                <Button
                  colorScheme="purple"
                  onClick={handleMintPath}
                  isLoading={isProcessing}
                  width="100%"
                  isDisabled={!mintAmount}
                >
                  Mint Tokens
                </Button>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Burn Path Modal */}
      <Modal isOpen={activeModal === 'burn'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Burn Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  value={burnAmount}
                  onChange={(e) => {
                    setBurnAmount(e.target.value);
                    checkNodeBalance();
                  }}
                  placeholder="Enter amount to burn"
                  type="number"
                />
              </FormControl>

              {burnAmount && (
                <Alert 
                  status={
                    BigInt(ethers.parseUnits(burnAmount || '0', 18)) <= BigInt(userBalance)
                      ? "success" 
                      : "error"
                  }
                >
                  <AlertIcon />
                  <Text>
                    {BigInt(ethers.parseUnits(burnAmount || '0', 18)) <= BigInt(userBalance)
                      ? "Ready to burn"
                      : "Insufficient balance"
                    }
                  </Text>
                </Alert>
              )}

              <Button
                colorScheme="purple"
                onClick={handleBurnPath}
                isLoading={isProcessing}
                width="100%"
                isDisabled={!burnAmount}
              >
                Burn Tokens
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NodeOperations;



// File: ./components/Node/NodePill.tsx
// File: ./components/Node/NodePill.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, 
  Text, 
  HStack, 
  VStack,
  Tooltip, 
  Button,
  Progress,
  useColorModeValue,
  SlideFade,
} from "@chakra-ui/react";
import { 
  Users, 
  Info, 
  UserPlus, 
  GitBranch, 
  Droplet,
  Activity,
  RefreshCw
} from 'lucide-react';
import { NodeState } from '../../types/chainData';
import { formatBalance } from '../../hooks/useBalances';
import { createPortal } from 'react-dom';

interface NodePillProps {
  node: NodeState;
  totalValue: number;
  color: string;
  onNodeClick: (nodeId: string) => void;
  onMintMembership: (nodeId: string) => void;
  onSpawnNode: (nodeId: string) => void;
  onTrickle: (nodeId: string) => void;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  percentage: number;
  isProcessing?: boolean;
}

const NodePill: React.FC<NodePillProps> = ({
  node,
  totalValue,
  color,
  onNodeClick,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  backgroundColor,
  textColor,
  borderColor,
  percentage = 0,
  isProcessing = false
}) => {
  // Refs and state
  const pillRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Theme
  const bgColor = useColorModeValue('white', 'gray.800');
  const menuBgColor = useColorModeValue(backgroundColor, `${backgroundColor}30`);

  // Node data
  const hasSignals = node?.signals?.length > 0 || false;
  const memberCount = node?.membersOfNode?.length || 0;
  const nodeValue = node?.basicInfo?.[4] ? formatBalance(node.basicInfo[4]) : '0';
  const nodeId = node?.basicInfo?.[0]?.slice(-6) || 'Unknown';

  // Set up portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Action buttons configuration
  const actionButtons = [
    {
      label: 'Info',
      icon: <Info size={14} />,
      onClick: onNodeClick,
      tooltip: 'View node details'
    },
    {
      label: 'Membership',
      icon: <UserPlus size={14} />,
      onClick: onMintMembership,
      tooltip: 'Mint membership'
    },
    {
      label: 'Spawn',
      icon: <GitBranch size={14} />,
      onClick: onSpawnNode,
      tooltip: 'Create child node'
    },
    {
      label: 'Redistribute',
      icon: <RefreshCw size={14} />,
      onClick: onTrickle,
      tooltip: 'Redistribute value'
    }
  ];

  // Update menu position when pill is hovered
  const updateMenuPosition = useCallback(() => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX + (rect.width / 2)
      });
    }
  }, []);

  // Handle hover states
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    updateMenuPosition();
    const timer = setTimeout(() => setShowMenu(true), 100);
    return () => clearTimeout(timer);
  }, [updateMenuPosition]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const timer = setTimeout(() => setShowMenu(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Update menu position on scroll
  useEffect(() => {
    if (isHovered) {
      const handleScroll = () => {
        updateMenuPosition();
      };
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isHovered, updateMenuPosition]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current && 
        !actionMenuRef.current.contains(event.target as Node) &&
        pillRef.current &&
        !pillRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
        setIsHovered(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Handle action click
  const handleAction = useCallback((
    action: (nodeId: string) => void,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!isProcessing && node?.basicInfo?.[0]) {
      action(node.basicInfo[0]);
      setShowMenu(false);
    }
  }, [node?.basicInfo, isProcessing]);

  // If no valid node data, return nothing
  if (!node || !node.basicInfo) {
    return null;
  }

  return (
    <>
      <Box
        ref={pillRef}
        bg={bgColor}
        px={3}
        py={2}
        borderRadius="md"
        boxShadow={isHovered ? 'md' : 'sm'}
        cursor="pointer"
        onClick={() => node.basicInfo[0] && onNodeClick(node.basicInfo[0])}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
        transition="all 0.2s ease"
        opacity={isProcessing ? 0.7 : 1}
        role="group"
        _hover={{
          transform: 'translateY(-1px)',
          boxShadow: 'md'
        }}
      >
        <VStack spacing={2} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              {nodeId}
            </Text>
            {hasSignals && (
              <Box
                width="6px"
                height="6px"
                borderRadius="full"
                bg={color}
                sx={{
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                    '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                  },
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </HStack>

          {/* Stats */}
          <HStack spacing={4} justify="space-between">
            <Tooltip label={`${memberCount} members`}>
              <HStack spacing={1}>
                <Users size={14} color={color} />
                <Text fontSize="xs" color={color}>{memberCount}</Text>
              </HStack>
            </Tooltip>
            <Tooltip label={`Value: ${nodeValue}`}>
              <HStack spacing={1}>
                <Droplet size={14} color={color} />
                <Text fontSize="xs" color={color}>
                  {typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}%
                </Text>
              </HStack>
            </Tooltip>
          </HStack>

          {/* Progress */}
          <Box w="100%">
            <Progress
              value={percentage}
              size="xs"
              colorScheme="purple"
              borderRadius="full"
              bg={`${color}20`}
            />
          </Box>
        </VStack>
      </Box>

      {/* Action Menu Portal */}
      {showMenu && portalContainer && createPortal(
        <Box
          ref={actionMenuRef}
          position="absolute"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
          zIndex={1000}
        >
          <SlideFade in={true} offsetY={-10}>
            <HStack
              spacing={1}
              bg={menuBgColor}
              borderRadius="full"
              p={1}
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
              onClick={(e) => e.stopPropagation()}
            >
              {actionButtons.map((button, index) => (
                <Tooltip key={index} label={button.tooltip}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => handleAction(button.onClick, e)}
                    isDisabled={isProcessing}
                    _hover={{ bg: `${color}20` }}
                    p={2}
                  >
                    {button.icon}
                  </Button>
                </Tooltip>
              ))}
            </HStack>
          </SlideFade>
        </Box>,
        portalContainer
      )}
    </>
  );
};

export default React.memo(NodePill, (prevProps, nextProps) => {
  return (
    prevProps.node?.basicInfo?.[0] === nextProps.node?.basicInfo?.[0] &&
    prevProps.totalValue === nextProps.totalValue &&
    prevProps.color === nextProps.color &&
    prevProps.percentage === nextProps.percentage &&
    prevProps.isProcessing === nextProps.isProcessing
  );
});



// File: ./components/Node/NodeHierarchyView.tsx
import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';

interface NodeHierarchyViewProps {
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
}

interface HierarchyNode {
  node: NodeState;
  children: HierarchyNode[];
}

export const NodeHierarchyView: React.FC<NodeHierarchyViewProps> = ({
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
}) => {
  // Move the color mode values to the component level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Build hierarchy tree
  const buildHierarchyTree = (nodes: NodeState[]): HierarchyNode[] => {
    const nodeMap = new Map<string, HierarchyNode>();
    const roots: HierarchyNode[] = [];

    // Create nodes
    nodes.forEach(node => {
      nodeMap.set(node.basicInfo[0], {
        node,
        children: [],
      });
    });

    // Build relationships
    nodes.forEach(node => {
      const nodeId = node.basicInfo[0];
      const parentId = node.rootPath[node.rootPath.length - 2];
      
      if (parentId) {
        const parent = nodeMap.get(parentId);
        const current = nodeMap.get(nodeId);
        if (parent && current) {
          parent.children.push(current);
        }
      } else {
        const root = nodeMap.get(nodeId);
        if (root) {
          roots.push(root);
        }
      }
    });

    return roots;
  };

  const renderNode = (hierarchyNode: HierarchyNode, level: number = 0) => {
    const { node, children } = hierarchyNode;
    const depth = node.rootPath?.length || 0;

    // Calculate indentation and sizing based on depth
    const ml = level * 6; // Reduced margin
    const width = `calc(100% - ${ml}px)`;

    return (
      <Box key={node.basicInfo[0]} ml={`${ml}px`} width={width}>
        <Box
          p={3} // Reduced padding
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          mb={2}
          cursor="pointer"
          onClick={() => onNodeSelect(node.basicInfo[0])}
          _hover={{ shadow: 'md', borderColor: selectedTokenColor }}
          position="relative"
        >
          {/* Connection lines */}
          {level > 0 && (
            <>
              <Box
                position="absolute"
                left="-16px" // Reduced line length
                top="50%"
                width="16px"
                height="1px"
                bg={borderColor}
              />
              <Box
                position="absolute"
                left="-16px"
                top="-50%"
                width="1px"
                height="calc(100% + 16px)"
                bg={borderColor}
                display={level > 1 ? 'block' : 'none'}
              />
            </>
          )}
          
          <Grid templateColumns="repeat(4, 1fr)" gap={2}>
            <GridItem colSpan={2}>
              <Text fontWeight="bold" fontSize="sm">
                Node {node.basicInfo[0].slice(0, 6)}...
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                Depth: {depth}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                {nodeValues[node.basicInfo[0]]}%
              </Text>
            </GridItem>
          </Grid>
          
          <Text fontSize="xs" color="gray.500">
            Members: {node.membersOfNode?.length || 0}
          </Text>
        </Box>
        
        {children.length > 0 && (
          <VStack align="stretch" spacing={1}> {/* Reduced spacing */}
            {children.map(child => renderNode(child, level + 1))}
          </VStack>
        )}
      </Box>
    );
  };

  const hierarchyTree = buildHierarchyTree(nodes);

  return (
    <Box overflowX="auto" p={4}>
      <VStack align="stretch" spacing={4}>
        {hierarchyTree.map(root => renderNode(root))}
      </VStack>
    </Box>
  );
};



// File: ./components/Node/StatsCards.tsx
import React from 'react';
import {
  Box,
  HStack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<LucideIcon>;
  color: string;
  tooltip: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  tooltip,
  size = 'sm'
}) => {
  const padding = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const titleSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
  const valueSize = size === 'sm' ? 'lg' : size === 'md' ? 'xl' : '2xl';

  return (
    <Tooltip label={tooltip}>
      <Box
        p={padding}
        bg={`${color}.50`}
        rounded="lg"
        border="1px solid"
        borderColor={`${color}.100`}
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        minW="150px"
      >
        <HStack color={`${color}.600`} mb={1} spacing={2}>
          {React.cloneElement(icon as React.ReactElement<any>, { style: { width: size === 'sm' ? 14 : 16, height: size === 'sm' ? 14 : 16 } } )}
          <Text fontSize={titleSize} fontWeight="medium">
            {title}
          </Text>
        </HStack>
        <Text 
          fontSize={valueSize} 
          fontWeight="bold"
          color={`${color}.900`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      </Box>
    </Tooltip>
  );
};



// File: ./components/Node/SignalHistory.tsx
import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { formatUnits } from 'ethers';

interface Signal {
  MembraneInflation: string[][];
  lastRedistSignal: string[];
}

interface SignalHistoryProps {
  signals: Signal[];
  selectedTokenColor: string;
}

export const SignalHistory: React.FC<SignalHistoryProps> = ({
  signals,
  selectedTokenColor
}) => {
  if (!signals.length) {
    return (
      <Box>
        <Heading size="md" mb={4}>Signal History</Heading>
        <Text color="gray.500">No signals recorded</Text>
      </Box>
    );
  }

  const formatSignalValue = (value: string) => {
    try {
      return formatUnits(value, 9);
    } catch {
      return '0';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(Number(timestamp) * 1000).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Signal History</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Value</Th>
            <Th>Timestamp</Th>
          </Tr>
        </Thead>
        <Tbody>
          {signals.map((signal, index) => (
            <React.Fragment key={index}>
              {/* Membrane Inflation Signals */}
              {signal.MembraneInflation.map((inflation, subIndex) => (
                <Tr key={`inflation-${index}-${subIndex}`}>
                  <Td>
                    <Badge colorScheme="blue">Membrane Inflation</Badge>
                  </Td>
                  <Td>
                    <Tooltip label="Inflation Rate">
                      <Text>{formatSignalValue(inflation[0])}%</Text>
                    </Tooltip>
                  </Td>
                  <Td>{formatTimestamp(inflation[1])}</Td>
                </Tr>
              ))}
              
              {/* Redistribution Signals */}
              {signal.lastRedistSignal.map((redistSignal, subIndex) => (
                <Tr key={`redist-${index}-${subIndex}`}>
                  <Td>
                    <Badge colorScheme="green">Redistribution</Badge>
                  </Td>
                  <Td>
                    <Tooltip label="Redistribution Amount">
                      <Text>{formatSignalValue(redistSignal)} ETH</Text>
                    </Tooltip>
                  </Td>
                  <Td>{formatTimestamp(redistSignal)}</Td>
                </Tr>
              ))}
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};



// File: ./components/Node/ChildrenList.tsx
import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Link,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { formatAddress } from '../../utils/formatting';

interface ChildrenListProps {
  children: string[];
  selectedTokenColor: string;
  onNodeSelect?: (nodeId: string) => void;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({
  children,
  selectedTokenColor,
  onNodeSelect
}) => {
  if (!children.length) {
    return (
      <Box>
        <Heading size="md" mb={4}>Child Nodes</Heading>
        <Text color="gray.500">No child nodes found</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Child Nodes ({children.length})</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Node ID</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {children.map((nodeId, index) => (
            <Tr key={`${nodeId}-${index}`}>
              <Td>
                <Text>
                  {formatAddress(nodeId)}
                </Text>
              </Td>
              <Td>
                <Button
                  rightIcon={<ChevronRightIcon />}
                  colorScheme="gray"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNodeSelect?.(nodeId)}
                >
                  View Node
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};



// File: ./components/Node/MembersList.tsx
import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Link,
  useClipboard,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { formatAddress } from '../../utils/formatting';

interface MembersListProps {
  members: string[];
  selectedTokenColor: string;
}

export const MembersList: React.FC<MembersListProps> = ({ 
  members, 
  selectedTokenColor 
}) => {
  const { hasCopied, onCopy } = useClipboard('');

  if (!members.length) {
    return (
      <Box>
        <Heading size="md" mb={4}>Members</Heading>
        <Text color="gray.500">No members found</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Members ({members.length})</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((address, index) => (
            <Tr key={`${address}-${index}`}>
              <Td>
                <Link 
                  href={`https://etherscan.io/address/${address}`}
                  isExternal
                  color={selectedTokenColor}
                >
                  {formatAddress(address)}
                </Link>
              </Td>
              <Td>
                <Tooltip 
                  label={hasCopied ? "Copied!" : "Copy address"}
                  placement="top"
                >
                  <IconButton
                    aria-label="Copy address"
                    icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopy(address)}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};



// File: ./components/Node/NodeCard.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatBalance } from '../../utils/formatters';
import { NodeState } from '../../types/chainData';

interface NodeCardProps {
  node: NodeState;
  index: number;
  selectedTokenColor: string;
  onNodeSelect?: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  chainId: string;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  index,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
  chainId
}) => {
  const router = useRouter();

  // Guard against invalid node data
  if (!node?.basicInfo?.[0]) return null;
  
  const nodeId = node.basicInfo[0];
  const memberCount = node.membersOfNode?.length || 0;
  const signalCount = node.signals?.length || 0;
  const nodeValue = node.basicInfo[4] || '0';
  const percentage = nodeValues[nodeId] || 0;

  // Handle node click with fallback to direct navigation
  const handleNodeClick = () => {
    if (onNodeSelect && typeof onNodeSelect === 'function') {
      onNodeSelect(nodeId);
    } else {
      // Direct navigation fallback
      const cleanChainId = chainId.replace('eip155:', '');
      router.push({
        pathname: '/nodes/[chainId]/[nodeId]',
        query: { chainId: cleanChainId, nodeId }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Box
        p={4}
        bg="white"
        rounded="lg"
        shadow="sm"
        border="1px solid"
        borderColor={selectedTokenColor}
        minW="240px"
        cursor="pointer"
        onClick={handleNodeClick}
        _hover={{ 
          transform: 'translateY(-2px)', 
          shadow: 'md',
          borderColor: `${selectedTokenColor}`,
          bg: `${selectedTokenColor}05`
        }}
        transition="all 0.2s"
        position="relative"
      >
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="medium">
            Node {nodeId.slice(-6)}
          </Text>
          {signalCount > 0 && (
            <Box
              w="2"
              h="2"
              rounded="full"
              bg={selectedTokenColor}
              sx={{
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                  '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                },
                animation: 'pulse 2s infinite'
              }}
            />
          )}
        </HStack>

        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <HStack>
              <Activity size={14} color={selectedTokenColor} />
              <Text fontSize="sm" color={selectedTokenColor}>
                {formatBalance(nodeValue)}
              </Text>
            </HStack>
            <HStack>
              <Users size={14} color={selectedTokenColor} />
              <Text fontSize="sm" color={selectedTokenColor}>
                {memberCount}
              </Text>
            </HStack>
          </HStack>

          <Box 
            bg={`${selectedTokenColor}10`}
            rounded="full" 
            h="2"
            overflow="hidden"
          >
            <Box
              bg={selectedTokenColor}
              h="full"
              w={`${percentage}%`}
              transition="width 0.3s ease"
            />
          </Box>
          
          <Text 
            fontSize="xs" 
            color="gray.500" 
            textAlign="right"
          >
            {percentage.toFixed(1)}%
          </Text>
        </VStack>
      </Box>
    </motion.div>
  );
};

export default React.memo(NodeCard, (prevProps, nextProps) => {
  return (
    prevProps.node?.basicInfo?.[0] === nextProps.node?.basicInfo?.[0] &&
    prevProps.nodeValues[prevProps.node?.basicInfo?.[0]] === nextProps.nodeValues[nextProps.node?.basicInfo?.[0]] &&
    prevProps.selectedTokenColor === nextProps.selectedTokenColor &&
    prevProps.chainId === nextProps.chainId
  );
});



// File: ./components/Node/NodeActions.tsx
import React from 'react';
import {
  HStack,
  Button,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import {
  Plus,
  GitBranchPlus,
  RefreshCw,
  MoreVertical,
  Download,
  Share2,
  Settings
} from 'lucide-react';

interface NodeActionsProps {
  onSpawnNode: () => void;
  isProcessing: boolean;
  selectedToken: string;
  userAddress: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
}

export const NodeActions: React.FC<NodeActionsProps> = ({
  onSpawnNode,
  isProcessing,
  selectedToken,
  userAddress,
  onRefresh,
  onExport,
  onShare,
  onSettings
}) => {
  return (
    <HStack spacing={2}>
      {/* Create Node Button */}
      <Tooltip
        label={!selectedToken ? "Select a token first" : !userAddress ? "Connect wallet to create" : "Create new root node"}
      >
        <Button
          leftIcon={<GitBranchPlus size={16} />}
          onClick={onSpawnNode}
          colorScheme="purple"
          isLoading={isProcessing}
          isDisabled={!selectedToken || isProcessing || !userAddress}
        >
          Create Node
        </Button>
      </Tooltip>

      {/* Refresh Button */}
      {onRefresh && (
        <Tooltip label="Refresh node data">
          <IconButton
            aria-label="Refresh"
            icon={<RefreshCw size={16} />}
            onClick={onRefresh}
            variant="ghost"
            isDisabled={isProcessing}
          />
        </Tooltip>
      )}

      {/* Additional Actions Menu */}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="More actions"
          icon={<MoreVertical size={16} />}
          variant="ghost"
        />
        <MenuList>
          {onExport && (
            <MenuItem icon={<Download size={16} />} onClick={onExport}>
              Export Data
            </MenuItem>
          )}
          {onShare && (
            <MenuItem icon={<Share2 size={16} />} onClick={onShare}>
              Share View
            </MenuItem>
          )}
          {onSettings && (
            <MenuItem icon={<Settings size={16} />} onClick={onSettings}>
              Settings
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </HStack>
  );
};



// File: ./components/Node/SignalForm/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Button, 
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { useNodeTransactions } from '../../../hooks/useNodeTransactions';
import { useNodeData } from '../../../hooks/useNodeData';
import { fetchIPFSMetadata } from '../../../utils/ipfs';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { ethers, formatUnits } from 'ethers';
import { NodeState } from '../../../types/chainData';
import MembraneSection from './MembraneSection';
import InflationSection from './InflationSection';
import SignalSlider from './SignalSlider';
import Link from 'next/link';


interface SignalFormProps {
  chainId: string;
  nodeId: string;
  parentNodeData: NodeState | null;
  onSuccess?: () => void;
}

type ChildData = {
  nodeId: string;
  parentId: string;
  membraneId: string;
  membraneName: string;
  currentSignal: number;
  eligibilityPerSecond: string;
};

interface MembraneMetadata {
  id: string;
  name: string;
}

interface MembraneRequirement {
  tokenAddress: string;
  amount: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

const SignalForm: React.FC<SignalFormProps> = ({ chainId, nodeId, parentNodeData, onSuccess }) => {
  const { user, ready } = usePrivy();
  const { signal } = useNodeTransactions(chainId);

  // State declarations
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [eligibilityImpacts, setEligibilityImpacts] = useState<{ [key: string]: string }>({});
  const [membraneValues, setMembraneValues] = useState<Record<string, string>>({});
  const [inflationRates, setInflationRates] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [membraneRequirements, setMembraneRequirements] = useState<MembraneRequirement[]>([]);

  // Move this function before handleMembraneChange
  const validateAndFetchMembraneData = useCallback(async (membraneId: string) => {
    if (!membraneId) return;
    setIsValidating(prev => ({ ...prev, [nodeId]: true }));
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const membraneContract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        provider
      );

      // Fetch membrane data from contract
      const membrane = await membraneContract.getMembraneById(membraneId);
      
      if (!membrane) {
        throw new Error('Invalid membrane ID');
      }

      // Fetch metadata from IPFS if available
      if (membrane.meta) {
        const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
        const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
        if (!response.ok) throw new Error('Failed to fetch membrane metadata');
        const metadata = await response.json();
        setMembraneMetadata({
          id: membraneId,
          name: metadata.name || `Membrane ${membraneId}`
        });
      }

      // Process token requirements
      const requirements = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function symbol() view returns (string)'],
            provider
          );

          const symbol = await tokenContract.symbol();
          const balance = membrane.balances[index];
          
          return {
            tokenAddress,
            symbol,
            amount: balance.toString(),
            requiredBalance: balance.toString(),
            formattedBalance: ethers.formatUnits(balance, 18)
          };
        })
      );

      setMembraneRequirements(requirements);
    } catch (err) {
      console.error('Error validating membrane:', err);
      setMembraneMetadata(null);
      setMembraneRequirements([]);
    } finally {
      setIsValidating(prev => ({ ...prev, [nodeId]: false }));
    }
  }, [chainId, nodeId]);

  const handleMembraneChange = useCallback((nodeId: string, value: string) => {
    setMembraneValues(prev => ({
      ...prev,
      [nodeId]: value
    }));
    validateAndFetchMembraneData(value);
  }, [validateAndFetchMembraneData]);

  const handleInflationChange = useCallback((nodeId: string, value: string) => {
    setInflationRates(prev => ({
      ...prev,
      [nodeId]: value
    }));
  }, []);

  // Utility functions
  const fetchIPFSMetadata = useCallback(async (ipfsHash: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${ipfsHash}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      return null;
    }
  }, []);

  // Add getContract utility function
  const getContract = useCallback(async () => {
    const cleanChainId = chainId.replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    return new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      provider
    );
  }, [chainId]);

  // Calculate eligibility impact function
  const calculateEligibilityImpact = useCallback(async (childId: string, newValue: number) => {
    if (!user?.wallet?.address) {
      console.warn('User wallet not ready');
      return;
    }

    try {
      const contract = await getContract();
      const currentSignal = sliderValues[childId] || 0;
      
      const newEligibility = await contract.calculateUserTargetedPreferenceAmount(
        childId,
        nodeId,
        newValue,
        user.wallet.address
      );
      
      const currentEligibility = await contract.calculateUserTargetedPreferenceAmount(
        childId,
        nodeId,
        currentSignal,
        user.wallet.address
      );

      const impact = newEligibility.sub(currentEligibility);
      const formattedImpact = ethers.formatUnits(impact, 18);
      
      setEligibilityImpacts(prev => ({
        ...prev,
        [childId]: formattedImpact
      }));
    } catch (error) {
      console.error('Error calculating eligibility impact:', error);
    }
  }, [getContract, nodeId, sliderValues, user?.wallet?.address]);

  // Event handlers after all utility functions
  const handleSliderChange = useCallback((childId: string, newValue: number) => {
    setSliderValues(prev => ({
      ...prev,
      [childId]: newValue
    }));

    // Recalculate total with 2 decimal precision
    const newTotal = Object.values({
      ...sliderValues,
      [childId]: newValue
    }).reduce((sum, val) => sum + (val || 0), 0);
    
    setTotalAllocation(Number(newTotal));
  }, [sliderValues]);

  // New input change handler
  const handleInputChange = useCallback(async (childId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const updatedValues = {
        ...sliderValues,
        [childId]: numValue / 100
      };
      setSliderValues(updatedValues);
      
      // Calculate new total allocation
      const newTotal = Object.values(updatedValues).reduce((sum, val) => sum + (val * 100), 0);
      setTotalAllocation(newTotal);
      
      await calculateEligibilityImpact(childId, numValue / 100);
    }
  }, [calculateEligibilityImpact, sliderValues]);

  const handleSubmit = useCallback(async () => {
    if (Math.abs(totalAllocation - 100) > 0.01) {
      setError('Total allocation must equal 100%');
      return;
    }
  
    try {
      setIsSubmitting(true);
      setError(null);
  
      // Convert signals to basis points
      const signalArray = [
        // Convert membrane value to string or default to '0'
        (membraneValues[nodeId] || '0').toString(),
        // Convert inflation value to string or default to '0'
        (inflationRates[nodeId] || '0').toString(),
        // Add the child node signals converted to basis points as strings
        ...childrenData.map(child => {
          // Convert percentage to basis points (multiply by 100)
          // If slider shows 75.66%, this becomes 7566
          const basisPoints = Math.round(sliderValues[child.nodeId] * 100);
          // Convert to string and ensure no scientific notation
          return basisPoints.toLocaleString('fullwide', { useGrouping: false });
        })
      ];
  
      // Verify the sum of child signals equals 10000 (100.00%)
      const childSignalsSum = signalArray.slice(2).reduce((sum, val) => sum + Number(val), 0);
      if (childSignalsSum !== 10000) {
        throw new Error(`Invalid signal sum: ${childSignalsSum}. Expected 10000 basis points.`);
      }
      console.log("Submitting signals:", signalArray);
      console.log("Signal array as strings:", signalArray.map(String));
      await signal(nodeId, signalArray.map(String));
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error submitting signals:', error);
      setError(error.message || 'Failed to submit signals');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    childrenData, 
    sliderValues, 
    signal, 
    nodeId, 
    totalAllocation, 
    onSuccess, 
    membraneValues, 
    inflationRates
  ]);

  // Fetch children data
  const fetchChildrenData = useCallback(async () => {
    // Add more detailed validation
    if (!ready) {
      console.log('Privy not ready');
      setLoadingChildren(false);
      return;
    }
    
    if (!chainId) {
      console.log('No chainId provided');
      setLoadingChildren(false);
      return;
    }
    
    if (!parentNodeData) {
      console.log('No parent node data');
      setLoadingChildren(false);
      return;
    }
    
    if (!user?.wallet?.address) {
      console.log('No wallet address');
      setLoadingChildren(false);
      return;
    }

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      
      // Validate contract address
      if (!deployments.WillWe[cleanChainId]) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
      
      const contract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        provider
      );

      // Validate children nodes exist
      if (!parentNodeData.childrenNodes || parentNodeData.childrenNodes.length === 0) {
        setChildrenData([]);
        setLoadingChildren(false);
        return;
      }

      const childNodes = await contract.getNodes(parentNodeData.childrenNodes);
      const existingSignals = await contract.getUserNodeSignals(
        user.wallet.address,
        nodeId
      );

      // Add validation for childNodes
      if (!childNodes || childNodes.length === 0) {
        throw new Error('No child nodes returned from contract');
      }

      const childrenWithMetadata = await Promise.all(
        childNodes.map(async (node: any, index: number) => {
          // Validate node data
          if (!node?.basicInfo?.[0]) {
            console.error('Invalid node data:', node);
            return null;
          }

          // Rest of your mapping logic...
          let membraneName = node.basicInfo[0].slice(-6);
          
          try {
            if (node.membraneMeta && typeof node.membraneMeta === 'string' && node.membraneMeta.trim() !== '') {
              // Hardcode the IPFS gateway URL and use CID directly
              const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
              const metadataUrl = `${IPFS_GATEWAY}${node.membraneMeta.trim()}`;
              
              console.log('Fetching metadata from:', metadataUrl); // Debug log
              
              const response = await fetch(metadataUrl);
              if (response.ok) {
                const metadata = await response.json();
                membraneName = metadata.title || metadata.name || membraneName;
              } else {
                console.error('Failed to fetch metadata:', response.status, response.statusText);
              }
            }
          } catch (error) {
            console.error('Error fetching membrane metadata:', error);
            // Continue with default membraneName
          }

          const currentSignalBasisPoints = Number(existingSignals[index]?.[0] || 0);

          return {
            nodeId: node.basicInfo[0],
            parentId: nodeId,
            membraneId: node.basicInfo[5],
            membraneName,
            currentSignal: currentSignalBasisPoints,
            eligibilityPerSecond: '0' // Default to 0 if calculation fails
          };
        })
      );

      // Filter out any null values from failed mappings
      const validChildren = childrenWithMetadata.filter(child => child !== null);
      
      if (validChildren.length === 0) {
        throw new Error('No valid children data could be processed');
      }

      setChildrenData(validChildren);
      
      // Initialize sliders
      const initialValues = Object.fromEntries(
        validChildren.map(child => [
          child.nodeId,
          child.currentSignal / 100
        ])
      );
      
      setSliderValues(initialValues);
      
      // Calculate initial total with explicit typing
      const initialTotal = Object.values(initialValues).reduce((sum: number, val: unknown) => sum + (Number(val) || 0), 0);
      setTotalAllocation(Number(initialTotal));

    } catch (error) {
      console.error('Error in fetchChildrenData:', error);
      setError(error instanceof Error ? error.message : 'Failed to load children nodes');
    } finally {
      setLoadingChildren(false);
    }
  }, [chainId, parentNodeData, user?.wallet?.address, ready, nodeId]);

  useEffect(() => {
    fetchChildrenData();
  }, [fetchChildrenData]);

  // Render loading state
  if (!ready || loadingChildren) {
    return (
      <VStack spacing={4} align="stretch" width="100%">
        <Progress size="xs" isIndeterminate colorScheme="purple" />
        <Text textAlign="center">Loading signals...</Text>
      </VStack>
    );
  }

  // Render wallet connection state
  if (!user?.wallet?.address) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Please connect your wallet to view signals
      </Alert>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // Render main component
  return (
    <VStack spacing={6} width="100%">
      {/* Membrane Section - Full width */}
      <Box width="100%">
        <MembraneSection
          membraneId={membraneValues[nodeId] || ''}
          setMembraneId={(value) => handleMembraneChange(nodeId, value)}
          membraneMetadata={membraneMetadata}
          membraneRequirements={membraneRequirements}
          isLoadingMembrane={false}
          isValidating={isValidating[nodeId] || false}
          isProcessing={isSubmitting}
        />
      </Box>

      {/* Inflation Section - Full width */}
      <Box width="100%">
        <InflationSection
          inflationRate={inflationRates[nodeId] || ''}
          setInflationRate={(value) => handleInflationChange(nodeId, value)}
          isProcessing={isSubmitting}
        />
      </Box>

      {/* Signal Sliders Section */}
      <VStack spacing={4} width="100%">
        {childrenData.map((child) => (
          <Box key={child.nodeId} width="100%" p={4} borderWidth="1px" borderRadius="md">
            <VStack spacing={4} align="stretch">
              <Link href={`/nodes/${chainId}/${child.nodeId}`} passHref>
                <Text 
                  cursor="pointer" 
                  color="purple.500" 
                  _hover={{ 
                    textDecoration: 'underline',
                    color: 'purple.600'
                  }}
                  fontWeight="medium"
                >
                  {child.membraneName || child.nodeId.slice(-6)}
                </Text>
              </Link>
              
              <SignalSlider
                nodeId={nodeId}
                parentId={child.nodeId}
                childId={child.nodeId}
                value={sliderValues[child.nodeId] }
                lastSignal={(child.currentSignal).toString()}
                balance={child.eligibilityPerSecond}
                eligibilityPerSecond={child.eligibilityPerSecond}
                totalInflationPerSecond="0" // Add this from parent node data if available
                onChange={(v) => handleSliderChange(child.nodeId, v)}
                onChangeEnd={(v) => handleSliderChange(child.nodeId, v)}
                isDisabled={isSubmitting}
                selectedTokenColor="purple.500"
                chainId={chainId}
              />
            </VStack>
          </Box>
        ))}

        {/* Total Allocation */}
        <Box width="100%" p={4} bg="gray.50" borderRadius="md">
          <HStack justify="space-between">
            <Text>Total Allocation:</Text>
            <Text 
              fontWeight="bold"
              color={Math.abs(totalAllocation - 100) < 0.01 ? 'green.500' : 'red.500'}
            >
              {Number(totalAllocation).toFixed(2)}%
            </Text>
          </HStack>
        </Box>

        {/* Submit Button */}
        <Button
          colorScheme="purple"
          width="100%"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Submitting Signals..."
          isDisabled={
            isSubmitting || 
            Math.abs(totalAllocation - 100) > 0.01 ||
            !user?.wallet?.address
          }
        >
          Submit Signals
        </Button>
      </VStack>
    </VStack>
  );
};

export default SignalForm;



// File: ./components/Node/SignalForm/MembraneSection.tsx
import React from 'react';
import {
  Box,
  Text,
  HStack,
  Input,
  FormControl,
  FormLabel,
  Progress,
  VStack,
  Badge,
  Tooltip,
  Skeleton,
} from '@chakra-ui/react';
import { Shield, Info } from 'lucide-react';
import { MembraneRequirement } from '../../../types/chainData';

interface MembraneSectionProps {
  membraneId: string;
  setMembraneId: (id: string) => void;
  membraneMetadata: any;
  membraneRequirements: MembraneRequirement[];
  isLoadingMembrane: boolean;
  isValidating: boolean;
  isProcessing: boolean;
}

export const MembraneSection: React.FC<MembraneSectionProps> = ({
  membraneId,
  setMembraneId,
  membraneMetadata,
  membraneRequirements,
  isLoadingMembrane,
  isValidating,
  isProcessing
}) => {
  return (
    <Box p={4} bg="purple.50" borderRadius="lg">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Membrane Configuration
      </Text>
      
      <FormControl>
        <FormLabel>
          <HStack>
            <Shield size={14} />
            <Text>Membrane ID</Text>
            <Tooltip label="Enter the ID of the membrane to signal for">
              <Box as="span" cursor="help">
                <Info size={14} />
              </Box>
            </Tooltip>
          </HStack>
        </FormLabel>

        <Input
          value={membraneId}
          type="text"
          onChange={(e) => setMembraneId(e.target.value)}
          placeholder="Enter membrane ID"
          isDisabled={isProcessing}
          bg="white"
        />

        {isValidating && (
          <Progress size="xs" isIndeterminate colorScheme="purple" mt={2} />
        )}

        {isLoadingMembrane ? (
          <Skeleton height="100px" mt={2} />
        ) : (
          membraneMetadata && (
            <Box mt={2} p={3} bg="white" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>
                {membraneMetadata.name}
              </Text>
              {membraneMetadata.description && (
                <Text fontSize="sm" color="gray.600" mb={2}>
                  {membraneMetadata.description}
                </Text>
              )}
              <VStack align="start" spacing={1}>
                {membraneRequirements.map((req, idx) => (
                  <HStack key={idx} spacing={2} fontSize="sm">
                    <Badge colorScheme="purple">{req.symbol}</Badge>
                    <Text>{req.formattedBalance} tokens required</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )
        )}
      </FormControl>
    </Box>
  );
};

export default MembraneSection;



// File: ./components/Node/SignalForm/utils.ts
import { ethers } from 'ethers';

export const calculateMonthlyPreference = (
  amount: string,
  decimals: number = 18
): string => {
  try {
    const annualAmount = ethers.parseUnits(amount, decimals);
    const monthlyAmount = annualAmount / BigInt(12);
    return ethers.formatUnits(monthlyAmount, decimals);
  } catch (error) {
    console.error('Error calculating monthly preference:', error);
    return '0';
  }
};

export const validateSignals = (signals: number[]): boolean => {
  if (signals.length === 0) return false;
  const sum = signals.reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 100) < 0.001; // Allow for small floating point errors
};

export const formatUnits = (value: string, decimals: number = 2): string => {
  const num = parseFloat(value);
  return num.toFixed(decimals);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};



// File: ./components/Node/SignalForm/types.ts
export interface SignalFormProps {
    nodeId: string;
    parentId: string;
    membraneId: string;
    membraneName: string;
    selectedTokenColor: string;
    onSubmit: (signals: number[]) => Promise<void>;
    onClose: () => void;
  }
  
  export interface SignalState {
    value: number;
    childId: string;
    lastSignal: string;
    balance: string;
    eligibilityPerSecond: string;
  }



// File: ./components/Node/SignalForm/SignalSlider.tsx
import React, { memo } from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  HStack,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { formatBalance } from '../../../utils/formatters';
import { formatUnits } from './utils';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getContract } from 'viem';
import { useWillWeContract } from '../../../hooks/useWillWeContract';

interface SignalSliderProps {
  nodeId: string;
  parentId: string;
  childId: string;
  value: number;
  lastSignal: string;
  balance: string;
  eligibilityPerSecond: string;
  totalInflationPerSecond: string;
  onChange: (value: number) => void;
  onChangeEnd: (value: number) => void;
  isDisabled?: boolean;
  selectedTokenColor: string;
  chainId: string;
  nodeName?: string;
}

// Separate impact display component
const EligibilityImpact = memo(({ impact }: { impact: string | null }) => {
  if (!impact) return null;
  return (
    <Text fontSize="xs" color={parseFloat(impact) >= 0 ? "green.500" : "red.500"}>
      Impact: {parseFloat(impact) >= 0 ? "+" : ""}
      {formatUnits(impact, 10)} tokens/day
    </Text>
  );
});

// Add this line to fix the display-name error
EligibilityImpact.displayName = 'EligibilityImpact';

export const SignalSlider: React.FC<SignalSliderProps> = ({
  nodeId,        // This is the parent/NodeDetails node id
  parentId,      // This is the child/slider node id
  value: externalValue,
  lastSignal,
  balance,
  onChange,
  onChangeEnd,
  isDisabled,
  selectedTokenColor,
  chainId,
  nodeName,
}) => {
  const { user } = usePrivy();
  const contract = useWillWeContract(chainId);
  const [localValue, setLocalValue] = useState(externalValue);
  const [eligibilityImpact, setEligibilityImpact] = useState<string | null>(null);

  // Convert basis points to percentage for display only - this should never change while sliding
  const lastPreferencePercentage = (parseInt(lastSignal) / 100).toFixed(2);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const calculateEligibilityImpact = useCallback(async (newValue: number) => {
    if (!user?.wallet?.address || !contract) return;
    try {
      // Convert percentage to basis points for contract interaction
      const newValueBasis = Math.round(newValue * 100);
      
      let newEligibility, currentEligibility;
      
      try {
        // Calculate current eligibility first (with last signal)
        currentEligibility = await contract.calculateUserTargetedPreferenceAmount(
          parentId,    // childId (slider node)
          nodeId,      // parentId (NodeDetails node)
          parseInt(lastSignal),
          user.wallet.address
        );

        // Calculate new eligibility with the proposed signal value
        newEligibility = await contract.calculateUserTargetedPreferenceAmount(
          parentId,    // childId (slider node)
          nodeId,      // parentId (NodeDetails node)
          newValueBasis,
          user.wallet.address
        );

        // Calculate the difference
        const impact = newEligibility - currentEligibility;
        const formattedImpact = ethers.formatUnits(impact, 18);
        // Calculate daily impact (multiply by seconds in a day)
        const dailyImpact = parseFloat(formattedImpact) * (24 * 60 * 60);
        setEligibilityImpact(dailyImpact.toString());
      } catch (error) {
        console.error('Error calculating eligibility:', error);
        setEligibilityImpact("0");
      }
    } catch (error) {
      console.error('Error in eligibility impact calculation:', error);
      setEligibilityImpact("0");
    }
  }, [nodeId, parentId, lastSignal, user?.wallet?.address, contract]);

  // Handle local changes without propagating to parent immediately
  const handleChange = useCallback((v: number) => {
    setLocalValue(v);
  }, []);

  // Only notify parent when sliding ends
  const handleChangeEnd = useCallback((v: number) => {
    setLocalValue(v);
    onChange(v);
    onChangeEnd(v);
    calculateEligibilityImpact(v);
  }, [onChange, onChangeEnd, calculateEligibilityImpact]);

  return (
    <VStack align="stretch" spacing={2} width="100%" mb={4}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Last Preference: {lastPreferencePercentage}%
        </Text>
      </HStack>

      <Slider
        value={localValue}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        min={0}
        max={100}
        step={0.1}
        isDisabled={isDisabled}
      >
        <SliderTrack 
          bg={`${selectedTokenColor}20`} 
          h="4px"
        >
          <SliderFilledTrack bg={selectedTokenColor} />
        </SliderTrack>
        <Tooltip
          label={`${localValue.toFixed(1)}%`}
          placement="top"
          bg={selectedTokenColor}
        >
          <SliderThumb 
            boxSize={6} 
            bg="white" 
            borderWidth="2px"
            borderColor={selectedTokenColor}
            _focus={{
              boxShadow: `0 0 0 3px ${selectedTokenColor}40`
            }}
          />
        </Tooltip>
      </Slider>

      <EligibilityImpact impact={eligibilityImpact} />
    </VStack>
  );
};

SignalSlider.displayName = 'SignalSlider';

export default SignalSlider;



// File: ./components/Node/SignalForm/InflationSection.tsx
import React from 'react';
import {
  Box,
  Text,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';
import { Activity } from 'lucide-react';

interface InflationSectionProps {
  inflationRate: string;
  setInflationRate: (rate: string) => void;
  isProcessing: boolean;
}

export const InflationSection: React.FC<InflationSectionProps> = ({
  inflationRate,
  setInflationRate,
  isProcessing
}) => {
  return (
    <Box p={4} bg="purple.50" borderRadius="lg">
      <Box mb={4}>
        <HStack>
          <Activity size={16} />
          <Text fontSize="lg" fontWeight="semibold">Inflation Rate</Text>
        </HStack>
      </Box>

      <FormControl>
        <FormLabel>Rate (gwei/sec)</FormLabel>
        <Input
          value={inflationRate}
          onChange={(e) => setInflationRate(e.target.value)}
          placeholder="Enter inflation rate"
          type="number"
          min="0"
          max="1000000"
          isDisabled={isProcessing}
          bg="white"
        />
        <FormHelperText>Maximum rate: 1,000,000 gwei/sec</FormHelperText>
      </FormControl>
    </Box>
  );
};

export default InflationSection;



// File: ./components/Node/NodeList.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { VStack } from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';
import NodePill from './NodePill';

interface NodeListProps {
  nodes: NodeState[];
  totalValue: bigint;
  selectedTokenColor: string;
  chainId: string; // Make chainId required
  onNodeSelect: (nodeId: string) => void;
  onMintMembership: (nodeId: string) => void;
  onSpawnNode: (nodeId: string) => void;
  onTrickle: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  isProcessing: boolean;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes = [],
  totalValue = BigInt(0),
  selectedTokenColor,
  chainId, // Required prop
  onNodeSelect,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  nodeValues = {},
  isProcessing = false
}) => {
  const router = useRouter();

  const handleNodeClick = async (nodeId: string) => {
    const cleanChainId = chainId.replace('eip155:', '');
    
    try {
      await router.push({
        pathname: '/nodes/[chainId]/[nodeId]',
        query: {
          chainId: cleanChainId,
          nodeId
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {nodes.map(node => {
        if (!node?.basicInfo?.[0]) return null;

        const nodeId = node.basicInfo[0];
        const nodeValue = nodeValues[nodeId] || 0;

        return (
          <NodePill
            key={nodeId}
            node={node}
            totalValue={Number(totalValue)}
            color={selectedTokenColor}
            onNodeClick={() => handleNodeClick(nodeId)}
            onMintMembership={onMintMembership}
            onSpawnNode={onSpawnNode}
            onTrickle={onTrickle}
            backgroundColor={`${selectedTokenColor}15`}
            textColor={selectedTokenColor}
            borderColor={selectedTokenColor}
            percentage={nodeValue}
            isProcessing={isProcessing}
          />
        );
      })}
    </VStack>
  );
};

export default NodeList;



// File: ./components/Node/NodeControls.tsx
// import React from 'react';
// import { HStack, Button, InputGroup, Input, InputRightElement } from '@chakra-ui/react';
// import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react';

// interface NodeControlsProps {
//   searchValue: string;
//   onSearchChange: (value: string) => void;
//   onNewRootNode: () => void;
//   onSortChange: () => void;
//   onSortDirectionChange: () => void;
//   sortBy: string;
//   sortDirection: 'asc' | 'desc';
//   selectedTokenColor: string;
//   isProcessing: boolean;
//   buttonHoverBg: string;
//   searchBorderColor: string;
//   searchHoverBorderColor: string;
//   userAddress?: string;
// }

// const NodeControls: React.FC<NodeControlsProps> = ({
//   searchValue,
//   onSearchChange,
//   onNewRootNode,
//   onSortChange,
//   onSortDirectionChange,
//   sortBy,
//   sortDirection,
//   selectedTokenColor,
//   isProcessing,
//   buttonHoverBg,
//   searchBorderColor,
//   searchHoverBorderColor,
//   userAddress
// }) => {
//   return (
//     <HStack spacing={4} wrap="wrap">
//       <Button
//         leftIcon={<Plus size={14} />}
//         onClick={onNewRootNode}
//         size="sm"
//         colorScheme="gray"
//         variant="outline"
//         isDisabled={!userAddress || isProcessing}
//         isLoading={isProcessing}
//         _hover={{ bg: buttonHoverBg }}
//       >
//         New Root Node
//       </Button>

//       <InputGroup size="sm" maxW="300px">
//         <Input
//           aria-label="Search nodes"
//           placeholder="Search nodes..."
//           value={searchValue}
//           onChange={(e) => onSearchChange(e.target.value)}
//           borderColor={searchBorderColor}
//           _hover={{ borderColor: searchHoverBorderColor }}
//           _focus={{
//             borderColor: selectedTokenColor,
//             boxShadow: `0 0 0 1px ${selectedTokenColor}`
//           }}
//         />
//         <InputRightElement>
//           <Search size={14} color={selectedTokenColor} aria-hidden="true" />
//         </InputRightElement>
//       </InputGroup>

//       <HStack>
//         <Button
//           size="sm"
//           variant="ghost"
//           onClick={onSortChange}
//           leftIcon={<Filter size={14} />}
//         >
//           {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
//         </Button>

//         <Button
//           size="sm"
//           variant="ghost"
//           onClick={onSortDirectionChange}
//           leftIcon={<ArrowUpDown size={14} />}
//         >
//           {sortDirection.toUpperCase()}
//         </Button>
//       </HStack>
//     </HStack>
//   );
// };

// export default NodeControls;



// File: ./components/Node/NodeFilters.tsx
import React, { useState } from 'react';
import {
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { 
  Search,
  SortAsc,
  SortDesc,
  Layout,
  List,
  GitBranch,
  Grid as GridIcon
} from 'lucide-react';
import { NodeState } from '../../types/chainData';

interface NodeFiltersProps {
  nodes: NodeState[];
  onFilterChange: (filteredNodes: NodeState[]) => void;
  onViewModeChange?: (mode: 'tree' | 'grid' | 'list') => void;
}

export const NodeFilters: React.FC<NodeFiltersProps> = ({
  nodes,
  onFilterChange,
  onViewModeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSearch = (term: string) => {
    /// @todo implement search with membrane metadata
    // setSearchTerm(term);
    // const filtered = nodes.filter(node => 
    //   node.basicInfo[0]?.toLowerCase().includes(term.toLowerCase()) ||
    //   (node.membraneMeta?. || '').toLowerCase().includes(term.toLowerCase())
    // );
    // onFilterChange(filtered);
  };

  const handleSort = (field: string) => {
    setSortField(field);
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    const sorted = [...nodes].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'value':
          comparison = Number(BigInt(a.basicInfo[4]) - BigInt(b.basicInfo[4]));
          break;
        case 'members':
          comparison = (a.membersOfNode?.length || 0) - (b.membersOfNode?.length || 0);
          break;
        case 'depth':
          comparison = (a.rootPath?.length || 0) - (b.rootPath?.length || 0);
          break;
        case 'signals':
          comparison = (a.signals?.length || 0) - (b.signals?.length || 0);
          break;
      }
      return newDirection === 'asc' ? comparison : -comparison;
    });
    
    onFilterChange(sorted);
  };

  const viewModes = [
    { icon: <GitBranch size={16} />, mode: 'tree', label: 'Tree View' },
    { icon: <GridIcon size={16} />, mode: 'grid', label: 'Grid View' },
    { icon: <List size={16} />, mode: 'list', label: 'List View' }
  ];

  return (
    <Box bg="white" p={4} rounded="lg" shadow="sm">
      <HStack spacing={4}>
        <InputGroup maxW="300px">
          <InputLeftElement>
            <Search size={16} />
          </InputLeftElement>
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={sortField}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="value">Sort by Value</option>
          <option value="members">Sort by Members</option>
          <option value="depth">Sort by Depth</option>
          <option value="signals">Sort by Signals</option>
        </Select>

        <Tooltip label={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}>
          <IconButton
            aria-label="Toggle sort direction"
            icon={sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            onClick={() => handleSort(sortField)}
            variant="ghost"
          />
        </Tooltip>

        {onViewModeChange && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="View options"
              icon={<Layout size={16} />}
              variant="ghost"
            />
            <MenuList>
              {viewModes.map(({ icon, mode, label }) => (
                <MenuItem
                  key={mode}
                  icon={icon}
                  onClick={() => onViewModeChange(mode as 'tree' | 'grid' | 'list')}
                >
                  {label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Box>
  );
};



// File: ./components/NodePill.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, 
  Text, 
  HStack, 
  VStack,
  Tooltip, 
  Button,
  Progress,
  useColorModeValue,
  SlideFade,
} from "@chakra-ui/react";
import { 
  Users, 
  Info, 
  UserPlus, 
  GitBranch, 
  Droplet,
  Activity,
  RefreshCw
} from 'lucide-react';
import { NodeState } from '../types/chainData';
import { formatBalance } from '../hooks/useBalances';
import { createPortal } from 'react-dom';

interface NodePillProps {
  node: NodeState;
  totalValue: number;
  color: string;
  onNodeClick: (nodeId: string) => void;
  onMintMembership: (nodeId: string) => void;
  onSpawnNode: (nodeId: string) => void;
  onTrickle: (nodeId: string) => void;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  percentage: number;
  isProcessing?: boolean;
}

export const NodePill: React.FC<NodePillProps> = ({
  node,
  totalValue,
  color,
  onNodeClick,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  backgroundColor,
  textColor,
  borderColor,
  percentage = 0,
  isProcessing = false
}) => {
  // Refs and state
  const pillRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Theme
  const bgColor = useColorModeValue('white', 'gray.800');
  const menuBgColor = useColorModeValue(backgroundColor, `${backgroundColor}30`);

  // Node data
  const hasSignals = node?.signals?.length > 0 || false;
  const memberCount = node?.membersOfNode?.length || 0;
  const nodeValue = node?.basicInfo?.[4] ? formatBalance(node.basicInfo[4]) : '0';
  const nodeId = node?.basicInfo?.[0]?.slice(-6) || 'Unknown';

  // Set up portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Action buttons configuration
  const actionButtons = [
    {
      label: 'Info',
      icon: <Info size={14} />,
      onClick: onNodeClick,
      tooltip: 'View node details'
    },
    {
      label: 'Membership',
      icon: <UserPlus size={14} />,
      onClick: onMintMembership,
      tooltip: 'Mint membership'
    },
    {
      label: 'Spawn',
      icon: <GitBranch size={14} />,
      onClick: onSpawnNode,
      tooltip: 'Create child node'
    },
    {
      label: 'Redistribute',
      icon: <RefreshCw size={14} />,
      onClick: onTrickle,
      tooltip: 'Redistribute value'
    }
  ];

  // Update menu position when pill is hovered
  const updateMenuPosition = useCallback(() => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX + (rect.width / 2)
      });
    }
  }, []);

  // Handle hover states
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    updateMenuPosition();
    const timer = setTimeout(() => setShowMenu(true), 100);
    return () => clearTimeout(timer);
  }, [updateMenuPosition]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const timer = setTimeout(() => setShowMenu(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Update menu position on scroll
  useEffect(() => {
    if (isHovered) {
      const handleScroll = () => {
        updateMenuPosition();
      };
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isHovered, updateMenuPosition]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current && 
        !actionMenuRef.current.contains(event.target as Node) &&
        pillRef.current &&
        !pillRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
        setIsHovered(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Handle action click
  const handleAction = useCallback((
    action: (nodeId: string) => void,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!isProcessing && node?.basicInfo?.[0]) {
      action(node.basicInfo[0]);
      setShowMenu(false);
    }
  }, [node?.basicInfo, isProcessing]);

  // If no valid node data, return nothing
  if (!node || !node.basicInfo) {
    return null;
  }

  return (
    <>
      <Box
        ref={pillRef}
        bg={bgColor}
        px={3}
        py={2}
        borderRadius="md"
        boxShadow={isHovered ? 'md' : 'sm'}
        cursor="pointer"
        onClick={() => node.basicInfo[0] && onNodeClick(node.basicInfo[0])}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
        transition="all 0.2s ease"
        opacity={isProcessing ? 0.7 : 1}
        role="group"
        _hover={{
          transform: 'translateY(-1px)',
          boxShadow: 'md'
        }}
      >
        <VStack spacing={2} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              {nodeId}
            </Text>
            {hasSignals && (
              <Box
                width="6px"
                height="6px"
                borderRadius="full"
                bg={color}
                sx={{
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                    '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                  },
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </HStack>

          {/* Stats */}
          <HStack spacing={4} justify="space-between">
            <Tooltip label={`${memberCount} members`}>
              <HStack spacing={1}>
                <Users size={14} color={color} />
                <Text fontSize="xs" color={color}>{memberCount}</Text>
              </HStack>
            </Tooltip>
            <Tooltip label={`Value: ${nodeValue}`}>
              <HStack spacing={1}>
                <Droplet size={14} color={color} />
                <Text fontSize="xs" color={color}>
                  {typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}%
                </Text>
              </HStack>
            </Tooltip>
          </HStack>

          {/* Progress */}
          <Box w="100%">
            <Progress
              value={percentage}
              size="xs"
              colorScheme="purple"
              borderRadius="full"
              bg={`${color}20`}
            />
          </Box>
        </VStack>
      </Box>

      {/* Action Menu Portal */}
      {showMenu && portalContainer && createPortal(
        <Box
          ref={actionMenuRef}
          position="absolute"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
          zIndex={1000}
        >
          <SlideFade in={true} offsetY={-10}>
            <HStack
              spacing={1}
              bg={menuBgColor}
              borderRadius="full"
              p={1}
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
              onClick={(e) => e.stopPropagation()}
            >
              {actionButtons.map((button, index) => (
                <Tooltip key={index} label={button.tooltip}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => handleAction(button.onClick, e)}
                    isDisabled={isProcessing}
                    _hover={{ bg: `${color}20` }}
                    p={2}
                  >
                    {button.icon}
                  </Button>
                </Tooltip>
              ))}
            </HStack>
          </SlideFade>
        </Box>,
        portalContainer
      )}
    </>
  );
};

export default React.memo(NodePill, (prevProps, nextProps) => {
  return (
    prevProps.node?.basicInfo?.[0] === nextProps.node?.basicInfo?.[0] &&
    prevProps.totalValue === nextProps.totalValue &&
    prevProps.color === nextProps.color &&
    prevProps.percentage === nextProps.percentage &&
    prevProps.isProcessing === nextProps.isProcessing
  );
});



// File: ./components/NodeView/NodeViewContainer.tsx
// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { usePrivy } from '@privy-io/react-auth';
// import { Spinner, Box, useToast } from '@chakra-ui/react';
// import { ethers } from 'ethers';
// import { deployments, ABIs } from '../../config/contracts';
// import { useNode } from '../../contexts/NodeContext';
// import MainLayout from '../Layout/MainLayout';
// import ContentLayout from '../Layout/ContentLayout';
// import RootNodeDetails from '../RootNodeDetails';
// import NodeDetails from '../NodeDetails';
// import ActivityLogs from '../ActivityLogs';

// const NodeViewContainer = ({
//   chainId: initialChainId,
//   nodeId: initialNodeId,
//   colorState,
//   cycleColors
// }) => {
//   const router = useRouter();
//   const { user, authenticated, logout, login, getEthersProvider } = usePrivy();
//   const { selectedToken, selectToken, selectedNodeId, selectNode } = useNode();
//   const [derivedNodes, setDerivedNodes] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const toast = useToast();

//   const chainId = router.query.chainId || initialChainId || user?.wallet?.chainId;
//   const cleanChainId = chainId?.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
//   const userAddress = user?.wallet?.address;
//   const currentToken = selectedToken || router.query.tokenAddress || '';

//   // Fetch all derived nodes
//   const fetchDerivedNodes = useCallback(async () => {
//     if (!cleanChainId || !currentToken || !userAddress) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const provider = await getEthersProvider();
//       const willWeAddress = deployments.WillWe[cleanChainId];
      
//       if (!willWeAddress) {
//         throw new Error(`No WillWe contract found for chain ${cleanChainId}`);
//       }

//       const contract = new ethers.Contract(
//         willWeAddress,
//         ABIs.WillWe,
//         provider
//       );

//       console.log('Fetching nodes for:', {
//         rootAddress: currentToken,
//         userAddress,
//         contract: willWeAddress
//       });

//       // Get all nodes for this root token
//       const nodes = await contract.getAllNodesForRoot(currentToken, userAddress);
//       console.log('Received nodes:', nodes);

//       // Transform nodes into proper structure
//       const transformedNodes = nodes.map(node => ({
//         basicInfo: node.basicInfo.map(String),
//         membersOfNode: node.membersOfNode || [],
//         childrenNodes: node.childrenNodes || [],
//         rootPath: node.rootPath || [],
//         signals: (node.signals || []).map(signal => ({
//           MembraneInflation: signal.MembraneInflation || [],
//           lastRedistSignal: signal.lastRedistSignal || []
//         }))
//       }));

//       console.log('Transformed nodes:', transformedNodes);
//       setDerivedNodes(transformedNodes);
//     } catch (error) {
//       console.error('Error fetching derived nodes:', error);
//       toast({
//         title: "Error fetching nodes",
//         description: error.message,
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [cleanChainId, currentToken, userAddress, getEthersProvider, toast]);

//   // Initial fetch
//   useEffect(() => {
//     fetchDerivedNodes();
//   }, [fetchDerivedNodes]);

//   // Calculate total value and organize nodes
//   const { totalValue, organizedNodes } = useMemo(() => {
//     const total = derivedNodes.reduce((sum, node) => {
//       const nodeValue = node.basicInfo[4] ? BigInt(node.basicInfo[4]) : BigInt(0);
//       return sum + nodeValue;
//     }, BigInt(0));

//     // Create a map for quick node lookup
//     const nodeMap = new Map(
//       derivedNodes.map(node => [node.basicInfo[0], node])
//     );

//     // Build parent-child relationships
//     const relationships = new Map();
//     derivedNodes.forEach(node => {
//       const path = node.rootPath;
//       if (path.length > 1) {
//         const parentId = path[path.length - 2];
//         if (!relationships.has(parentId)) {
//           relationships.set(parentId, []);
//         }
//         relationships.get(parentId).push(node.basicInfo[0]);
//       }
//     });

//     console.log('Node relationships:', {
//       nodeMap,
//       relationships,
//       totalValue: total.toString()
//     });

//     return {
//       totalValue: total,
//       organizedNodes: derivedNodes,
//       relationships,
//     };
//   }, [derivedNodes]);

//   const handleNodeSelect = useCallback((nodeId) => {
//     if (cleanChainId) {
//       selectNode(nodeId, cleanChainId);
//       router.push(`/nodes/${cleanChainId}/${nodeId}`);
//     }
//   }, [cleanChainId, router, selectNode]);

//   const handleSpawnNode = useCallback(async () => {
//     try {
//       if (!user?.wallet?.address) throw new Error('Please connect your wallet');
//       if (!cleanChainId) throw new Error('Invalid chain ID');
      
//       const provider = await getEthersProvider();
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(
//         deployments.WillWe[cleanChainId],
//         ABIs.WillWe,
//         signer
//       );

//       const tx = await contract.spawnRootBranch(currentToken);
//       await tx.wait();
      
//       toast({
//         title: "Node spawned",
//         description: "New root node created successfully",
//         status: "success",
//         duration: 5000,
//       });

//       // Refresh nodes
//       await fetchDerivedNodes();
//     } catch (error) {
//       console.error('Failed to spawn node:', error);
//       toast({
//         title: "Failed to spawn node",
//         description: error.message,
//         status: "error",
//         duration: 5000,
//       });
//     }
//   }, [user?.wallet?.address, cleanChainId, currentToken, getEthersProvider, toast, fetchDerivedNodes]);

//   const renderContent = useCallback(() => {
//     if (isLoading) {
//       return <Spinner size="xl" />;
//     }

//     // If there's a selected node, show its details
//     if (selectedNodeId || initialNodeId) {
//       return (
//         <NodeDetails 
//           chainId={cleanChainId}
//           nodeId={selectedNodeId || initialNodeId}
//           onNodeSelect={handleNodeSelect}
//           selectedTokenColor={colorState.contrastingColor}
//         />
//       );
//     }

//     // If we have a current token, show the root node details
//     if (currentToken) {
//       return (
//         <RootNodeDetails
//           nodes={organizedNodes}
//           totalValue={totalValue}
//           selectedTokenColor={colorState.contrastingColor}
//           onNodeSelect={handleNodeSelect}
//           onSpawnNode={handleSpawnNode}
//         />
//       );
//     }

//     // Fallback to activity logs
//     return <ActivityLogs />;
//   }, [
//     isLoading,
//     selectedNodeId,
//     initialNodeId,
//     currentToken,
//     organizedNodes,
//     totalValue,
//     cleanChainId,
//     colorState.contrastingColor,
//     handleNodeSelect,
//     handleSpawnNode
//   ]);

//   return (

//       <ContentLayout
//         sidebarProps={{
//           selectedToken: currentToken,
//           handleTokenSelect: selectToken,
//           ...colorState,
//           userAddress: userAddress || '',
//           chainId: chainId || '',
//           isLoading
//         }}
//       >
//         {renderContent()}
//       </ContentLayout>

//   );
// };

// export default NodeViewContainer;



// File: ./components/TokenOperations/RequirementsTable.tsx
// File: ./components/TokenOperations/RequirementsTable.tsx

import React from 'react';
import {
  Table,
  Tbody,
  Tr,
  Td,
  Link,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';
import { getChainById } from '../../config/deployments';

interface RequirementsTableProps {
  requirements: Array<{
    tokenAddress: string;
    symbol: string;
    formattedBalance: string;
  }>;
  chainId: string;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  chainId,
}) => {
  const chain = getChainById(chainId.replace('eip155:', ''));
  
  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
      <Table size="sm" variant="simple">
        <Tbody>
          {requirements.map((req, idx) => (
            <Tr key={idx}>
              <Td>
                <HStack spacing={2}>
                  <Text>{req.symbol}</Text>
                  <Link
                    href={`${chain?.blockExplorers?.default.url}/address/${req.tokenAddress}`}
                    isExternal
                    color="purple.500"
                    fontSize="sm"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </HStack>
              </Td>
              <Td isNumeric>{req.formattedBalance}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default RequirementsTable;



// File: ./components/TokenOperations/TokenOperationModal.tsx
// File: ./components/TokenOperations/TokenOperationModal.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Progress,
  Text,
  Badge,
  InputGroup,
  InputRightElement,
  Tooltip,
  HStack,
  Link,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
} from '@chakra-ui/react';
import {
  Shield,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { RequirementsTable } from './RequirementsTable';
import { OperationConfirmation } from './OperationConfirmation';
import { deployments, ABIs } from '../../config/contracts';
import { NodeState, MembraneMetadata, MembraneRequirement } from '../../types/chainData';
import { useTransaction } from '../../contexts/TransactionContext';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  nodeId: string;
  chainId: string;
  node?: NodeState;
}

interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  nodeId,
  chainId,
  node,
}) => {
  // State
  const [membraneId, setMembraneId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isValidInput, setIsValidInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMembraneId('');
      setMembraneMetadata(null);
      setRequirements([]);
      setError(null);
      setInputError(null);
      setIsValidInput(false);
    }
  }, [isOpen]);

  // Validate membrane ID format
  const validateMembraneIdFormat = useCallback((value: string) => {
    setInputError(null);
    setIsValidInput(false);

    if (!value) {
      setInputError('Membrane ID is required');
      return false;
    }

    try {
      ethers.getBigInt(value);
      setIsValidInput(true);
      return true;
    } catch (error) {
      setInputError('Invalid numeric format');
      return false;
    }
  }, []);

  // Fetch membrane metadata and requirements
  const fetchMembraneMetadata = useCallback(async (membraneId: string) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      
      if (!provider) {
        throw new Error('Provider not available');
      }

      const contract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        //@ts-ignore
        provider
      );
      //@ts-ignore
      const membrane = await contract.getMembraneById(membraneId);
      if (!membrane) throw new Error('Membrane not found');

      // Fetch metadata from IPFS
      const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
      if (!response.ok) throw new Error('Failed to fetch membrane metadata');
      
      const metadata = await response.json();
      setMembraneMetadata(metadata);

      // Fetch token details
      setIsLoadingTokens(true);
      const requirements = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
            //@ts-ignore
            provider
          );

          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);

          return {
            tokenAddress,
            symbol,
            requiredBalance: membrane.balances[index].toString(),
            formattedBalance: ethers.formatUnits(membrane.balances[index], decimals)
          };
        })
      );

      setRequirements(requirements);
    } catch (err) {
      console.error('Error fetching membrane data:', err);
      throw err;
    } finally {
      setIsLoadingTokens(false);
    }
  }, [chainId, getEthersProvider]);

  // Handle membrane ID input change
  const handleMembraneIdChange = useCallback((value: string) => {
    setMembraneId(value);
    if (validateMembraneIdFormat(value)) {
      setIsValidating(true);
      fetchMembraneMetadata(value)
        .catch(error => {
          setError(error.message);
          setMembraneMetadata(null);
          setRequirements([]);
        })
        .finally(() => setIsValidating(false));
    }
  }, [validateMembraneIdFormat, fetchMembraneMetadata]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidInput || !membraneId) {
      setError('Please enter a valid membrane ID');
      return;
    }

    try {
      await onSubmit({ membraneId });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Operation Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <Box maxH="85vh" overflowY="auto" p={6}>
          <VStack spacing={6} align="stretch" width="100%">
            {/* Header Section */}
            <Box borderBottomWidth="1px" pb={4}>
              <Text fontSize="2xl" fontWeight="bold">New Node with Membrane</Text>
              <Text fontSize="sm" color="gray.600">Spawn a child node in the current context with provided membrane conditions</Text>
            </Box>

            {/* Input Section */}
            <FormControl isRequired isInvalid={!!inputError}>
              <FormLabel>
                <HStack>
                  <Text>Membrane ID</Text>
                  <Tooltip label="Enter a numeric membrane identifier">
                    <span><Info size={14} /></span>
                  </Tooltip>
                </HStack>
              </FormLabel>
              
              <InputGroup>
                <Input
                  value={membraneId}
                  onChange={(e) => handleMembraneIdChange(e.target.value)}
                  placeholder="Enter numeric membrane ID"
                  isDisabled={isValidating || isLoading}
                  pattern="\d*"
                  inputMode="numeric"
                />
                <InputRightElement>
                  {membraneId && (
                    isValidInput ? (
                      <CheckCircle size={18} color="green" />
                    ) : (
                      <XCircle size={18} color="red" />
                    )
                  )}
                </InputRightElement>
              </InputGroup>

              {inputError && (
                <Alert status="error" mt={2} size="sm">
                  <AlertIcon as={AlertTriangle} width={5} height={5} />
                  {inputError}
                </Alert>
              )}
            </FormControl>

            {/* Loading States */}
            {(isValidating || isLoadingTokens) && (
              <Box>
                <Progress size="xs" isIndeterminate colorScheme="purple" />
                <Text mt={2} textAlign="center" fontSize="sm" color="gray.600">
                  {isValidating ? 'Validating membrane...' : 'Loading token details...'}
                </Text>
              </Box>
            )}

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Membrane Data Display */}
            {membraneMetadata && !error && (
              <VStack spacing={4} align="stretch">
                {/* Membrane Info Card */}
                <Card variant="outline" bg="purple.50" mb={4}>
                  <CardHeader pb={2}>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">{membraneMetadata.name}</Text>
                      <Badge colorScheme="purple">ID: {membraneId}</Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {membraneMetadata.characteristics?.map((char, idx) => (
                        <Box
                          key={idx}
                          p={3}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="purple.100"
                        >
                          <HStack justify="space-between">
                            <Text>{char.title}</Text>
                            {char.link && (
                              <Link 
                                href={char.link} 
                                isExternal 
                                color="purple.500"
                                fontSize="sm"
                              >
                                <HStack spacing={1}>
                                  <LinkIcon size={14} />
                                  <ExternalLink size={14} />
                                </HStack>
                              </Link>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Requirements Table */}
                <RequirementsTable
                  requirements={requirements}
                  chainId={chainId}
                />

                {/* Operation Confirmation */}
                <OperationConfirmation
                  membraneMetadata={membraneMetadata}
                  membraneId={membraneId}
                  requirementsCount={requirements.length}
                />
              </VStack>
            )}

            {/* Action Buttons */}
            <Box 
              borderTopWidth="1px" 
              pt={4} 
              mt={4}
              background="white"
            >
              <HStack justify="flex-end" spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={handleSubmit}
                  isLoading={isLoading || isValidating || isLoadingTokens}
                  loadingText="Processing..."
                  isDisabled={!!error || !membraneMetadata || !isValidInput}
                  leftIcon={<Shield size={16} />}
                >
                  Apply Membrane
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default TokenOperationModal;



// File: ./components/TokenOperations/index.ts
export * from './TokenOperationModal';
export * from './OperationConfirmation';
export * from './OperationForm';
export * from './RequirementsTable';
export * from './StatusIndicator';



// File: ./components/TokenOperations/TokenValueOperations.tsx
import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Progress,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { deployments, ABIs } from '../../config/contracts';
import { Check, AlertTriangle } from 'lucide-react';

interface TokenValueOperationsProps {
  nodeId: string;
  chainId: string;
  operation: 'mint' | 'burn' | 'mintPath' | 'burnPath';
  onSubmit: (params: { amount: string }) => Promise<void>;
  onClose: () => void;
}

const TokenValueOperations: React.FC<TokenValueOperationsProps> = ({
  nodeId,
  chainId,
  operation,
  onSubmit,
  onClose,
}) => {
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getEthersProvider } = usePrivy();
  const toast = useToast();

  const checkAllowance = useCallback(async () => {
    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Get root token from path
      const willWeContract = new ethers.Contract(
        deployments.WillWe[chainId.replace('eip155:', '')],
        ABIs.WillWe,
        //@ts-ignore
        provider
      );
      const path = await willWeContract.getFidPath(nodeId);
      const rootToken = path[0];

      // Check ERC20 allowance
      const tokenContract = new ethers.Contract(
        ethers.getAddress(rootToken),
        ABIs.IERC20,
        //@ts-ignore
        provider
      );

      const allowance = await tokenContract.allowance(
        userAddress,
        willWeContract.target
      );

      const parsedAmount = ethers.parseUnits(amount || '0', 18);
      setNeedsApproval(allowance < parsedAmount);

    } catch (err) {
      console.error('Error checking allowance:', err);
      setError('Failed to check token approval status');
    }
  }, [amount, chainId, getEthersProvider, nodeId]);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    
    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      const willWeContract = new ethers.Contract(
        deployments.WillWe[chainId.replace('eip155:', '')],
        ABIs.WillWe,
        //@ts-ignore
        provider
      );
      
      const path = await willWeContract.getFidPath(nodeId);
      const rootToken = path[0];
      
      const tokenContract = new ethers.Contract(
        ethers.getAddress(rootToken),
        ABIs.IERC20,
        //@ts-ignore
        signer
      );

      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await tokenContract.approve(willWeContract.target, parsedAmount);
      await tx.wait();

      setNeedsApproval(false);
      toast({
        title: 'Approved',
        description: 'Token spending approved successfully',
        status: 'success',
        duration: 5000,
      });
      
    } catch (err) {
      console.error('Approval error:', err);
      setError('Failed to approve token spending');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ amount });
      onClose();
    } catch (err) {
      console.error('Transaction error:', err);
      setError('Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (amount && (operation === 'mint' || operation === 'mintPath')) {
      checkAllowance();
    }
  }, [amount, operation, checkAllowance]);

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.000000000000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            isDisabled={isApproving || isSubmitting}
          />
        </FormControl>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {(isApproving || isSubmitting) && (
          <Progress size="xs" isIndeterminate colorScheme="purple" />
        )}

        <HStack spacing={4} justify="flex-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          {needsApproval && (operation === 'mint' || operation === 'mintPath') ? (
            <Button
              colorScheme="purple"
              onClick={handleApprove}
              isLoading={isApproving}
              loadingText="Approving..."
            >
              Approve
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={`${operation}ing...`}
              isDisabled={(operation === 'mint' || operation === 'mintPath') && needsApproval}
            >
              {operation.charAt(0).toUpperCase() + operation.slice(1)}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default TokenValueOperations;



// File: ./components/TokenOperations/OperationConfirmation.tsx
import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Button,
  Link,
  IconButton,
  Code,
  Tooltip,
} from '@chakra-ui/react';
import {
  Shield,
  Info,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { MembraneMetadata } from '../../types/chainData';

interface OperationConfirmationProps {
  membraneMetadata: MembraneMetadata;
  membraneId: string;
  requirementsCount: number;
}

export const OperationConfirmation: React.FC<OperationConfirmationProps> = ({
  membraneMetadata,
  membraneId,
  requirementsCount
}) => {
  return (
    <Box 
      p={4} 
      bg="gray.50" 
      borderRadius="md" 
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" width="100%">
          <Text fontWeight="semibold">Operation Summary:</Text>
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<Info size={14} />}
            colorScheme="purple"
          >
            {membraneId.slice(0, 6)}...{membraneId.slice(-4)}
          </Button>
        </HStack>

        <VStack align="start" spacing={2}>
          <HStack>
            <Shield size={14} />
            <Text fontSize="sm">
              Creating sub-node with membrane restrictions
            </Text>
          </HStack>

          <HStack>
            <Info size={14} />
            <Text fontSize="sm">
              {requirementsCount} token requirement{requirementsCount !== 1 ? 's' : ''}
            </Text>
          </HStack>

          {membraneMetadata.characteristics?.length > 0 && (
            <HStack>
              <Info size={14} />
              <Text fontSize="sm">
                {membraneMetadata.characteristics.length} characteristic{membraneMetadata.characteristics.length !== 1 ? 's' : ''}
              </Text>
            </HStack>
          )}

          {/* Links Section */}
          {membraneMetadata.characteristics.map((char, idx) => (
            char.link && (
              <Box 
                key={idx}
                w="100%"
                p={2}
                bg="white"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">{char.title}</Text>
                  <Link
                    href={char.link}
                    isExternal
                    color="purple.500"
                    fontSize="sm"
                  >
                    <HStack spacing={1}>
                      <LinkIcon size={12} />
                      <Text>Open</Text>
                      <ExternalLink size={12} />
                    </HStack>
                  </Link>
                </HStack>
              </Box>
            )
          ))}
        </VStack>

        {/* Verification Note */}
        <Box 
          mt={2}
          p={3}
          bg="purple.50"
          borderRadius="md"
          width="100%"
        >
          <HStack spacing={2}>
            <Info size={14} color="purple.500" />
            <Text fontSize="sm" color="purple.700">
              Membrane configuration will be verified on-chain during deployment
            </Text>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default OperationConfirmation;



// File: ./components/TokenOperations/StatusIndicator.tsx
import React from 'react';
import {
  Box,
  Progress,
  Text,
  Alert,
  AlertIcon,
  HStack,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { useTransaction } from '../../contexts/TransactionContext';

interface StatusIndicatorProps {
  error: string | null;
  processingStage?: 'validating' | 'loading' | 'deploying' | null;
  customMessage?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  error,
  processingStage,
  customMessage
}) => {
  const { isTransacting } = useTransaction();

  const getStatusMessage = () => {
    if (customMessage) return customMessage;
    
    switch (processingStage) {
      case 'validating':
        return 'Validating membrane requirements...';
      case 'loading':
        return 'Loading token information...';
      case 'deploying':
        return 'Deploying membrane configuration...';
      default:
        return 'Processing transaction...';
    }
  };

  if (isTransacting || processingStage) {
    return (
      <Box width="100%">
        <VStack spacing={2} align="stretch">
          <Progress 
            size="xs" 
            isIndeterminate 
            colorScheme="purple" 
            borderRadius="full" 
          />
          <HStack justify="center" spacing={3}>
            <Spinner size="sm" color="purple.500" />
            <Text 
              fontSize="sm" 
              color="gray.600" 
              textAlign="center"
            >
              {getStatusMessage()}
            </Text>
          </HStack>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">Error</Text>
          <Text fontSize="sm">{error}</Text>
        </VStack>
      </Alert>
    );
  }

  return null;
};

// Optional loading steps component
interface LoadingStepProps {
  step: number;
  totalSteps: number;
  currentStep: number;
  label: string;
}

export const LoadingStep: React.FC<LoadingStepProps> = ({
  step,
  totalSteps,
  currentStep,
  label
}) => {
  const isComplete = step < currentStep;
  const isActive = step === currentStep;

  return (
    <HStack spacing={3} opacity={isComplete || isActive ? 1 : 0.5}>
      <Box
        w="20px"
        h="20px"
        borderRadius="full"
        bg={isComplete ? "green.500" : isActive ? "purple.500" : "gray.200"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontSize="xs"
      >
        {step + 1}
      </Box>
      <Text
        fontSize="sm"
        color={isComplete ? "green.700" : isActive ? "purple.700" : "gray.500"}
        fontWeight={isActive ? "medium" : "normal"}
      >
        {label}
      </Text>
    </HStack>
  );
};

export const LoadingSteps: React.FC<{
  currentStep: number;
  steps: string[];
}> = ({ currentStep, steps }) => {
  return (
    <VStack spacing={2} align="stretch" width="100%">
      {steps.map((step, index) => (
        <LoadingStep
          key={index}
          step={index}
          totalSteps={steps.length}
          currentStep={currentStep}
          label={step}
        />
      ))}
    </VStack>
  );
};

export default StatusIndicator;



// File: ./components/TokenOperations/types.ts
import { BalanceItem } from '@covalenthq/client-sdk';

export interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

export interface MembraneMetadata {
  name: string;
  characteristics: Array<{
    title: string;
    link: string;
  }>;
  membershipConditions: Array<{
    tokenAddress: string;
    requiredBalance: string;
  }>;
}

export interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export interface Membrane {
  id: string;
  name: string;
}

export interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  data?: {
    currentNode: { id: string; name: string };
    children?: Array<{ id: string; name: string }>;
  };
  nodeId: string;
  chainId?: string;
}



// File: ./components/TokenOperations/OperationForm.tsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  RadioGroup,
  Radio,
  Stack,
  FormErrorMessage,
} from '@chakra-ui/react';

interface OperationFormProps {
  operation: string;
  amount: string;
  setAmount: (value: string) => void;
  membraneId: string;
  setMembraneId: (value: string) => void;
  membraneInputType: 'dropdown' | 'manual';
  setMembraneInputType: (value: 'dropdown' | 'manual') => void;
  targetNodeId: string;
  setTargetNodeId: (value: string) => void;
  membranes: Array<{ id: string; name: string }>;
  nodeId: string;
  data?: {
    children?: Array<{ id: string; name: string }>;
  };
  error?: string;
  isLoading?: boolean;
}

export const OperationForm: React.FC<OperationFormProps> = ({
  operation,
  amount,
  setAmount,
  membraneId,
  setMembraneId,
  membraneInputType,
  setMembraneInputType,
  targetNodeId,
  setTargetNodeId,
  membranes,
  nodeId,
  data,
  error,
  isLoading,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {['mint', 'burn', 'mintPath', 'burnPath'].includes(operation) && (
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.000000000000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </FormControl>
      )}

      {operation === 'spawnWithMembrane' && (
        <>
          <FormControl>
            <FormLabel>Select Input Method</FormLabel>
            <RadioGroup
              onChange={(value) => setMembraneInputType(value as 'dropdown' | 'manual')}
              value={membraneInputType}
            >
              <Stack direction="row">
                <Radio value="dropdown">Select from List</Radio>
                <Radio value="manual">Enter Membrane ID</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <FormControl isRequired isInvalid={!!error}>
            <FormLabel>
              {membraneInputType === 'dropdown' ? 'Select Membrane' : 'Enter Membrane ID'}
            </FormLabel>
            {membraneInputType === 'dropdown' ? (
              <Select
                value={membraneId}
                onChange={(e) => setMembraneId(e.target.value)}
                placeholder="Select membrane"
              >
                {membranes.map(membrane => (
                  <option key={membrane.id} value={membrane.id}>
                    {membrane.name} ({membrane.id})
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={membraneId}
                onChange={(e) => setMembraneId(e.target.value)}
                placeholder="Enter membrane ID"
              />
            )}
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
        </>
      )}

      {['mintPath', 'burnPath'].includes(operation) && data && (
        <FormControl isRequired>
          <FormLabel>Target Node</FormLabel>
          <Select
            value={targetNodeId}
            onChange={(e) => setTargetNodeId(e.target.value)}
            placeholder="Select target node"
          >
            <option value={nodeId}>
              Current Node ({nodeId.slice(-6)})
            </option>
            {data.children?.map(child => (
              <option key={child.id} value={child.id}>
                Child: {child.name || `Node ${child.id.slice(-6)}`}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </VStack>
  );
};



// File: ./components/shared/ErrorState.tsx
import React from 'react';
import { Alert, AlertIcon, Text, Button, Box } from '@chakra-ui/react';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Box p={6} bg="white" rounded="xl" shadow="sm">
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="400px"
      rounded="md"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <Text mt={4} mb={2} fontSize="lg">
        Error loading node data
      </Text>
      <Text color="gray.600">
        {error.message}
      </Text>
      {onRetry && (
        <Button
          mt={4}
          size="sm"
          colorScheme="purple"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </Alert>
  </Box>
);



// File: ./components/shared/StatsCard.tsx
import React from 'react';
import { Grid, Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { Activity, Users, GitBranch, Signal } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalValue: bigint;
    totalMembers: number;
    totalSignals: number;
    avgValue: string;
  };
  color: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, color }) => {
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(`${color}20`, `${color}40`);
  
  const cards = [
    {
      label: 'Total Value',
      value: stats.totalValue.toString(),
      icon: Activity,
      subtitle: `Average: ${stats.avgValue}`
    },
    {
      label: 'Total Members',
      value: stats.totalMembers.toString(),
      icon: Users,
      subtitle: 'Active participants'
    },
    {
      label: 'Active Signals',
      value: stats.totalSignals.toString(),
      icon: Signal,
      subtitle: 'Pending distributions'
    },
    {
      label: 'Token Flow',
      value: `${(Number(stats.avgValue) / Number(stats.totalValue) * 100).toFixed(2)}%`,
      icon: GitBranch,
      subtitle: 'Distribution rate'
    }
  ];

  return (
    <Grid 
      templateColumns={{ 
        base: "1fr", 
        md: "repeat(2, 1fr)", 
        lg: "repeat(4, 1fr)" 
      }}
      gap={4}
      mb={8}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Box
            key={index}
            bg={bgColor}
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            transition="all 0.2s"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'md',
              borderColor: color
            }}
          >
            <HStack color={color} mb={2} spacing={3}>
              <Icon size={20} />
              <Text fontSize="sm" fontWeight="medium">
                {card.label}
              </Text>
            </HStack>

            <Text 
              fontSize="2xl" 
              fontWeight="bold"
              mb={1}
            >
              {card.value}
            </Text>

            <Text 
              fontSize="xs" 
              color="gray.500"
            >
              {card.subtitle}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
};

export default StatsCards;



// File: ./components/shared/LoadingState.tsx
import React from 'react';
import { VStack, Spinner, Text, Box } from '@chakra-ui/react';

interface LoadingStateProps {
  color: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ color }) => (
  <Box p={6} bg="white" rounded="xl" shadow="sm">
    <VStack spacing={4} align="center" justify="center" minH="400px">
      <Spinner size="xl" color={color} />
      <Text color="gray.600">Loading node data...</Text>
    </VStack>
  </Box>
);



// File: ./components/Layout/AppLayout.tsx
// File: /components/Layout/AppLayout.tsx
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useNode } from '../../contexts/NodeContext';
import { useColorManagement } from '../../hooks/useColorManagement';
import { MainLayout } from './MainLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout, login } = usePrivy();
  const {  selectToken, selectedNodeId } = useNode();
  const { colorState, cycleColors } = useColorManagement();



  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    const chainId = user?.wallet?.chainId || '';
    if (chainId) {
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [router, user?.wallet?.chainId]);

  return (
    <MainLayout
      headerProps={{
        userAddress: user?.wallet?.address,
        chainId: user?.wallet?.chainId || '',
        logout,
        login,
        onNodeSelect: handleNodeSelect,
        selectedNodeId: selectedNodeId || '',
        isTransacting: false,
        contrastingColor: colorState.contrastingColor,
        reverseColor: colorState.reverseColor,
        cycleColors,
      }}
    >
      {children}
    </MainLayout>
  );
};

export default AppLayout;



// File: ./components/Layout/TransactionHandler.tsx
import React from 'react';
import { Box, Text, Link, useToast, ToastId } from '@chakra-ui/react';
import { ContractTransactionResponse } from 'ethers';
import { ExternalLink } from 'lucide-react';
import { getChainById } from '../../config/contracts';
import { useTransaction } from '../../contexts/TransactionContext';
import { usePrivy } from '@privy-io/react-auth';


interface TransactionHandlerProps {
  children: React.ReactNode;
  chainId: string;
}

export const TransactionHandler: React.FC<TransactionHandlerProps> = ({ children, chainId }) => {
  const { isTransacting, currentHash, error } = useTransaction();
  const toast = useToast();

  // Show transaction status when needed
  React.useEffect(() => {
    let toastId: ToastId;

    if (isTransacting && currentHash) {
      toastId = toast({
        title: 'Transaction Pending',
        description: (
          <Box>
            <Text mb={2}>Transaction submitted. Waiting for confirmation...</Text>
            <Link 
              href={`${getChainById(String(chainId)).blockExplorers?.default.url}/tx/${currentHash}`}
              isExternal
              display="flex"
              alignItems="center"
              color="blue.500"
            >
              View on Explorer <ExternalLink size={14} style={{ marginLeft: 4 }} />
            </Link>
          </Box>
        ),
        status: 'info',
        duration: null,
        isClosable: false,
      });
    }

    return () => {
      if (toastId) {
        toast.close(toastId);
      }
    };
  }, [isTransacting, currentHash, toast, chainId]);

  // Show error toast if needed
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Transaction Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  return <>{children}</>;
};



// File: ./components/Layout/PaletteButton.tsx
import React, { useState, useEffect } from 'react';
import { IconButton, IconButtonProps, useToken } from '@chakra-ui/react';
import { Palette } from 'lucide-react';

interface PaletteButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  cycleColors: () => void;
  contrastingColor: string;
  reverseColor: string;
}

export const PaletteButton: React.FC<PaletteButtonProps> = ({
  cycleColors,
  contrastingColor,
  reverseColor,
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [baseColor] = useToken('colors', [contrastingColor]);

  // Set up auto-cycling on hover
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isHovering) {
      intervalId = setInterval(cycleColors, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovering, cycleColors]);

  return (
    <IconButton
      aria-label="Cycle Colors"
      icon={<Palette size={18} />}
      onClick={cycleColors}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      size="md"
      isRound
      color={reverseColor}
      bg={baseColor}
      _hover={{ 
        bg: reverseColor, 
        color: baseColor,
        transform: 'translateY(-1px)',
      }}
      _active={{
        bg: reverseColor,
        color: baseColor,
        transform: 'translateY(0px)',
      }}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow="sm"
      {...props}
    />
  );
};

export default PaletteButton;



// File: ./components/Layout/Header.tsx
// File: ./components/Layout/Header.tsx

import React from 'react';
import { Flex } from '@chakra-ui/react';
import { PaletteButton } from './PaletteButton';
import HeaderButtons from '../HeaderButtons';

interface HeaderProps {
  userAddress?: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  contrastingColor: string;
  reverseColor: string;
  cycleColors: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userAddress,
  chainId,
  logout,
  login,
  selectedNodeId,
  onNodeSelect,
  isTransacting,
  contrastingColor,
  reverseColor,
  cycleColors
}) => {
  // Only render header components once
  return (
    <Flex 
      justify="space-between" 
      p={4} 
      borderBottom="1px solid" 
      borderColor="gray.200"
      bg="white"
    >
      <PaletteButton 
        cycleColors={cycleColors} 
        contrastingColor={contrastingColor} 
        reverseColor={reverseColor}
      />
      <HeaderButtons 
        logout={logout} 
        login={login}
        userAddress={userAddress || ''} 
        chainId={chainId}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        isTransacting={isTransacting}
      />
    </Flex>
  );
};

export default Header;



// File: ./components/Layout/MainLayout.tsx
// File: ./components/Layout/MainLayout.tsx

import React, { ReactNode, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useCovalentBalances } from '../../hooks/useCovalentBalances';
import Header from './Header';
import BalanceList from '../BalanceList';
import { useNode } from '../../contexts/NodeContext';

interface MainLayoutProps {
  children: ReactNode;
  headerProps?: {
    userAddress?: string;
    chainId: string;
    logout: () => void;
    login: () => void;
    selectedNodeId?: string;
    isTransacting: boolean;
    contrastingColor: string;
    reverseColor: string;
    cycleColors: () => void;
    onNodeSelect: (nodeId: string) => void;
  };
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, headerProps }) => {
  const { user } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const router = useRouter();
  
  // Fetch balances for top bar
  const { 
    balances, 
    protocolBalances, 
    isLoading: balancesLoading 
  } = useCovalentBalances(
    user?.wallet?.address || '',
    headerProps?.chainId || ''
  );

  // Handle token selection with navigation
  const handleTokenSelect = useCallback((tokenAddress: string) => {
    selectToken(tokenAddress);
    // Always navigate to dashboard with the selected token
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    });
  }, [selectToken, router]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      {headerProps && <Header {...headerProps} />}
      
      {/* Token Balance Bar - Always visible */}
      {user?.wallet?.address && (
        <Box width="100%" borderBottom="1px solid" borderColor="gray.200">
          <BalanceList
            selectedToken={selectedToken}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={headerProps?.contrastingColor || ''}
            reverseColor={headerProps?.reverseColor || ''}
            hoverColor={`${headerProps?.contrastingColor}20` || ''}
            userAddress={user?.wallet?.address}
            chainId={headerProps?.chainId || ''}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading}
          />
        </Box>
      )}
      
      {/* Main Content */}
      <Box 
        flex={1} 
        overflow="hidden"
        bg="gray.50"
      >
        {children}
      </Box>
    </Box>
  );
};



// File: ./components/Layout/DashboardContent.tsx
// import React, { useState, useCallback, useMemo } from 'react';
// import { Box, VStack, Text, Spinner, Alert, AlertIcon, useToast } from '@chakra-ui/react';
// import { usePrivy } from '@privy-io/react-auth';
// import { NodeState } from '../../types/chainData';
// import { useNode } from '../../contexts/NodeContext';
// import { useRootNodes } from '../../hooks/useRootNodes';
// import NodeList from '../Node/NodeList';
// import NodeControls from '../Node/NodeControls';
// import StatsCards from '../Node/StatsCards';

// interface DashboardContentProps {
//   colorState: {
//     contrastingColor: string;
//     reverseColor: string;
//     hoverColor: string;
//   };
//   tokenAddress?: string;
//   onRefresh?: () => void;
// }

// const DashboardContent: React.FC<DashboardContentProps> = ({
//   colorState,
//   tokenAddress,
//   onRefresh
// }) => {
//   // State
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [searchValue, setSearchValue] = useState('');
//   const [sortBy, setSortBy] = useState<'value' | 'members'>('value');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

//   // Hooks
//   const { user } = usePrivy();
//   const toast = useToast();
//   const { selectToken } = useNode();
  
//   const chainId = user?.wallet?.chainId?.toString() || '';
//   const userAddress = user?.wallet?.address || '';

//   // Fetch nodes data
//   const { 
//     data: nodesData, 
//     isLoading, 
//     error, 
//     refetch 
//   } = useRootNodes(chainId, tokenAddress || '', userAddress);

//   // Process and filter nodes
//   const processedNodes = useMemo(() => {
//     // Early return if no data or invalid data
//     if (!nodesData || !Array.isArray(nodesData)) return [];

//     // Create a mutable copy of the nodes array
//     const filteredNodes = [...nodesData].filter((node): node is NodeState => {
//       if (!node?.basicInfo?.[0]) return false;
      
//       if (searchValue) {
//         const searchLower = searchValue.toLowerCase();
//         return (
//           node.basicInfo[0].toLowerCase().includes(searchLower) ||
//           (node.membersOfNode || []).some(addr => 
//             addr.toLowerCase().includes(searchLower)
//           )
//         );
//       }
//       return true;
//     });

//     // Sort the mutable copy
//     return filteredNodes.sort((a, b) => {
//       try {
//         if (sortBy === 'value') {
//           const aVal = BigInt(a.basicInfo?.[4] || '0');
//           const bVal = BigInt(b.basicInfo?.[4] || '0');
//           return sortDirection === 'desc' 
//             ? Number(bVal - aVal)
//             : Number(aVal - bVal);
//         } else {
//           const aMembers = a.membersOfNode?.length || 0;
//           const bMembers = b.membersOfNode?.length || 0;
//           return sortDirection === 'desc'
//             ? bMembers - aMembers
//             : aMembers - bMembers;
//         }
//       } catch (error) {
//         console.error('Sorting error:', error);
//         return 0;
//       }
//     });
//   }, [nodesData, searchValue, sortBy, sortDirection]);

//   // Calculate stats safely
//   const stats = useMemo(() => {
//     const defaultStats = {
//       totalValue: BigInt(0),
//       totalMembers: 0,
//       totalSignals: 0,
//       avgValue: '0',
//       nodeCount: 0
//     };

//     if (!Array.isArray(processedNodes) || processedNodes.length === 0) {
//       return defaultStats;
//     }

//     try {
//       return processedNodes.reduce((acc, node) => {
//         if (!node?.basicInfo) return acc;

//         const value = BigInt(node.basicInfo[4] || '0');
//         const members = node.membersOfNode?.length || 0;
//         const signals = node.signals?.length || 0;

//         return {
//           totalValue: acc.totalValue + value,
//           totalMembers: acc.totalMembers + members,
//           totalSignals: acc.totalSignals + signals,
//           avgValue: ((acc.totalValue + value) / BigInt(acc.nodeCount + 1)).toString(),
//           nodeCount: acc.nodeCount + 1
//         };
//       }, defaultStats);
//     } catch (error) {
//       console.error('Stats calculation error:', error);
//       return defaultStats;
//     }
//   }, [processedNodes]);

//   // Calculate node values safely
//   const nodeValues = useMemo(() => {
//     const values: Record<string, number> = {};
    
//     if (!stats.totalValue || stats.totalValue === BigInt(0)) {
//       return values;
//     }

//     try {
//       processedNodes.forEach(node => {
//         if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
//         const nodeValue = BigInt(node.basicInfo[4]);
//         values[node.basicInfo[0]] = Number((nodeValue * BigInt(10000)) / stats.totalValue) / 100;
//       });
//     } catch (error) {
//       console.error('Node values calculation error:', error);
//     }

//     return values;
//   }, [processedNodes, stats.totalValue]);

//   // Node spawn handler
//   const handleSpawnNode = useCallback(async () => {
//     if (!tokenAddress) {
//       toast({
//         title: "Error",
//         description: "No token selected",
//         status: "error",
//         duration: 3000
//       });
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       // Implement spawn logic here
//       await onRefresh?.();
//       toast({
//         title: "Success",
//         description: "New node created successfully",
//         status: "success",
//         duration: 3000
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         status: "error",
//         duration: 3000
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [tokenAddress, onRefresh, toast]);

//   // Loading state
//   if (isLoading) {
//     return (
//       <Box height="100%" display="flex" alignItems="center" justifyContent="center">
//         <Spinner size="xl" color={colorState.contrastingColor} />
//       </Box>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Alert 
//         status="error" 
//         variant="subtle" 
//         flexDirection="column" 
//         alignItems="center" 
//         justifyContent="center" 
//         textAlign="center" 
//         height="400px"
//       >
//         <AlertIcon boxSize="40px" mr={0} />
//         <Text mt={4} mb={2} fontSize="lg">
//           Error loading data
//         </Text>
//         <Text color="gray.600">
//           {error.message}
//         </Text>
//       </Alert>
//     );
//   }

//   return (
//     <VStack spacing={6} align="stretch" w="100%" p={6}>
//       <NodeControls 
//         searchValue={searchValue}
//         onSearchChange={setSearchValue}
//         onNewRootNode={handleSpawnNode}
//         onSortChange={() => setSortBy(prev => prev === 'value' ? 'members' : 'value')}
//         onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
//         sortBy={sortBy}
//         sortDirection={sortDirection}
//         selectedTokenColor={colorState.contrastingColor}
//         isProcessing={isProcessing}
//         buttonHoverBg={`${colorState.contrastingColor}20`}
//         searchBorderColor={colorState.contrastingColor}
//         searchHoverBorderColor={`${colorState.contrastingColor}60`}
//         userAddress={userAddress}
//       />

//       <StatsCards 
//         stats={stats}
//         color={colorState.contrastingColor}
//       />

//       <NodeList
//         chainId={chainId}
//         nodes={processedNodes}
//         totalValue={stats.totalValue}
//         selectedTokenColor={colorState.contrastingColor}
//         onNodeSelect={(nodeId) => {
//           // Implement node selection logic
//         }}
//         onMintMembership={(nodeId) => {
//           // Implement mint membership logic
//         }}
//         onSpawnNode={(nodeId) => {
//           // Implement spawn node logic
//         }}
//         onTrickle={(nodeId) => {
//           // Implement trickle logic
//         }}
//         nodeValues={nodeValues}
//         isProcessing={isProcessing}
//       />
//     </VStack>
//   );
// };

// export default DashboardContent;



// File: ./components/ActivityLogs.tsx
import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Divider,
  HStack,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { Activity, Clock } from 'lucide-react';

interface ActivityLog {
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'redistribution';
  timestamp: Date;
  nodeId: string;
  details: string;
  status: 'pending' | 'completed' | 'failed';
}

const ActivityLogs: React.FC = () => {
  // In a real implementation, this would come from a context or prop
  const recentActivities: ActivityLog[] = [];
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  const getStatusColor = (status: ActivityLog['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <Heading size="md">Recent Activity</Heading>
          <Activity size={20} />
        </HStack>
        
        <Divider />
        
        {recentActivities.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {recentActivities.map((activity, index) => (
              <Box
                key={index}
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <HStack justify="space-between" mb={2}>
                  <Badge colorScheme={getStatusColor(activity.status)}>
                    {activity.type.toUpperCase()}
                  </Badge>
                  <HStack spacing={1} color="gray.500">
                    <Clock size={14} />
                    <Text fontSize="sm">{formatTimestamp(activity.timestamp)}</Text>
                  </HStack>
                </HStack>
                <Text fontSize="sm" fontWeight="medium">
                  Node: {activity.nodeId}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {activity.details}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No recent activity</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ActivityLogs;



// File: ./components/CreateToken.tsx
// File: /components/CreateToken.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Progress,
  Text,
  Alert,
  AlertIcon,
  useToast,
  Heading,
  IconButton,
  Link,
  Code,
} from '@chakra-ui/react';
import { Trash2, Plus, ExternalLink, Check } from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { ERC20Bytecode, ERC20CreateABI } from '../const/envconst';
import { ContractRunner, ethers, Provider, TransactionRequest } from 'ethers';
import { useTransactionHandler } from '../hooks/useTransactionHandler';
import { getExplorerLink } from '../config/contracts';

interface Recipient {
  address: string;
  balance: string;
}

interface CreateTokenProps {
  chainId: string;
  userAddress?: string;
  onSuccess?: () => void;
}

export const CreateToken: React.FC<CreateTokenProps> = ({
  chainId,
  userAddress,
  onSuccess
}) => {
  // Form state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: userAddress || '', balance: '' }
  ]);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deployedAddress, setDeployedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useToast();
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransactionHandler(chainId);

  // Recipients management
  const addRecipient = useCallback(() => {
    setRecipients(prev => [...prev, { address: '', balance: '' }]);
  }, []);

  const removeRecipient = useCallback((index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRecipientChange = useCallback((index: number, field: keyof Recipient, value: string) => {
    setRecipients(prev => prev.map((recipient, i) => {
      if (i === index) return { ...recipient, [field]: value };
      return recipient;
    }));
  }, []);

  // Calculate total supply
  const totalSupply = recipients.reduce((total, recipient) => {
    return total + (parseFloat(recipient.balance) || 0);
  }, 0);

  // Deploy token
  const deployToken = async () => {
    try {
      if (!authenticated || !ready) {
        throw new Error('Please connect your wallet first');
      }

      setIsLoading(true);
      setDeploymentState('deploying');

      // Validate inputs
      if (!tokenName || !tokenSymbol) {
        throw new Error('Token name and symbol are required');
      }

      const validRecipients = recipients.filter(r => r.address && r.balance);
      if (validRecipients.length === 0) {
        throw new Error('At least one valid recipient is required');
      }
      const provider = await getEthersProvider();
      const signer = provider.getSigner();
      const runner: ContractRunner = {
        call: async (tx: TransactionRequest) => await signer.call(tx as any),
        sendTransaction: async (tx: TransactionRequest) => {
          const response = await signer.sendTransaction(tx as any);
          return response as unknown as ethers.TransactionResponse;
        },
        estimateGas: async (tx: TransactionRequest) => {
          const estimate = await signer.estimateGas(tx as any);
          return BigInt(estimate.toString());
        },
        provider: provider as unknown as Provider
      };
      
      const factory = new ethers.ContractFactory(
        ERC20CreateABI,
        ERC20Bytecode,
        runner
      );

      // Create deployment transaction
      const deploymentTx = factory.deploy(
        tokenName,
        tokenSymbol,
        validRecipients.map(r => r.address),
        validRecipients.map(r => ethers.parseUnits(r.balance, 18))
      );
      // Execute transaction with proper lifecycle handling
      const transactionResult = await executeTransaction(deploymentTx);
      if (transactionResult.contractAddress) {
        const deployedAddress = transactionResult.contractAddress;
        setDeployedAddress(deployedAddress);
        setDeploymentState('complete');
        
        toast({
          title: 'Success',
          description: (
            <>
              Token deployed successfully. View on explorer:{' '}
              <Link href={getExplorerLink(transactionResult.txHash, chainId, 'tx')} isExternal>
                {transactionResult.txHash.substring(0, 8)}...{transactionResult.txHash.substring(58)}
                <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </Link>
            </>
          ),
          status: 'success',
          duration: 5000,
        });

        onSuccess?.();
      }

    } catch (error: any) {
      console.error('Token deployment error:', error);
      setDeploymentState('idle');
      
      toast({
        title: 'Failed to Deploy Token',
        description: error.message || 'Transaction failed',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      height="calc(100vh - 200px)"
    >
      {/* Header */}
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Heading size="md" mb={2}>Create Token</Heading>
        <Text color="gray.600">Deploy a new ERC20 token with custom distribution</Text>
      </Box>

      {/* Scrollable Content Area */}
      <Box 
        overflowY="auto"
        flex="1"
        pb="200px"
      >
        <Box p={8}>
          <VStack spacing={8} align="stretch">
            {/* Token Details */}
            <FormControl isRequired>
              <FormLabel>Token Name</FormLabel>
              <Input
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Enter token name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Token Symbol</FormLabel>
              <Input
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                placeholder="Enter token symbol"
              />
            </FormControl>

            {/* Total Supply Display */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">
                Total Supply: {totalSupply.toLocaleString()}
              </Text>
            </Box>

            {/* Recipients */}
            {recipients.map((recipient, index) => (
              <Box 
                key={index}
                p={4}
                bg="gray.50"
                borderRadius="md"
              >
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Address</FormLabel>
                    <Input
                      placeholder="0x..."
                      value={recipient.address}
                      onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Balance</FormLabel>
                    <Input
                      placeholder="Amount"
                      value={recipient.balance}
                      type="number"
                      onChange={(e) => handleRecipientChange(index, 'balance', e.target.value)}
                    />
                  </FormControl>

                  <IconButton
                    aria-label="Remove recipient"
                    icon={<Trash2 size={16} />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeRecipient(index)}
                    alignSelf="flex-end"
                    mb={1}
                  />
                </HStack>
              </Box>
            ))}

            <Button
              leftIcon={<Plus size={16} />}
              onClick={addRecipient}
              variant="ghost"
              size="sm"
            >
              Add Recipient
            </Button>

            {/* Deployment Result */}
            {deploymentState === 'complete' && deployedAddress && (
              <Alert status="success" variant="subtle">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Token deployed successfully!</Text>
                  <HStack spacing={2} justify="space-between" width="100%">
                    <Code fontFamily="mono" fontSize="sm">
                      {deployedAddress}
                    </Code>
                    <Link
                      href={`https://explorer.base.org/address/${deployedAddress}`}
                      isExternal
                      color="purple.500"
                    >
                      <HStack>
                        <Text>View on Explorer</Text>
                        <ExternalLink size={14} />
                      </HStack>
                    </Link>
                  </HStack>
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Footer with Deploy Button */}
      <Box 
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        p={6}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="white"
        zIndex={2}
      >
        <Button
          colorScheme="purple"
          onClick={deployToken}
          isLoading={isLoading}
          loadingText="Deploying..."
          isDisabled={
            !tokenName || 
            !tokenSymbol || 
            recipients.some(r => !r.address || !r.balance) ||
            deploymentState === 'deploying'
          }
          width="100%"
          size="lg"
          leftIcon={deploymentState === 'complete' ? <Check size={16} /> : undefined}
        >
          Deploy Token
        </Button>
        {isLoading && (
          <Progress size="xs" isIndeterminate colorScheme="purple" mt={2} />
        )}
      </Box>
    </Box>
  );
};

export default CreateToken;



// File: ./components/HeaderButtons.tsx
import React from 'react';
import {
  HStack,
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
} from '@chakra-ui/react';
import { 
  LogOut, 
  LogIn,
  Coins,
  Users,
  Plus 
} from 'lucide-react';
import  CreateToken  from './CreateToken';
import { DefineEntity } from './DefineEntity';

interface HeaderButtonsProps {
  userAddress: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  buttonHoverBg?: string;
}

export default function HeaderButtons({
  userAddress,
  chainId,
  logout,
  login,
  isTransacting,
  buttonHoverBg = 'purple.50'
}: HeaderButtonsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const modalContentStyles = {
    maxH: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
  };

  // Consistent button styles
  const buttonStyles = {
    size: "sm",
    variant: "outline",
    colorScheme: "purple",
    _hover: { bg: buttonHoverBg },
    isDisabled: isTransacting
  };

  return (
    <>
      <HStack spacing={4}>
        {/* Compose Button - Always Visible */}
        <Tooltip label="Create new token or entity">
          <Button
            leftIcon={<Plus size={18} />}
            onClick={onOpen}
            {...buttonStyles}
          >
            Compose
          </Button>
        </Tooltip>

        {/* Auth Button */}
        {userAddress ? (
          <Button
            leftIcon={<LogOut size={18} />}
            onClick={logout}
            {...buttonStyles}
          >
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </Button>
        ) : (
          <Button
            leftIcon={<LogIn size={18} />}
            onClick={login}
            {...buttonStyles}
          >
            Connect
          </Button>
        )}
      </HStack>

      {/* Compose Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="4xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          sx={modalContentStyles}
          maxW="1000px"
          bg="white"
          rounded="lg"
          shadow="xl"
          overflow="hidden"
        >
          <ModalHeader 
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            Compose
            <ModalCloseButton />
          </ModalHeader>

          <Box flex="1" overflow="hidden">
            <Tabs
              isFitted
              colorScheme="purple"
              isLazy
              display="flex"
              flexDirection="column"
              h="full"
            >
              <TabList borderBottom="1px solid" borderColor="gray.100">
                <Tab
                  py={4}
                  _selected={{
                    color: 'purple.600',
                    borderBottom: '2px solid',
                    borderColor: 'purple.600'
                  }}
                >
                  <HStack spacing={2}>
                    <Coins size={16} />
                    <span>Create Token</span>
                  </HStack>
                </Tab>
                <Tab
                  py={4}
                  _selected={{
                    color: 'purple.600',
                    borderBottom: '2px solid',
                    borderColor: 'purple.600'
                  }}
                >
                  <HStack spacing={2}>
                    <Users size={16} />
                    <span>Define Entity</span>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels flex="1" overflow="hidden">
                <TabPanel h="full" p={0}>
                  <CreateToken
                    chainId={chainId}
                    userAddress={userAddress}
                    onSuccess={onClose}
                  />
                </TabPanel>
                <TabPanel h="full" p={0}>
                  <DefineEntity
                    chainId={chainId}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}



// File: ./components/ActivityFeed/ActivityFeed.tsx
// File: ./components/ActivityFeed/ActivityFeed.tsx

import React, { useMemo } from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Badge, 
  Spinner, 
  Button, 
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  GitBranch,
  Signal,
  Users
} from 'lucide-react';
import { formatDistance } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'spawn' | 'membership';
  timestamp: number;
  description: string;
  account: string;
  nodeId?: string;
  amount?: string;
  tokenSymbol?: string;
  status: 'success' | 'pending' | 'failed';
  transactionHash?: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  selectedToken?: string;
}

export function ActivityFeed({
  activities = [],
  isLoading = false,
  error = null,
  onRefresh,
  selectedToken
}: ActivityFeedProps) {
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const emptyStateBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <ArrowUpRight className="text-green-500" size={16} />;
      case 'burn':
        return <ArrowDownRight className="text-red-500" size={16} />;
      case 'spawn':
        return <GitBranch className="text-purple-500" size={16} />;
      case 'signal':
        return <Signal className="text-blue-500" size={16} />;
      case 'membership':
        return <Users className="text-orange-500" size={16} />;
      default:
        return <Activity className="text-gray-500" size={16} />;
    }
  };

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => b.timestamp - a.timestamp);
  }, [activities]);

  if (isLoading) {
    return (
      <Box
        p={8}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="400px"
      >
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        p={8}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="center">
          <Text color="red.500" fontWeight="medium">
            Error loading activities: {error.message}
          </Text>
          {onRefresh && (
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={onRefresh}
              colorScheme="purple"
              size="sm"
            >
              Retry
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      height="100%"
      minH="400px"
    >
      <VStack spacing={6} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            Recent Activity
          </Text>
          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCw size={16} />}
              onClick={onRefresh}
              colorScheme="purple"
            >
              Refresh
            </Button>
          )}
        </Box>

        {sortedActivities.length === 0 ? (
          <Box
            py={12}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg={emptyStateBg}
            borderRadius="lg"
          >
            <Activity size={32} className="text-gray-400 mb-4" />
            <Text color={textColor}>No recent activity</Text>
            {selectedToken && (
              <Text color={textColor} fontSize="sm" mt={2}>
                Select a token to view its activity
              </Text>
            )}
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {sortedActivities.map((activity) => (
              <Box
                key={activity.id}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'sm',
                  bg: hoverBg
                }}
              >
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      {getActivityIcon(activity.type)}
                      <Text fontWeight="medium">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Text>
                    </HStack>
                    <Badge colorScheme={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </HStack>
                  
                  <Text color={textColor} fontSize="sm">
                    {activity.description}
                  </Text>
                  
                  {activity.amount && (
                    <Text fontSize="sm" fontWeight="medium">
                      Amount: {activity.amount} {activity.tokenSymbol}
                    </Text>
                  )}
                  
                  <HStack justify="space-between" fontSize="xs" color={textColor}>
                    <Text>
                      {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
                    </Text>
                    <HStack spacing={4}>
                      {activity.nodeId && (
                        <Text fontFamily="mono">
                          Node: {activity.nodeId.slice(0, 6)}...{activity.nodeId.slice(-4)}
                        </Text>
                      )}
                      <Text fontFamily="mono">
                        {activity.account.slice(0, 6)}...{activity.account.slice(-4)}
                      </Text>
                    </HStack>
                  </HStack>

                  {activity.transactionHash && (
                    <Text fontSize="xs" color="purple.500" fontFamily="mono">
                      Tx: {activity.transactionHash.slice(0, 10)}...
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default ActivityFeed;



// File: ./components/RootNodeDetails.tsx
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Grid,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import { 
  Users,
  Activity,
  GitBranch, 
  Signal,
  Plus,
  GitBranchPlus,
  Check,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  Wallet,
  Copy
} from 'lucide-react';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';
import { formatBalance, addressToNodeId } from '../utils/formatters';
import { useTransaction } from '../contexts/TransactionContext';
import { NodeHierarchyView } from './Node/NodeHierarchyView';
import { StatsCard } from './Node/StatsCards'; 
import { NodeFilters } from './Node/NodeFilters';
import { NodeActions } from './Node/NodeActions';
import { TokenNameDisplay } from './Token/TokenNameDisplay';
import { useWillWeContract } from '../hooks/useWillWeContract';

interface RootNodeDetailsProps {
  chainId: string;
  selectedToken: string;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodes: NodeState[];
  isLoading: boolean;
  error: Error | null;
  onRefresh?: () => void;
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({
  chainId,
  selectedToken,
  selectedTokenColor,
  onNodeSelect,
  nodes = [],
  isLoading,
  error,
  onRefresh
}) => {
  const toast = useToast();
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const willweContract = useWillWeContract(chainId);
  const [totalSupplyValue, setTotalSupplyValue] = useState<bigint>(BigInt(0));

  // Fetch total supply
  useEffect(() => {
    const fetchTotalSupply = async () => {
      if (!selectedToken || !willweContract) return;
      try {
        const tokenId = addressToNodeId(selectedToken);
        const supply = await willweContract.totalSupply(tokenId);
        setTotalSupplyValue(supply);
      } catch (error) {
        console.error('Error fetching total supply:', {
          error,
          contractAddress: willweContract.target,
          tokenId: selectedToken,
          abi: ABIs.WillWe
        });
      }
    };

    if (willweContract) {
      fetchTotalSupply();
    }
  }, [selectedToken, willweContract]);

  // Calculate stats and organize nodes
  const {
    baseNodes,
    derivedNodes,
    nodeValues,
    totalMembers,
    maxDepth,
    totalSignals,
    averageExpense
  } = useMemo(() => {
    if (!nodes?.length || !selectedToken) return {
      baseNodes: [],
      derivedNodes: [],
      nodeValues: {},
      totalMembers: 0,
      maxDepth: 0,
      totalSignals: 0,
      averageExpense: 0
    };

    // Organize nodes into base and derived
    const base = nodes.filter(node => node.rootPath.length === 1);
    const derived = nodes.filter(node => node.rootPath.length > 1);

    // Calculate unique members (addresses)
    const uniqueAddresses = new Set<string>();
    nodes.forEach(node => {
      if (node.membersOfNode) {
        const members = node.membersOfNode;
        members.forEach((member: string) => uniqueAddresses.add(member));
      }
    });

    // Calculate max depth
    const depth = nodes.reduce((max, node) => {
      return node.rootPath ? Math.max(max, node.rootPath.length) : max;
    }, 0);

    // Calculate average expense per day (convert from gwei/sec to ether/day)
    const totalExpensePerSec = nodes.reduce((sum, node) => {
      const expensePerSec = node.basicInfo?.[1] ? BigInt(node.basicInfo[1]) : BigInt(0);
      return sum + expensePerSec;
    }, BigInt(0));
    
    const nodesWithExpense = nodes.filter(node => node.basicInfo?.[1] && BigInt(node.basicInfo[1]) > 0).length;
    const avgExpensePerSecGwei = nodesWithExpense > 0 ? 
      Number(totalExpensePerSec) / nodesWithExpense : 
      0;
    
    // Convert gwei/sec to ether/day
    const avgExpensePerDay = (avgExpensePerSecGwei * 86400) / 1e9;

    // Calculate node value percentages based on total supply
    const values: Record<string, number> = {};
    if (totalSupplyValue > BigInt(0)) {
      nodes.forEach(node => {
        if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
        try {
          const nodeValue = BigInt(node.basicInfo[4]);
          values[node.basicInfo[0]] = Number((nodeValue * BigInt(10000)) / totalSupplyValue) / 100;
        } catch {
          values[node.basicInfo[0]] = 0;
        }
      });
    }

    return {
      baseNodes: base,
      derivedNodes: derived,
      nodeValues: values,
      totalMembers: uniqueAddresses.size,
      maxDepth: depth,
      totalSignals: 0,
      averageExpense: avgExpensePerDay
    };
  }, [nodes, selectedToken, totalSupplyValue]);

  // Handle spawning a new root node
  const handleSpawnNode = useCallback(async () => {
    if (!selectedToken) {
      toast({
        title: "Error",
        description: "Please select a token first",
        status: "error",
        duration: 3000
      });
      return;
    }

    setIsProcessing(true);

    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const cleanChainId = chainId.replace('eip155:', '');
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer as unknown as ethers.ContractRunner
          );

          return contract.spawnBranch(selectedToken, { gasLimit: 500000 });
        },
        {
          successMessage: 'New node created successfully',
          errorMessage: 'Failed to create node',
          onSuccess: async () => {
            if (onRefresh) {
              await onRefresh();
            }
          }
        }
      );
    } catch (error: any) {
      console.error('Error spawning node:', error);
      toast({
        title: "Failed to Create Node",
        description: error.message,
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, selectedToken, getEthersProvider, executeTransaction, toast, onRefresh]);



  if (isLoading) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm">
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="xl" color={selectedTokenColor} />
          <Text color="gray.600">Loading node data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="400px"
          rounded="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <Text mt={4} mb={2} fontSize="lg">
            Error loading node data
          </Text>
          <Text color="gray.600">
            {error.message}
          </Text>
          {onRefresh && (
            <Button
              mt={4}
              size="sm"
              colorScheme="purple"
              onClick={onRefresh}
            >
              Retry
            </Button>
          )}
        </Alert>
      </Box>
    );
  }


  return (
    <Flex 
      direction="column" 
      h="calc(100vh - 80px)" // Adjust this value based on your navbar/header height
      bg="white" 
      rounded="xl" 
      shadow="sm"
      overflow="hidden" // Prevents content from spilling out
    >
      {/* Fixed Header Section */}
      <Box p={4} borderBottom="1px" borderColor="gray.100">
        <HStack justify="space-between" mb={4}>
          <NodeActions
            onSpawnNode={handleSpawnNode}
            isProcessing={isProcessing}
            selectedToken={selectedToken}
            userAddress={userAddress}
            onRefresh={onRefresh}
          />
          {selectedToken && (
            <TokenNameDisplay 
              tokenAddress={selectedToken}  
              chainId={chainId}
            />
          )}
        </HStack>

        {/* Adjusted Stats Cards */}
        <Grid 
          templateColumns="repeat(5, 1fr)"
          gap={3}
          maxW="100%"
          mx="auto"
        >
          <StatsCard
            title="Total Value"
            value={formatBalance(totalSupplyValue)}
            icon={<Wallet size={14} />}
            color="purple"
            tooltip="Total supply of the token"
            size="sm"
          />
          <StatsCard
            title="Members"
            value={totalMembers}
            icon={<Users size={14} />}
            color="blue"
            tooltip="Total unique members across all nodes"
            size="sm"
          />
          <StatsCard
            title="Max Depth"
            value={maxDepth}
            icon={<GitBranch size={14} />}
            color="green"
            tooltip="Maximum depth of the node hierarchy"
            size="sm"
          />
          <StatsCard
            title="Active Signals"
            value={totalSignals}
            icon={<Signal size={14} />}
            color="orange"
            tooltip="Total active signals across all nodes"
            size="sm"
          />
          <StatsCard
            title="Average Expense"
            value={averageExpense.toFixed(6)}
            icon={<Wallet size={14} />}
            color="red"
            tooltip="Average expense per node in ETH/day"
            size="sm"
          />
        </Grid>
      </Box>

      {/* Scrollable Content Section */}
      <Flex 
        direction="column" 
        flex="1"
        overflow="hidden"
      >
        {/* Filters - Fixed below header */}
        <Box px={6} py={4} borderBottom="1px" borderColor="gray.100">
          <NodeFilters
            nodes={nodes}
            onFilterChange={(filteredNodes) => {
              // Implement filtering logic
            }}
          />
        </Box>

        {/* Scrollable Node Content */}
        <Box 
          flex="1"
          overflowY="auto"
          px={6}
          py={4}
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
              },
            },
            // Add these styles to create a more distinct hierarchy
            '.node-level-0': {
              borderLeft: '0px solid',
              ml: '0',
            },
            '.node-level-1': {
              borderLeft: '2px solid',
              borderColor: 'gray.200',
              ml: '2',
              pl: '4',
            },
            '.node-level-2': {
              borderLeft: '2px solid',
              borderColor: 'gray.300',
              ml: '4',
              pl: '4',
            },
            '.node-level-3': {
              borderLeft: '2px solid',
              borderColor: 'gray.400',
              ml: '6',
              pl: '4',
            },
            // Add more levels if needed
          }}
        >
          {nodes.length === 0 ? (
            <Box 
              p={8} 
              bg="gray.50" 
              rounded="lg" 
              textAlign="center"
              border="2px dashed"
              borderColor="gray.200"
            >
              <VStack spacing={4}>
                <Text color="gray.600">
                  No nodes found. Create a new root node to get started.
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  onClick={handleSpawnNode}
                  colorScheme="purple"
                  isLoading={isProcessing}
                  isDisabled={!selectedToken || isProcessing || !wallets[0]?.address}
                >
                  Create Root Node
                </Button>
              </VStack>
            </Box>
          ) : (
            <NodeHierarchyView
              nodes={nodes}
              selectedTokenColor={selectedTokenColor}
              onNodeSelect={onNodeSelect}
              nodeValues={nodeValues}
            />
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default RootNodeDetails;



// File: ./components/BalanceList.tsx
// File: ./components/BalanceList.tsx

import React, { useRef, useState, useCallback } from 'react';
import { Box, HStack, IconButton, useToken } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TokenBalance from './TokenBalance';
import { BalanceItem } from '@covalenthq/client-sdk';

interface BalanceListProps {
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string; 
  hoverColor: string;
  userAddress: string;
  chainId: string;
  balances: BalanceItem[];
  protocolBalances: BalanceItem[];
  isLoading: boolean;
}

const BalanceList: React.FC<BalanceListProps> = ({
  selectedToken,
  handleTokenSelect,
  contrastingColor,
  reverseColor,
  hoverColor,
  balances = [],
  protocolBalances = [],
  isLoading
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [baseColor] = useToken('colors', [contrastingColor]);

  // Handle scroll visibility
  const checkScrollButtons = useCallback(() => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Scroll handlers
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  if (isLoading) {
    return (
      <Box height="100px" display="flex" alignItems="center" justifyContent="center" bg="white">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </Box>
    );
  }

  return (
    <Box position="relative" bg="white" height="100px">
      {/* Left Scroll Button */}
      {showLeftScroll && (
        <IconButton
          aria-label="Scroll left"
          icon={<ChevronLeft size={20} />}
          position="absolute"
          left={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          bg="white"
          color={contrastingColor}
          onClick={() => scroll('left')}
          _hover={{ bg: hoverColor }}
          h="full"
          borderRadius="none"
        />
      )}

      {/* Token List */}
      <Box
        ref={scrollContainer}
        overflowX="hidden"
        whiteSpace="nowrap"
        py={2}
        px={10}
        onScroll={checkScrollButtons}
        height="100%"
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <HStack spacing={4} height="100%">
          {balances.map((balance) => {
            const protocolBalance = protocolBalances.find(
              p => p.contract_address.toLowerCase() === balance.contract_address.toLowerCase()
            );

            return (
              <Box
                key={balance.contract_address}
                onClick={() => handleTokenSelect(balance.contract_address)}
                cursor="pointer"
                transition="all 0.2s"
                borderRadius="md"
                bg={selectedToken === balance.contract_address ? `${baseColor}10` : 'transparent'}
                border="1px solid"
                borderColor={selectedToken === balance.contract_address ? baseColor : 'transparent'}
                _hover={{
                  bg: hoverColor,
                  transform: 'translateY(-1px)',
                }}
                height="100%"
                minW="200px"
                maxW="200px"
                p={3}
              >
                <TokenBalance
                  balanceItem={balance}
                  protocolBalance={protocolBalance}
                  isSelected={selectedToken === balance.contract_address}
                  contrastingColor={contrastingColor}
                  reverseColor={reverseColor}
                />
              </Box>
            );
          })}
        </HStack>
      </Box>

      {/* Right Scroll Button */}
      {showRightScroll && (
        <IconButton
          aria-label="Scroll right"
          icon={<ChevronRight size={20} />}
          position="absolute"
          right={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          bg="white"
          color={contrastingColor}
          onClick={() => scroll('right')}
          _hover={{ bg: hoverColor }}
          h="full"
          borderRadius="none"
        />
      )}
    </Box>
  );
};

export default BalanceList;



// File: ./components/TokenBalance.tsx
// File: ./components/TokenBalance.tsx

import React, { useMemo } from 'react';
import { Box, Text, VStack, HStack, Tooltip } from '@chakra-ui/react';
import { Activity, Wallet } from 'lucide-react';
import { BalanceItem } from '@covalenthq/client-sdk';
import { formatBalance } from '../utils/formatters';

interface TokenBalanceProps {
  balanceItem: BalanceItem;
  protocolBalance?: BalanceItem | null;
  isSelected: boolean;
  contrastingColor: string;
  reverseColor: string;
  isCompact?: boolean;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  balanceItem,
  protocolBalance,
  isSelected,
  contrastingColor,
  reverseColor,
  isCompact = false
}) => {
  const formattedAmounts = useMemo(() => {
    return {
      user: formatBalance(balanceItem?.balance || '0'),
      protocol: formatBalance(protocolBalance?.balance || '0')
    };
  }, [balanceItem?.balance, protocolBalance?.balance]);

  const percentages = useMemo(() => {
    const userBalance = BigInt(balanceItem?.balance || '0');
    const protocolBal = BigInt(protocolBalance?.balance || '0');
    const total = userBalance + protocolBal;

    if (total === BigInt(0)) return { user: 0, protocol: 0 };

    const userPercentage = Number((userBalance * BigInt(100)) / total);
    return {
      user: userPercentage,
      protocol: 100 - userPercentage
    };
  }, [balanceItem?.balance, protocolBalance?.balance]);

  return (
    <Box position="relative">
      {/* Token Header */}
      <VStack align="start" spacing={isCompact ? 0.5 : 1}>
        <Text 
          fontWeight="medium" 
          fontSize={isCompact ? "xs" : "sm"}
          lineHeight={isCompact ? "1.2" : "normal"}
        >
          {balanceItem.contract_ticker_symbol || 'Unknown Token'}
        </Text>
        <Text 
          fontSize={isCompact ? "2xs" : "xs"} 
          color="gray.500"
          lineHeight={isCompact ? "1" : "normal"}
        >
          {balanceItem.contract_name || 'Unknown Name'}
        </Text>
      </VStack>

      {/* Balance Display */}
      <VStack align="start" spacing={isCompact ? 0.5 : 1} mt={isCompact ? 1 : 2}>
        <Tooltip label="Your wallet balance">
          <HStack spacing={1}>
            <Wallet size={isCompact ? 12 : 14} />
            <Text 
              fontSize={isCompact ? "2xs" : "sm"} 
              fontWeight="medium"
              lineHeight={isCompact ? "1" : "normal"}
            >
              {formattedAmounts.user.split('.')[0]}
              <Text 
                as="span" 
                fontSize={isCompact ? "3xs" : "xs"} 
                color="gray.500"
              >
                .{formattedAmounts.user.split('.')[1]}
              </Text>
            </Text>
          </HStack>
        </Tooltip>
      </VStack>

      {/* Progress Bar */}
      <Box 
        mt={isCompact ? 1 : 2} 
        h={isCompact ? "1px" : "2px"} 
        bg={`${contrastingColor}20`} 
        borderRadius="full" 
        overflow="hidden"
      >
        <Box
          h="100%"
          w={`${percentages.user}%`}
          bg={contrastingColor}
          transition="width 0.3s ease"
        />
      </Box>
    </Box>
  );
};

export default React.memo(TokenBalance);



// File: ./components/Token/TokenDetails.tsx
// File: ./components/Token/TokenDetails.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, VStack, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs } from '../../config/contracts';

interface TokenDetailsProps {
  tokenAddress: string;
  chainId: string;
}

export const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenAddress, chainId }) => {
  const { getEthersProvider } = usePrivy();

  // Fetch token data using React Query
  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['token', tokenAddress, chainId],
    queryFn: async () => {
      if (!tokenAddress || !chainId) return null;

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        tokenAddress, 
        ABIs.IERC20, 
        //@ts-ignore
        provider
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    },
    enabled: !!tokenAddress && !!chainId,
    staleTime: 30000 // Cache for 30 seconds
  });

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load token details
      </Alert>
    );
  }

  if (!tokenData) {
    return (
      <Alert status="info">
        <AlertIcon />
        No token data available
      </Alert>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="sm" color="gray.500">Name</Text>
          <Text fontSize="lg" fontWeight="semibold">{tokenData.name}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Symbol</Text>
          <Text fontSize="lg" fontWeight="semibold">{tokenData.symbol}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Total Supply</Text>
          <Text fontSize="lg" fontWeight="semibold">
            {Number(tokenData.totalSupply).toLocaleString()} {tokenData.symbol}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Decimals</Text>
          <Text fontSize="lg" fontWeight="semibold">{tokenData.decimals}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default TokenDetails;



// File: ./components/Token/TokenNameDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, useToast, HStack, Icon } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { getRPCUrl } from '../../config/contracts';
import { CopyIcon } from '@chakra-ui/icons';

interface TokenNameDisplayProps {
  tokenAddress: string;
  chainId: string;
}

export const TokenNameDisplay: React.FC<TokenNameDisplayProps> = ({
  tokenAddress,
  chainId
}) => {
  const [tokenName, setTokenName] = useState<string>('Loading...');
  const toast = useToast();

  useEffect(() => {
    const fetchTokenName = async () => {
      if (!tokenAddress) {
        setTokenName('Invalid Address');
        return;
      }

      try {
        const rpcUrl = getRPCUrl(chainId);
        const activeProvider = new ethers.JsonRpcProvider(rpcUrl);
        

        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function name() view returns (string)'],
          activeProvider
        );
        const name = await tokenContract.name();
        setTokenName(name);
      } catch (error) {
        console.error('Error fetching token name:', error);
        setTokenName('Error');
        toast({
          title: "Failed to fetch token name",
          description: "Please check your network connection",
          status: "error",
          duration: 3000,
        });
      }
    };

    fetchTokenName();
  }, [tokenAddress, chainId, toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenAddress);
    toast({
      title: "Address copied",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <Tooltip label="Click to copy token address">
      <Badge 
        colorScheme="purple" 
        p={2}
        cursor="pointer"
        onClick={handleCopy}
        _hover={{ opacity: 0.8 }}
      >
        <HStack spacing={2}>
          <span>{tokenName}</span>
          <Icon 
            as={CopyIcon} 
            w={3} 
            h={3}
            _hover={{ color: 'purple.300' }}
          />
        </HStack>
      </Badge>
    </Tooltip>
  );
};



// File: ./components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Code,
} from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" py={10} px={6}>
              <AlertTriangle size={50} className="mx-auto text-red-500" />
              <Heading as="h2" size="xl" mt={6} mb={2}>
                Something went wrong
              </Heading>
              <Text color="gray.500">
                We encountered an error while rendering this page.
              </Text>
            </Box>

            <Box bg="gray.50" p={4} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Error:</Text>
              <Code display="block" whiteSpace="pre-wrap" p={4}>
                {this.state.error?.toString()}
              </Code>
            </Box>

            {this.state.errorInfo && (
              <Box bg="gray.50" p={4} borderRadius="md">
                <Text fontWeight="bold" mb={2}>Component Stack:</Text>
                <Code display="block" whiteSpace="pre-wrap" p={4}>
                  {this.state.errorInfo.componentStack}
                </Code>
              </Box>
            )}

            <Button 
              colorScheme="purple"
              onClick={this.handleReset}
              alignSelf="center"
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              alignSelf="center"
            >
              Return to Home
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}



// File: ./components/NodeDetails.tsx
// File: ./components/NodeDetails.tsx

import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon,
  useDisclosure,
} from "@chakra-ui/react";
import { 
  Users, 
  ArrowUpRight, 
  GitBranch,
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { NodeOperations } from './Node/NodeOperations';
import  SignalForm  from './Node/SignalForm/index';
import { formatBalance } from '../utils/formatters';
import { useNodeTransactions } from '../hooks/useNodeTransactions';
import {nodeIdToAddress} from '../utils/formatters';
import { NodeState } from '../types/chainData';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
  selectedTokenColor: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  onNodeSelect,
  selectedTokenColor,
}) => {
  // Hooks
  const { user } = usePrivy();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Clean chain ID
  const cleanChainId = chainId?.replace('eip155:', '') || '';

  // Style hooks
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const permissionsBg = useColorModeValue('gray.50', 'gray.900');

  // Fetch node data
  const { data: nodeData, error, isLoading, refetch } = useNodeData(cleanChainId, nodeId);

  // Calculate stats
  const stats = useMemo(() => {
    if (!nodeData?.basicInfo) return {
      totalValue: '0',
      dailyGrowth: '0',
      memberCount: 0,
      childCount: 0,
      pathDepth: 0
    };

    try {
      const totalValue = nodeData.basicInfo[4] ? BigInt(nodeData.basicInfo[4]) : BigInt(0);
      const inflation = nodeData.basicInfo[1] ? BigInt(nodeData.basicInfo[1]) : BigInt(0);
      const dailyGrowth = inflation * BigInt(86400);

      return {
        totalValue: formatBalance(totalValue.toString()),
        dailyGrowth: formatBalance(dailyGrowth.toString()),
        memberCount: nodeData.membersOfNode?.length || 0,
        childCount: nodeData.childrenNodes?.length || 0,
        pathDepth: nodeData.rootPath?.length || 0
      };
    } catch (err) {
      console.error('Error calculating stats:', err);
      return {
        totalValue: '0',
        dailyGrowth: '0',
        memberCount: 0,
        childCount: 0,
        pathDepth: 0
      };
    }
  }, [nodeData]);

  // Loading state
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
      </Alert>
    );
  }

  // No data state
  if (!nodeData?.basicInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>No data available for this node</Text>
      </Alert>
    );
  }

  return (
    <Box
    borderRadius="lg"
    bg={bgColor}
    border="1px solid"
    borderColor={borderColor}
    overflow="auto" // Change from "hidden" to "auto"
    maxHeight="calc(100vh - 200px)" // Add max height with space for header/nav
    display="flex"
    flexDirection="column"
    >
      {/* Header Section */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontSize="lg" fontWeight="bold">
                Node {nodeId.slice(-6)}
              </Text>
              <Badge colorScheme="purple">
                Depth {stats.pathDepth}
              </Badge>
            </HStack>
            <Text fontSize="sm" color={textColor}>
              {nodeData.basicInfo[0]}
            </Text>
          </VStack>
          


<NodeOperations
  nodeId={nodeId}
  chainId={chainId}
  selectedTokenColor={selectedTokenColor}
  onSuccess={refetch}
/>

        </HStack>

        <HStack spacing={8} wrap="wrap">
          <Tooltip label="Total Value">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Total Value</Text>
              <Text fontSize="lg" fontWeight="semibold">
                {stats.totalValue}
              </Text>
            </VStack>
          </Tooltip>

          <Tooltip label="Daily Growth">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Daily Growth</Text>
              <Text fontSize="lg" fontWeight="semibold" color="green.500">
                +{stats.dailyGrowth}
              </Text>
            </VStack>
          </Tooltip>

          <Tooltip label="Members">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Members</Text>
              <HStack>
                <Users size={16} />
                <Text fontSize="lg" fontWeight="semibold">
                  {stats.memberCount}
                </Text>
              </HStack>
            </VStack>
          </Tooltip>

          <Tooltip label="Child Nodes">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Child Nodes</Text>
              <HStack>
                <GitBranch size={16} />
                <Text fontSize="lg" fontWeight="semibold">
                  {stats.childCount}
                </Text>
              </HStack>
            </VStack>
          </Tooltip>
        </HStack>
      </Box>

      {/* Path Display */}
      {nodeData.rootPath.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <Text fontWeight="medium" mb={2}>Path</Text>
          <HStack spacing={2}>
            {nodeData.rootPath.map((pathNodeId, index) => (
              <React.Fragment key={pathNodeId}>
                {index > 0 && <ArrowUpRight size={14} />}
                <Badge
                  cursor="pointer"
                  onClick={() => onNodeSelect?.(pathNodeId)}
                  _hover={{ bg: 'purple.100' }}
                >
                  {pathNodeId.slice(-6)}
                </Badge>
              </React.Fragment>
            ))}
          </HStack>
        </Box>
      )}

      {/* Signal Configuration */}
      {nodeData?.basicInfo && (
  <SignalForm
    chainId={cleanChainId}
    nodeId={nodeId}
    parentNodeData={nodeData}
    onSuccess={refetch}
  />
)}

      {/* Signal History */}
      {nodeData.signals.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <Text fontWeight="medium" mb={4}>Recent Signals</Text>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Membrane</Th>
                <Th>Inflation</Th>
                <Th>Timestamp</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {nodeData.signals.slice(0, 5).map((signal, index) => (
                <Tr key={index}>
                  <Td>{signal.MembraneInflation[0] || 'Unknown'}</Td>
                  <Td>{signal.MembraneInflation[1] || '0'}</Td>
                  <Td>{new Date(Number(signal.lastRedistSignal[0] || '0')).toLocaleString()}</Td>
                  <Td isNumeric>{formatBalance(String(signal.MembraneInflation[1]) || '0')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Permissions */}
      {user?.wallet?.address && (
        <Box p={6} bg={permissionsBg}>
          <Text fontWeight="medium" mb={2}>Permissions</Text>
          <HStack spacing={4} wrap="wrap">
            <Badge colorScheme="green" variant="subtle">Mint</Badge>
            <Badge colorScheme="green" variant="subtle">Burn</Badge>
            <Badge colorScheme="green" variant="subtle">Signal</Badge>
            <Badge colorScheme="green" variant="subtle">Redistribute</Badge>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default NodeDetails;



// File: ./components/DefineEntity.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Progress,
  Text,
  useToast,
  Link,
  IconButton,
  Code,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";

import {
  Trash2,
  Plus,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { validateToken } from '../utils/tokenValidation';
import { getExplorerLink } from '../config/contracts';

interface DefineEntityProps {
  chainId: string;
  onSubmit?: () => void;
}

interface Characteristic {
  title: string;
  link: string;
}

interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol?: string;
}

interface EntityMetadata {
  name: string;
  characteristics: Characteristic[];
  membershipConditions: MembershipCondition[];
}

export const DefineEntity: React.FC<DefineEntityProps> = ({ chainId, onSubmit }) => {
  console.log('chainId', chainId);
  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<{ 
    membraneId?: string;
    txHash: string;
    timestamp: number;
  } | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  // Hooks
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const toast = useToast();

  // Token validation and handling
  const validateAndAddToken = useCallback(async () => {
    if (!newTokenAddress || !newTokenBalance) {
      toast({
        title: 'Error',
        description: 'Both token address and balance are required',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setValidatingToken(true);
    console.log('Validating token:', { address: newTokenAddress, balance: newTokenBalance });

    try {
      const tokenInfo = await validateToken(newTokenAddress, chainId);
      if (!tokenInfo) throw new Error('Invalid token address');

      const isDuplicate = membershipConditions.some(
        mc => mc.tokenAddress.toLowerCase() === newTokenAddress.toLowerCase()
      );

      if (isDuplicate) {
        throw new Error('Token already added to conditions');
      }

      setMembershipConditions(prev => [...prev, {
        tokenAddress: newTokenAddress.toLowerCase(),
        requiredBalance: newTokenBalance,
        symbol: tokenInfo.symbol
      }]);

      setNewTokenAddress('');
      setNewTokenBalance('');

      toast({
        title: 'Success',
        description: `Added ${tokenInfo.symbol} token requirement`,
        status: 'success',
        duration: 2000
      });

      console.log('Token validated and added:', tokenInfo);

    } catch (error: any) {
      console.error('Token validation error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    } finally {
      setValidatingToken(false);
    }
  }, [newTokenAddress, newTokenBalance, chainId, membershipConditions, toast]);

  // Characteristic handling
  const addCharacteristic = useCallback(() => {
    if (!newCharTitle || !newCharLink) {
      toast({
        title: 'Error',
        description: 'Both title and link are required',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setCharacteristics(prev => [...prev, {
      title: newCharTitle,
      link: newCharLink
    }]);

    setNewCharTitle('');
    setNewCharLink('');
  }, [newCharTitle, newCharLink, toast]);

  // Form submission
  const handleSubmit = async () => {
    if (!authenticated || !ready) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!entityName || characteristics.length === 0) {
      toast({
        title: 'Error',
        description: 'Entity name and at least one characteristic are required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting membrane creation...', {
        entityName,
        membershipConditions,
        characteristics
      });

      // Prepare metadata
      const metadata: EntityMetadata = {
        name: entityName,
        characteristics,
        membershipConditions
      };

      // Upload to IPFS
      console.log('Uploading metadata to IPFS...');
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadata }),
      });

      if (!response.ok) throw new Error('Failed to upload metadata');
      const { cid } = await response.json();
      console.log('Metadata uploaded to IPFS:', { cid });

      // Get contract instance
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      const membraneAddress = deployments.Membrane[cleanChainId];

      if (!membraneAddress) {
        throw new Error(`No Membrane contract found for chain ${chainId}`);
      }

      
      const contract = new ethers.Contract(
        membraneAddress,
        ABIs.Membrane,
        signer as unknown as ethers.Signer
      );

      // Prepare transaction parameters
      const tokens = membershipConditions.map(mc => mc.tokenAddress.toLowerCase());
      const balances = membershipConditions.map(mc => 
        ethers.parseUnits(mc.requiredBalance, 18)
      );

      console.log('Creating membrane with parameters:', {
        tokens,
        balances,
        cid
      });

      // Send transaction
      const tx = await contract.createMembrane(tokens, balances, cid);
      console.log('Transaction sent:', tx.hash);

      // Show pending toast
      const pendingToastId = toast({
        title: 'Transaction Pending',
        description: 'Creating membrane...',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      try {
        // Wait for confirmation differently
        const receipt = await provider.waitForTransaction(tx.hash);
        console.log('Transaction confirmed:', receipt);

        // Close pending toast
        toast.close(pendingToastId);

        // Find MembraneCreated event
        const membraneCreatedEvent = receipt.logs
          .find(log => {
            try {
              return log.topics[0] === ethers.id("MembraneCreated(uint256,string)");
            } catch {
              return false;
            }
          });

        if (!membraneCreatedEvent) {
          throw new Error('Could not find membrane ID in transaction logs');
        }

        const membraneId = ethers.toBigInt(membraneCreatedEvent.topics[1]).toString();
        console.log('Membrane created with ID:', membraneId);

        setCreationResult({
          membraneId,
          txHash: receipt.transactionHash,
          timestamp: Date.now()
        });

        toast({
          title: 'Success',
          description: 'Entity created successfully',
          status: 'success',
          duration: 5000,
          icon: <Check size={16} />,
        });

        if (onSubmit) {
          onSubmit();
        }

      } catch (waitError) {
        console.error('Transaction confirmation error:', waitError);
        toast.close(pendingToastId);
        throw new Error('Transaction failed during confirmation');
      }

    } catch (error: any) {
      console.error('Entity creation error:', error);
      setError(error.message);
      toast({
        title: 'Failed to Create Entity',
        description: error.message || 'Transaction failed',
        status: 'error',
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 200px)">
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Text fontSize="2xl" fontWeight="bold">Define Entity</Text>
        <Text color="gray.600">Configure membrane requirements</Text>
      </Box>

      <Box overflowY="auto" flex="1" pb="160px">
        <Box p={6}>
          <VStack spacing={6} align="stretch">
            {/* Entity Name */}
            <FormControl isRequired>
              <FormLabel>Entity Name</FormLabel>
              <Input
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Enter entity name"
              />
            </FormControl>

            {/* Characteristics Section */}
            <Box>
              <FormLabel>Characteristics</FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="Title"
                  value={newCharTitle}
                  onChange={(e) => setNewCharTitle(e.target.value)}
                />
                <Input
                  placeholder="Link"
                  value={newCharLink}
                  onChange={(e) => setNewCharLink(e.target.value)}
                />
                <IconButton
                  aria-label="Add characteristic"
                  icon={<Plus size={20} />}
                  onClick={addCharacteristic}
                  isDisabled={!newCharTitle || !newCharLink}
                />
              </HStack>

              {characteristics.length > 0 && (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Link</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {characteristics.map((char, idx) => (
                      <Tr key={idx}>
                        <Td>{char.title}</Td>
                        <Td>
                          <Link href={char.link} isExternal color="purple.500">
                            {char.link.substring(0, 30)}...
                            <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                          </Link>
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Delete characteristic"
                            icon={<Trash2 size={18} />}
                            onClick={() => setCharacteristics(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            <Divider />

            {/* Membership Conditions Section */}
            <Box>
              <FormLabel>Membership Conditions</FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="Token address"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                />
                <Input
                  placeholder="Required balance"
                  value={newTokenBalance}
                  onChange={(e) => setNewTokenBalance(e.target.value)}
                />
                <Button
                  colorScheme="purple"
                  onClick={validateAndAddToken}
                  isLoading={validatingToken}
                  isDisabled={!newTokenAddress || !newTokenBalance}
                >
                  Add
                </Button>
              </HStack>

              {membershipConditions.length > 0 && (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Token</Th>
                      <Th>Required Balance</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {membershipConditions.map((mc, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <Code>{mc.symbol ? `${mc.symbol} (${mc.tokenAddress})` : mc.tokenAddress}</Code>
                        </Td>
                        <Td>{mc.requiredBalance}</Td>
                        <Td>
                          <IconButton
                            aria-label="Delete condition"
                            icon={<Trash2 size={18} />}
                            onClick={() => setMembershipConditions(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            <Divider />

            {/* Form submission */}
            <Button
              colorScheme="purple"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Creating Entity"
              isDisabled={!entityName || characteristics.length === 0 || isLoading}
            >
              Submit
            </Button>

            {isLoading && <Progress size="xs" isIndeterminate colorScheme="purple" />}

            {/* Display result or error */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {creationResult && (
              <Alert status="success">
                <AlertIcon />
                <VStack align="stretch" width="100%" spacing={2}>
                  <Text>Entity successfully created</Text>
                  <HStack>
                    <Text fontWeight="bold">Membrane ID:</Text>
                    <Code maxW="300px" isTruncated>
                      {creationResult.membraneId}
                    </Code>
                    <Tooltip label="Copy to clipboard">
                      <IconButton
                        aria-label="Copy membrane ID"
                        icon={<Copy size={14} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(creationResult.membraneId!);
                          toast({
                            title: "Copied",
                            status: "success",
                            duration: 2000,
                          });
                        }}
                      />
                    </Tooltip>
                  </HStack>
                  {creationResult.txHash && (
                    <Link 
                      href={getExplorerLink(chainId, creationResult.txHash)}
                      isExternal
                      color="purple.500"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                    >
                      View transaction <ExternalLink size={14} style={{ marginLeft: 4 }} />
                    </Link>
                  )}
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default DefineEntity;



// File: ./config/theme.ts
// File: config/theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const fonts = {
  body: "'AdelleSans-Regular', -apple-system, system-ui, sans-serif",
  heading: "'AdelleSans-Semibold', -apple-system, system-ui, sans-serif",
};

const colors = {
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
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
};

const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    defaultProps: {
      colorScheme: 'brand',
      size: 'md',
    },
    variants: {
      solid: (props: { colorScheme: string }) => ({
        bg: `${props.colorScheme}.600`,
        color: 'white',
        _hover: {
          bg: `${props.colorScheme}.700`,
        },
      }),
      outline: (props: { colorScheme: string }) => ({
        borderColor: `${props.colorScheme}.600`,
        color: `${props.colorScheme}.600`,
        _hover: {
          bg: `${props.colorScheme}.50`,
        },
      }),
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'sm',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'lg',
      },
    },
  },
  Toast: {
    baseStyle: {
      container: {
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'gray.100',
      },
    },
  },
};

const styles = {
  global: {
    'html, body': {
      minHeight: '100vh',
      backgroundColor: 'gray.50',
      color: 'gray.900',
    },
    '*': {
      borderColor: 'gray.200',
      borderStyle: 'solid',
    },
    '::selection': {
      backgroundColor: 'brand.100',
      color: 'brand.900',
    },
  },
};

// Construct the complete theme
export const customTheme = extendTheme({
  config,
  fonts,
  colors,
  breakpoints,
  components,
  styles,
});



// File: ./config/apiKeys.ts
export const getCovalentApiKey = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
    if (!apiKey) {
      throw new Error('Covalent API key not configured');
    }
    return apiKey;
  };
  
  export const getAirstackApiKey = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_AIRSTACK_API_KEY;
    if (!apiKey) {
      throw new Error('Airstack API key not configured');
    }
    return apiKey;
  };
  
  export const getCoinbOnchainKitApiKey = (): string => {
    const apiKey = process.env.COINB_ONCHAINKIT_API_KEY;
    if (!apiKey) {
      throw new Error('Coinb Onchainkit API key not configured');
    }
    return apiKey;
  };



// File: ./config/contracts.ts
import { deployments, ABIs, getChainById } from './deployments';
import { ethers } from 'ethers';

export { deployments, ABIs, getChainById };

export const getRPCUrl = (chainId: string): string => {
  let url;
  const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId
  switch (cleanChainId) {
    case '84532': // Base Sepolia
      url = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
      break;
    case '11155420': // Optimism Sepolia
      url = process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM_SEPOLIA;
      break;
    case '167009': // Taiko Hekla
      url = process.env.NEXT_PUBLIC_RPC_URL_TAIKO_HEKLA;
      break;
    case '167000': // Taiko
      url = process.env.NEXT_PUBLIC_RPC_URL_TAIKO;
      break;
    case '534351': // Scroll Testnet
      url = process.env.NEXT_PUBLIC_RPC_URL_SCROLL_TESTNET;
      break;
    default:
      url = process.env[`NEXT_PUBLIC_RPC_URL_${cleanChainId}`]; /// use getChainByID or set some defaults via viem
  }
  
  if (!url) {
    throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
  }
  return url;
};

export const getExplorerLink = (
  address: string,
  chainId: string,
  type: 'tx' | 'address' = 'address'
): string => {
  try {
    // Ensure we're using the chainId, not an address
    if (!chainId ) {
      throw new Error('Invalid chain ID format');
    }
    
    // Clean chainId format
    const cleanChainId = chainId.replace('eip155:', '');
    
    // Get chain info from viem
    const chain = getChainById(cleanChainId);
    const explorerUrl = chain.blockExplorers?.default?.url;
    
    if (!explorerUrl) {
      throw new Error('No explorer URL found for chain');
    }

    // Validate address format for address type
    if (type === 'address' && !ethers.isAddress(address)) {
      throw new Error('Invalid address format');
    }

    return `${explorerUrl}/${type}/${address}`;
  } catch (error) {
    console.warn('Failed to get explorer URL:', error);
    return '#';
  }
};
export const getMembraneContract = async (
  chainId: string,
  provider: ethers.Provider
): Promise<ethers.Contract> => {
  // Remove 'eip155:' prefix if present
  const cleanChainId = chainId.replace('eip155:', '');
  
  // Get the contract address for this chain
  const address = deployments["Membrane"][cleanChainId];
  if (!address) {
    throw new Error(`No Membrane contract deployed on chain ${chainId}`);
  }

  // Create and return the contract instance
  return new ethers.Contract(
    address,
    ABIs.Membrane,
    provider
  );
};



// File: ./config/deployments.ts
import { Chain} from 'viem';
import * as chains from 'viem/chains';
import { InterfaceAbi } from 'ethers';

type Deployments = { [key: string]: { [key: string]: string } };
type ABIKP = { [key: string]: InterfaceAbi };

// ###############################
// Foundation Agent Safe at:  0xE9a6CaCD129732dc840051676e9cab2490dbE851
// Will:  0x82Cb12995f4861D317a6C7C72917BE3C243222a6
// Membrane:  0x07BC28304C6D0fb926F25B1917c1F64BeF1587Ac
// Execution:  0x3d7A9839935333C7C373e1338C12B593F78318D3
// WillWe:  0x88AB91578876A7fC13F9F4A9332083Ddfb062049
// ###############################


export const deployments: Deployments = {
  "WillWe": {
    "84532": "0x8f45bEe4c58C7Bb74CDa9fBD40aD86429Dba3E41",
    "11155420": "0x264336ec33fab9CC7859b2C5b431f42020a20E75",
    "167009" : "0x88AB91578876A7fC13F9F4A9332083Ddfb062049"
  },
  "Membrane": {
    "84532": "0xaBbd15F9eD0cab9D174b5e9878E9f104a993B41f",
    "11155420": "0x36C70f035c39e4072822F8C33C4427ae59298451",
    "167009" : "0x07BC28304C6D0fb926F25B1917c1F64BeF1587Ac"
  },
  "Execution": {
    "84532": "0x3D52a3A5D12505B148a46B5D69887320Fc756F96",
    "11155420": "0xEDf98928d9513051D75e72244e0b4DD254DB1462",
    "167009" : "0x3d7A9839935333C7C373e1338C12B593F78318D3"
  },
  "RVI": {
    "84532": "0xDf17125350200A99E5c06E5E2b053fc61Be7E6ae",
    "11155420": "0x9d814170537951fE8eD28A534CDE9F30Fd731A64",
    "167009" : "0x82Cb12995f4861D317a6C7C72917BE3C243222a6"
  }
};

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
export function getChainById(chainId: string): Chain {
    if (! chainId)   throw new Error(`Unproper provided chain id ${chainId}`);
    const CID =  (chainId.includes(":")) ? chainId.split(":")[1] : chainId;
  for (const chain of Object.values(chains)) {
    if ('id' in chain) {
      if (chain.id === Number(CID)) {
        return chain as Chain;
      }
    }
  }
  throw new Error(`Chain with id ${chainId} not found`); 
}

export const ABIs: ABIKP = {
    "WillWe" :   [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "Execution",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "Membrane",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "Will",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "allMembersOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "asRootValuation",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "rAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "balanceOfBatch",
            "inputs": [
                {
                    "name": "owners",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "balances",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burn",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "topVal",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "burnPath",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "calculateUserTargetedPreferenceAmount",
            "inputs": [
                {
                    "name": "childId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "parentId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signal",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "control",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "endpoint",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "entityCount",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "executeQueue",
            "inputs": [
                {
                    "name": "SignatureQueueHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "executionAddress",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getAllNodesForRoot",
            "inputs": [
                {
                    "name": "rootAddress",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "userIfAny",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "nodes",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membraneMeta",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getChildParentEligibilityPerSec",
            "inputs": [
                {
                    "name": "childId_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "parentId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getChildrenOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getFidPath",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "fids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMembraneOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodeData",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "NodeData",
                    "type": "tuple",
                    "internalType": "struct NodeState",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membraneMeta",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodeDataWithUserSignals",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "nodeData",
                    "type": "tuple",
                    "internalType": "struct NodeState",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membraneMeta",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodes",
            "inputs": [
                {
                    "name": "nodeIds",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "nodes",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membraneMeta",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getParentOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getSigQueue",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct SignatureQueue",
                    "components": [
                        {
                            "name": "state",
                            "type": "uint8",
                            "internalType": "enum SQState"
                        },
                        {
                            "name": "Action",
                            "type": "tuple",
                            "internalType": "struct Movement",
                            "components": [
                                {
                                    "name": "category",
                                    "type": "uint8",
                                    "internalType": "enum MovementType"
                                },
                                {
                                    "name": "initiatior",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "exeAccount",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "viaNode",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "expiresAt",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "descriptionHash",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "Signers",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "Sigs",
                            "type": "bytes[]",
                            "internalType": "bytes[]"
                        },
                        {
                            "name": "exeSig",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUserNodeSignals",
            "inputs": [
                {
                    "name": "signalOrigin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "parentNodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "UserNodeSignals",
                    "type": "uint256[2][]",
                    "internalType": "uint256[2][]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "inParentDenomination",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "inParentVal",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "inflationOf",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "initSelfControl",
            "inputs": [],
            "outputs": [
                {
                    "name": "controlingAgent",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "isApprovedForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isMember",
            "inputs": [
                {
                    "name": "whoabout_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "whereabout_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isQueueValid",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "localizeEndpoint",
            "inputs": [
                {
                    "name": "endpoint_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "endpointParent_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "endpointOwner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "membershipEnforce",
            "inputs": [
                {
                    "name": "target",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "membershipID",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintInflation",
            "inputs": [
                {
                    "name": "node",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintMembership",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintPath",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "redistribute",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "distributedAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "redistributePath",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "distributedAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "removeSignature",
            "inputs": [
                {
                    "name": "sigHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "resignal",
            "inputs": [
                {
                    "name": "targetNode_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "originator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeBatchTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "amounts",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "sendSignal",
            "inputs": [
                {
                    "name": "targetNode_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setApprovalForAll",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "isApproved",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setControl",
            "inputs": [
                {
                    "name": "newController",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnBranch",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "newID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnBranchWithMembrane",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "membraneID_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "newID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnRootBranch",
            "inputs": [
                {
                    "name": "fungible20_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "fID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "startMovement",
            "inputs": [
                {
                    "name": "typeOfMovement",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "node",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiresInDays",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "executingAccount",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "submitSignatures",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "signers",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "signatures",
                    "type": "bytes[]",
                    "internalType": "bytes[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "supportsInterface",
            "inputs": [
                {
                    "name": "interfaceId",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "taxPolicyPreference",
            "inputs": [
                {
                    "name": "rootToken_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "taxRate_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "toAddress",
            "inputs": [
                {
                    "name": "x",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "toID",
            "inputs": [
                {
                    "name": "x",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "uri",
            "inputs": [
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "ApprovalForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "isApproved",
                    "type": "bool",
                    "indexed": false,
                    "internalType": "bool"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "BranchSpawned",
            "inputs": [
                {
                    "name": "parentId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "newBranchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "ConfigSignal",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "expressedOption",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "InflationMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "InflationRateChanged",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "oldInflationRate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newInflationRate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MembershipMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "member",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MembraneChanged",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "previousMembrane",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newMembrane",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewBranch",
            "inputs": [
                {
                    "name": "newId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "parentId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewMovement",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewRootBranch",
            "inputs": [
                {
                    "name": "rootBranchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SelfControlAtAddress",
            "inputs": [
                {
                    "name": "AgencyLocus",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SignalSent",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "sender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Signaled",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "sender",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "origin",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TokensBurned",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "burner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TokensMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "minter",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TransferBatch",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                },
                {
                    "name": "amounts",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TransferSingle",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "URI",
            "inputs": [
                {
                    "name": "value",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AccountBalanceOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ArrayLengthsMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BadLen",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BaseOrNonFungible",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BranchAlreadyExists",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BranchNotFound",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnE20TransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CannotSkip",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CoreGasTransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Disabled",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EOA",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExecutionOnly",
            "inputs": []
        },
        {
            "type": "error",
            "name": "IncompleteSign",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientAmt",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientRootBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MembershipOp",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MembraneNotFound",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MintE20TransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "No",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoControl",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMembership",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoSoup",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoTimeDelta",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Noise",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoiseNotVoice",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotOwnerNorApproved",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PathTooShort",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ResignalMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "RootExists",
            "inputs": []
        },
        {
            "type": "error",
            "name": "RootNodeOrNone",
            "inputs": []
        },
        {
            "type": "error",
            "name": "SignalOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "StableRoot",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TargetIsRoot",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferToNonERC1155ReceiverImplementer",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferToZeroAddress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Unautorised",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UniniMembrane",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Unqualified",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnregisteredFungible",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnsupportedTransfer",
            "inputs": []
        },
        {
            "type": "error",
            "name": "isControled",
            "inputs": []
        }
    ],
    "Execution" : [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "WillToken_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "EIP712_DOMAIN_TYPEHASH",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "MOVEMENT_TYPEHASH",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "WillToken",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "WillWe",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "contract IFun"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "endpoint",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "endpointOwner",
            "inputs": [
                {
                    "name": "endpointAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "executeQueue",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getSigQueue",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct SignatureQueue",
                    "components": [
                        {
                            "name": "state",
                            "type": "uint8",
                            "internalType": "enum SQState"
                        },
                        {
                            "name": "Action",
                            "type": "tuple",
                            "internalType": "struct Movement",
                            "components": [
                                {
                                    "name": "category",
                                    "type": "uint8",
                                    "internalType": "enum MovementType"
                                },
                                {
                                    "name": "initiatior",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "exeAccount",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "viaNode",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "expiresAt",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "descriptionHash",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "Signers",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "Sigs",
                            "type": "bytes[]",
                            "internalType": "bytes[]"
                        },
                        {
                            "name": "exeSig",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "hashDomain",
            "inputs": [
                {
                    "name": "domain",
                    "type": "tuple",
                    "internalType": "struct EIP712Domain",
                    "components": [
                        {
                            "name": "name",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "version",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "chainId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "verifyingContract",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "salt",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "hashMessage",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "hashMovement",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "isQueueValid",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "removeLatentAction",
            "inputs": [
                {
                    "name": "actionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "removeSignature",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signer",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setWillWe",
            "inputs": [
                {
                    "name": "implementation",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "startMovement",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "typeOfMovement",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiresInDays",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "executingAccount",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "submitSignatures",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "signers",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "signatures",
                    "type": "bytes[]",
                    "internalType": "bytes[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "verifyMessage",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                },
                {
                    "name": "v",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "r",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "s",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "expectedAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "EndpointCreatedForAgent",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "endpoint",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "agent",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "LatentActionRemoved",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "actionHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewMovementCreated",
            "inputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewSignaturesSubmitted",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "QueueExecuted",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SignatureRemoved",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "signer",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WillWeSet",
            "inputs": [
                {
                    "name": "implementation",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AlreadyHasEndpoint",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyInit",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyInitialized",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadySigned",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_A0sig",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_ActionIndexMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_BadOwnerOrAuthType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_InProgress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_NoDescription",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_NoType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_OnlyMore",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_OnlySigner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_SQInvalid",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_ZeroLen",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_exeQFail",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EmptyUnallowed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExpiredMovement",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExpiredQueue",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidQueue",
            "inputs": []
        },
        {
            "type": "error",
            "name": "LenErr",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMembersForNode",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMovementType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoSignatures",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotExeAccOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotNodeMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnavailableState",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UninitQueue",
            "inputs": []
        }
    ],
    "Membrane" :   [
        {
            "type": "function",
            "name": "createMembrane",
            "inputs": [
                {
                    "name": "tokens_",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "balances_",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "meta_",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "gCheck",
            "inputs": [
                {
                    "name": "who_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "membraneID_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMembraneById",
            "inputs": [
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct Membrane",
                    "components": [
                        {
                            "name": "tokens",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "balances",
                            "type": "uint256[]",
                            "internalType": "uint256[]"
                        },
                        {
                            "name": "meta",
                            "type": "string",
                            "internalType": "string"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setInitWillWe",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "willWe",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "contract IFun"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "MembraneCreated",
            "inputs": [
                {
                    "name": "membraneId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "CID",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WillWeSet",
            "inputs": [
                {
                    "name": "willWeAddress",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "Membrane__EmptyFieldOnMembraneCreation",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Membrane__UnauthorizedWillWeSet",
            "inputs": []
        },
        {
            "type": "error",
            "name": "membraneNotFound",
            "inputs": []
        }
    ],
    "RVI" : [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "price_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pps_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "initMintAddrs_",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "initMintAmts_",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "allowance",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "approve",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "account",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burn",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amtValReturned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "burnReturns",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "rv",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burnTo",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "to_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "currentPrice",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "decimals",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint8",
                    "internalType": "uint8"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "deconstructBurn",
            "inputs": [
                {
                    "name": "amountToBurn_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "tokensToRedeem",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "outputs": [
                {
                    "name": "shareBurned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "decreaseAllowance",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "subtractedValue",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "increaseAllowance",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "addedValue",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "initTime",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "mintCost",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mintFromETH",
            "inputs": [],
            "outputs": [
                {
                    "name": "howMuchMinted",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "pps",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "relayERC20",
            "inputs": [
                {
                    "name": "_from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "sendERC20",
            "inputs": [
                {
                    "name": "_to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_chainId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "simpleBurn",
            "inputs": [
                {
                    "name": "amountToBurn_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amtValReturned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "transfer",
            "inputs": [
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "transferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "Approval",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "spender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "RelayERC20",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "source",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SendERC20",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "destination",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Transfer",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "ATransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnRefundF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CallerNotL2ToL2CrossDomainMessenger",
            "inputs": []
        },
        {
            "type": "error",
            "name": "DelegateCallFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficentBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidCalldata",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidCrossDomainSender",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PayCallF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PingF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Reentrant",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnqualifiedCall",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ValueMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ZeroAddress",
            "inputs": []
        }
    ],
    "IERC20" : [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_from",
                        "type": "address"
                    },
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    },
                    {
                        "name": "_spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "payable": true,
                "stateMutability": "payable",
                "type": "fallback"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            }
        
        ],
    "PowerProxy" : [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "proxyOwner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "implementation",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "onERC1155Received",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setImplementation",
            "inputs": [
                {
                    "name": "implementation_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setOwner",
            "inputs": [
                {
                    "name": "owner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setSignedHash",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "tryAggregate",
            "inputs": [
                {
                    "name": "requireSuccess",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "calls",
                    "type": "tuple[]",
                    "internalType": "struct PowerProxy.Call[]",
                    "components": [
                        {
                            "name": "target",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "callData",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "returnData",
                    "type": "tuple[]",
                    "internalType": "struct PowerProxy.Result[]",
                    "components": [
                        {
                            "name": "success",
                            "type": "bool",
                            "internalType": "bool"
                        },
                        {
                            "name": "returnData",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "error",
            "name": "Multicall2",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "noFallback",
            "inputs": []
        }
    ]
}


export const getRPCUrl = (chainId: string): string => {
    let url;
    const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId
    switch (cleanChainId) {
      case '84532': // Base Sepolia
        url = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
        break;
      case '11155420': // Optimism Sepolia
        url = process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM_SEPOLIA;
        break;
      case '167009': // Taiko Hekla
        url = process.env.NEXT_PUBLIC_RPC_URL_TAIKO_HEKLA;
        break;
      case '167000': // Taiko
        url = process.env.NEXT_PUBLIC_RPC_URL_TAIKO;
        break;
      case '534351': // Scroll Testnet
        url = process.env.NEXT_PUBLIC_RPC_URL_SCROLL_TESTNET;
        break;
      default:
        url = process.env[`NEXT_PUBLIC_RPC_URL_${cleanChainId}`]; /// use getChainByID or set some defaults via viem
    }
    
    if (!url) {
      throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
    }
    return url;
  };



// File: ./hooks/useSignalState.ts
import { useState, useCallback, useMemo } from 'react';

interface SignalState {
  [key: string]: number;
}

export function useSignalState(childNodes: string[]) {
  const [childSignals, setChildSignals] = useState<SignalState>(() => 
    childNodes.reduce((acc, nodeId) => ({ ...acc, [nodeId]: 0 }), {})
  );

  const [inflationRate, setInflationRate] = useState('');

  const validateInflationRate = useCallback((value: string): boolean => {
    if (!value) return false;
    const rate = Number(value);
    return !isNaN(rate) && rate >= 0 && rate <= 1000000;
  }, []);

  const totalAllocation = useMemo(() => 
    Object.values(childSignals).reduce((sum, val) => sum + val, 0),
  [childSignals]);

  const validateChildSignals = useCallback(() => 
    Math.abs(totalAllocation - 100) < 0.01,
  [totalAllocation]);

  return {
    childSignals,
    setChildSignals,
    inflationRate,
    setInflationRate,
    validateInflationRate,
    validateChildSignals,
    totalAllocation
  };
}



// File: ./hooks/useNodeDataLoading.tsx
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

export function useNodeDataLoading(chainId: string | undefined, nodeId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<NodeState | null>(null);

  // Move fetchData outside useEffect for reusability
  const fetchData = useCallback(async () => {
    if (!chainId || !nodeId) {
      setIsLoading(false);
      return;
    }

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      
      // Create provider
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      
      // Get contract instance
      const contractAddress = deployments.WillWe[cleanChainId];
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
      
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.WillWe,
        provider as unknown as ethers.ContractRunner
      );

      console.log('Fetching node data for:', {
        chainId: cleanChainId,
        nodeId,
        contractAddress
      });

      // Fetch node data
      const nodeData = await contract.getNodeData(nodeId);
      
      // Transform and validate the data
      if (!nodeData || !nodeData.basicInfo) {
        throw new Error('Invalid node data received');
      }

      const transformedData: NodeState = {
        basicInfo: nodeData.basicInfo.map(String),
        membersOfNode: nodeData.membersOfNode || [],
        childrenNodes: nodeData.childrenNodes || [],
        rootPath: nodeData.rootPath || [],
        signals: nodeData.signals || [],
        membraneMeta: nodeData.membraneMeta || null
      };

      setData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId]);

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        setIsLoading(true);
        await fetchData();
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    data,
    refetch
  };
}



// File: ./hooks/useBalances.tsx
import { useCallback } from 'react';
import { BalanceItem } from '@covalenthq/client-sdk';
import { useCovalentBalances } from './useCovalentBalances';
import { useWillBalances } from './useWillBalances';

interface UseBalancesResult {
  balances: BalanceItem[];
  protocolBalances: BalanceItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBalances(
  userAddress: string | undefined,
  chainId: string | undefined
): UseBalancesResult {
  const covalentBalancesResult = useCovalentBalances(userAddress || '', chainId || '');
  const balances = covalentBalancesResult.balances;
  const protocolBalancesResult = covalentBalancesResult.protocolBalances;
  const isBalancesLoading = covalentBalancesResult.isLoading;
  const balancesError = covalentBalancesResult.error;

  const {
    willBalanceItems: protocolBalances,
    isLoading: isProtocolBalancesLoading,
    error: protocolBalancesError,
  } = useWillBalances(chainId || '');

  const isLoading = isBalancesLoading || isProtocolBalancesLoading;
  const error = balancesError || protocolBalancesError;
  const refetch = useCallback(() => {
    covalentBalancesResult.refetch();
    useWillBalances(chainId || '').refetch();
  }, [covalentBalancesResult, useWillBalances, chainId]);

  return {
    balances,
    protocolBalances,
    isLoading,
    error,
    refetch
  };
}

// Helper function to merge user and protocol balances
export function mergeBalances(
  userBalances: BalanceItem[],
  protocolBalances: BalanceItem[]
): BalanceItem[] {
  const mergedBalances = [...userBalances];
  
  protocolBalances.forEach(protocolBalance => {
    const existingIndex = mergedBalances.findIndex(
      balance => balance.contract_address === protocolBalance.contract_address
    );
    
    if (existingIndex === -1) {
      mergedBalances.push(protocolBalance);
    }
  });
  
  return mergedBalances.sort((a: BalanceItem, b: BalanceItem) => {
    // Convert bigint balance strings to BigInt for proper comparison
    const aUserBalance  = BigInt(a.balance || '0');
    const bUserBalance = BigInt(b.balance || '0');
    
    const aProtocolBalance = BigInt(
      protocolBalances.find(p => p.contract_address === a.contract_address)?.balance || '0'
    );
    
    const bProtocolBalance = BigInt(
      protocolBalances.find(p => p.contract_address === b.contract_address)?.balance || '0'
    );
    
    // Calculate total balances
    const aTotalBalance = aUserBalance + aProtocolBalance;
    const bTotalBalance = bUserBalance + bProtocolBalance;
    
    // Compare and return sort order
    if (aTotalBalance < bTotalBalance) return 1;
    if (aTotalBalance > bTotalBalance) return -1;
    return 0;
  });
}

// Utility function to format balance display
export function formatBalance(balance: string | bigint): string {
  const balanceBigInt = typeof balance === 'string' ? BigInt(balance) : balance;
  // Convert to string and handle decimals (assuming 18 decimals)
  const stringBalance = balanceBigInt.toString();
  const decimalPosition = Math.max(0, stringBalance.length - 18);
  
  if (decimalPosition === 0) {
    return `0.${stringBalance.padStart(18, '0')}`;
  }
  
  const wholePart = stringBalance.slice(0, decimalPosition);
  const decimalPart = stringBalance.slice(decimalPosition);
  
  return `${wholePart}.${decimalPart.padEnd(18, '0')}`;
}



// File: ./hooks/useMembraneOperations.tsx
// File: ./hooks/useMembraneOperations.ts

import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';

export function useMembraneOperations(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { getEthersProvider } = usePrivy();

  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    try {
      const result = await executeTransaction(
        chainId,
        async () => {
          const cleanChainId = chainId.replace('eip155:', '');
          const contractAddress = deployments.Membrane[cleanChainId];
          
          if (!contractAddress) {
            throw new Error(`No contract found for chain ${chainId}`);
          }

          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.Membrane,
            // @ts-ignore
            signer
          );

          // Parse balances to proper format
          const parsedBalances = balances.map(b => ethers.parseUnits(b, 18));
          
          // Create membrane
          const tx = await contract.createMembrane(
            tokens, 
            parsedBalances, 
            metadataCid,
            { gasLimit: 500000 }
          );

          const receipt = await tx.wait();

          // Find MembraneCreated event
          const membraneCreatedLog = receipt.logs.find((log: any) => {
            try {
              return log.topics[0] === ethers.id("MembraneCreated(uint256,string)");
            } catch {
              return false;
            }
          });
          
          if (!membraneCreatedLog) {
            throw new Error('Failed to find MembraneCreated event in logs');
          }

          const membraneId = ethers.toBigInt(membraneCreatedLog.topics[1]).toString();

          return tx;
        },
        {
          successMessage: 'Membrane created successfully',
          errorMessage: 'Failed to create membrane'
        }
      );
      
      return result;

    } catch (error) {
      console.error('Create membrane error:', error);
      throw error;
    }
  }, [chainId, executeTransaction, getEthersProvider]);

  const checkMembrane = useCallback(async (
    address: string,
    membraneId: string
  ) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.Membrane[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No Membrane contract found for chain ${chainId}`);
      }

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.Membrane,
        // @ts-ignore
        provider
      );

      return await contract.gCheck(address, membraneId);
    } catch (error) {
      console.error('Error checking membrane:', error);
      throw error;
    }
  }, [chainId, getEthersProvider]);

  const getMembraneById = useCallback(async (membraneId: string) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.Membrane[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No Membrane contract found for chain ${chainId}`);
      }

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.Membrane,
        // @ts-ignore
        provider
      );

      return await contract.getMembraneById(membraneId);
    } catch (error) {
      console.error('Error fetching membrane:', error);
      throw error;
    }
  }, [chainId, getEthersProvider]);

  return {
    createMembrane,
    checkMembrane,
    getMembraneById
  };
}

export default useMembraneOperations;



// File: ./hooks/useMembraneData.ts
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface MembraneMetadata {
  name: string;
  description?: string;
  characteristics?: Array<{title: string; link?: string}>;
}

interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export function useMembraneData(chainId: string) {
  const [membraneId, setMembraneId] = useState('');
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [membraneRequirements, setMembraneRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingMembrane, setIsLoadingMembrane] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const fetchMembraneMetadata = useCallback(async (cid: string) => {
    try {
      const response = await fetch(`${IPFS_GATEWAY}${cid}`);
      if (!response.ok) throw new Error('Failed to fetch membrane metadata');
      const metadata = await response.json();
      setMembraneMetadata(metadata);
    } catch (err) {
      console.error('Error fetching membrane metadata:', err);
      setMembraneMetadata(null);
    }
  }, []);

  useEffect(() => {
    if (!membraneId) return;

    const validateMembrane = async () => {
      setIsValidating(true);
      setIsLoadingMembrane(true);

      try {
        const cleanChainId = chainId.replace('eip155:', '');
        const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
        const membraneContract = new ethers.Contract(
          deployments.Membrane[cleanChainId],
          ABIs.Membrane,
          provider
        );

        const membrane = await membraneContract.getMembraneById(membraneId);
        
        if (!membrane) throw new Error('Invalid membrane ID');

        if (membrane.meta) {
          await fetchMembraneMetadata(membrane.meta);
        }

        const requirements = await Promise.all(
          membrane.tokens.map(async (tokenAddress: string, index: number) => {
            const tokenContract = new ethers.Contract(
              tokenAddress,
              ['function symbol() view returns (string)'],
              provider
            );

            const symbol = await tokenContract.symbol();
            
            return {
              tokenAddress,
              symbol,
              requiredBalance: membrane.balances[index].toString(),
              formattedBalance: ethers.formatUnits(membrane.balances[index], 18)
            };
          })
        );

        setMembraneRequirements(requirements);
      } catch (err) {
        console.error('Membrane validation error:', err);
        setMembraneRequirements([]);
        setMembraneMetadata(null);
      } finally {
        setIsValidating(false);
        setIsLoadingMembrane(false);
      }
    };

    validateMembrane();
  }, [membraneId, chainId, fetchMembraneMetadata]);

  return {
    membraneId,
    setMembraneId,
    membraneMetadata,
    membraneRequirements,
    isLoadingMembrane,
    isValidating
  };
}



// File: ./hooks/useNodeHierarchy.tsx
// File: ./hooks/useNodeHierarchy.ts
import { useMemo } from 'react';
import { NodeState } from '../types/chainData';

interface NodeHierarchyResult {
  rootNodes: NodeState[];
  descendantNodes: Map<string, NodeState[]>;
  totalValue: bigint;
  nodeValues: Record<string, number>;
}

export function useNodeHierarchy(nodes: NodeState[]): NodeHierarchyResult {
  return useMemo(() => {
    // Safely handle empty or undefined nodes array
    if (!nodes || nodes.length === 0) {
      return {
        rootNodes: [],
        descendantNodes: new Map(),
        totalValue: BigInt(0),
        nodeValues: {},
      };
    }

    // Create a map for quick node lookup
    const nodeMap = new Map<string, NodeState>();
    nodes.forEach(node => {
      if (node?.basicInfo?.[0]) {
        nodeMap.set(node.basicInfo[0], node);
      }
    });

    // Find root nodes (nodes with rootPath.length === 1)
    const rootNodes = nodes.filter(node => 
      node?.rootPath?.length === 1 && node?.basicInfo?.[0]
    );

    // Create descendant map
    const descendantNodes = new Map<string, NodeState[]>();
    nodes.forEach(node => {
      if (!node?.rootPath || !node?.basicInfo?.[0]) return;
      
      const parentId = node.rootPath[node.rootPath.length - 2];
      if (parentId) {
        const currentChildren = descendantNodes.get(parentId) || [];
        descendantNodes.set(parentId, [...currentChildren, node]);
      }
    });

    // Calculate total value safely
    const totalValue = nodes.reduce((sum, node) => {
      if (!node?.basicInfo?.[4]) return sum;
      try {
        return sum + BigInt(node.basicInfo[4]);
      } catch {
        return sum;
      }
    }, BigInt(0));

    // Calculate node values as percentages with safety checks
    const nodeValues: Record<string, number> = {};
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
      
      try {
        const nodeValue = BigInt(node.basicInfo[4]);
        nodeValues[node.basicInfo[0]] = totalValue > 0 
          ? Number((nodeValue * BigInt(10000)) / totalValue) / 100
          : 0;
      } catch {
        nodeValues[node.basicInfo[0]] = 0;
      }
    });

    return {
      rootNodes,
      descendantNodes,
      totalValue,
      nodeValues,
    };
  }, [nodes]);
}



// File: ./hooks/useActivityFeed.tsx
// File: ./hooks/useActivityFeed.ts

import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../contexts/TransactionContext';

export interface ActivityItem {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'spawn' | 'membership';
  timestamp: number;
  description: string;
  account: string;
  nodeId?: string;
  amount?: string;
  tokenSymbol?: string;
  status: 'success' | 'pending' | 'failed';
  transactionHash?: string;
}

interface UseActivityFeedResult {
  activities: ActivityItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useActivityFeed(chainId: string): UseActivityFeedResult {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = usePrivy();
  const { currentHash, isTransacting } = useTransaction();

  // Add new activity
  const addActivity = useCallback((activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev]);
  }, []);

  // Update activity status
  const updateActivityStatus = useCallback((hash: string, status: 'success' | 'failed') => {
    setActivities(prev => 
      prev.map(activity => 
        activity.transactionHash === hash 
          ? { ...activity, status }
          : activity
      )
    );
  }, []);

  // Watch for new transactions
  useEffect(() => {
    if (currentHash && isTransacting) {
      addActivity({
        id: currentHash,
        type: 'transfer',
        timestamp: Date.now(),
        description: 'Transaction pending...',
        account: user?.wallet?.address || '',
        status: 'pending',
        transactionHash: currentHash
      });
    }
  }, [currentHash, isTransacting, addActivity, user?.wallet?.address]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!user?.wallet?.address || !chainId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate fetching activities - replace with actual API call
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'mint',
          timestamp: Date.now() - 1000 * 60 * 5,
          description: 'Minted 100 tokens',
          account: user.wallet.address,
          amount: '100',
          tokenSymbol: 'TKN',
          status: 'success'
        },
        {
          id: '2',
          type: 'signal',
          timestamp: Date.now() - 1000 * 60 * 30,
          description: 'Redistributive preference signaled by Johanna',
          account: user.wallet.address,
          nodeId: '123',
          status: 'success'
        }
      ];

      setActivities(mockActivities);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.wallet?.address, chainId]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    refresh: fetchActivities
  };
}

export default useActivityFeed;



// File: ./hooks/useContractOperations.ts
// File: hooks/useContractOperations.ts

import { useState } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";

interface ContractCallOptions {
  successMessage?: string;
  onSuccess?: () => void;
  deploymentData?: {
    bytecode: string;
    abi: any[];
  };
}

export const useContractOperations = (chainId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getEthersProvider } = usePrivy();

  const executeContractCall = async (
    contractType: string,
    method: string,
    args: any[],
    options: ContractCallOptions = {}
  ) => {
    setIsLoading(true);
    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();

      if (contractType === 'factory' && method === 'deploy') {
        const factory = new ethers.ContractFactory(
          options.deploymentData!.abi,
          options.deploymentData!.bytecode,
          //@ts-ignore
          signer
        );

        const contract = await factory.deploy(...args);
        await contract.waitForDeployment();

        if (options.onSuccess) {
          options.onSuccess();
        }

        return {
          success: true,
          data: {
            address: await contract.getAddress(),
            contract
          }
        };
      }

      throw new Error('Unsupported contract operation');

    } catch (error: any) {
      console.error('Contract operation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeContractCall,
    isLoading
  };
};

export default useContractOperations;



// File: ./hooks/useChainId.ts
import { useCallback, useMemo } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from 'next/router';

const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '84532'; // Base Sepolia

export const useChainId = () => {
  const { user } = usePrivy();
  const router = useRouter();

  const getChainId = useCallback(() => {
    let chainId: string | undefined;

    // Try URL query first
    if (router.query.chainId) {
      chainId = router.query.chainId.toString();
    }
    // Then try path parameter
    else if (router.pathname.includes('/nodes/[chainId]')) {
      const pathParts = router.asPath.split('/');
      const pathChainId = pathParts[2];
      if (pathChainId && pathChainId !== '[chainId]') {
        chainId = pathChainId;
      }
    }
    // Then try Privy user
    else if (user?.wallet?.chainId) {
      chainId = user.wallet.chainId;
    }

    // Clean and return
    return chainId ? cleanChainId(chainId) : DEFAULT_CHAIN_ID;
  }, [router.query, router.pathname, router.asPath, user?.wallet?.chainId]);

  const cleanChainId = useCallback((dirtyChainId: string): string => {
    return dirtyChainId.replace('eip155:', '');
  }, []);

  const chainId = useMemo(() => getChainId(), [getChainId]);

  return {
    chainId,
    cleanChainId,
    isValidChainId: (chainId: string) => {
      const validChainIds = [
        '84532',     // Base Sepolia
        '11155420',  // Optimism Sepolia
        '167009',    // Taiko Hekla
        '167000',    // Taiko
      ];
      const cleaned = cleanChainId(chainId);
      return validChainIds.includes(cleaned);
    }
  };
};

export default useChainId;



// File: ./hooks/useNodeTransactions.tsx
import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { useTransaction } from '../contexts/TransactionContext';

export function useNodeTransactions(chainId: string) {
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();

  const getContract = useCallback(async () => {
    const provider = await getEthersProvider();
    const cleanChainId = chainId.replace('eip155:', '');
    return new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      // @ts-ignore
      provider.getSigner()
    );
  }, [chainId, getEthersProvider]);

  const signal = useCallback(async (nodeId: string, signals: string[], onSuccess?: () => void) => {
    const contract = await getContract();
    

    return executeTransaction(
      chainId,
      async () => {
        const gasEstimate = await contract.sendSignal.estimateGas(nodeId, signals);
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
        const feeData = await provider.getFeeData();
        
        return contract.sendSignal(nodeId, signals, {
          gasLimit: Math.ceil(Number(gasEstimate) * 1.4),
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });
      },
      {
        successMessage: 'Signals submitted successfully',
        errorMessage: 'Failed to submit signals',
        onSuccess
      }
    );
  }, [chainId, executeTransaction, getContract]);

  return {
    signal
  };
}



// File: ./hooks/useTransactionHandler.ts
// File: ./hooks/useTransactionHandler.ts

import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { getExplorerLink } from '../config/contracts';

interface TransactionResult {
  txHash: string;
  contractAddress: string;
}

export const useTransactionHandler = (chainId: string) => {
  const toast = useToast();

  const executeTransaction = useCallback(async (
    deploymentPromise: Promise<any>   
  ): Promise<TransactionResult> => {
    const pendingToastId = toast({
      title: 'Confirm Transaction',
      description: 'Please confirm the transaction in your wallet',
      status: 'info',
      duration: null,
      isClosable: false,
    });

    try {
      // Deploy contract
      const contract = await deploymentPromise;
      const tx = contract.deploymentTransaction();
      if (!tx) throw new Error('No deployment transaction found');
      
      // Close the confirmation toast
      toast.close(pendingToastId);
      
      // Show transaction hash toast with explorer link
      toast({
        title: 'Transaction Submitted',
        description: `Transaction Hash: ${tx.hash}\n View on explorer: ${getExplorerLink(tx.hash, chainId, 'tx')}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Get the contract address directly from the deployment
      const deployedAddress = await contract.getAddress();

      return {
        txHash: tx.hash,
        contractAddress: deployedAddress
      };

    } catch (error: any) {
      // Close any pending toasts
      toast.close(pendingToastId);

      // Handle user rejection 
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        throw new Error('Transaction was rejected by user');
      }

      // Handle replacement transaction errors
      if (error.code === 'TRANSACTION_REPLACED') {
        if (error.reason === 'repriced') {
          throw new Error('Transaction was replaced (speeded up)');
        }
        throw new Error('Transaction was replaced');
      }

      throw error;
    }
  }, [toast]);

  return { executeTransaction };
};



// File: ./hooks/useColorManagement.ts
import { useState, useCallback } from 'react';

interface ColorState {
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
}

export const useColorManagement = () => {
  // Color utility functions
  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }, []);

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return '#' + [r, g, b]
      .map(x => Math.round(x).toString(16).padStart(2, '0'))
      .join('');
  }, []);

  const getContrastColor = useCallback((hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }, [hexToRgb]);

  const getReverseColor = useCallback((hex: string, alpha: number = 1): string => {
    const [r, g, b] = hexToRgb(hex);
    const reverse = [255 - r, 255 - g, 255 - b];
    if (alpha === 1) {
      return rgbToHex(reverse[0], reverse[1], reverse[2]);
    }
    return `rgba(${reverse[0]}, ${reverse[1]}, ${reverse[2]}, ${alpha})`;
  }, [hexToRgb, rgbToHex]);

  const getRandomColor = useCallback((): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  const [colorState, setColorState] = useState<ColorState>({
    contrastingColor: '#7C3AED', // Default purple
    reverseColor: '#FFFFFF',
    hoverColor: 'rgba(124, 58, 237, 0.1)'
  });

  const cycleColors = useCallback(() => {
    const newColor = getRandomColor();
    setColorState({
      contrastingColor: newColor,
      reverseColor: getContrastColor(newColor),
      hoverColor: `${newColor}20`
    });
  }, [getRandomColor, getContrastColor]);

  return { colorState, cycleColors };
};

export default useColorManagement;



// File: ./hooks/useNodeOperations.ts
import { useCallback } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../contexts/TransactionContext';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';

export function useNodeOperations(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { getEthersProvider } = usePrivy();

  // Helper function to get contract instance
  const getContract = useCallback(async () => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const address = deployments.WillWe[cleanChainId];
      
      if (!address) {
        throw new Error(`No contract deployment found for chain ${chainId}`);
      }
      // @ts-ignore
      return new ethers.Contract(address, ABIs.WillWe, signer);
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw error;
    }
  }, [chainId, getEthersProvider]);

  const spawnNode = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.spawnBranch(nodeId, { gasLimit: 400000 });
      },
      {
        successMessage: 'Node spawned successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const mintMembership = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.mintMembership(nodeId, { gasLimit: 200000 });
      },
      {
        successMessage: 'Membership minted successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const redistribute = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.redistributePath(nodeId, { gasLimit: 500000 });
      },
      {
        successMessage: 'Value redistributed successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const signal = useCallback(async (nodeId: string, signals: number[]) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        const gasEstimate = await contract.sendSignal.estimateGas(nodeId, signals);
        return contract.sendSignal(nodeId, signals, { gasLimit: gasEstimate });
      },
      {
        successMessage: 'Signal sent successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const spawnBranchWithMembrane = useCallback(async (nodeId: string, membraneId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
      },
      {
        successMessage: 'Branch with membrane spawned successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  return {
    spawnNode,
    mintMembership,
    redistribute,
    signal,
    spawnBranchWithMembrane
  };
}

export default useNodeOperations;



// File: ./hooks/useNodeData.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  NodeState, 
  TransformedNodeData, 
  isValidNodeState, 
  transformNodeData 
} from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

interface UseNodeDataResult {
  data: NodeState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Convert address to uint256 ID format
const addressToUint256 = (address: string): string => {
  try {
    // Ensure address is properly formatted
    const formattedAddress = address.toLowerCase().startsWith('0x') 
      ? address.toLowerCase()
      : `0x${address.toLowerCase()}`;

    // Remove '0x' prefix and convert to decimal string
    const withoutPrefix = formattedAddress.slice(2);
    return BigInt(`0x${withoutPrefix}`).toString();
  } catch (error) {
    console.error('Error converting address to uint256:', error);
    throw error;
  }
};

export function useNodeData(
  chainId: string | undefined, 
  nodeIdOrAddress: string | undefined,
  isRootNode: boolean = false // Add flag to indicate if this is a root node
): UseNodeDataResult {
  const [data, setData] = useState<NodeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !nodeIdOrAddress) {
      setError(new Error('Invalid chainId or node identifier'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(contractAddress, ABIs.WillWe, provider);

      // Convert input to appropriate format based on whether it's a root node
      let formattedId: string;
      if (isRootNode) {
        // For root nodes, we need to convert the token address to uint256
        formattedId = addressToUint256(nodeIdOrAddress);
      } else {
        // For regular nodes, use the nodeId directly
        formattedId = BigInt(nodeIdOrAddress).toString();
      }

      console.log('Fetching node data:', {
        chainId: cleanChainId,
        nodeIdOrAddress,
        formattedId,
        isRootNode,
        contractAddress
      });

      // Get node data using the formatted ID
      const nodeData = await contract.getNodeData(formattedId);

      // Validate the received data
      if (!nodeData?.basicInfo) {
        throw new Error('Invalid node data received');
      }

      // Transform data to ensure all BigInt values are converted to strings
      const transformedData: NodeState = {
        basicInfo: nodeData.basicInfo.map((item: any) => item.toString()),
        membraneMeta: nodeData.membraneMeta || '',
        membersOfNode: nodeData.membersOfNode || [],
        childrenNodes: (nodeData.childrenNodes || []).map((node: any) => node.toString()),
        rootPath: (nodeData.rootPath || []).map((path: any) => path.toString()),
        signals: (nodeData.signals || []).map((signal: any) => ({
          MembraneInflation: (signal.MembraneInflation || []).map((mi: any[]) => 
            mi.map(item => item.toString())
          ),
          lastRedistSignal: (signal.lastRedistSignal || []).map((item: any) => 
            item.toString()
          )
        }))
      };

      setData(transformedData);
      setError(null);

      console.log('Node data fetched successfully:', transformedData);

    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeIdOrAddress, isRootNode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setData(null);
    setError(null);
    setIsLoading(true);
  }, [chainId, nodeIdOrAddress, isRootNode]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

// Helper functions for working with node data
export const isNodeMember = (nodeData: NodeState | null, address: string): boolean => {
  if (!nodeData?.membersOfNode || !address) return false;
  return nodeData.membersOfNode
    .map(addr => addr.toLowerCase())
    .includes(address.toLowerCase());
};

export const getNodeValue = (nodeData: NodeState | null): string => {
  if (!nodeData?.basicInfo?.[4]) return '0';
  return nodeData.basicInfo[4];
};

export const getNodeInflation = (nodeData: NodeState | null): string => {
  if (!nodeData?.basicInfo?.[1]) return '0';
  return nodeData.basicInfo[1];
};

export const getNodeMembraneId = (nodeData: NodeState | null): string => {
  if (!nodeData?.basicInfo?.[5]) return '0';
  return nodeData.basicInfo[5];
};

export default useNodeData;



// File: ./hooks/useRootNodes.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

export function useRootNodes(chainId: string, tokenAddress: string, userAddress: string) {
  const [data, setData] = useState<NodeState[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !tokenAddress || !userAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching nodes for:', { chainId, tokenAddress, userAddress });
      
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      
      if (!willWeAddress) {
        throw new Error(`No contract for chain ${cleanChainId}`);
      }

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(willWeAddress, ABIs.WillWe, provider);

      const nodesData = await contract.getAllNodesForRoot(tokenAddress, userAddress);
      console.log('Received nodes data:', nodesData);

      setData(nodesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching root nodes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, tokenAddress, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}



// File: ./hooks/useWillBalances.ts
import { useState, useEffect } from 'react';
import { CovalentClient, ChainID, BalanceItem } from '@covalenthq/client-sdk';
import { getCovalentApiKey } from '../config/apiKeys';
import { deployments } from '../config/deployments';

export function useWillBalances(chainId: string) {
  const [willBalanceItems, setWillBalanceItems] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new CovalentClient(getCovalentApiKey());
      const response = await client.BalanceService.getTokenBalancesForWalletAddress(parseInt(chainId.replace('eip155:', '')) as ChainID, deployments.WillWe[chainId] as string);
      console.log(response);
      if (response.data && response.data.items) {
        setWillBalanceItems(response.data.items);
      } else {
        throw new Error('No balance data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching balances'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWillBalances();
  }, [chainId]);

  return { 
    willBalanceItems, 
    isLoading, 
    error,
    refetch: fetchWillBalances 
  };
}



// File: ./hooks/useAuth.ts
import { usePrivy } from "@privy-io/react-auth";

export const useAuth = () => {
  const { ready, authenticated, user, logout } = usePrivy();
  return { ready, authenticated, user, logout };
};



// File: ./hooks/useCovalentBalances.ts
import { useState, useEffect } from 'react';
import { BalanceItem, ChainID, CovalentClient } from "@covalenthq/client-sdk";
import { getCovalentApiKey } from '../config/apiKeys';

const fetchBalances = async (address: string, chainId: string): Promise<{balances: BalanceItem[], protocolBalances: BalanceItem[]}> => {
  if (!address || !chainId) return { balances: [], protocolBalances: [] };

  const apiKey = getCovalentApiKey();
  const covalentClient = new CovalentClient(apiKey);
  const cleanChainId = chainId.replace('eip155:', '') as unknown as ChainID;

  // Get regular balances
  const balanceResponse = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(cleanChainId, address);
  const balances = balanceResponse.data?.items || [];

  // Get protocol balances
  const protocolResponse = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(cleanChainId, address, {
    nft: false,
    noSpam: true,
    quoteCurrency: 'USD'
  });
  const protocolBalances = protocolResponse.data?.items || [];

  return { balances, protocolBalances };
};

export const useCovalentBalances = (address: string, chainId: string) => {
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [protocolBalances, setProtocolBalances] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBalances = async () => {
    setIsLoading(true);
    try {
      const { balances, protocolBalances } = await fetchBalances(address, chainId);
      setBalances(balances);
      setProtocolBalances(protocolBalances);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [address, chainId]);

  return { balances, protocolBalances, isLoading, error, refetch: loadBalances };
};



// File: ./hooks/useChildNodes.ts
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface ChildNodeInfo {
  id: string;
  membraneTitle: string | null;
}

export function useChildNodes(node: NodeState, chainId: string) {
  const [childNodesInfo, setChildNodesInfo] = useState<{[key: string]: ChildNodeInfo}>({});

  useEffect(() => {
    const fetchChildNodeMembranes = async () => {
      if (!node?.childrenNodes?.length) return;

      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        provider
      );
      const membraneContract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        provider
      );

      const childInfo: {[key: string]: ChildNodeInfo} = {};

      await Promise.all(node.childrenNodes.map(async (childId) => {
        try {
          const nodeData = await contract.getNodeData(childId);
          if (nodeData?.basicInfo?.[5]) {
            const membrane = await membraneContract.getMembraneById(nodeData.basicInfo[5]);
            if (membrane?.meta) {
              try {
                const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
                const metadata = await response.json();
                childInfo[childId] = {
                  id: childId,
                  membraneTitle: metadata.name || null
                };
              } catch (err) {
                console.error('Failed to fetch membrane metadata:', err);
                childInfo[childId] = { id: childId, membraneTitle: null };
              }
            }
          } else {
            childInfo[childId] = { id: childId, membraneTitle: null };
          }
        } catch (err) {
          console.error('Failed to fetch node data:', err);
          childInfo[childId] = { id: childId, membraneTitle: null };
        }
      }));

      setChildNodesInfo(childInfo);
    };

    fetchChildNodeMembranes();
  }, [node?.childrenNodes, chainId]);

  return { childNodesInfo };
}



// File: ./hooks/useContract.ts
import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs } from '../config/contracts';

export function useContract(
  contractName: keyof typeof deployments,
  chainId?: string
) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { getEthersProvider } = usePrivy();

  const cleanChainId = useMemo(() => {
    if (!chainId) return null;
    return chainId.replace('eip155:', '');
  }, [chainId]);

  useEffect(() => {
    const initContract = async () => {
      if (!cleanChainId) return;

      try {
        const provider = await getEthersProvider();
        if (!provider) throw new Error('Provider not available');

        const address = deployments[contractName][cleanChainId];
        if (!address) throw new Error(`No contract found for chain ${chainId}`);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          address,
          ABIs[contractName],
          signer as unknown as ethers.ContractRunner
        );

        setContract(contract);
        setError(null);

      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize contract'));
        setContract(null);
      }
    };

    initContract();
  }, [contractName, cleanChainId, getEthersProvider]);

  return { contract, error };
}

export default useContract;



// File: ./hooks/useNodeSignals.tsx
import { useMemo } from 'react';
import { NodeState, UserSignal } from '../types/chainData';

interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

interface NodeSignalsResult {
  recentSignals: SignalData[];
  totalSignalValue: bigint;
  signalsByType: Map<string, SignalData[]>;
  hasActiveSignals: boolean;
  getLastSignalTime: () => number;
}

export function useNodeSignals(node: NodeState): NodeSignalsResult {
  return useMemo(() => {
    const processSignal = (signal: UserSignal): SignalData[] => {
      // @ts-ignore
      return signal.MembraneInflation.map(([membrane, inflation], index) => ({
        membrane,
        inflation,
        timestamp: Number(signal.lastRedistSignal[index]) || Date.now(),
        value: inflation
      }));
    };

    // Process all signals
    const allSignals = node.signals.flatMap(processSignal)
      .sort((a, b) => b.timestamp - a.timestamp);

    // Calculate total signal value
    const totalSignalValue = allSignals.reduce(
      (sum, signal) => sum + BigInt(signal.value || "0"),
      BigInt(0)
    );

    // Group signals by type
    const signalsByType = new Map<string, SignalData[]>();
    allSignals.forEach(signal => {
      const current = signalsByType.get(signal.membrane) || [];
      signalsByType.set(signal.membrane, [...current, signal]);
    });

    // Get most recent signal timestamp
    const getLastSignalTime = () => {
      return allSignals.length > 0 ? allSignals[0].timestamp : 0;
    };

    return {
      recentSignals: allSignals.slice(0, 10), // Last 10 signals
      totalSignalValue,
      signalsByType,
      hasActiveSignals: allSignals.length > 0,
      getLastSignalTime,
    };
  }, [node.signals]);
}



// File: ./hooks/useWillWeContract.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { getRPCUrl } from '../config/contracts';

interface WillWeContract extends ethers.BaseContract {
  totalSupply: (nodeId: string) => Promise<bigint>;
  getChildParentEligibilityPerSec: (
    childId: string,
    parentId: string
  ) => Promise<bigint>;
  calculateUserTargetedPreferenceAmount: (
    childId: string,
    parentId: string,
    signal: number,
    user: string
  ) => Promise<bigint>;
}

export const useWillWeContract = (chainId: string) => {
  const [contract, setContract] = useState<WillWeContract | null>(null);
  useEffect(() => {
    const initContract = async () => {
      try {
        const rpcUrl = getRPCUrl(chainId);
        if (!rpcUrl) throw new Error(`No RPC URL found for chain ${chainId}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const willWeAddress = deployments.WillWe[chainId];

        if (!willWeAddress) {
          throw new Error(`No WillWe contract found for chain ${chainId}`);
        }

        const willWeContract = new ethers.Contract(
          willWeAddress,
          ABIs.WillWe,
          provider
        ) as unknown as WillWeContract;

        if (typeof willWeContract.totalSupply !== 'function') {
          console.error('totalSupply function not found in contract ABI:', ABIs.WillWe);
          throw new Error('Contract missing required function: totalSupply');
        }

        setContract(willWeContract);
      } catch (error) {
        console.error('Error initializing WillWe contract:', error);
        setContract(null);
      }
    };

    initContract();
  }, [chainId]);

  return contract;
}

export default useWillWeContract;



// File: ./contexts/NodeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface NodeContextType {
  selectedToken: string;
  selectedNodeId: string | null;
  selectToken: (tokenAddress: string) => void;
  selectNode: (nodeId: string, chainId: string) => void;
  clearNodeSelection: () => void;
}

const NodeContext = createContext<NodeContextType>({
  selectedToken: '',
  selectedNodeId: null,
  selectToken: () => {},
  selectNode: () => {},
  clearNodeSelection: () => {}
});

export const useNode = () => useContext(NodeContext);

interface NodeProviderProps {
  children: React.ReactNode;
}

export const NodeProvider: React.FC<NodeProviderProps> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectToken = useCallback((tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setSelectedNodeId(null); // Clear selected node when selecting a token
  }, []);

  const selectNode = useCallback((nodeId: string, chainId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const clearNodeSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <NodeContext.Provider
      value={{
        selectedToken,
        selectedNodeId,
        selectToken,
        selectNode,
        clearNodeSelection
      }}
    >
      {children}
    </NodeContext.Provider>
  );
};



// File: ./contexts/TokenContext.tsx
// File: ./contexts/TokenContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';

interface TokenContextType {
  selectedToken: string | null;
  selectToken: (address: string) => void;
  tokenData: any | null;
  isLoading: boolean;
  error: Error | null;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

interface TokenProviderProps {
  children: React.ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const { getEthersProvider } = usePrivy();

  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['token', selectedToken],
    queryFn: async () => {
      if (!selectedToken) return null;

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(selectedToken, ABIs.IERC20, provider as unknown as ethers.ContractRunner);

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    },
    enabled: !!selectedToken,
    staleTime: 30000
  });

  const selectToken = useCallback((address: string) => {
    setSelectedToken(address);
  }, []);

  const value = {
    selectedToken,
    selectToken,
    tokenData,
    isLoading,
    error: error as Error | null
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};



// File: ./contexts/TransactionContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContractTransaction, ethers } from 'ethers';
import { TransactionReceipt, usePrivy } from '@privy-io/react-auth';
import { useToast } from '@chakra-ui/react';

interface TransactionContextType {
  isTransacting: boolean;
  currentHash: string | null;
  error: Error | null;
  executeTransaction: (
    chainId: string,
    transactionFn: () => Promise<ethers.ContractTransaction>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: () => void;
    }
  ) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { login, authenticated, getEthersProvider, ready, user } = usePrivy();
  const toast = useToast();

  const executeTransaction = useCallback(
    async (
      chainId: string,
      transactionFn: () => Promise<ethers.ContractTransaction>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: () => void;
      }
    ) => {
      if (!authenticated) {
        await login();
        return;
      }

      if (!ready || !user?.wallet) {
        throw new Error('Wallet not ready');
      }

      setIsTransacting(true);
      setCurrentHash(null);
      setError(null);
      try {
        const provider = await getEthersProvider();
        if (!provider) {
          throw new Error('Provider not available');
        }

        // Get network after provider is ready
        const network = await provider.getNetwork();
        const targetChainId = parseInt(chainId.replace('eip155:', ''));
        
        // Execute the transaction
        const tx = await transactionFn();
        // Wait for 1 confirmation
        // @ts-ignore
        const receipt = await provider.waitForTransaction(tx.hash, 1);

        if (receipt && receipt.status === 1) {
          if (options?.successMessage) {
            toast({
              title: 'Success',
              description: options.successMessage,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }

          if (options?.onSuccess) {
            await options.onSuccess();
          }
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.error('Transaction error:', error);
        let errorMessage = 'Transaction failed';
        
        if (error instanceof Error) {
          if (error.message.includes('rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else {
            errorMessage = error.message;
          }
        }
        
        if (options?.errorMessage) {
          toast({
            title: 'Error',
            description: options.errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setIsTransacting(false);
        setCurrentHash(null);
        setError(null);
      }
    },
    [authenticated, login, getEthersProvider, ready, user, toast]
  );

  const value = {
    isTransacting,
    currentHash,
    error,
    executeTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};



// File: ./utils/tokenValidation.ts
import { createPublicClient, http, parseAbi } from 'viem';
import { getChainById } from '../config/contracts';

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export async function validateToken(
  address: string,
  chainId: string
): Promise<TokenInfo | null> {
  try {
    const chain = getChainById(chainId);
    const publicClient = createPublicClient({
      chain,
      transport: http()
    });

    const tokenAbi = parseAbi([
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function name() view returns (string)'
    ]);

    const [symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: tokenAbi,
        functionName: 'symbol'
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: tokenAbi,
        functionName: 'decimals'
      })
    ]);

    return {
      address,
      symbol: symbol as string,
      decimals: decimals as number
    };

  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}

export function isValidTokenAmount(amount: string): boolean {
  try {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return false;
    }
    // Check for proper decimal format
    const parts = amount.split('.');
    if (parts.length > 2) return false;
    if (parts[1] && parts[1].length > 18) return false;
    return true;
  } catch {
    return false;
  }
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    const num = Number(amount);
    if (isNaN(num)) return '0';
    return num.toFixed(Math.min(decimals, 18));
  } catch {
    return '0';
  }
}

// Cache validated tokens to avoid repeated RPC calls
const tokenCache: Record<string, TokenInfo> = {};

export async function validateTokenWithCache(
  address: string,
  chainId: string
): Promise<TokenInfo | null> {
  const cacheKey = `${chainId}-${address.toLowerCase()}`;
  
  if (tokenCache[cacheKey]) {
    return tokenCache[cacheKey];
  }

  const tokenInfo = await validateToken(address, chainId);
  if (tokenInfo) {
    tokenCache[cacheKey] = tokenInfo;
  }

  return tokenInfo;
}

export function clearTokenCache() {
  Object.keys(tokenCache).forEach(key => delete tokenCache[key]);
}

// Helper for handling common token errors
export function getTokenValidationError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('contract not deployed')) {
      return 'Token contract not found at this address';
    }
    if (error.message.includes('execution reverted')) {
      return 'Invalid token contract';
    }
    return error.message;
  }
  return 'Failed to validate token';
}



// File: ./utils/formatting.ts
export const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };



// File: ./utils/ipfs.ts
interface IPFSMetadata {
    title: string;
    description?: string;
    // Add other metadata fields as needed
  }
  
  export const fetchIPFSMetadata = async (cid: string): Promise<IPFSMetadata> => {
    try {
      // Using IPFS gateway to fetch metadata
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch IPFS metadata');
      }
      const data = await response.json();
      return {
        title: data.title || 'Untitled',
        description: data.description
      };
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      return {
        title: 'Untitled',
        description: 'No description available'
      };
    }
  };



// File: ./utils/formatters.ts
import { ethers } from 'ethers';

/**
 * Helper function to check if a string is a valid hex string
 */
const isHexString = (value: string): boolean => {
  return /^0x[0-9a-fA-F]*$/.test(value);
};

/**
 * Converts a node ID to its proper address format
 * Handles different input formats: hex string, number, or bigint
 */
export const nodeIdToAddress = (nodeId: string | number | bigint): string => {
  try {
    // If already a hex address of correct length, return as is
    if (typeof nodeId === 'string' && isHexString(nodeId) && nodeId.length === 42) {
      return nodeId.toLowerCase();
    }

    // Convert to BigInt first to handle large numbers
    let bigIntValue: bigint;
    if (typeof nodeId === 'string') {
      // Remove '0x' prefix if present for numeric conversion
      const cleanNodeId = nodeId.startsWith('0x') ? nodeId.slice(2) : nodeId;
      bigIntValue = BigInt(cleanNodeId);
    } else {
      bigIntValue = BigInt(nodeId);
    }

    // Convert to hex and pad to 20 bytes (40 hex chars)
    let hexString = bigIntValue.toString(16);
    hexString = hexString.padStart(40, '0');
    
    // Add 0x prefix
    return ethers.getAddress('0x' + hexString);
  } catch (error) {
    console.error('Error converting node ID to address:', error);
    throw new Error('Invalid node ID format');
  }
};

/**
 * Converts an address to a node ID number
 */
export const addressToNodeId = (address: string): string => {
  try {
    if (!isHexString(address)) {
      throw new Error('Invalid address format');
    }
    // Remove '0x' prefix and convert to decimal string
    const nodeId = BigInt(address).toString();
    return nodeId;
  } catch (error) {
    console.error('Error converting address to node ID:', error);
    throw new Error('Invalid address format');
  }
};

/**
 * Formats a balance value for display
 */
export const formatBalance = (value: string | bigint | undefined | null): string => {
  if (!value) return '0';
  try {
    const bigIntValue = typeof value === 'string' ? BigInt(value) : value;
    return ethers.formatUnits(bigIntValue, 18);
  } catch {
    return '0';
  }
};

/**
 * Formats a percentage value with 2 decimal places
 */
export const formatPercentage = (value: number): string => {
  return (Math.round(value * 100) / 100).toFixed(2) + '%';
};



// File: ./types/chainData.ts
// File: ./types/chainData.ts

// Reflects the smart contract's basic info array structure
export interface NodeBasicInfo {
  nodeId: string;        // basicInfo[0]
  inflation: string;     // basicInfo[1]
  balanceAnchor: string; // basicInfo[2]
  balanceBudget: string; // basicInfo[3]
  value: string;         // basicInfo[4]
  membraneId: string;    // basicInfo[5]
  balanceOfUser: string; // basicInfo[6]
  eligibilityPerSec: string; // basicInfo[7]
  lastRedistribution: string; // basicInfo[8]
}

// Matches the smart contract's UserSignal struct
export interface UserSignal {
  MembraneInflation: [string, string][]; // Array of [membraneId, inflationRate] pairs
  lastRedistSignal: string[];            // Array of timestamps
}

// Matches the smart contract's NodeState struct exactly
export interface NodeState {
  basicInfo: [
    nodeId: string,           // basicInfo[0]
    inflation: string,        // basicInfo[1]
    balanceAnchor: string,   // basicInfo[2] - balance in parent reserve
    balanceBudget: string,   // basicInfo[3] - budget
    value: string,           // basicInfo[4] - valuation denominated in root token
    membraneId: string,      // basicInfo[5] - membrane id
    balanceOfUser: string,   // basicInfo[6] - balance of current user in this node
    eligibilityPerSec: string, // basicInfo[7] - redistribution eligibility from parent per sec
    lastRedistribution: string // basicInfo[8] - last redistribution timestamp
  ];
  membraneMeta: string;     // IPFS hash or metadata string
  membersOfNode: string[];  // Array of ethereum addresses
  childrenNodes: string[];  // Array of node IDs
  rootPath: string[];       // Array of node IDs from root to this node
  signals: UserSignal[];    // Array of UserSignal structs
}


// For membrane-related data
export interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export interface MembraneCharacteristic {
  title: string;
  link?: string;
}

export interface MembraneMetadata {
  name: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
  }[];
}

// For the processed node data used in the UI
export interface TransformedNodeData {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
}

// For computed statistics
export interface NodeStats {
  totalValue: string;
  dailyGrowth: string;
  memberCount: number;
  childCount: number;
  pathDepth: number;
}

// For membrane state from contract
export interface MembraneState {
  tokens: string[];
  balances: string[];
  meta: string;
}

// For query responses
export interface NodeQueryResponse {
  data: NodeState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// For operation parameters
export interface NodeOperationParams {
  nodeId: string;
  chainId: string;
  options?: {
    gasLimit?: number;
    gasPrice?: string;
  };
}

// For signal data
export interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

// Movement types (if needed for governance)
export enum MovementType {
  Revert = 0,
  AgentMajority = 1,
  EnergeticMajority = 2
}

// Queue states (if needed for governance)
export enum SQState {
  None = 0,
  Initialized = 1,
  Valid = 2,
  Executed = 3,
  Stale = 4
}

// Type guard functions
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    Array.isArray(data?.basicInfo) &&
    data.basicInfo.length === 9 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals) &&
    data.signals.every((signal: any) =>
      Array.isArray(signal.MembraneInflation) &&
      Array.isArray(signal.lastRedistSignal)
    )
  );
};

export const isValidUserSignal = (data: any): data is UserSignal => {
  return (
    Array.isArray(data?.MembraneInflation) &&
    Array.isArray(data?.lastRedistSignal) &&
    data.MembraneInflation.every((item: any) =>
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === 'string' &&
      typeof item[1] === 'string'
    )
  );
};

export const transformNodeData = (nodeData: NodeState): TransformedNodeData => {
  return {
    basicInfo: {
      nodeId: nodeData.basicInfo[0],
      inflation: nodeData.basicInfo[1],
      balanceAnchor: nodeData.basicInfo[2],
      balanceBudget: nodeData.basicInfo[3],
      value: nodeData.basicInfo[4],
      membraneId: nodeData.basicInfo[5],
      balanceOfUser: nodeData.basicInfo[6],
      eligibilityPerSec: nodeData.basicInfo[7],
      lastRedistribution: nodeData.basicInfo[8]
    },
    membraneMeta: nodeData.membraneMeta,
    membersOfNode: nodeData.membersOfNode,
    childrenNodes: nodeData.childrenNodes,
    rootPath: nodeData.rootPath,
    signals: nodeData.signals
  };
};



// File: ./const/colors.tsx
export const cols = {
    lightC: '#dad6d6',
    lightGreen: '#65aa98',
    darkGreen: '#348b60',
    blackColor: '#273437',
    redColor: '#b04f45',
    salmonColor: '#DAC2BB',
    darkBlue: '#19232F',
    lightBlue: '#5EA9B3',
    lightGrey: '#9DA4B1',
    violet: '#A79FBB'
  };
  function isValidHex(hex: string): boolean {
    return typeof hex === 'string' && /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

function hexToRgb(hex: string): [number, number, number] | null {
    if (!isValidHex(hex)) return null;
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');
    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}

function rgbToLuminance(r: number, g: number, b: number): number {
    // Calculate luminance as per the formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getComplementaryColor(hex: string): string | null {
    let rgb = hexToRgb(hex);
    if (!rgb) return null;
    let [r, g, b] = rgb;
    // Calculate complementary color
    let compR = 255 - r;
    let compG = 255 - g;
    let compB = 255 - b;
    // Convert back to hex
    return `#${((1 << 24) + (compR << 16) + (compG << 8) + (compB)).toString(16).slice(1).toUpperCase()}`;
}

function colorsAreTooSimilar(hex1: string, hex2: string): boolean {
    let rgb1 = hexToRgb(hex1);
    let rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return false;
    let [r1, g1, b1] = rgb1;
    let [r2, g2, b2] = rgb2;
    let luminance1 = rgbToLuminance(r1, g1, b1);
    let luminance2 = rgbToLuminance(r2, g2, b2);
    // You can adjust the threshold for similarity here
    let threshold = 50;
    return Math.abs(luminance1 - luminance2) < threshold;
}

export function getDistinguishableColor(hex: string, backgroundHex: string): string | null {
    if (!isValidHex(hex) || !isValidHex(backgroundHex)) return null;
    if (colorsAreTooSimilar(hex, backgroundHex)) {
        return getComplementaryColor(hex);
    }
    return hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  // Convert r, g, b values to a hex string
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export function getReverseColor(hex: string): string | null {
  let rgb = hexToRgb(hex);
  if (!rgb) return null;
  let [r, g, b] = rgb;
  // Calculate complementary color
  let compR = 255 - r;
  let compG = 255 - g;
  let compB = 255 - b;
  // Convert back to hex
  return rgbToHex(compR, compG, compB);
}



// File: ./const/envconst.tsx
import { baseSepolia, base, taiko, taikoHekla  } from "viem/chains";
// import { defineChain, Hex } from "viem";
import {  InterfaceAbi }  from "ethers";
import * as chains from 'viem/chains';
import { BalanceItem } from "@covalenthq/client-sdk";
import { Chain } from "viem";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
export const COV_APIKEY= process.env.COV_APIKEY;




type Deployments = {
    [key: string]: {
        [key: string]: string;
    };
};

type ABIKP = {
    [key: string]: 
         InterfaceAbi; 
};


export const deployments: Deployments  = {
    "WillWe" : {
        "84532" :  "0x8f45bEe4c58C7Bb74CDa9fBD40aD86429Dba3E41",
        "11155420": "0xcdf01592c88eaa45cf3efff824f7c7e0687263ad"

    },
    "Membrane" : {
    "84532": "0xaBbd15F9eD0cab9D174b5e9878E9f104a993B41f",
    "11155420": "0xc2985039aeb2040ac403484c8d792a5de53cdfb1"
},
    "Execution": { 
        "84532": "0x3D52a3A5D12505B148a46B5D69887320Fc756F96",
        "11155420": "0xd5717a4bfc0c06540700e5f326d8c63b23d9216d"
}, "RVI": {
        "84532" : "0xDf17125350200A99E5c06E5E2b053fc61Be7E6ae",
        "11155420": "0xa0f47ae56845209db2f22c32af206ce33f8447a0"
} 

}





  /**
   * Gets the chain object for the given chain id.
   * @param chainId - Chain id of the target EVM chain.
   * @returns Viem's chain object.
   */
  export function getChainById(chainId: string) : Chain {
    for (const chain of Object.values(chains)) {
      if ('id' in chain) {
        if (chain.id === Number(chainId)) {
          return chain as Chain;
        }
      }
    }

    throw new Error(`Chain with id ${chainId} not found`);
  }



export const ABIs: ABIKP = {
    "WillWe" :   [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "Execution",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "Membrane",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "Will",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "allMembersOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "asRootValuation",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "rAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "balanceOfBatch",
            "inputs": [
                {
                    "name": "owners",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "balances",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burn",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "topVal",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "burnPath",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "calculateUserTargetedPreferenceAmount",
            "inputs": [
                {
                    "name": "childId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "parentId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signal",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "control",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "endpoint",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "entityCount",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "executeQueue",
            "inputs": [
                {
                    "name": "SignatureQueueHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "executionAddress",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getAllNodesForRoot",
            "inputs": [
                {
                    "name": "rootAddress",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "userIfAny",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "nodes",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getChildParentEligibilityPerSec",
            "inputs": [
                {
                    "name": "childId_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "parentId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getChildrenOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getFidPath",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "fids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMembraneOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodeData",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "NodeData",
                    "type": "tuple",
                    "internalType": "struct NodeState",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodeDataWithUserSignals",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "nodeData",
                    "type": "tuple",
                    "internalType": "struct NodeState",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodes",
            "inputs": [
                {
                    "name": "nodeIds",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "nodes",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getParentOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getSigQueue",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct SignatureQueue",
                    "components": [
                        {
                            "name": "state",
                            "type": "uint8",
                            "internalType": "enum SQState"
                        },
                        {
                            "name": "Action",
                            "type": "tuple",
                            "internalType": "struct Movement",
                            "components": [
                                {
                                    "name": "category",
                                    "type": "uint8",
                                    "internalType": "enum MovementType"
                                },
                                {
                                    "name": "initiatior",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "exeAccount",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "viaNode",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "expiresAt",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "descriptionHash",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "Signers",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "Sigs",
                            "type": "bytes[]",
                            "internalType": "bytes[]"
                        },
                        {
                            "name": "exeSig",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUserNodeSignals",
            "inputs": [
                {
                    "name": "signalOrigin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "parentNodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "UserNodeSignals",
                    "type": "uint256[2][]",
                    "internalType": "uint256[2][]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "inParentDenomination",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "inParentVal",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "inflationOf",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "initSelfControl",
            "inputs": [],
            "outputs": [
                {
                    "name": "controlingAgent",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "isApprovedForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isMember",
            "inputs": [
                {
                    "name": "whoabout_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "whereabout_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isQueueValid",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "localizeEndpoint",
            "inputs": [
                {
                    "name": "endpoint_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "endpointParent_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "endpointOwner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "membershipEnforce",
            "inputs": [
                {
                    "name": "target",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "membershipID",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintInflation",
            "inputs": [
                {
                    "name": "node",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintMembership",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintPath",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "redistribute",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "distributedAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "redistributePath",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "distributedAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "removeSignature",
            "inputs": [
                {
                    "name": "sigHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "resignal",
            "inputs": [
                {
                    "name": "targetNode_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "originator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeBatchTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "amounts",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "sendSignal",
            "inputs": [
                {
                    "name": "targetNode_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setApprovalForAll",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "isApproved",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setControl",
            "inputs": [
                {
                    "name": "newController",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnBranch",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "newID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnBranchWithMembrane",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "membraneID_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "newID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnRootBranch",
            "inputs": [
                {
                    "name": "fungible20_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "fID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "startMovement",
            "inputs": [
                {
                    "name": "typeOfMovement",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "node",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiresInDays",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "executingAccount",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "submitSignatures",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "signers",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "signatures",
                    "type": "bytes[]",
                    "internalType": "bytes[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "supportsInterface",
            "inputs": [
                {
                    "name": "interfaceId",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "taxPolicyPreference",
            "inputs": [
                {
                    "name": "rootToken_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "taxRate_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "toAddress",
            "inputs": [
                {
                    "name": "x",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "toID",
            "inputs": [
                {
                    "name": "x",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "uri",
            "inputs": [
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "ApprovalForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "isApproved",
                    "type": "bool",
                    "indexed": false,
                    "internalType": "bool"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "BranchSpawned",
            "inputs": [
                {
                    "name": "parentId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "newBranchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "InflationMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "InflationRateChanged",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "oldInflationRate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newInflationRate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MembershipMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "member",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MembraneChanged",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "previousMembrane",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newMembrane",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewMovement",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SelfControlAtAddress",
            "inputs": [
                {
                    "name": "AgencyLocus",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SignalSent",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "sender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TokensBurned",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "burner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TokensMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "minter",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TransferBatch",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                },
                {
                    "name": "amounts",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TransferSingle",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "URI",
            "inputs": [
                {
                    "name": "value",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AccountBalanceOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ArrayLengthsMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BadLen",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BaseOrNonFungible",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BranchAlreadyExists",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BranchNotFound",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnE20TransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CannotSkip",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CoreGasTransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Disabled",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EOA",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExecutionOnly",
            "inputs": []
        },
        {
            "type": "error",
            "name": "IncompleteSign",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientAmt",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientRootBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MembershipOp",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MembraneNotFound",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MintE20TransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "No",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoControl",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMembership",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoSoup",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoTimeDelta",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Noise",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoiseNotVoice",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotOwnerNorApproved",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PathTooShort",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ResignalMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "RootExists",
            "inputs": []
        },
        {
            "type": "error",
            "name": "RootNodeOrNone",
            "inputs": []
        },
        {
            "type": "error",
            "name": "SignalOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "StableRoot",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TargetIsRoot",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferToNonERC1155ReceiverImplementer",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferToZeroAddress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Unautorised",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UniniMembrane",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Unqualified",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnregisteredFungible",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnsupportedTransfer",
            "inputs": []
        },
        {
            "type": "error",
            "name": "isControled",
            "inputs": []
        }
    ],
    "Execution" :  [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "WillToken_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "EIP712_DOMAIN_TYPEHASH",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "MOVEMENT_TYPEHASH",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "WillToken",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "WillWe",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "contract IFun"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "endpoint",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "endpointOwner",
            "inputs": [
                {
                    "name": "endpointAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "executeQueue",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getSigQueue",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct SignatureQueue",
                    "components": [
                        {
                            "name": "state",
                            "type": "uint8",
                            "internalType": "enum SQState"
                        },
                        {
                            "name": "Action",
                            "type": "tuple",
                            "internalType": "struct Movement",
                            "components": [
                                {
                                    "name": "category",
                                    "type": "uint8",
                                    "internalType": "enum MovementType"
                                },
                                {
                                    "name": "initiatior",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "exeAccount",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "viaNode",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "expiresAt",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "descriptionHash",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "Signers",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "Sigs",
                            "type": "bytes[]",
                            "internalType": "bytes[]"
                        },
                        {
                            "name": "exeSig",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "hashDomain",
            "inputs": [
                {
                    "name": "domain",
                    "type": "tuple",
                    "internalType": "struct EIP712Domain",
                    "components": [
                        {
                            "name": "name",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "version",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "chainId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "verifyingContract",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "salt",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "hashMessage",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "hashMovement",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "isQueueValid",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "removeLatentAction",
            "inputs": [
                {
                    "name": "actionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "removeSignature",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signer",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setWillWe",
            "inputs": [
                {
                    "name": "implementation",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "startMovement",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "typeOfMovement",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiresInDays",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "executingAccount",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "submitSignatures",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "signers",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "signatures",
                    "type": "bytes[]",
                    "internalType": "bytes[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "verifyMessage",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                },
                {
                    "name": "v",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "r",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "s",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "expectedAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "EndpointCreatedForAgent",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "endpoint",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "agent",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "LatentActionRemoved",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "actionHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewMovementCreated",
            "inputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewSignaturesSubmitted",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "QueueExecuted",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SignatureRemoved",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "signer",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WillWeSet",
            "inputs": [
                {
                    "name": "implementation",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AlreadyHasEndpoint",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyInit",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyInitialized",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadySigned",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_A0sig",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_ActionIndexMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_BadOwnerOrAuthType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_InProgress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_NoDescription",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_NoType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_OnlyMore",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_OnlySigner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_SQInvalid",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_ZeroLen",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_exeQFail",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EmptyUnallowed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExpiredMovement",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExpiredQueue",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidQueue",
            "inputs": []
        },
        {
            "type": "error",
            "name": "LenErr",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMembersForNode",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMovementType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoSignatures",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotExeAccOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotNodeMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnavailableState",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UninitQueue",
            "inputs": []
        }
    ],
    "Membrane" : [
        {
            "type": "function",
            "name": "createMembrane",
            "inputs": [
                {
                    "name": "tokens_",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "balances_",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "meta_",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "gCheck",
            "inputs": [
                {
                    "name": "who_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "membraneID_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMembraneById",
            "inputs": [
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct Membrane",
                    "components": [
                        {
                            "name": "tokens",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "balances",
                            "type": "uint256[]",
                            "internalType": "uint256[]"
                        },
                        {
                            "name": "meta",
                            "type": "string",
                            "internalType": "string"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "error",
            "name": "Membrane__EmptyFieldOnMembraneCreation",
            "inputs": []
        },
        {
            "type": "error",
            "name": "membraneNotFound",
            "inputs": []
        }
    ],
    "RVI" :  [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "price_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pps_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "initMintAddrs_",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "initMintAmts_",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "allowance",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "approve",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "account",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burn",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amtValReturned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "burnReturns",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "rv",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burnTo",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "to_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "currentPrice",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "decimals",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint8",
                    "internalType": "uint8"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "deconstructBurn",
            "inputs": [
                {
                    "name": "amountToBurn_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "tokensToRedeem",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "outputs": [
                {
                    "name": "shareBurned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "decreaseAllowance",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "subtractedValue",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "increaseAllowance",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "addedValue",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "initTime",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "mintCost",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mintFromETH",
            "inputs": [],
            "outputs": [
                {
                    "name": "howMuchMinted",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "pps",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "relayERC20",
            "inputs": [
                {
                    "name": "_from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "sendERC20",
            "inputs": [
                {
                    "name": "_to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_chainId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "simpleBurn",
            "inputs": [
                {
                    "name": "amountToBurn_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amtValReturned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "transfer",
            "inputs": [
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "transferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "Approval",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "spender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "RelayERC20",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "source",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SendERC20",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "destination",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Transfer",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "ATransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnRefundF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CallerNotL2ToL2CrossDomainMessenger",
            "inputs": []
        },
        {
            "type": "error",
            "name": "DelegateCallFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficentBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidCalldata",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidCrossDomainSender",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PayCallF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PingF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Reentrant",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnqualifiedCall",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ValueMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ZeroAddress",
            "inputs": []
        }
    ],
    "IERC20" : [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_from",
                        "type": "address"
                    },
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    },
                    {
                        "name": "_spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "payable": true,
                "stateMutability": "payable",
                "type": "fallback"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            }
        
        ],
    "PowerProxy" : [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "proxyOwner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "implementation",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "onERC1155Received",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setImplementation",
            "inputs": [
                {
                    "name": "implementation_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setOwner",
            "inputs": [
                {
                    "name": "owner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setSignedHash",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "tryAggregate",
            "inputs": [
                {
                    "name": "requireSuccess",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "calls",
                    "type": "tuple[]",
                    "internalType": "struct PowerProxy.Call[]",
                    "components": [
                        {
                            "name": "target",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "callData",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "returnData",
                    "type": "tuple[]",
                    "internalType": "struct PowerProxy.Result[]",
                    "components": [
                        {
                            "name": "success",
                            "type": "bool",
                            "internalType": "bool"
                        },
                        {
                            "name": "returnData",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "error",
            "name": "Multicall2",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "noFallback",
            "inputs": []
        }
    ]
}



export const RPCurl : {[key: string]: string } = {
    "84532": process.env.BB_BASE_SEPOLIA_RPC || baseSepolia.rpcUrls.default.http[0],
    "11155420": process.env.OPTIMISM_SEPOLIA_RPC || baseSepolia.rpcUrls.default.http[0],
    "167009":  taikoHekla.rpcUrls.default.http[0] || process.env.TAIKO_HEKLA_RPC,
    "167000":  taiko.rpcUrls.default.http[0] || process.env.TAIKO_RPC
}


export const ERC20Bytecode = "0x60806040523480156200001157600080fd5b5060405162001c6438038062001c648339818101604052810190620000379190620007c1565b838381600390816200004a919062000af0565b5080600490816200005c919062000af0565b5050508051825114620000a6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200009d9062000c5e565b60405180910390fd5b60005b81518110156200011557620000ff838281518110620000cd57620000cc62000c80565b5b6020026020010151838381518110620000eb57620000ea62000c80565b5b60200260200101516200012060201b60201c565b80806200010c9062000cde565b915050620000a9565b505050505062000dff565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620001955760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016200018c919062000d3c565b60405180910390fd5b620001a960008383620001ad60201b60201c565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160362000203578060026000828254620001f6919062000d59565b92505081905550620002d9565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508181101562000292578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401620002899392919062000da5565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160362000324578060026000828254039250508190555062000371565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620003d0919062000de2565b60405180910390a3505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200044682620003fb565b810181811067ffffffffffffffff821117156200046857620004676200040c565b5b80604052505050565b60006200047d620003dd565b90506200048b82826200043b565b919050565b600067ffffffffffffffff821115620004ae57620004ad6200040c565b5b620004b982620003fb565b9050602081019050919050565b60005b83811015620004e6578082015181840152602081019050620004c9565b60008484015250505050565b600062000509620005038462000490565b62000471565b905082815260208101848484011115620005285762000527620003f6565b5b62000535848285620004c6565b509392505050565b600082601f830112620005555762000554620003f1565b5b815162000567848260208601620004f2565b91505092915050565b600067ffffffffffffffff8211156200058e576200058d6200040c565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620005d182620005a4565b9050919050565b620005e381620005c4565b8114620005ef57600080fd5b50565b6000815190506200060381620005d8565b92915050565b6000620006206200061a8462000570565b62000471565b905080838252602082019050602084028301858111156200064657620006456200059f565b5b835b818110156200067357806200065e8882620005f2565b84526020840193505060208101905062000648565b5050509392505050565b600082601f830112620006955762000694620003f1565b5b8151620006a784826020860162000609565b91505092915050565b600067ffffffffffffffff821115620006ce57620006cd6200040c565b5b602082029050602081019050919050565b6000819050919050565b620006f481620006df565b81146200070057600080fd5b50565b6000815190506200071481620006e9565b92915050565b6000620007316200072b84620006b0565b62000471565b905080838252602082019050602084028301858111156200075757620007566200059f565b5b835b818110156200078457806200076f888262000703565b84526020840193505060208101905062000759565b5050509392505050565b600082601f830112620007a657620007a5620003f1565b5b8151620007b88482602086016200071a565b91505092915050565b60008060008060808587031215620007de57620007dd620003e7565b5b600085015167ffffffffffffffff811115620007ff57620007fe620003ec565b5b6200080d878288016200053d565b945050602085015167ffffffffffffffff811115620008315762000830620003ec565b5b6200083f878288016200053d565b935050604085015167ffffffffffffffff811115620008635762000862620003ec565b5b62000871878288016200067d565b925050606085015167ffffffffffffffff811115620008955762000894620003ec565b5b620008a3878288016200078e565b91505092959194509250565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200090257607f821691505b602082108103620009185762000917620008ba565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620009827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000943565b6200098e868362000943565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620009d1620009cb620009c584620006df565b620009a6565b620006df565b9050919050565b6000819050919050565b620009ed83620009b0565b62000a05620009fc82620009d8565b84845462000950565b825550505050565b600090565b62000a1c62000a0d565b62000a29818484620009e2565b505050565b5b8181101562000a515762000a4560008262000a12565b60018101905062000a2f565b5050565b601f82111562000aa05762000a6a816200091e565b62000a758462000933565b8101602085101562000a85578190505b62000a9d62000a948562000933565b83018262000a2e565b50505b505050565b600082821c905092915050565b600062000ac56000198460080262000aa5565b1980831691505092915050565b600062000ae0838362000ab2565b9150826002028217905092915050565b62000afb82620008af565b67ffffffffffffffff81111562000b175762000b166200040c565b5b62000b238254620008e9565b62000b3082828562000a55565b600060209050601f83116001811462000b68576000841562000b53578287015190505b62000b5f858262000ad2565b86555062000bcf565b601f19841662000b78866200091e565b60005b8281101562000ba25784890151825560018201915060208501945060208101905062000b7b565b8683101562000bc2578489015162000bbe601f89168262000ab2565b8355505b6001600288020188555050505b505050505050565b600082825260208201905092915050565b7f526563697069656e747320616e642062616c616e636573206c656e677468206d60008201527f69736d6174636800000000000000000000000000000000000000000000000000602082015250565b600062000c4660278362000bd7565b915062000c538262000be8565b604082019050919050565b6000602082019050818103600083015262000c798162000c37565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000ceb82620006df565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820362000d205762000d1f62000caf565b5b600182019050919050565b62000d3681620005c4565b82525050565b600060208201905062000d53600083018462000d2b565b92915050565b600062000d6682620006df565b915062000d7383620006df565b925082820190508082111562000d8e5762000d8d62000caf565b5b92915050565b62000d9f81620006df565b82525050565b600060608201905062000dbc600083018662000d2b565b62000dcb602083018562000d94565b62000dda604083018462000d94565b949350505050565b600060208201905062000df9600083018462000d94565b92915050565b610e558062000e0f6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461013457806370a082311461015257806395d89b4114610182578063a9059cbb146101a0578063dd62ed3e146101d057610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a0610200565b6040516100ad9190610aa9565b60405180910390f35b6100d060048036038101906100cb9190610b64565b610292565b6040516100dd9190610bbf565b60405180910390f35b6100ee6102b5565b6040516100fb9190610be9565b60405180910390f35b61011e60048036038101906101199190610c04565b6102bf565b60405161012b9190610bbf565b60405180910390f35b61013c6102ee565b6040516101499190610c73565b60405180910390f35b61016c60048036038101906101679190610c8e565b6102f7565b6040516101799190610be9565b60405180910390f35b61018a61033f565b6040516101979190610aa9565b60405180910390f35b6101ba60048036038101906101b59190610b64565b6103d1565b6040516101c79190610bbf565b60405180910390f35b6101ea60048036038101906101e59190610cbb565b6103f4565b6040516101f79190610be9565b60405180910390f35b60606003805461020f90610d2a565b80601f016020809104026020016040519081016040528092919081815260200182805461023b90610d2a565b80156102885780601f1061025d57610100808354040283529160200191610288565b820191906000526020600020905b81548152906001019060200180831161026b57829003601f168201915b5050505050905090565b60008061029d61047b565b90506102aa818585610483565b600191505092915050565b6000600254905090565b6000806102ca61047b565b90506102d7858285610495565b6102e2858585610529565b60019150509392505050565b60006012905090565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461034e90610d2a565b80601f016020809104026020016040519081016040528092919081815260200182805461037a90610d2a565b80156103c75780601f1061039c576101008083540402835291602001916103c7565b820191906000526020600020905b8154815290600101906020018083116103aa57829003601f168201915b5050505050905090565b6000806103dc61047b565b90506103e9818585610529565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b610490838383600161061d565b505050565b60006104a184846103f4565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146105235781811015610513578281836040517ffb8f41b200000000000000000000000000000000000000000000000000000000815260040161050a93929190610d6a565b60405180910390fd5b6105228484848403600061061d565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361059b5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016105929190610da1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361060d5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016106049190610da1565b60405180910390fd5b6106188383836107f4565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361068f5760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016106869190610da1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107015760006040517f94280d620000000000000000000000000000000000000000000000000000000081526004016106f89190610da1565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080156107ee578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516107e59190610be9565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361084657806002600082825461083a9190610deb565b92505081905550610919565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156108d2578381836040517fe450d38c0000000000000000000000000000000000000000000000000000000081526004016108c993929190610d6a565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361096257806002600082825403925050819055506109af565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a0c9190610be9565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610a53578082015181840152602081019050610a38565b60008484015250505050565b6000601f19601f8301169050919050565b6000610a7b82610a19565b610a858185610a24565b9350610a95818560208601610a35565b610a9e81610a5f565b840191505092915050565b60006020820190508181036000830152610ac38184610a70565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610afb82610ad0565b9050919050565b610b0b81610af0565b8114610b1657600080fd5b50565b600081359050610b2881610b02565b92915050565b6000819050919050565b610b4181610b2e565b8114610b4c57600080fd5b50565b600081359050610b5e81610b38565b92915050565b60008060408385031215610b7b57610b7a610acb565b5b6000610b8985828601610b19565b9250506020610b9a85828601610b4f565b9150509250929050565b60008115159050919050565b610bb981610ba4565b82525050565b6000602082019050610bd46000830184610bb0565b92915050565b610be381610b2e565b82525050565b6000602082019050610bfe6000830184610bda565b92915050565b600080600060608486031215610c1d57610c1c610acb565b5b6000610c2b86828701610b19565b9350506020610c3c86828701610b19565b9250506040610c4d86828701610b4f565b9150509250925092565b600060ff82169050919050565b610c6d81610c57565b82525050565b6000602082019050610c886000830184610c64565b92915050565b600060208284031215610ca457610ca3610acb565b5b6000610cb284828501610b19565b91505092915050565b60008060408385031215610cd257610cd1610acb565b5b6000610ce085828601610b19565b9250506020610cf185828601610b19565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610d4257607f821691505b602082108103610d5557610d54610cfb565b5b50919050565b610d6481610af0565b82525050565b6000606082019050610d7f6000830186610d5b565b610d8c6020830185610bda565b610d996040830184610bda565b949350505050565b6000602082019050610db66000830184610d5b565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610df682610b2e565b9150610e0183610b2e565b9250828201905080821115610e1957610e18610dbc565b5b9291505056fea2646970667358221220dde26259188310601e90c42c29f32358f866bb4ebf582b425186c6914931b34564736f6c63430008130033"
export const ERC20CreateABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "recipients",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "balances",
				"type": "uint256[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]




export interface TokenInfo {
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export function isValidTokenAmount(amount: string): boolean {
export function isValidTokenAmount(amount: string): boolean {
  try {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return false;
    }
    // Check for proper decimal format
    const parts = amount.split('.');
    if (parts.length > 2) return false;
    if (parts[1] && parts[1].length > 18) return false;
    return true;
  } catch {
    return false;
  }
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    const num = Number(amount);
    if (isNaN(num)) return '0';
    return num.toFixed(Math.min(decimals, 18));
  } catch {
    return '0';
  }
}

export function clearTokenCache() {
export function clearTokenCache() {
  Object.keys(tokenCache).forEach(key => delete tokenCache[key]);
}

export function getTokenValidationError(error: unknown): string {
export function getTokenValidationError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('contract not deployed')) {
      return 'Token contract not found at this address';
    }
    if (error.message.includes('execution reverted')) {
      return 'Invalid token contract';
    }
    return error.message;
  }
  return 'Failed to validate token';
}

export const formatAddress = (address: string): string => {
export const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

export const nodeIdToAddress = (nodeId: string | number | bigint): string => {
export const nodeIdToAddress = (nodeId: string | number | bigint): string => {
  try {
    // If already a hex address of correct length, return as is
    if (typeof nodeId === 'string' && isHexString(nodeId) && nodeId.length === 42) {
      return nodeId.toLowerCase();
    }

    // Convert to BigInt first to handle large numbers
    let bigIntValue: bigint;
    if (typeof nodeId === 'string') {
      // Remove '0x' prefix if present for numeric conversion
      const cleanNodeId = nodeId.startsWith('0x') ? nodeId.slice(2) : nodeId;
      bigIntValue = BigInt(cleanNodeId);
    } else {
      bigIntValue = BigInt(nodeId);
    }

    // Convert to hex and pad to 20 bytes (40 hex chars)
    let hexString = bigIntValue.toString(16);
    hexString = hexString.padStart(40, '0');
    
    // Add 0x prefix
    return ethers.getAddress('0x' + hexString);
  } catch (error) {
    console.error('Error converting node ID to address:', error);
    throw new Error('Invalid node ID format');
  }
};

export const addressToNodeId = (address: string): string => {
export const addressToNodeId = (address: string): string => {
  try {
    if (!isHexString(address)) {
      throw new Error('Invalid address format');
    }
    // Remove '0x' prefix and convert to decimal string
    const nodeId = BigInt(address).toString();
    return nodeId;
  } catch (error) {
    console.error('Error converting address to node ID:', error);
    throw new Error('Invalid address format');
  }
};

export const formatBalance = (value: string | bigint | undefined | null): string => {
export const formatBalance = (value: string | bigint | undefined | null): string => {
  if (!value) return '0';
  try {
    const bigIntValue = typeof value === 'string' ? BigInt(value) : value;
    return ethers.formatUnits(bigIntValue, 18);
  } catch {
    return '0';
  }
};

export const formatPercentage = (value: number): string => {
export const formatPercentage = (value: number): string => {
  return (Math.round(value * 100) / 100).toFixed(2) + '%';
};

export interface NodeBasicInfo {
export interface NodeBasicInfo {
  nodeId: string;        // basicInfo[0]
  inflation: string;     // basicInfo[1]
  balanceAnchor: string; // basicInfo[2]
  balanceBudget: string; // basicInfo[3]
  value: string;         // basicInfo[4]
  membraneId: string;    // basicInfo[5]
  balanceOfUser: string; // basicInfo[6]
  eligibilityPerSec: string; // basicInfo[7]
  lastRedistribution: string; // basicInfo[8]
}

export interface UserSignal {
export interface UserSignal {
  MembraneInflation: [string, string][]; // Array of [membraneId, inflationRate] pairs
  lastRedistSignal: string[];            // Array of timestamps
}

export interface NodeState {
export interface NodeState {
  basicInfo: [
    nodeId: string,           // basicInfo[0]
    inflation: string,        // basicInfo[1]
    balanceAnchor: string,   // basicInfo[2] - balance in parent reserve
    balanceBudget: string,   // basicInfo[3] - budget
    value: string,           // basicInfo[4] - valuation denominated in root token
    membraneId: string,      // basicInfo[5] - membrane id
    balanceOfUser: string,   // basicInfo[6] - balance of current user in this node
    eligibilityPerSec: string, // basicInfo[7] - redistribution eligibility from parent per sec
    lastRedistribution: string // basicInfo[8] - last redistribution timestamp
  ];
  membraneMeta: string;     // IPFS hash or metadata string
  membersOfNode: string[];  // Array of ethereum addresses
  childrenNodes: string[];  // Array of node IDs
  rootPath: string[];       // Array of node IDs from root to this node
  signals: UserSignal[];    // Array of UserSignal structs
}

export interface MembraneRequirement {
export interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export interface MembraneCharacteristic {
export interface MembraneCharacteristic {
  title: string;
  link?: string;
}

export interface MembraneMetadata {
export interface MembraneMetadata {
  name: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
  }[];
}

export interface TransformedNodeData {
export interface TransformedNodeData {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
}

export interface NodeStats {
export interface NodeStats {
  totalValue: string;
  dailyGrowth: string;
  memberCount: number;
  childCount: number;
  pathDepth: number;
}

export interface MembraneState {
export interface MembraneState {
  tokens: string[];
  balances: string[];
  meta: string;
}

export interface NodeQueryResponse {
export interface NodeQueryResponse {
  data: NodeState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface NodeOperationParams {
export interface NodeOperationParams {
  nodeId: string;
  chainId: string;
  options?: {
    gasLimit?: number;
    gasPrice?: string;
  };
}

export interface SignalData {
export interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

export const isValidNodeState = (data: any): data is NodeState => {
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    Array.isArray(data?.basicInfo) &&
    data.basicInfo.length === 9 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals) &&
    data.signals.every((signal: any) =>
      Array.isArray(signal.MembraneInflation) &&
      Array.isArray(signal.lastRedistSignal)
    )
  );
};

export const isValidUserSignal = (data: any): data is UserSignal => {
export const isValidUserSignal = (data: any): data is UserSignal => {
  return (
    Array.isArray(data?.MembraneInflation) &&
    Array.isArray(data?.lastRedistSignal) &&
    data.MembraneInflation.every((item: any) =>
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === 'string' &&
      typeof item[1] === 'string'
    )
  );
};

export const transformNodeData = (nodeData: NodeState): TransformedNodeData => {
export const transformNodeData = (nodeData: NodeState): TransformedNodeData => {
  return {
    basicInfo: {
      nodeId: nodeData.basicInfo[0],
      inflation: nodeData.basicInfo[1],
      balanceAnchor: nodeData.basicInfo[2],
      balanceBudget: nodeData.basicInfo[3],
      value: nodeData.basicInfo[4],
      membraneId: nodeData.basicInfo[5],
      balanceOfUser: nodeData.basicInfo[6],
      eligibilityPerSec: nodeData.basicInfo[7],
      lastRedistribution: nodeData.basicInfo[8]
    },
    membraneMeta: nodeData.membraneMeta,
    membersOfNode: nodeData.membersOfNode,
    childrenNodes: nodeData.childrenNodes,
    rootPath: nodeData.rootPath,
    signals: nodeData.signals
  };
};
</document_content>
</document></documents>
