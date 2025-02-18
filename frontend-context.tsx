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
    "context": "./create-context.sh",
    "find:unused": "next-unused"
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
    "@types/plotly.js": "^2.35.1",
    "@types/react-plotly.js": "^2.6.3",
    "@visx/group": "^3.12.0",
    "@visx/mock-data": "^3.12.0",
    "@visx/scale": "^3.12.0",
    "@visx/shape": "^3.12.0",
    "alchemy-sdk": "^3.5.0",
    "chroma-js": "^3.0.0",
    "color": "^4.2.3",
    "d3": "^7.9.0",
    "ethers": "^6.12.0",
    "form-data": "^4.0.1",
    "framer-motion": "^11.2.12",
    "helia": "^5.0.1",
    "json-bigint": "^1.0.0",
    "json-bignum": "^0.0.3",
    "json-bignumber": "^1.1.1",
    "lucide-react": "^0.399.0",
    "next": "latest",
    "next-unused": "^0.0.6",
    "node-fetch": "^2.7.0",
    "plotly.js-dist-min": "^2.35.3",
    "react": "^18.3.1",
    "react-force-graph": "^1.44.4",
    "react-force-graph-2d": "^1.25.8",
    "react-force-graph-3d": "^1.24.3",
    "react-icons": "^5.2.1",
    "react-plotly.js": "^2.6.0",
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
    "@types/d3": "^7.4.3",
    "@types/node": "^18",
    "@types/plotly.js-dist-min": "^2.3.4",
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
      {
        source: '/ipfs/:path*',
        destination: `${process.env.IPFS_GATEWAY}:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
        ],
      },
    ];
  }
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
            onNodeSelect={headerProps.onNodeSelect}
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
import { usePrivy } from '@privy-io/react-auth';
import { useNode } from '../../../contexts/NodeContext';
import { useActivityFeed } from '../../../hooks/useActivityFeed';
import { MainLayout } from '../../../components/Layout/MainLayout';

const NodePage = () => {
  const router = useRouter();
  const { colorState, cycleColors } = useColorManagement();
  const toast = useToast();
  const { user, ready, authenticated, logout, login } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  
  const { chainId, nodeId } = router.query;

  // Prepare header props - matching the dashboard implementation
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId as string,
    logout,
    login,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      router.push(`/nodes/${chainId}/${nodeId}`);
    },
  };

  const { data: nodeData, isLoading, error } = useNodeData(
    chainId as string,
    nodeId as string
  );

  if (!router.isReady || !chainId || !nodeId) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerProps={headerProps}>
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        <NodeDetails
          chainId={chainId as string}
          nodeId={nodeId.toString()}
          selectedTokenColor={colorState.contrastingColor}
        />
      </Box>
    </MainLayout>
  );
};

export default NodePage;



// File: ./pages/api/get-ipfs-data.ts
// This file implements the logic for fetching data from IPFS.
// It defines an API endpoint that handles incoming requests and retrieves data based on the provided hash.

import { NextApiRequest, NextApiResponse } from 'next';

const getIpfsData = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Invalid hash parameter' });
  }

  const requestUrl = `${process.env.IPFS_GATEWAY}${hash}`;
  console.log('Fetching data from IPFS:', requestUrl);
  try {
    // Implement your logic to fetch data from IPFS using the hash
    const response = await fetch(`${process.env.IPFS_GATEWAY}${hash}`);
    console.log("getIpfsData, response:", response);
    if (!response.ok) {
      throw new Error('Failed to fetch data from IPFS');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from IPFS:', error);
    return res.status(500).json({ error: 'Failed to fetch data from IPFS' });
  }
};

export default getIpfsData;



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



// File: ./components/Node/MovementDetails.tsx
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { LatentMovement, MovementType } from '../../types/chainData';

interface MovementDetailsProps {
  movement: LatentMovement;
  signatures: {
    current: number;
    required: number;
  };
  description: string;
}

export const MovementDetails = React.memo(({ 
  movement, 
  signatures,
  description 
}: MovementDetailsProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  const decodeCalls = (executedPayload: string) => {
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        [{
          type: 'tuple[]',
          components: [
            { name: 'target', type: 'address' },
            { name: 'callData', type: 'bytes' },
            { name: 'value', type: 'uint256' }
          ]
        }],
        executedPayload
      );

      return decoded[0];
    } catch {
      return [];
    }
  };

  const calls = decodeCalls(movement.movement.executedPayload);
  const progress = (signatures.current / signatures.required) * 100;

  return (
    <Box 
      border="1px solid" 
      borderColor={borderColor} 
      borderRadius="md" 
      p={4}
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="sm" color="gray.500">Description</Text>
          <Text>{description || 'No description available'}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Authorization Type</Text>
          <Badge colorScheme={movement.movement.category === MovementType.AgentMajority ? 'blue' : 'purple'}>
            {movement.movement.category === MovementType.AgentMajority ? 'Agent Majority' : 'Value Majority'}
          </Badge>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Target Endpoint</Text>
          <Tooltip label={movement.movement.exeAccount}>
            <Text fontSize="sm" fontFamily="mono">
              {movement.movement.exeAccount.slice(0, 6)}...{movement.movement.exeAccount.slice(-4)}
            </Text>
          </Tooltip>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Actions ({calls.length})</Text>
          <VStack align="stretch" spacing={2} mt={2}>
            {calls.map((call: any, index: number) => (
              <Box 
                key={index} 
                bg={bgColor} 
                p={3} 
                borderRadius="md"
                fontSize="sm"
              >
                <HStack justify="space-between">
                  <Tooltip label={call.target}>
                    <Text fontFamily="mono">To: {call.target.slice(0, 6)}...{call.target.slice(-4)}</Text>
                  </Tooltip>
                  {call.value.toString() !== '0' && (
                    <Badge colorScheme="green">
                      Value: {ethers.formatEther(call.value)} ETH
                    </Badge>
                  )}
                </HStack>
                <Tooltip label={call.callData}>
                  <Text 
                    fontFamily="mono" 
                    mt={1} 
                    isTruncated
                  >
                    Data: {call.callData.slice(0, 10)}...
                  </Text>
                </Tooltip>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.500">Signature Progress</Text>
            <Text fontSize="sm" fontWeight="medium">
              {signatures.current} / {signatures.required} 
              {movement.movement.category === MovementType.AgentMajority ? ' signatures' : ' voting power'}
            </Text>
          </HStack>
          <Progress 
            value={progress} 
            size="sm" 
            borderRadius="full"
            colorScheme={progress >= 100 ? 'green' : 'blue'}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Expires</Text>
          <Text>
            {new Date(Number(movement.movement.expiresAt) * 1000).toLocaleString()}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
});

MovementDetails.displayName = 'MovementDetails';



// File: ./components/Node/NodeOperations.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
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
  ToastId,
  IconButton,
  FormHelperText,
  Switch
} from '@chakra-ui/react';
import {
  GitBranchPlus,
  Shield,
  UserPlus,
  RefreshCw,
  Plus,
  Trash,
  ChevronDown,
  Trash2,
  Info
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { deployments } from '../../config/deployments';
import { ABIs } from '../../config/contracts';
import { nodeIdToAddress } from '../../utils/formatters';
import  SpawnNodeForm  from './SpawnNodeForm';

type ModalType = 'spawn' | 'membrane' | 'mint' | 'burn' | null;


interface TokenRequirement {
  tokenAddress: string;
  requiredBalance: string;
}

interface SpawnFormData {
  name: string;
  characteristics: { title: string; link: string }[];
  tokenRequirements: TokenRequirement[];
  inflation: number;
}

interface MembraneMetadata {
  name: string;
  description?: string;
  characteristics: string[];
}

interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export type NodeOperationsProps = {
  nodeId: string;
  chainId: string;
  selectedTokenColor?: string;
  userAddress?: string;
  onSuccess?: () => void;
  initialTab?: 'spawn' | 'membrane' | 'mint' | 'burn' | null;
  showToolbar?: boolean;
};

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  selectedTokenColor,
  userAddress,
  onSuccess,
  initialTab = null,
  showToolbar = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(initialTab);
  const [membraneId, setMembraneId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [burnAmount, setBurnAmount] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [useDirectParentMint, setUseDirectParentMint] = useState(false);
  const [useDirectParentBurn, setUseDirectParentBurn] = useState(false);
  const [formData, setFormData] = useState<SpawnFormData>({
    name: '',
    characteristics: [],
    tokenRequirements: [],
    inflation: 0
  });

  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const { data: nodeData } = useNodeData(chainId, userAddress, nodeId);
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address || '');

  // Effect to handle initialTab prop changes
  useEffect(() => {
    setActiveModal(initialTab);
  }, [initialTab]);

  // Reset states when modal closes
  useEffect(() => {
    if (!activeModal) {
      setMintAmount('');
      setBurnAmount('');
      setNeedsApproval(false);
      setAllowance('0');
      setUseDirectParentMint(false);
      setUseDirectParentBurn(false);
    }
  }, [activeModal]);

  const checkAllowance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address || !mintAmount) {
        console.warn('Required data not available');
        return;
      }
  
      const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
  
      if (!willWeAddress) {
        console.warn('WillWe contract address not available');
        return;
      }
  
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
  
      const tokenContract = new ethers.Contract(
        rootTokenAddress,
        [
          'function allowance(address,address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        signer
      );
  
      const [currentAllowance, decimals] = await Promise.all([
        tokenContract.allowance(user.wallet.address, willWeAddress),
        tokenContract.decimals()
      ]);

      // Convert amount to BigInt with proper decimals
      const requiredAmount = ethers.parseUnits(mintAmount, decimals);
      
      // Store both values
      setAllowance(currentAllowance.toString());
      
      // Strict BigInt comparison
      setNeedsApproval(currentAllowance < requiredAmount);

      console.log('Allowance check:', {
        currentAllowance: currentAllowance.toString(),
        requiredAmount: requiredAmount.toString(),
        needsApproval: currentAllowance < requiredAmount
      });

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
    if (!nodeData?.rootPath?.[0] || isProcessing || !mintAmount) {
      return;
    }
  
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
  
      const tokenContract = new ethers.Contract(
        rootTokenAddress,
        ['function approve(address,uint256) returns (bool)'],
        //@ts-ignore
        signer
      );
  
      await executeTransaction(
        chainId,
        async () => {
          const tx = await tokenContract.approve(
            willWeAddress,
            ethers.parseUnits(mintAmount, 18)
          );
          return tx;
        },
        {
          successMessage: 'Token approval granted successfully',
          errorMessage: 'Failed to approve token spending',
          onSuccess: async () => {
            await checkAllowance();
            setNeedsApproval(false);
          }
        }
      );
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, mintAmount, getEthersProvider, checkAllowance, isProcessing, executeTransaction, toast]);

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
      
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address account, uint256 id) view returns (uint256)'],
        //@ts-ignore
        signer
      );
  
      const balance = await contract.balanceOf(
        user.wallet.address,
        BigInt(nodeId)
      );
      
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

  // Continue to Part 3 for handler functions

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
            // @ts-ignore
            signer
          );
          
          return await contract.mintPath(nodeId, ethers.parseUnits(mintAmount, 18), {
            gasLimit: BigInt(500000)
          });
        },
        {
          successMessage: 'Tokens minted successfully via path',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to mint tokens via path:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleMint = useCallback(async () => {
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
            // @ts-ignore
            signer
          );
          
          return await contract.mint(nodeId, ethers.parseUnits(mintAmount, 18), {
            gasLimit: BigInt(300000)
          });
        },
        {
          successMessage: 'Tokens minted successfully from parent',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to mint tokens from parent:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleBurnPath = useCallback(async () => {
    if (!burnAmount || isProcessing) return;
    
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
            // @ts-ignore
            signer
          );
          
          const amountToBurn = ethers.parseUnits(burnAmount, 18);
          return contract.burnPath(nodeId, amountToBurn);
        },
        {
          successMessage: 'Tokens burned successfully via path',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          } 
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens via path:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleBurn = useCallback(async () => {
    if (!burnAmount || isProcessing) return;
    
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
            /// @ts-ignore
            signer
          );
          
          const amountToBurn = ethers.parseUnits(burnAmount, 18);
          return contract.burn(nodeId, amountToBurn);
        },
        {
          successMessage: 'Tokens burned successfully to parent',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          } 
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens to parent:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

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
            /// @ts-ignore
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
        description: error instanceof Error ? error.message : 'Failed to mint membership',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getEthersProvider, onSuccess, toast]);

  const handleRedistribute = useCallback(async () => {
    if (isProcessing) return;
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
            // @ts-ignore
            signer
          );
  
          return contract.redistributePath(nodeId, { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess: () => {
            onSuccess?.();
          }
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
  }, [chainId, nodeId, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  // Mint Modal Content
  const renderMintModalContent = () => (
    <VStack spacing={4}>
      <HStack width="100%" justify="space-between" align="center" pb={2}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="mint-from-parent" mb="0">
            Mint from Parent
          </FormLabel>
          <Switch 
            id="mint-from-parent"
            isChecked={useDirectParentMint}
            onChange={(e) => setUseDirectParentMint(e.target.checked)}
            colorScheme="purple"
          />
        </FormControl>
      </HStack>
      
      <FormControl isRequired>
        <FormLabel>Amount</FormLabel>
        <Input
          value={mintAmount}
          onChange={async (e) => {
            const newAmount = e.target.value;
            setMintAmount(newAmount); // Update form value immediately
            
            // Skip allowance check if amount is empty or 0
            if (!newAmount || parseFloat(newAmount) === 0) {
              setNeedsApproval(false);
              return;
            }

            // Immediately check allowance with new value
            try {
              if (!nodeData?.rootPath?.[0] || !user?.wallet?.address) {
                console.warn('Required data not available');
                return;
              }

              const provider = await getEthersProvider();
              const signer = await provider.getSigner();
              const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
              const cleanChainId = chainId.replace('eip155:', '');
              const willWeAddress = deployments.WillWe[cleanChainId];

              const tokenContract = new ethers.Contract(
                rootTokenAddress,
                [
                  'function allowance(address,address) view returns (uint256)',
                  'function decimals() view returns (uint8)'
                ],
                signer
              );

              const [currentAllowance, decimals] = await Promise.all([
                tokenContract.allowance(user.wallet.address, willWeAddress),
                tokenContract.decimals()
              ]);

              const requiredAmount = ethers.parseUnits(newAmount, decimals);
              setAllowance(currentAllowance.toString());
              setNeedsApproval(currentAllowance < requiredAmount);

              console.log('Immediate allowance check:', {
                currentAllowance: currentAllowance.toString(),
                requiredAmount: requiredAmount.toString(),
                needsApproval: currentAllowance < requiredAmount
              });
            } catch (error) {
              console.error('Error in immediate allowance check:', error);
              setNeedsApproval(true); // Fail safe: require approval on error
            }
          }}
          placeholder="Enter amount to mint"
          type="number"
          min="0"
          step="any"
        />
        <FormHelperText>
          {useDirectParentMint 
            ? "Mints tokens directly from parent node's reserve"
            : "Mints tokens through the entire path from root"
          }
        </FormHelperText>
      </FormControl>

      {mintAmount && parseFloat(mintAmount) > 0 && (
        <Alert status={needsApproval ? "warning" : "success"}>
          <AlertIcon />
          <VStack align="start" spacing={1} width="100%">
            <Text>
              {needsApproval 
                ? "Approval required before minting" 
                : "Ready to mint"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Current allowance: {ethers.formatUnits(allowance || '0', 18)}
              {needsApproval && ` (Need: ${mintAmount})`}
            </Text>
          </VStack>
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
          onClick={() => useDirectParentMint ? handleMint() : handleMintPath()}
          isLoading={isProcessing}
          width="100%"
          isDisabled={!mintAmount || parseFloat(mintAmount) === 0}
        >
          {useDirectParentMint ? 'Mint from Parent' : 'Mint Path'}
        </Button>
      )}
    </VStack>
  );

  // Burn Modal Content
  const renderBurnModalContent = () => (
    <VStack spacing={4}>
      <HStack width="100%" justify="space-between" align="center" pb={2}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="burn-to-parent" mb="0">
            Burn to Parent
          </FormLabel>
          <Switch 
            id="burn-to-parent"
            isChecked={useDirectParentBurn}
            onChange={(e) => setUseDirectParentBurn(e.target.checked)}
            colorScheme="purple"
          />
        </FormControl>
      </HStack>

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
        <FormHelperText>
          {useDirectParentBurn 
            ? "Burns tokens directly to parent node"
            : "Burns tokens through the entire path to root"
          }
        </FormHelperText>
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
        onClick={() => useDirectParentBurn ? handleBurn() : handleBurnPath()}
        isLoading={isProcessing}
        width="100%"
        isDisabled={!burnAmount}
      >
        {useDirectParentBurn ? 'Burn to Parent' : 'Burn Path'}
      </Button>
    </VStack>
  );

  return (
    <>
      {showToolbar && (
        <Box 
          display="flex" 
          justifyContent="flex-end" 
          mb={4} 
          px={6}
          borderBottom="1px solid"
          borderColor="gray.200"
          py={4}
          bg="gray.50"
        >
          <ButtonGroup 
            size="sm" 
            spacing={3} 
            display="flex" 
            flexWrap="wrap" 
            gap={2}
          >
            <Tooltip label="Mint membership">
              <Button
                leftIcon={<UserPlus size={16} />}
                onClick={handleMintMembership}
                isDisabled={isMember}
                colorScheme="purple"
                variant="outline"
              >
                Join
              </Button>
            </Tooltip>

            <Tooltip label="Create new node">
  <Button
    leftIcon={<GitBranchPlus size={16} />}
    onClick={() => setActiveModal('spawn')}
    colorScheme="purple"
    variant="outline"
  >
    Spawn Node
  </Button>
</Tooltip>

            <Tooltip label="Redistribute value">
              <Button
                leftIcon={<RefreshCw size={16} />}
                onClick={handleRedistribute}
                colorScheme="purple"
                variant="outline"
              >
                Redistribute
              </Button>
            </Tooltip>

            <Tooltip label="Mint tokens">
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => setActiveModal('mint')}
                colorScheme="purple"
                variant="outline"
              >
                Mint
              </Button>
            </Tooltip>

            <Tooltip label="Burn tokens">
              <Button
                leftIcon={<Trash size={16} />}
                onClick={() => {
                  setActiveModal('burn');
                  checkNodeBalance();
                }}
                colorScheme="purple"
                variant="outline"
              >
                Burn
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
      )}

<Modal 
  isOpen={activeModal === 'spawn'} 
  onClose={() => setActiveModal(null)}
  motionPreset="slideInBottom"
>
  <ModalOverlay backdropFilter="blur(4px)" />
  <ModalContent mx={4} bg="white" shadow="xl" borderRadius="xl">
    <ModalHeader>Create New Node</ModalHeader>
    <ModalCloseButton />
    <ModalBody pb={6}>
      <SpawnNodeForm
        nodeId={nodeId}
        chainId={chainId}
        onSuccess={onSuccess}
        onClose={() => setActiveModal(null)}
      />
    </ModalBody>
  </ModalContent>
</Modal>

      {/* Mint Modal */}
      <Modal 
        isOpen={activeModal === 'mint'} 
        onClose={() => setActiveModal(null)}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4} bg="white" shadow="xl" borderRadius="xl">
          <ModalHeader>Mint Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderMintModalContent()}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Burn Modal */}
      <Modal 
        isOpen={activeModal === 'burn'} 
        onClose={() => setActiveModal(null)}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4} bg="white" shadow="xl" borderRadius="xl">
          <ModalHeader>Burn Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderBurnModalContent()}
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



// File: ./components/Node/CreateMovementForm.tsx
import { DEFAULT_FORM_STATE, FormState, MovementFormValidation, validateFormField, validateFormForSubmission } from '../../types/movements';
import React, { useState, useMemo, memo } from 'react';
import { ethers } from 'ethers';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  FormHelperText,
  FormErrorMessage,
  useToast,
  Progress,
  HStack
} from '@chakra-ui/react';
import { MovementType } from '../../types/chainData';
import { getEndpointActions } from '../../config/endpointActions';
import { nodeIdToAddress } from '../../utils/formatters';

interface CreateMovementFormProps {
  nodeData: any;
  onSubmit: (data: FormState) => Promise<void>;
  onClose: () => void;
}

const CreateMovementForm: React.FC<CreateMovementFormProps> = ({ 
  nodeData,
  onSubmit,
  onClose 
}) => {
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize validation based on action type
  const [validation, setValidation] = useState<MovementFormValidation>({
    target: true,
    calldata: true,
    description: true,
    value: true,
    to: true
  });
  // const { description, isUploading, error, uploadDescription } = useMovementDescription();
  const toast = useToast();


  const endpointOptions = useMemo(() => {
    if (!nodeData?.movementEndpoints?.length) return [];
    
    return nodeData.movementEndpoints.map(endpoint => ({
      value: endpoint,
      label: `${endpoint.slice(0, 6)}...${endpoint.slice(-4)}`,
      authType: nodeData.childrenNodes.includes(endpoint) ? 
        MovementType.AgentMajority : 
        MovementType.EnergeticMajority,
      balance: nodeData.basicInfo[2] // Use balance anchor
    }));
  }, [nodeData?.movementEndpoints, nodeData?.childrenNodes, nodeData?.basicInfo]);

  // Update the handleEndpointChange to also set safe defaults
  const handleEndpointChange = (endpoint: string) => {
    const selectedEndpoint = endpointOptions.find(opt => opt.value === endpoint);
    setFormData(prev => ({
      ...prev,
      endpoint,
      type: selectedEndpoint ? selectedEndpoint.authType : prev.type,
      target: selectedEndpoint ? selectedEndpoint.value : ethers.ZeroAddress,
      calldata: '0x',
      value: '0'
    }));
    // Reset validations on endpoint change
    setValidation({
      target: true,
      calldata: true,
      description: true,
      value: true
    });
    setTouchedFields({});
  };

  const isValidHexString = (value: string) => /^0x[0-9a-fA-F]*$/.test(value);

  const validateField = (name: keyof FormState, value: string) => {
    if (!value && name === 'value') return true; // Empty value is valid, will default to 0
    if (!value) return true; // Don't show validation errors for empty fields until submit
    
    switch (name) {
      case 'target':
        return isValidHexString(value);
      case 'calldata':
        return isValidHexString(value) && value.length >= 10; // At least function signature
      case 'value':
        return !isNaN(Number(value));
      case 'description':
        return value.length >= 10;
      default:
        return true;
    }
  };

  // Update to handle empty values properly
  const handleInputChange = (field: keyof FormState, value: string) => {
    // Ensure value is treated as string
    let finalValue = value;
    if (field === 'value') {
      // Strip non-numeric characters and leading zeros for value field
      finalValue = value.replace(/[^\d.]/g, '').replace(/^0+(\d)/, '$1');
      if (finalValue === '') finalValue = '0';
    }

    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));

    setTouchedFields(prev => ({ ...prev, [field]: true }));
    setValidation(prev => ({
      ...prev,
      [field]: validateFormField(field, finalValue)
    }));
  };

  const handleSubmit = async () => {
    const isTokenTransfer = formData.actionType === 'tokenTransfer';
    
    try {
      const action = getActionOptions.find(a => a.id === formData.actionType);
      if (!action) throw new Error('Invalid action type');
  
      // Get target address based on action type
      let targetAddress;
      if (isTokenTransfer) {
        targetAddress = nodeData?.rootPath?.[0];
        targetAddress = nodeIdToAddress(targetAddress); 
      } else {
        targetAddress = formData.target || formData.params?.target;
      }
  
      // Validate target address
      if (!targetAddress || !ethers.isAddress(targetAddress)) {
        throw new Error('Target address is required');
      }
  
      // Extract CID from description if it's an object
      const descriptionCid = typeof formData.description === 'object' && 'cid' in formData.description
        ? formData.description.cid
        : formData.description;
  
      // Create clean parameters object without CID objects
      const cleanParams = Object.entries(formData.params || {}).reduce((acc, [key, value]) => {
        let cleanValue;
        
        // Convert CID objects to strings
        if (typeof value === 'object' && 'cid' in value) {
          cleanValue = value.cid;
        }
        // Convert numbers to strings
        else if (typeof value === 'number') {
          cleanValue = value.toString();
        }
        // Handle addresses
        else if (key.toLowerCase().includes('address') || key === 'target' || key === 'to') {
          try {
            cleanValue = ethers.getAddress(value as string);
          } catch {
            cleanValue = value;
          }
        }
        // Use value as is for other cases
        else {
          cleanValue = value;
        }
  
        return { ...acc, [key]: cleanValue };
      }, {});
  
      // Add required parameters
      const formattedParams = {
        ...cleanParams,
        value: formData.value || '0',
        target: targetAddress,
        description: descriptionCid // Use string CID instead of object
      };
  
      // Get call data with formatted parameters
      const callData = action.getCallData(formattedParams, nodeData.rootPath[0]);
  
      // Prepare final submission data
      const submissionData = {
        ...formData,
        description: descriptionCid, // Use string CID
        value: formData.value || '0',
        target: targetAddress,
        callData: callData.callData || '0x',
        params: formattedParams // Use cleaned parameters
      };
  
      // Validate submission data
      const validationResult = {
        ...validateFormForSubmission({
          ...submissionData,
          description: descriptionCid // Ensure validation uses string CID
        }),
        target: true
      };
  
      setValidation(prev => ({
        ...prev,
        ...validationResult
      }));
  
      if (!Object.values(validationResult).every(Boolean)) {
        toast({
          title: 'Validation Error',
          description: 'Please check the form for errors',
          status: 'error',
          duration: 3000
        });
        return;
      }
  
      setIsSubmitting(true);
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create movement',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionOptions = useMemo(() => {
    let rootTokenAddress;
    try {
      rootTokenAddress = nodeData?.rootPath?.[0] ? 
        nodeIdToAddress(nodeData.rootPath[0]) : 
        ethers.ZeroAddress;
    } catch (error) {
      console.error('Error converting node ID:', error);
      rootTokenAddress = ethers.ZeroAddress;
    }
    return getEndpointActions(rootTokenAddress, 'tokens');
  }, [nodeData?.rootPath]);

  // Ensure we reset validation states when switching between token transfer and custom call
  const handleActionChange = (actionId: string) => {
    const action = getActionOptions.find(a => a.id === actionId);
    if (action) {
      const defaultTarget = actionId === 'tokenTransfer' ? 
        nodeData?.rootPath?.[0] : 
        ethers.ZeroAddress; // Use ZeroAddress as fallback
  
      setFormData(prev => ({
        ...prev,
        actionType: actionId,
        target: defaultTarget,
        calldata: '0x',
        value: '0',
        params: {
          to: '',
          amount: '0',
          target: defaultTarget, // Initialize target in params as well
          calldata: '0x',
          value: '0'
        }
      }));
      
      // Reset validation state based on action type
      setValidation({
        target: true,
        calldata: true,
        description: true,
        value: true,
        to: true
      });
      
      setTouchedFields({});
    }
  };

  // Update the form controls to only validate on touch or submit
  const renderDynamicFields = () => {
    const action = getActionOptions.find(a => a.id === formData.actionType);
    if (!action) return null;

    return action.fields
      // For token transfers, skip any 'target' field since it's handled automatically
      .filter(field => !(formData.actionType === 'tokenTransfer' && field.name === 'target'))
      .map(field => (
      <FormControl 
        key={field.name} 
        isRequired={field.required}
        isInvalid={touchedFields[field.name] && !validation[field.name]}
      >
        <FormLabel>{field.label}</FormLabel>
        <Input
          type={field.type || 'text'}
          value={formData.params?.[field.name] || ''}
          onChange={(e) => {
            const value = e.target.value;
            setFormData(prev => ({
              ...prev,
              params: {
                ...prev.params,
                [field.name]: value
              }
            }));
            if (touchedFields[field.name]) {
              setValidation(prev => ({
                ...prev,
                [field.name]: validateFormField(field.name, value)
              }));
            }
          }}
          onBlur={() => {
            setTouchedFields(prev => ({ ...prev, [field.name]: true }));
            const value = formData.params?.[field.name] || '';
            setValidation(prev => ({
              ...prev,
              [field.name]: validateFormField(field.name, value)
            }));
          }}
          placeholder={field.placeholder}
        />
        {touchedFields[field.name] && !validation[field.name] && (
          <FormErrorMessage>
            {field.type === 'number' 
              ? 'Please enter a valid number' 
              : field.name === 'to' 
                ? 'Please enter a valid Ethereum address'
                : 'Please enter a valid value'}
          </FormErrorMessage>
        )}
      </FormControl>
    ));
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Execution Endpoint</FormLabel>
        <Select
          value={formData.endpoint}
          onChange={(e) => handleEndpointChange(e.target.value)}
        >
          <option value="new">Create New Execution Endpoint</option>
          {endpointOptions.map(({ value, label, authType, balance }) => (
            <option key={value} value={value}>
              {label} {authType === MovementType.AgentMajority ? '(Agent)' : '(Value)'} - {ethers.formatEther(balance || '0')} tokens
            </option>
          ))}
        </Select>
        <FormHelperText>
          {formData.endpoint === 'new' 
            ? 'A new execution endpoint will be created for this movement'
            : 'Using existing endpoint with matching authorization type'}
        </FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>Movement Type</FormLabel>
        <Select
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          isDisabled={formData.endpoint !== 'new'}
        >
          <option value={MovementType.AgentMajority}>Agent Majority</option>
          <option value={MovementType.EnergeticMajority}>Value Majority</option>
        </Select>
        <FormHelperText>
          {formData.endpoint !== 'new' && 'Movement type must match endpoint authorization type'}
        </FormHelperText>
      </FormControl>

      <FormControl isInvalid={touchedFields.description && !validation.description}>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          onBlur={() => setTouchedFields(prev => ({ ...prev, description: true }))}
          placeholder="Describe the purpose of this movement..."
          minH="100px"
          isDisabled={isUploading}
        />
        <FormErrorMessage>
          {error || 'Description must be at least 10 characters long'}
        </FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Expires In (Days)</FormLabel>
        <HStack>
          <Button onClick={() => handleInputChange('expiryDays', String(Math.max(1, formData.expiryDays - 1)))}>
            -
          </Button>
          <Input
            type="number"
            value={formData.expiryDays}
            onChange={(e) => handleInputChange('expiryDays', e.target.value)}
            min={1}
            textAlign="center"
          />
          <Button onClick={() => handleInputChange('expiryDays', String(formData.expiryDays + 1))}>
            +
          </Button>
        </HStack>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Action Type</FormLabel>
        <Select
          value={formData.actionType || 'customCall'}
          onChange={(e) => handleActionChange(e.target.value)}
        >
          {getActionOptions.map(action => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </Select>
        <FormHelperText>
          {getActionOptions.find(a => a.id === formData.actionType)?.description}
        </FormHelperText>
      </FormControl>

      {/* Dynamic fields based on selected action */}
      {renderDynamicFields()}

      <Button
        colorScheme="purple"
        onClick={handleSubmit}
        width="100%"
        isLoading={isSubmitting || isUploading}
        loadingText={isUploading ? "Uploading Description..." : "Creating Movement..."}
        isDisabled={!Object.values(validation).every(Boolean)}
      >
        Create Movement
      </Button>

      {(isSubmitting || isUploading) && (
        <Progress size="xs" isIndeterminate width="100%" colorScheme="purple" />
      )}
    </VStack>
  );
};

CreateMovementForm.displayName = 'CreateMovementForm';

export default CreateMovementForm;



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



// File: ./components/Node/MovementsErrorBoundary.tsx
import React, { Component, ErrorInfo } from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class MovementsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error('Movement error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={4}>
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Movement Error
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              <VStack spacing={4}>
                <Box>
                  {this.state.error?.message || 'An unexpected error occurred while processing movements'}
                </Box>
                <Button colorScheme="red" onClick={this.handleReset}>
                  Try Again
                </Button>
              </VStack>
            </AlertDescription>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}



// File: ./components/Node/RootNodeDetails.tsx



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



// File: ./components/Node/SpawnNodeForm.tsx
import { useState, useCallback } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Switch,
  HStack,
  IconButton,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Link,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { Plus, Trash2, ExternalLink, Copy } from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs, getExplorerLink } from '../../config/contracts';
import { validateToken } from '../../utils/tokenValidation';
import { useTransaction } from '../../contexts/TransactionContext';

interface Characteristic {
  title: string;
  link: string;
}

interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol?: string;
}

interface SpawnNodeFormProps {
  nodeId: string;
  chainId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const SpawnNodeForm = ({
  nodeId,
  chainId,
  onSuccess,
  onClose
}: SpawnNodeFormProps) => {
  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');
  const [inflationRate, setInflationRate] = useState(1);
  const [useMembrane, setUseMembrane] = useState(false);

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Hooks
  const { getEthersProvider } = usePrivy();
  const toast = useToast();
  const { executeTransaction } = useTransaction();

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

  const submitTransaction = async (cid: string = '') => {
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.WillWe[cleanChainId];
    
    if (!contractAddress) {
      throw new Error(`No contract deployment found for chain ${cleanChainId}`);
    }

    const tx = await executeTransaction(
      chainId,
      async () => {
        const provider = await getEthersProvider();
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          ABIs.WillWe,
          signer
        );

        let transaction;
        if (useMembrane) {
          transaction = await contract.spawnBranchWithMembrane(
            nodeId,
            membershipConditions.map(mc => mc.tokenAddress.toLowerCase()),
            membershipConditions.map(mc => ethers.parseUnits(mc.requiredBalance, 18)),
            cid,
            inflationRate,
            { gasLimit: BigInt(1000000) }
          );
        } else {
          transaction = await contract.spawnBranch(
            nodeId,
            { gasLimit: BigInt(500000) }
          );
        }

        setTransactionHash(transaction.hash);
        return transaction;
      },
      {
        successMessage: "Node created successfully",
        errorMessage: "Failed to create node",
        onSuccess: () => {
          onSuccess?.();
          onClose?.();
        }
      }
    );

    return tx;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useMembrane && (!entityName || characteristics.length === 0)) {
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
      let cid = '';
      if (useMembrane) {
        // Prepare and upload metadata to IPFS
        const metadata = {
          name: entityName,
          characteristics,
          membershipConditions
        };

        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: metadata }),
        });

        if (!response.ok) throw new Error('Failed to upload metadata');
        const { cid: ipfsCid } = await response.json();
        cid = ipfsCid;
      }

      await submitTransaction(cid);
    } catch (err) {
      console.error('Error spawning node:', err);
      setError(err instanceof Error ? err.message : 'Failed to spawn node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={6} align="stretch">
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="use-membrane" mb="0">
            Define Node
          </FormLabel>
          <Switch
            id="use-membrane"
            isChecked={useMembrane}
            onChange={(e) => setUseMembrane(e.target.checked)}
            colorScheme="purple"
          />
        </FormControl>

        {useMembrane && (
          <>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Enter name for the membrane"
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
          </>
        )}

        <FormControl>
          <FormLabel>Inflation Rate (gwei/sec)</FormLabel>
          <NumberInput
            value={inflationRate}
            onChange={(valueString) => setInflationRate(parseInt(valueString))}
            min={1}
            max={100000000}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Rate at which new node shares are generated
          </FormHelperText>
        </FormControl>

        {isLoading && <Progress size="xs" isIndeterminate colorScheme="purple" />}

        {error && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {transactionHash && (
          <Alert status="success">
            <AlertIcon />
            <VStack align="stretch" width="100%" spacing={2}>
              <Text>Node successfully created</Text>
              <Link 
                href={getExplorerLink(chainId, transactionHash)}
                isExternal
                color="purple.500"
                fontSize="sm"
                display="flex"
                alignItems="center"
              >
                View transaction <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </Link>
            </VStack>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="purple"
          isLoading={isLoading}
          loadingText="Creating Node..."
          size="lg"
          width="100%"
          isDisabled={
            (useMembrane && (!entityName || characteristics.length === 0)) ||
            isLoading ||
            inflationRate <= 0
          }
        >
          Create Node
        </Button>
      </VStack>
    </Box>
  );
};

export default SpawnNodeForm;



// File: ./components/Node/EndpointComponent.tsx
import React from 'react';
import { Box, Text, Link, Button, HStack, Alert, AlertIcon } from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import { nodeIdToAddress } from '../../utils/formatters';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';

interface EndpointProps {
  parentNodeId: string;
  chainId: string;
  userAddress?: string;
  nodeData: NodeState;
}

export const EndpointComponent = ({ parentNodeId, chainId, nodeData, userAddress }: EndpointProps) => {
  const [isRedistributing, setIsRedistributing] = useState(false);
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  const endpointAddress = nodeIdToAddress(nodeData.basicInfo[0]);

  const handleRedistribute = async () => {
    if (isRedistributing) return;
    setIsRedistributing(true);

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
            // @ts-ignore
            signer
          );

          return contract.redistributePath(nodeData.basicInfo[0], { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully to endpoint',
          onSuccess: () => {
            toast({
              title: 'Redistribution complete',
              description: 'Value has been redistributed from parent node to endpoint',
              status: 'success',
              duration: 5000,
            });
          }
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to redistribute value',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsRedistributing(false);
    }
  };

  return (
    <Box p={6}>
      <Alert status="info" rounded="md">
        <AlertIcon />
        <Text>
          This is an endpoint corresponding to an action or user of node{' '}
          <Link 
            href={`/nodes/${chainId}/${parentNodeId}`}
            color="blue.500"
            fontWeight="medium"
          >
            {parentNodeId}
          </Link>
        </Text>
      </Alert>

      {userAddress && (
        <HStack spacing={4} justify="center" mt={4}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRedistribute}
            isLoading={isRedistributing}
            loadingText="Redistributing..."
            colorScheme="purple"
            size="md"
          >
            Redistribute
          </Button>
        </HStack>
      )}

      {endpointAddress && (
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
          Endpoint Address: {endpointAddress}
        </Text>
      )}
    </Box>
  );
};

export default EndpointComponent;



// File: ./components/Node/MovementRow.tsx
import React, { useState } from 'react';
import {
  Tr,
  Td,
  Badge,
  HStack,
  Button,
  Text,
  Tooltip,
  Collapse,
  Box,
  IconButton
} from '@chakra-ui/react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { MovementType, SignatureQueueState, LatentMovement } from '../../types/chainData';
import { MovementDetails } from './MovementDetails';

interface MovementRowProps {
  movement: LatentMovement;
  description: string;
  signatures: { current: number; required: number };
  onSign: () => void;
  onExecute: () => void;
}

const MovementRow: React.FC<MovementRowProps> = ({ 
  movement, 
  description, 
  signatures, 
  onSign, 
  onExecute 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStateDisplay = (state: SignatureQueueState) => {
    switch (state) {
      case SignatureQueueState.Valid:
        return { label: 'Valid', color: 'green', icon: <CheckCircle size={14} /> };
      case SignatureQueueState.Initialized:
        return { label: 'Pending Signatures', color: 'yellow', icon: <Clock size={14} /> };
      case SignatureQueueState.Executed:
        return { label: 'Executed', color: 'blue', icon: <CheckCircle size={14} /> };
      case SignatureQueueState.Stale:
        return { label: 'Expired', color: 'red', icon: <XCircle size={14} /> };
      default:
        return { label: 'Unknown', color: 'gray', icon: <AlertTriangle size={14} /> };
    }
  };

  const state = getStateDisplay(movement.signatureQueue.state);

  return (
    <>
      <Tr 
        cursor="pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: 'gray.50' }}
      >
        <Td>
          <HStack>
            <IconButton
              aria-label="Toggle details"
              icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
            <Badge>
              {movement.movement.category === MovementType.AgentMajority 
                ? 'Agent Majority' 
                : 'Value Majority'}
            </Badge>
          </HStack>
        </Td>
        <Td>
          <Tooltip label={movement.movement.descriptionHash}>
            <Text isTruncated maxW="200px">
              {description || 'Loading description...'}
            </Text>
          </Tooltip>
        </Td>
        <Td>
          <HStack>
            <Clock size={14} />
            <Text>
              {new Date(Number(movement.movement.expiresAt) * 1000).toLocaleDateString()}
            </Text>
          </HStack>
        </Td>
        <Td>
          <HStack>
            {state.icon}
            <Badge colorScheme={state.color}>
              {state.label}
            </Badge>
          </HStack>
        </Td>
        <Td>
          <Tooltip label={`${signatures.current} / ${signatures.required} ${movement.movement.category === MovementType.AgentMajority ? 'signatures' : 'voting power'}`}>
            <Text>
              {signatures.current} / {signatures.required}
            </Text>
          </Tooltip>
        </Td>
        <Td>
          <HStack>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSign();
              }}
              isDisabled={movement.signatureQueue.state !== SignatureQueueState.Initialized}
            >
              Sign
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              onClick={(e) => {
                e.stopPropagation();
                onExecute();
              }}
              isDisabled={movement.signatureQueue.state !== SignatureQueueState.Valid}
            >
              Execute
            </Button>
          </HStack>
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={6} p={0}>
          <Collapse in={isExpanded}>
            <Box p={4}>
              <MovementDetails
                movement={movement}
                signatures={signatures}
                description={description}
              />
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  );
};

export default MovementRow;



// File: ./components/Node/SunburstChart.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { NodeState } from '../../types/chainData';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import {getMembraneData} from '../../hooks/useMembraneData';


const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box>Loading...</Box>
});

interface SunburstChartProps {
  nodeData: NodeState;
  chainId: string;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ nodeData, chainId }) => {
  const router = useRouter();

  const transformDataForSunburst = async () => {
    const labels: string[] = [];
    const parents: string[] = [];
    const ids: string[] = [];
    const values: number[] = []; // Changed back to number[] for plotly

    if (!nodeData?.rootPath?.length) {
      console.warn('No root path data available');
      return { labels, parents, ids, values };
    }

    const nodeIds = nodeData.rootPath.slice(1);
    const membanes = await getMembraneData(chainId, nodeIds);
    const membraneDatas = membanes.membraneMetadata;

    // Process all nodes in the path
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) return;

      try {
        const formattedId = nodeId.toLowerCase();
        
        // Get display name - use membrane name if available, otherwise use formatted address
        let displayName : string;
        if (index === 0) {
          const hexAddress = ethers.toBigInt(formattedId).toString(16).padStart(40, '0');
          displayName = `0x${hexAddress.slice(0, 6)}...${hexAddress.slice(-4)}`;
        } else {
          displayName = membraneDatas[index -1]?.name || `Node ${nodeId.slice(-6)}`;
        }
        
        labels.push(displayName);
        ids.push(formattedId);
        
        // Format budget value for the sunburst size
        const budget = nodeData.basicInfo[4];
        const formattedBudget = budget ? Number(ethers.formatUnits(budget, 'gwei')) : 1;
        values.push(formattedBudget);

        if (index === 0) {
          parents.push('');
        } else {
          parents.push(nodeData.rootPath[index - 1].toLowerCase());
        }
      } catch (error) {
        console.error(`Error processing node ID ${nodeId}:`, error);
      }
    }
    
    return { labels, parents, ids, values };
  };

  const handleClick = (event: any) => {
    if (event.points?.[0]) {
      const nodeId = event.points[0].id;
      const nodeIndex = nodeData.rootPath.findIndex(id => 
        id.toLowerCase() === nodeId.toLowerCase()
      );

      if (nodeIndex === 0) {
        // Root token - go to dashboard
        const hexAddress = ethers.toBigInt(nodeId)
          .toString(16)
          .padStart(40, '0');
        router.push(`/dashboard?token=0x${hexAddress.toLowerCase()}`);
      } else {
        // Non-root nodes - go to nodes page
        router.push(`/nodes/${chainId}/${nodeId}`);
      }
    }
  };

  const [sunburstData, setSunburstData] = React.useState<{
    labels: string[];
    parents: string[];
    ids: string[];
    values: number[];
  }>({ labels: [], parents: [], ids: [], values: [] });

  React.useEffect(() => {
    transformDataForSunburst().then((data) => {
      if (data) setSunburstData(data);
    });
  }, [nodeData, chainId]);

  return (
    <Box height="400px" width="100%">
      <Plot
        data={[{
          type: 'sunburst',
          labels: sunburstData.labels,
          parents: sunburstData.parents,
          ids: sunburstData.ids,
          values: sunburstData.values,
          branchvalues: 'total',
          hovertemplate: '%{label}<br>Budget: %{value} PSC<extra></extra>',
          textposition: 'inside'
        }]}
        layout={{
          margin: { l: 0, r: 0, b: 0, t: 0 },
          width: 400,
          height: 400,
          showlegend: false
        }}
        onClick={handleClick}
      />
    </Box>
  );
};

export default SunburstChart;



// File: ./components/Node/ActivitySection.tsx
import React from 'react';
import { Box, Text, VStack, Skeleton, Alert, AlertIcon } from '@chakra-ui/react';
import { SignalHistory } from './SignalHistory';
import { UserSignal } from '../../types/chainData';

interface ActivitySectionProps {
  signals?: UserSignal[];
  selectedTokenColor?: string;
  isLoading?: boolean;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  signals,
  selectedTokenColor,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <VStack spacing={4} w="full">
        <Skeleton height="60px" w="full" />
        <Skeleton height="100px" w="full" />
        <Skeleton height="100px" w="full" />
      </VStack>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Text>No activity recorded yet</Text>
      </Alert>
    );
  }

  return (
    <Box w="full">
      <VStack align="stretch" spacing={6}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Recent Activity
        </Text>
        
        <SignalHistory 
          signals={signals} 
          selectedTokenColor={selectedTokenColor || 'purple.500'}
        />
      </VStack>
    </Box>
  );
};

export default ActivitySection;



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



// File: ./components/Node/SankeyChart.tsx
'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Flex, Input, List, ListItem, VStack, Text, Select } from '@chakra-ui/react';
import { PlotMouseEvent } from 'plotly.js';
import { getMembraneNameFromCID } from '../../utils/ipfs';
import { NodeState } from '../../types/chainData';

interface SankeyChartProps {
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  chainId: string | number;
}

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box w="100%" h="600px" display="flex" alignItems="center" justifyContent="center">Loading chart...</Box>
});

export const SankeyChart: React.FC<SankeyChartProps> = ({
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
  chainId
}) => {
  const router = useRouter();
  const [nodeLabels, setNodeLabels] = useState<string[]>([]);
  const [isLabelsLoading, setIsLabelsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Add labelToId mapping
  const [labelToId, setLabelToId] = useState<Map<string, string>>(new Map());

  // Initialize basic structure with node IDs
  const sankeyStructure = useMemo(() => {
    const labels: string[] = [];
    const source: number[] = [];
    const target: number[] = [];
    const values: number[] = [];
    const nodeMap = new Map<string, number>();

    // First pass - create nodes with temporary labels
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const nodeId = node.basicInfo[0];
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, labels.length);
        labels.push(nodeId); // Remove slice to keep full ID
      }
    });

    // Second pass - create links
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const sourceIdx = nodeMap.get(node.basicInfo[0]);
      if (typeof sourceIdx !== 'number') return;

      node.childrenNodes?.forEach(childId => {
        const targetIdx = nodeMap.get(childId);
        if (typeof targetIdx === 'number') {
          source.push(sourceIdx);
          target.push(targetIdx);
          values.push(nodeValues[childId] || 1);
        }
      });
    });

    return { nodeMap, labels, source, target, values };
  }, [nodes, nodeValues]);

  const formatNodeId = (nodeId: string) => {
    const halfLength = Math.floor(nodeId.length / 2);
    return '_' + nodeId.slice(halfLength);
  };

  // Load membrane names
  useEffect(() => {
    const loadMembraneNames = async () => {
      setIsLabelsLoading(true);
      const newLabels = [...sankeyStructure.labels];
      const newLabelToId = new Map<string, string>();
      
      await Promise.all(
        nodes.map(async (node) => {
          if (node?.basicInfo?.[0] && node.membraneMeta) {
            const idx = sankeyStructure.nodeMap.get(node.basicInfo[0]);
            if (idx !== undefined) {
              const membraneName = await getMembraneNameFromCID(node.membraneMeta);
              if (membraneName) {
                newLabels[idx] = membraneName;
                newLabelToId.set(membraneName, node.basicInfo[0]);
              } else {
                // Format node ID if no membrane name
                const formattedId = formatNodeId(node.basicInfo[0]);
                newLabels[idx] = formattedId;
                newLabelToId.set(formattedId, node.basicInfo[0]);
              }
            }
          }
        })
      );
      
      // Also add ID mappings for non-named nodes
      nodes.forEach(node => {
        if (node?.basicInfo?.[0]) {
          const nodeId = node.basicInfo[0];
          const formattedId = formatNodeId(nodeId);
          newLabelToId.set(formattedId, nodeId);
          
          // Update label if it hasn't been set by membrane name
          const idx = sankeyStructure.nodeMap.get(nodeId);
          if (idx !== undefined && newLabels[idx] === nodeId) {
            newLabels[idx] = formattedId;
          }
        }
      });
      
      setNodeLabels(newLabels);
      setLabelToId(newLabelToId);
      setIsLabelsLoading(false);
    };

    loadMembraneNames();
  }, [nodes, sankeyStructure]);

  const handleNodeClick = useCallback((event: PlotMouseEvent) => {
    const clickedPoint = event.points?.[0];
    if (!clickedPoint) return;

    const label = clickedPoint.label;
    if (label) {
      const nodeId = labelToId.get(label);
      if (nodeId) {
        onNodeSelect(nodeId);
        router.push(`/nodes/${chainId}/${nodeId}`);
      }
    }
  }, [labelToId, onNodeSelect, router, chainId]);

  const handleNodeListClick = useCallback((label: string) => {
    const nodeId = labelToId.get(label);
    if (nodeId) {
      onNodeSelect(nodeId);
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [labelToId, onNodeSelect, router, chainId]);

  const getFilteredAndSortedNodes = () => {
    const filtered = nodeLabels.filter(label => 
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if (sortOrder === "asc") return a.localeCompare(b);
      return b.localeCompare(a);
    });
  };

  if (isLabelsLoading) {
    return <Box>Loading labels...</Box>;
  }

  return (
    <Flex w="100%" h="100%" gap={4}>
      <Box flex="0.85" minH="600px">
        <Plot
          data={[{
            type: 'sankey',
            node: {
              label: nodeLabels,
              color: Array(nodeLabels.length).fill(selectedTokenColor)
            },
            link: {
              source: sankeyStructure.source,
              target: sankeyStructure.target,
              value: sankeyStructure.values
            }
          }]}
          layout={{
            autosize: true,
            height: 600
          }}
          onClick={handleNodeClick}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <VStack flex="0.15" h="600px" p={4} borderLeft="1px" borderColor="gray.200" spacing={4}>
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />
        
        <Select 
          size="sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </Select>

        <List w="100%" overflowY="auto" flex="1">
          {getFilteredAndSortedNodes().map((label, index) => (
            <ListItem 
              key={index}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleNodeListClick(label)}
            >
              <Text>{label}</Text>
            </ListItem>
          ))}
        </List>
      </VStack>
    </Flex>
  );
};



// File: ./components/Node/NodeInfo.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Text,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Badge,
  Skeleton,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { Copy, ChevronRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import SunburstChart from './SunburstChart';
import { nodeIdToAddress } from '../../utils/formatters';
import router from 'next/router';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface NodeInfoProps {
  node: NodeState;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
}

interface NodeMetrics {
  inflation: string;
  budget: string;
  totalValue: string;
  availableShares: string;
  inflow: string;
  value: string;
  memberCount: number;
  membersList: string[];
  userOwnedShares: string;
}

// Add interface for member data
interface MemberData {
  address: string;
  ensName: string | null;
}

const calculateMetrics = (node: NodeState): NodeMetrics => {
  // Per-second rates in gwei, multiply by seconds in a day
  const inflationPerSec = BigInt(node.basicInfo[1] || '0');
  const dailyInflation = inflationPerSec * BigInt(86400);
  
  return {
    inflation: ethers.formatUnits(dailyInflation, 'gwei'),
    budget: ethers.formatUnits(node.basicInfo[4] || '0', 'gwei'),
    totalValue: ethers.formatUnits(node.basicInfo[5] || '0', 'gwei'),
    availableShares: ethers.formatUnits(node.basicInfo[3] || '0', 'gwei'),
    inflow: ethers.formatUnits(inflationPerSec, 'gwei'), // Keep this as per-second rate
    value: ethers.formatUnits(node.basicInfo[4] || '0', 'gwei'),
    memberCount: node.membersOfNode.length,
    membersList: node.membersOfNode,
    userOwnedShares: ethers.formatUnits(node.basicInfo[9] || '0', 'gwei')
  };
};

const NodeInfo: React.FC<NodeInfoProps> = ({ node, chainId, onNodeSelect }) => {
  const [membraneTitle, setMembraneTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId), {
    chainId: Number(chainId),
    name: `${chainId}`,
  });
  const tokenAddress = nodeIdToAddress(node.rootPath[0]);

  const tokenContract = new ethers.Contract(
    tokenAddress,
    ABIs.IERC20,
    provider
  );

  const [memberData, setMemberData] = useState<MemberData[]>([]);

  useEffect(() => {
    const fetchTokenSymbol = async () => {
      if (!node?.rootPath?.[0] || !chainId) return;

      try {
        const code = await provider.getCode(tokenAddress);
        if (code === '0x') {
          setTokenSymbol('NOT A TOKEN');
          return;
        }

        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching token symbol:', error);
        setTokenSymbol('token');
      }
    };

    fetchTokenSymbol();
  }, [node?.rootPath, chainId, tokenAddress, provider]);

  useEffect(() => {
    const fetchMembraneTitle = async () => {
      if (!node.membraneMeta) {
        setIsLoadingTitle(false);
        return;
      }

      try {
        const response = await fetch(`${IPFS_GATEWAY}${node.membraneMeta}`);
        if (!response.ok) throw new Error('Failed to fetch membrane metadata');
        const metadata = await response.json();
        setMembraneTitle(metadata.name || null);
      } catch (error) {
        console.error('Error fetching membrane title:', error);
        setMembraneTitle(null);
      } finally {
        setIsLoadingTitle(false);
      }
    };

    fetchMembraneTitle();
  }, [node.membraneMeta]);

  const formatCurrency = (value: string): string => {
    const number = parseFloat(value);
    if (isNaN(number)) return '0.0000';
    // Format with appropriate precision based on value size
    if (number < 0.0001) {
      return number.toExponential(4);
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
      maximumSignificantDigits: 6
    }).format(number);
  };

  const metrics = useMemo(() => calculateMetrics(node), [node]);

  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(node.basicInfo[0]);
    toast({
      title: 'Node ID copied',
      status: 'success',
      duration: 2000,
    });
  };

  // Add ENS resolution effect
  useEffect(() => {
    const resolveEnsNames = async () => {
      if (!metrics.membersList.length) return;

      try {
        // Use Ethereum mainnet for ENS resolution
        const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));

        const resolvedMembers = await Promise.all(
          metrics.membersList.map(async (address) => {
            try {
              const ensName = await mainnetProvider.lookupAddress(address);
              return {
                address,
                ensName
              };
            } catch (error) {
              console.error(`Error resolving ENS for ${address}:`, error);
              return {
                address,
                ensName: null
              };
            }
          })
        );

        setMemberData(resolvedMembers);
      } catch (error) {
        console.error('Error resolving ENS names:', error);
        // Fallback to addresses only
        setMemberData(metrics.membersList.map(address => ({
          address,
          ensName: null
        })));
      }
    };

    resolveEnsNames();
  }, [metrics.membersList]);

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
    >
      <Box p={4}>
        <HStack spacing={4} align="start" w="full" minH="300px">
          <VStack
            flex="1"
            align="stretch"
            spacing={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            p={4}
          >
            <HStack justify="space-between">
              <Tooltip label="Daily token creation rate for this node" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Inflation</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.inflation)} PSC/day</Text>
            </HStack>
            <HStack justify="space-between">
              <Tooltip label="Amount of tokens held in node's own account" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Budget</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.budget)} PSC</Text>
            </HStack>
            <HStack justify="space-between">
              <Tooltip label="Current per-second inflation rate" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Inflow Rate</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.inflow)} PSC/sec</Text>
            </HStack>
            <HStack justify="space-between">
              <Tooltip label="Current balance available in the node's budget" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Active Shares</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.availableShares)} PSC</Text>
            </HStack>
          </VStack>

          <VStack flex="1" align="stretch" spacing={4}>
            {metrics.membersList.length > 0 && (
              <VStack align="stretch">
                <Text fontSize="sm" color={mutedColor}>Members ({metrics.membersList.length})</Text>
                <Box
                  maxH="125px"
                  overflowY="auto"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={2}
                >
                  {memberData.map((member, index) => (
                    <Text 
                      key={index} 
                      fontSize="xs" 
                      isTruncated 
                      py={1}
                      display="flex"
                      alignItems="center"
                    >
                      {member.ensName || 
                        `${member.address.slice(0, 6)}...${member.address.slice(-4)}`
                      }
                      {member.ensName && (
                        <Text 
                          as="span" 
                          fontSize="xx-small" 
                          color="gray.500" 
                          ml={2}
                        >
                          ({`${member.address.slice(0, 6)}...${member.address.slice(-4)}`})
                        </Text>
                      )}
                    </Text>
                  ))}
                </Box>
              </VStack>
            )}

            {node.childrenNodes.length > 0 && (
              <VStack align="stretch">
                <Text fontSize="sm" color={mutedColor}>Sub-Nodes ({node.childrenNodes.length})</Text>
                <Box
                  maxH="125px"
                  overflowY="auto"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={2}
                >
                  {node.childrenNodes.map((childId, index) => (
                    <Text
                      key={index}
                      fontSize="xs"
                      isTruncated
                      py={1}
                      cursor="pointer"
                      onClick={() => {
                      onNodeSelect?.(childId);
                      router.push(`/nodes/${chainId}/${childId}`);
                      }}
                      _hover={{ color: 'purple.500', textDecoration: 'none' }}>
                      {childId}
                    </Text>
                  ))}
                </Box>
              </VStack>
            )}
          </VStack>

          <Box flex="1">
            <SunburstChart
              nodeData={node}
              chainId={chainId}
            />
          </Box>
        </HStack>
      </Box>
    </Box>
  );
};

export default NodeInfo;



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



// File: ./components/Node/Movements.tsx
import React, { useState, useMemo, Suspense, lazy } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Alert,
  AlertIcon,
  Skeleton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { MovementType, NodeState } from '../../types/chainData';
import { useMovements } from '../../hooks/useMovements';
import { useEndpoints } from '../../hooks/useEndpoints';
import { LazyLoadWrapper } from '../shared/LazyLoadWrapper';
import { ErrorBoundary } from '../shared/ErrorBoundary';

// Lazy load components
const MovementRow = lazy(() => import('./MovementRow'));
const CreateMovementForm = lazy(() => import('./CreateMovementForm'));

interface MovementsProps {
  nodeId: string;
  chainId: string;
  nodeData: NodeState;
}

export const Movements: React.FC<MovementsProps> = ({ nodeId, chainId, nodeData }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const {
    movements,
    descriptions,
    signatures,
    isLoading,
    createMovement,
    signMovement,
    executeMovement
  } = useMovements({ nodeId, chainId });
  
  // Load endpoint data in parallel
  const { endpoints, isLoading: isLoadingEndpoints } = useEndpoints(nodeData, chainId);

  const handleCreateMovement = async (formData: any) => {
    try {
      await createMovement(formData);
      toast({
        title: 'Success',
        description: 'Movement created successfully',
        status: 'success',
        duration: 3000
      });
      onClose();
    } catch (error) {
      console.error('Movement creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create movement',
        status: 'error',
        duration: 5000
      });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="bold">Movements</Text>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={onOpen}
          colorScheme="purple"
          size="sm"
          isLoading={isLoadingEndpoints}
        >
          Create Movement
        </Button>
      </HStack>

      {isLoading ? (
        <VStack spacing={4}>
          <Skeleton height="50px" width="100%" />
          <Skeleton height="50px" width="100%" />
          <Skeleton height="50px" width="100%" />
        </VStack>
      ) : movements.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <Text>No active movements found</Text>
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th>Signatures</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {movements.map((movement) => (
              <LazyLoadWrapper key={movement.movementHash} height="80px">
                <MovementRow
                  movement={movement}
                  description={descriptions[movement.movement.descriptionHash] || ''}
                  signatures={signatures[movement.movementHash] || { current: 0, required: 0 }}
                  onSign={() => signMovement(movement)}
                  onExecute={() => executeMovement(movement)}
                />
              </LazyLoadWrapper>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Movement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <LazyLoadWrapper height="400px">
              <ErrorBoundary>
                <CreateMovementForm
                  nodeData={{
                    ...nodeData,
                    endpoints,
                    isLoadingEndpoints
                  }}
                  onSubmit={handleCreateMovement}
                  onClose={onClose}
                />
              </ErrorBoundary>
            </LazyLoadWrapper>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Movements;



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



// File: ./components/Node/PlotlyChart.tsx
import React, { useEffect, useRef } from 'react';
import { NodeState } from '../../types/chainData';
import { Data } from 'plotly.js';

interface PlotlyChartProps {
  data: NodeState | NodeState[];
  onNodeClick: (nodeId: string) => void;
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, onNodeClick }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPlotly = async () => {
      const Plotly = await import('plotly.js-dist-min');
      if (!chartRef.current) return;

      const nodes = Array.isArray(data) ? data : [data];
      const plotData: Data[] = [{
        type: 'sunburst' as const,
        ids: nodes.map(n => n.basicInfo[0]),
        labels: nodes.map(n => n.basicInfo[0]),
        parents: nodes.map(n => n.rootPath[n.rootPath.length - 2] || ''),
        values: nodes.map(n => parseInt(n.basicInfo[4]) || 1),
        branchvalues: 'total',
        textposition: 'inside'
      }];
      

      const layout = {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        width: chartRef.current.offsetWidth,
        height: 400
      };

      Plotly.newPlot(chartRef.current, plotData, layout);

      chartRef.current.removeEventListener('plotly_click', () => {});
      chartRef.current.addEventListener('plotly_click', (event: any) => {
        const point = event.points[0];
        onNodeClick(point.id);
      });
    };

    loadPlotly();

    return () => {
      if (chartRef.current) {
        // @ts-ignore
        if (chartRef.current._Plotly) {
          // @ts-ignore
          chartRef.current._Plotly.purge(chartRef.current);
        }
      }
    };
  }, [data, onNodeClick]);

  return <div ref={chartRef} />;
};

export default PlotlyChart;



// File: ./components/Node/Chat.tsx
import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

export const Chat = () => {
  return (
    <Box p={6}>
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">Chat</Text>
        <Text>Chat functionality coming soon...</Text>
      </VStack>
    </Box>
  );
};



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
                value={sliderValues[child.nodeId]}
                lastSignal={(child.currentSignal).toString()}
                balance={child.eligibilityPerSecond}
                eligibilityPerSecond={child.eligibilityPerSecond}
                totalInflationPerSecond="0"
                onChange={(v) => handleSliderChange(child.nodeId, v)}
                onChangeEnd={(v) => handleSliderChange(child.nodeId, v)}
                isDisabled={isSubmitting}
                selectedTokenColor="purple.500"
                chainId={chainId}
                totalAllocation={totalAllocation}
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
import React, { memo, useState, useCallback, useEffect } from 'react';
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
  IconButton,
  ButtonGroup,
} from '@chakra-ui/react';
import { Plus, Minus } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useWillWeContract } from '../../../hooks/useWillWeContract';

const STEP_SIZE = 0.1;

const EligibilityImpact = memo(({ 
  impact, 
  inflationRate,
  parentBalance 
}: { 
  impact: string | null;
  inflationRate: string;
  parentBalance: string;
}) => {
  if (!impact) return null;

  const calculateScaledImpact = () => {
    try {
      // Convert all inputs to BigInt for precise calculation
      const impactBN = BigInt(impact);
      const inflationBN = BigInt(inflationRate);
      const SECONDS_PER_DAY = BigInt(86400);
      
      // Calculate daily impact
      // First multiply by seconds per day to get daily rate
      let dailyImpact = impactBN * SECONDS_PER_DAY;
      
      // Convert to display format (18 decimals)
      const displayValue = ethers.formatUnits(dailyImpact, 18);
      return displayValue;
    } catch (error) {
      console.error('Error calculating scaled impact:', error);
      return "0";
    }
  };

  const scaledImpact = calculateScaledImpact();
  const displayValue = parseFloat(scaledImpact).toFixed(4);

  return (
    <Text fontSize="xs" color={parseFloat(displayValue) >= 0 ? "green.500" : "red.500"}>
      Impact: {parseFloat(displayValue) >= 0 ? "+" : ""}
      {displayValue} tokens/day
    </Text>
  );
});

EligibilityImpact.displayName = 'EligibilityImpact';

const SignalSlider = ({
  nodeId,
  parentId,
  value: externalValue,
  lastSignal,
  balance,
  eligibilityPerSecond,
  totalInflationPerSecond,
  onChange,
  onChangeEnd,
  isDisabled,
  selectedTokenColor,
  chainId,
  nodeName,
  totalAllocation
}) => {
  const { user } = usePrivy();
  const contract = useWillWeContract(chainId);
  const [localValue, setLocalValue] = useState(externalValue);
  const [eligibilityImpact, setEligibilityImpact] = useState<string | null>(null);
  const [initialThumbValue, setInitialThumbValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tempTotalAllocation, setTempTotalAllocation] = useState(totalAllocation);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(100, localValue + STEP_SIZE);
    const newTotal = (totalAllocation - localValue + newValue);
    if (newTotal <= 100) {
      setLocalValue(newValue);
      setTempTotalAllocation(newTotal);
      onChange(newValue);
      onChangeEnd(newValue);
    }
  }, [localValue, totalAllocation, onChange, onChangeEnd]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(0, localValue - STEP_SIZE);
    setLocalValue(newValue);
    setTempTotalAllocation(totalAllocation - localValue + newValue);
    onChange(newValue);
    onChangeEnd(newValue);
  }, [localValue, totalAllocation, onChange, onChangeEnd]);

  const calculateEligibilityImpact = useCallback(async (newValue: number) => {
    if (!user?.wallet?.address || !contract) return;
    
    try {
      const newValueBasis = Math.round(newValue * 100);
      const lastSignalBasis = parseInt(lastSignal);

      const [currentEligibility, newEligibility] = await Promise.all([
        contract.calculateUserTargetedPreferenceAmount(
          parentId,
          nodeId,
          lastSignalBasis,
          user.wallet.address
        ),
        contract.calculateUserTargetedPreferenceAmount(
          parentId,
          nodeId,
          newValueBasis,
          user.wallet.address
        )
      ]);

      const impact = newEligibility - currentEligibility;
      setEligibilityImpact(impact.toString());
    } catch (error) {
      console.error('Error calculating eligibility:', error);
      setEligibilityImpact("0");
    }
  }, [nodeId, parentId, lastSignal, user?.wallet?.address, contract]);

  const handleChange = useCallback((v: number) => {
    setLocalValue(v);
    const diff = v - initialThumbValue;
    const newTempTotal = totalAllocation + diff;
    setTempTotalAllocation(newTempTotal);
    onChange(v);
  }, [onChange, initialThumbValue, totalAllocation]);

  const handleChangeEnd = useCallback((v: number) => {
    setLocalValue(v);
    onChange(v);
    onChangeEnd(v);
    calculateEligibilityImpact(v);
  }, [onChange, onChangeEnd, calculateEligibilityImpact]);

  const handleDragStart = () => {
    setInitialThumbValue(localValue);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const calculateRemainingAllocation = () => {
    if (!isDragging) {
      return (100 - totalAllocation).toFixed(1);
    }
    const currentDiff = localValue - initialThumbValue;
    const projectedTotal = totalAllocation + currentDiff;
    return (100 - projectedTotal).toFixed(1);
  };

  return (
    <VStack align="stretch" spacing={2} width="100%" mb={4}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Last Preference: {(parseInt(lastSignal) / 100).toFixed(2)}%
        </Text>
        <ButtonGroup size="sm" spacing={1}>
          <IconButton
            aria-label="Decrease allocation"
            icon={<Minus size={14} />}
            onClick={handleDecrement}
            isDisabled={isDisabled || localValue <= 0}
            colorScheme="gray"
            variant="ghost"
          />
          <IconButton
            aria-label="Increase allocation"
            icon={<Plus size={14} />}
            onClick={handleIncrement}
            isDisabled={isDisabled || tempTotalAllocation >= 100}
            colorScheme="gray"
            variant="ghost"
          />
        </ButtonGroup>
      </HStack>

      <Slider
        value={localValue}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        min={0}
        max={100}
        step={STEP_SIZE}
        isDisabled={isDisabled}
      >
        <SliderTrack bg={`${selectedTokenColor}20`} h="4px">
          <SliderFilledTrack bg={selectedTokenColor} />
        </SliderTrack>
        <Tooltip
          label={
            <VStack spacing={0} align="center">
              <Text>{localValue.toFixed(1)}%</Text>
              <Text
                fontSize="xs"
                color={calculateRemainingAllocation() < "0" ? "red.500" : "white"}
              >
                Remaining: {calculateRemainingAllocation()}%
              </Text>
            </VStack>
          }
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

      <EligibilityImpact 
        impact={eligibilityImpact}
        inflationRate={totalInflationPerSecond}
        parentBalance={balance}
      />
    </VStack>
  );
};

SignalSlider.displayName = 'SignalSlider';

export default memo(SignalSlider);



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



// File: ./components/Node/MyEndpoint.tsx
import React, { useState, useEffect } from 'react';
import { ethers, Provider } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments } from '../../config/deployments';
import { ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  Heading,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Divider,
  Code,
  IconButton,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import { addressToNodeId, formatBalance, nodeIdToAddress } from '../../utils/formatters';
import { Plus, Trash2, Play, Copy, AlertCircle } from 'lucide-react';
import { RefreshCw, Wallet } from 'lucide-react';
import { getEndpointActions, EndpointActionConfig } from '../../config/endpointActions';

interface Call {
  target: string;
  callData: string;
  value: string;
}

interface CurrentCallState extends Call {
  actionType?: string;
  params?: Record<string, any>;
}

interface MyEndpointProps {
  nodeData: NodeState;
  chainId: string;
  onSuccess?: () => void;
}

export const MyEndpoint: React.FC<MyEndpointProps> = ({ 
  nodeData, 
  chainId,
  onSuccess 
}) => {
  const { user } = usePrivy();
  const [calls, setCalls] = useState<Call[]>([]);
  const [currentCall, setCurrentCall] = useState<CurrentCallState>({
    target: '',
    callData: '',
    value: '0',
    actionType: 'tokenTransfer',
    params: {}
  });
  const [executionResult, setExecutionResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [rootTokenBalance, setRootTokenBalance] = useState<string>('0');
  const [isRedistributing, setIsRedistributing] = useState(false);
  const [endpointNodeData, setEndpointNodeData] = useState<NodeState | null>(null);
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();
  const [rootTokenSymbol, setRootTokenSymbol] = useState<string>('');

  // Get endpoint address and membership status from nodeData
  const endpointAddress = nodeData.basicInfo[10];  // endpoint address is at index 10
  const endpointId = endpointAddress && endpointAddress !== ethers.ZeroAddress ? 
    addressToNodeId(endpointAddress) : null;
  const isMember = nodeData.membersOfNode.some(
    member => member.toLowerCase() === user?.wallet?.address?.toLowerCase()
  );
  
  const readProvider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
  const rootTokenAddress = nodeData.rootPath[0] ? nodeIdToAddress(nodeData.rootPath[0]) : null;

  // Use root valuation reserve at index 5 instead of balance
  const endpointBalance = Number(ethers.formatEther(nodeData.basicInfo[2])).toFixed(4);  // Use balance anchor (reserve)

  useEffect(() => {
    const fetchRootTokenBalance = async () => {
      if (!endpointAddress || !rootTokenAddress) return;
      
      try {
        const tokenContract = new ethers.Contract(
          rootTokenAddress,
          ABIs.IERC20,
          readProvider
        );
        
        const balance = await tokenContract.balanceOf(endpointAddress);
        setRootTokenBalance(balance.toString());
      } catch (error) {
        console.error('Error fetching root token balance:', error);
      }
    };

    fetchRootTokenBalance();
  }, [endpointAddress, rootTokenAddress, readProvider]);

  useEffect(() => {
    const fetchEndpointData = async () => {
      if (!endpointAddress || endpointAddress === ethers.ZeroAddress || !endpointId) return;
      
      try {
        const willWeContract = new ethers.Contract(
          deployments.WillWe[chainId.replace('eip155:', '')],
          ABIs.WillWe,
          readProvider
        );

        // Pass the window.ethereum address or zero address as fallback
        const userAddress = window.ethereum?.selectedAddress || ethers.ZeroAddress;
        const data = await willWeContract.getNodeData(endpointId, userAddress);
        setEndpointNodeData(data);
      } catch (error) {
        console.error('Error fetching endpoint data:', error);
      }
    };

    fetchEndpointData();
  }, [endpointAddress, endpointId, chainId, readProvider]);

  useEffect(() => {
    const fetchRootTokenSymbol = async () => {
      if (!rootTokenAddress) return;
      
      try {
        const tokenContract = new ethers.Contract(
          rootTokenAddress,
          ABIs.IERC20,
          readProvider
        );
        
        const symbol = await tokenContract.symbol();
        setRootTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching root token symbol:', error);
        setRootTokenSymbol('tokens');
      }
    };

    fetchRootTokenSymbol();
  }, [rootTokenAddress, readProvider]);

  const deployEndpoint = async () => {
    if (!isMember) {
      toast({
        title: 'Error',
        description: 'You must be a member to create an endpoint',
        status: 'error',
        duration: 5000,
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
          const userAddress = await signer.getAddress();
          
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            // @ts-ignore
            signer
          );
          
          return contract.createEndpointForOwner(nodeData.basicInfo[0], userAddress);
        },
        {
          successMessage: 'Endpoint created successfully',
          onSuccess: () => {
            onSuccess?.();
            toast({
              title: 'Success',
              description: 'Your endpoint has been created',
              status: 'success',
              duration: 5000,
            });
          }
        }
      );
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to create endpoint',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBurnPath = async () => {
    if (isBurning || !rootTokenBalance || !endpointNodeData) return;
    setIsBurning(true);

    try {
      const provider = getEthersProvider();
      const signer = provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      
      const proxyContract = new ethers.Contract(
        endpointAddress,
        ABIs.PowerProxy,
        // @ts-ignore
        signer
      );

      const willWeContract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        readProvider
      );

      // Use endpoint's node data for burn path
      const burnCalldata = willWeContract.interface.encodeFunctionData('burnPath', [
        nodeData.basicInfo[0],
        endpointNodeData.basicInfo[5]
      ]);

      const calls = [{
        target: deployments.WillWe[cleanChainId],
        callData: burnCalldata,
        value: '0'
      }];

      await executeTransaction(
        chainId,
        async () => {
          return proxyContract.tryAggregate(true, calls);
        },
        {
          successMessage: 'Successfully burned tokens through path',
          onSuccess: () => {
            setRootTokenBalance('0');
          }
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsBurning(false);
    }
  };

  const addCall = () => {
    if (!currentCall.target || !currentCall.callData) {
      toast({
        title: 'Invalid call',
        description: 'Target and call data are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setCalls([...calls, currentCall]);
    setCurrentCall({ target: '', callData: '', value: '0' });
  };

  const removeCall = (index: number) => {
    setCalls(calls.filter((_, i) => i !== index));
  };


  const handleRedistribute = async () => {
    if (isRedistributing || !endpointNodeData) return;
    setIsRedistributing(true);
  
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
            signer as unknown as ethers.ContractRunner
          );
  
          return contract.redistributePath(endpointId, { gasLimit: 500000 });
        },
        {
          onSuccess: () => {
            toast({
              title: 'Redistribution complete',
              description: 'Value has been redistributed from parent node to endpoint',
              status: 'success',
              duration: 5000,
            });
          }
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to redistribute value',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsRedistributing(false);
    }
  };

  const executeAggregatedCalls = async () => {
    if (!endpointAddress || calls.length === 0) return;

    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const endpointContract = new ethers.Contract(
            endpointAddress,
            ABIs.PowerProxy,
            // @ts-ignore
            signer
          );

          const formattedCalls = calls.map(call => ({
            target: call.target,
            callData: call.callData,
            value: ethers.parseEther(call.value || '0')
          }));

          return endpointContract.tryAggregate(true, formattedCalls);
        },
        {
          successMessage: 'Calls executed successfully',
          onSuccess: () => {
            setExecutionResult('Execution successful');
            setCalls([]);
          }
        }
      );
    } catch (error) {
      console.error('Error executing calls:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute calls',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If not a member, show membership required message
  if (!isMember) {
    return (
      <Alert 
        status="warning" 
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertCircle size={40} />
        <Text mt={4} fontSize="lg" fontWeight="medium">
          Membership Required
        </Text>
        <Text mt={2}>
          You need to be a member of this node to create and manage an endpoint.
        </Text>
      </Alert>
    );
  }

  // If no endpoint exists, show creation option
  if (!endpointAddress || endpointAddress === ethers.ZeroAddress) {
    return (
      <VStack spacing={6} align="stretch">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">No Endpoint Found</Text>
            <Text fontSize="sm">
              Create an endpoint to execute transactions on behalf of this node.
            </Text>
          </VStack>
        </Alert>

        <Button
          colorScheme="blue"
          onClick={deployEndpoint}
          isLoading={isProcessing}
          loadingText="Creating..."
        >
          Create Endpoint
        </Button>
      </VStack>
    );
  }

  // Main endpoint management interface
  return (
    <VStack spacing={6} align="stretch">
      <Box 
        p={4} 
        borderRadius="md" 
        bg="gray.50" 
        border="1px" 
        borderColor="gray.200"
      >
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.600">Your Endpoint Address</Text>
            <Code fontSize="sm">{endpointAddress}</Code>
          </VStack>
          <IconButton
            aria-label="Copy endpoint address"
            icon={<Copy size={16} />}
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(endpointAddress);
              toast({
                title: 'Copied',
                status: 'success',
                duration: 2000,
              });
            }}
          />
        </HStack>
      </Box>

      <HStack spacing={8} justify="center">
        <Stat>
          <StatLabel>Endpoint Budget</StatLabel>
          <StatNumber>
            {endpointNodeData ? Number(ethers.formatEther(endpointNodeData.basicInfo[5])).toFixed(4) : '0'} {rootTokenSymbol}
          </StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Root Token Balance</StatLabel>
          <StatNumber>{Number(formatBalance(rootTokenBalance)).toFixed(4)} {rootTokenSymbol}</StatNumber>
        </Stat>
      </HStack>

      <HStack justify="center">
        <Button
          leftIcon={<RefreshCw size={16} />}
          onClick={handleRedistribute}
          isLoading={isRedistributing}
          loadingText="Redistributing..."
          colorScheme="purple"
          size="md"
        >
          Redistribute to Endpoint
        </Button>
        
        {endpointNodeData && (
          <Tooltip label={parseFloat(ethers.formatEther(endpointNodeData.basicInfo[5])) <= 0 ? "No budget available to burn" : ""}>
            <Button
              leftIcon={<Wallet size={16} />}
              onClick={handleBurnPath}
              isLoading={isBurning}
              loadingText="Burning..."
              colorScheme="red"
              size="md"
              isDisabled={parseFloat(ethers.formatEther(endpointNodeData.basicInfo[5])) <= 0}
            >
              Withdraw All to Endpoint
            </Button>
          </Tooltip>
        )}
      </HStack>

      <Divider />

      <Box>
        <Heading size="sm" mb={4}>Execute Multiple Calls</Heading>
        
        <VStack spacing={4} mb={6}>
          <FormControl>
            <FormLabel>Action Type</FormLabel>
            <Select 
              value={currentCall.actionType || 'tokenTransfer'}
              onChange={(e) => {
                setCurrentCall({
                  target: '',
                  callData: '',
                  value: '0',
                  actionType: e.target.value,
                  params: {}
                });
              }}
            >
              {rootTokenAddress && getEndpointActions(rootTokenAddress, rootTokenSymbol).map(action => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </Select>
            <FormHelperText>
              {currentCall.actionType && 
                getEndpointActions(rootTokenAddress || '', rootTokenSymbol)[
                  getEndpointActions(rootTokenAddress || '', rootTokenSymbol).findIndex(a => a.id === currentCall.actionType)
                ]?.description
              }
            </FormHelperText>
          </FormControl>

          {currentCall.actionType && getEndpointActions(rootTokenAddress || '', rootTokenSymbol).map(action => {
            if (action.id !== currentCall.actionType) return null;
            
            return (
              <React.Fragment key={action.id}>
                {action.fields.map(field => (
                  <FormControl key={field.name} isRequired={field.required}>
                    <FormLabel>{field.label}</FormLabel>
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={currentCall.params?.[field.name] || ''}
                      onChange={(e) => setCurrentCall({
                        ...currentCall,
                        params: {
                          ...currentCall.params,
                          [field.name]: e.target.value
                        }
                      })}
                      placeholder={field.placeholder}
                    />
                  </FormControl>
                ))}
              </React.Fragment>
            );
          })}

          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              const action = getEndpointActions(rootTokenAddress || '', rootTokenSymbol).find(
                a => a.id === currentCall.actionType
              );
              if (!action) return;
              
              const callData = action.getCallData(currentCall.params || {});
              setCalls([...calls, callData]);
              setCurrentCall({
                target: '',
                callData: '',
                value: '0',
                actionType: currentCall.actionType,
                params: {}
              });
            }}
            colorScheme="blue"
            size="sm"
            isDisabled={!currentCall.actionType}
          >
            Add Call
          </Button>
        </VStack>

        {calls.length > 0 && (
          <Box overflowX="auto">
            <Table size="sm" mb={4}>
              <Thead>
                <Tr>
                  <Th>Target</Th>
                  <Th>Call Data</Th>
                  <Th>Value</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {calls.map((call, index) => (
                  <Tr key={index}>
                    <Td><Code fontSize="xs">{call.target.slice(0, 10)}...</Code></Td>
                    <Td><Code fontSize="xs">{call.callData.slice(0, 10)}...</Code></Td>
                    <Td>{call.value} ETH</Td>
                    <Td>
                      <IconButton
                        aria-label="Remove call"
                        icon={<Trash2 size={14} />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeCall(index)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Button
              leftIcon={<Play size={16} />}
              onClick={executeAggregatedCalls}
              colorScheme="green"
              isLoading={isProcessing}
              loadingText="Executing..."
              isDisabled={calls.length === 0}
            >
              Execute All Calls
            </Button>
          </Box>
        )}

        {executionResult && (
          <Box mt={4}>
            <Heading size="sm" mb={2}>Execution Result</Heading>
            <Code display="block" whiteSpace="pre" p={4} borderRadius="md" bg="gray.50">
              {executionResult}
            </Code>
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default MyEndpoint;



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
// File path: components/TokenOperations/TokenValueOperations.tsx
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



// File: ./components/shared/LazyLoadWrapper.tsx
import React from 'react';
import { Box, Skeleton, VStack } from '@chakra-ui/react';

interface LazyLoadWrapperProps {
  height?: string | number;
  children: React.ReactNode;
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({ 
  height = '400px',
  children 
}) => (
  <React.Suspense
    fallback={
      <VStack spacing={4}>
        <Skeleton height={height} width="100%" borderRadius="md" />
      </VStack>
    }
  >
    {children}
  </React.Suspense>
);



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



// File: ./components/shared/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={4} borderRadius="md" bg="red.50">
          <Text color="red.500">Something went wrong. Please try again.</Text>
          <Button
            mt={2}
            size="sm"
            colorScheme="red"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}



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
import { useToken } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import logoSrc from '../../public/logos/logo.png';

interface PaletteButtonProps {
  cycleColors: () => void;
  contrastingColor: string;
  reverseColor: string;
  className?: string;
}

export const PaletteButton: React.FC<PaletteButtonProps> = ({
  cycleColors,
  contrastingColor,
  reverseColor,
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [baseColor] = useToken('colors', [contrastingColor]);

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
    <Link
      href="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        color: reverseColor,
        backgroundColor: baseColor,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={cycleColors}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <Image 
        src={logoSrc} 
        alt="Logo" 
        width={66} 
        height={66}
        style={{ 
          transform: isHovering ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-in-out',
          filter: 'brightness(0) saturate(100%)',
        }}
      />
    </Link>
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
import { useBalances } from '../../hooks/useBalances';
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
  
  // Fetch balances for top bar using combined hook
  const { 
    balances, 
    protocolBalances,
    isLoading: balancesLoading 
  } = useBalances(
    user?.wallet?.address,
    headerProps?.chainId
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
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading} userAddress={headerProps?.userAddress || ''} chainId={headerProps?.chainId || '' 
            }          />
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
import { SankeyChart } from './Node/SankeyChart';
import { StatsCard } from './Node/StatsCards'; 
import { NodeFilters } from './Node/NodeFilters';
import { NodeActions } from './Node/NodeActions';
import { TokenNameDisplay } from './Token/TokenNameDisplay';
import { useWillWeContract } from '../hooks/useWillWeContract';
import { NodeOperations } from './Node/NodeOperations';

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
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const toast = useToast();
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const willweContract = useWillWeContract(chainId);
  const [totalSupplyValue, setTotalSupplyValue] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const fetchTotalSupply = async () => {
      if (!selectedToken || !willweContract) return;
      try {
        const tokenId = addressToNodeId(selectedToken);
        const supply = await willweContract.totalSupply(tokenId);
        setTotalSupplyValue(supply);
      } catch (error) {
        console.error('Error fetching total supply:', error);
      }
    };

    if (willweContract) {
      fetchTotalSupply();
    }
  }, [selectedToken, willweContract]);

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

    const base = nodes.filter(node => node.rootPath.length === 1);
    const derived = nodes.filter(node => node.rootPath.length > 1);

    const uniqueAddresses = new Set<string>();
    nodes.forEach(node => {
      if (node.membersOfNode) {
        node.membersOfNode.forEach((member: string) => uniqueAddresses.add(member));
      }
    });

    const depth = nodes.reduce((max, node) => {
      return node.rootPath ? Math.max(max, node.rootPath.length) : max;
    }, 0);

    const totalExpensePerSec = nodes.reduce((sum, node) => {
      const expensePerSec = node.basicInfo?.[1] ? BigInt(node.basicInfo[1]) : BigInt(0);
      return sum + expensePerSec;
    }, BigInt(0));
    
    const nodesWithExpense = nodes.filter(node => node.basicInfo?.[1] && BigInt(node.basicInfo[1]) > 0).length;
    const avgExpensePerSecGwei = nodesWithExpense > 0 ? 
      Number(totalExpensePerSec) / nodesWithExpense : 
      0;
    
    const avgExpensePerDay = (avgExpensePerSecGwei * 86400) / 1e9;

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
      h="calc(100vh - 80px)"
      bg="white" 
      rounded="xl" 
      shadow="sm"
      overflow="hidden"
    >
      <Box p={4} borderBottom="1px" borderColor="gray.100">
        <HStack justify="space-between" mb={4}>
          <NodeActions
            onSpawnNode={() => setShowSpawnModal(true)}
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

        <Grid 
          templateColumns="repeat(5, 1fr)"
          gap={3}
          maxW="100%"
          mx="auto"
        >
          <StatsCard
            title="Total Value"
            value={Number(formatBalance(totalSupplyValue)).toFixed(3)}
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
            value={formatBalance(averageExpense.toString())}
            icon={<Wallet size={14} />}
            color="red"
            tooltip="Average expense per node in ETH/day"
            size="sm"
          />
        </Grid>
      </Box>

      <Flex direction="column" flex="1" overflow="hidden">
        <Box px={6} py={4} borderBottom="1px" borderColor="gray.100">
          <NodeFilters
            nodes={nodes}
            onFilterChange={(filteredNodes) => {
              // Implement filtering logic
            }}
          />
        </Box>

        <Box flex="1" overflowY="auto" px={6} py={4} pb={20}>
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
                  No nodes found. Create a new node to get started.
                </Text>

                <Button
  leftIcon={<Plus size={16} />}
  onClick={() => {
    if (!selectedToken) {
      toast({
        title: "Error",
        description: "Invalid root token selected",
        status: "error",
        duration: 5000,
      });
      return;
    }
    setShowSpawnModal(true);
  }}
  colorScheme="purple"
  isLoading={isProcessing}
  isDisabled={!selectedToken || isProcessing || !wallets[0]?.address}
>
  Create Node
</Button>

              </VStack>
            </Box>
          ) : (
            <Box pb={16}>
              <SankeyChart
                nodes={nodes}
                selectedTokenColor={selectedTokenColor}
                onNodeSelect={onNodeSelect}
                nodeValues={nodeValues}
                chainId={chainId}
              />
            </Box>
          )}
        </Box>
      </Flex>

      <NodeOperations
  nodeId={selectedToken}
  chainId={chainId}
  selectedTokenColor={selectedTokenColor}
  userAddress={userAddress}
  onSuccess={() => {
    setShowSpawnModal(false);
    if (onRefresh) onRefresh();
  }}
  initialTab={showSpawnModal ? 'spawn' : null}
  showToolbar={false}
/>
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
import { AlchemyTokenBalance } from '../hooks/useAlchemyBalances';

interface BalanceListProps {
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string; 
  hoverColor: string;
  userAddress: string;
  chainId: string;
  balances: AlchemyTokenBalance[];
  protocolBalances: AlchemyTokenBalance[];
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
              p => p.contractAddress.toLowerCase() === balance.contractAddress.toLowerCase()
            );

            return (
              <Box
                key={balance.contractAddress}
                onClick={() => handleTokenSelect(balance.contractAddress)}
                cursor="pointer"
                transition="all 0.2s"
                borderRadius="md"
                bg={selectedToken === balance.contractAddress ? `${baseColor}10` : 'transparent'}
                border="1px solid"
                borderColor={selectedToken === balance.contractAddress ? baseColor : 'transparent'}
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
                  isSelected={selectedToken === balance.contractAddress}
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
import { AlchemyTokenBalance } from '../hooks/useAlchemyBalances';
import { formatBalance } from '../utils/formatters';

interface TokenBalanceProps {
  balanceItem: AlchemyTokenBalance;
  protocolBalance?: AlchemyTokenBalance | null;
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
      user: balanceItem.formattedBalance || '0.00',
      protocol: protocolBalance?.formattedBalance || '0.00'
    };
  }, [balanceItem.formattedBalance, protocolBalance?.formattedBalance]);

  const percentages = useMemo(() => {
    const userBalance = BigInt(balanceItem.tokenBalance || '0');
    const protocolBal = BigInt(protocolBalance?.tokenBalance || '0');
    const total = userBalance + protocolBal;

    if (total === BigInt(0)) return { user: 0, protocol: 0 };

    const userPercentage = Number((userBalance * BigInt(100)) / total);
    return {
      user: userPercentage,
      protocol: 100 - userPercentage
    };
  }, [balanceItem.tokenBalance, protocolBalance?.tokenBalance]);

  const renderBalance = (balance: string) => {
    const parts = balance.split('.');
    const wholePart = parts[0] || '0';
    const decimalPart = parts[1] || '00';

    return (
      <>
        {wholePart}
        <Text 
          as="span" 
          fontSize={isCompact ? "3xs" : "xs"} 
          color="gray.500"
        >
          .{decimalPart}
        </Text>
      </>
    );
  };

  return (
    <Box position="relative">
      {/* Token Header */}
      <VStack align="start" spacing={isCompact ? 0.5 : 1}>
        <Text 
          fontWeight="medium" 
          fontSize={isCompact ? "xs" : "sm"}
          lineHeight={isCompact ? "1.2" : "normal"}
        >
          {balanceItem.symbol || 'Unknown Token'}
        </Text>
        <Text 
          fontSize={isCompact ? "2xs" : "xs"} 
          color="gray.500"
          lineHeight={isCompact ? "1" : "normal"}
        >
          {balanceItem.name || 'Unknown Name'}
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
              {renderBalance(formattedAmounts.user)}
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
import React, { useState, useEffect, useCallback } from 'react';
import './NodeDetails.module.css';
import {
  Box,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  Text,
  useColorModeValue,
  useDisclosure,
  Badge,
  HStack,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  ButtonGroup,
  IconButton,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { NodeOperations } from './Node/NodeOperations';
import SignalForm from './Node/SignalForm/index';
import NodeInfo from './Node/NodeInfo';
import { SignalHistory } from './Node/SignalHistory';
import { Movements } from './Node/Movements';
import { ActivitySection } from './Node/ActivitySection';
import { Chat } from './Node/Chat';
import { MyEndpoint } from './Node/MyEndpoint';
import { EndpointComponent } from './Node/EndpointComponent';
import { MovementsErrorBoundary } from './Node/MovementsErrorBoundary';

import { 
  Signal, 
  Activity,
  MessageCircle,
  ArrowUpDown,
  Plus,
  ArrowRight,
  GitBranch,
  Monitor,
} from 'lucide-react';
import { nodeIdToAddress } from '../utils/formatters';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  selectedTokenColor: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  selectedTokenColor,
}) => {
  const { user } = usePrivy();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const { data: nodeData, error, isLoading, refetch: fetchNodeData } = useNodeData(cleanChainId, user?.wallet?.address, nodeId);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const permissionsBg = useColorModeValue('gray.50', 'gray.900');
  
  const refetch = useCallback(() => {
    fetchNodeData();
  }, [fetchNodeData]);

  console.log('NodeData:', nodeData);
  // Add check for endpoint
  const isEndpoint = nodeData?.basicInfo && 
    nodeData.rootPath[0].slice(0, 12) !== nodeData.basicInfo[0].slice(0, 12); // root node id

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
      </Alert>
    );
  }

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
      borderRadius="xl"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      maxHeight="calc(100vh - 200px)"
      display="flex"
      flexDirection="column"
      shadow="md"
    >
      <Box 
        borderBottom="1px solid" 
        borderColor={borderColor}
        bg={useColorModeValue('gray.50', 'gray.900')}
        p={6}
        position="sticky"
        top={0}
        zIndex={1}
      >
        <NodeInfo 
          node={nodeData} 
          chainId={chainId}
        />
      </Box>

      {isEndpoint ? (
        <EndpointComponent parentNodeId={nodeData.rootPath[nodeData.rootPath.length - 1]} chainId={chainId} nodeData={nodeData} userAddress={user?.wallet?.address} />
      ) : (
        <>
          <NodeOperations
            nodeId={nodeId}
            chainId={chainId}
            selectedTokenColor={selectedTokenColor}
            userAddress={user?.wallet?.address}
            onSuccess={refetch}
            showToolbar={true}
          />

          <Box flex="1" overflow="auto">
            <Tabs 
              className="tabs"
              sx={{
                '.chakra-tabs__tab-panel': {
                  p: 0
                }
              }}
            >
              <TabList 
                px={6} 
                borderBottomColor={borderColor}
                bg={useColorModeValue('gray.50', 'gray.900')}
              >
                <Tab><HStack spacing={2}><ArrowUpDown size={14} /><Text>Signal</Text></HStack></Tab>
                <Tab><HStack spacing={2}><ArrowRight size={14} /><Text>Moves</Text></HStack></Tab>
                <Tab><HStack spacing={2}><Activity size={14} /><Text>Activity</Text></HStack></Tab>
                <Tab><HStack spacing={2}><MessageCircle size={14} /><Text>Chat</Text></HStack></Tab>
                <Tab><HStack spacing={2}><Monitor size={14} /><Text>Endpoint</Text></HStack></Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={6}>
                  <VStack align="stretch" spacing={8} maxW="900px" mx="auto">
                    {nodeData?.basicInfo && (
                      <>
                        <SignalForm
                          chainId={cleanChainId}
                          nodeId={nodeId}
                          parentNodeData={nodeData}
                          onSuccess={refetch}
                        />
                       
                      </>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel p={6}>
                  <Box maxW="900px" mx="auto">
                    <MovementsErrorBoundary>
                      <Movements nodeId={nodeData.basicInfo[0]} chainId={chainId} nodeData={nodeData} />
                    </MovementsErrorBoundary>
                  </Box>
                </TabPanel>

                <TabPanel p={6}>
                  <Box maxW="900px" mx="auto">
                  <ActivitySection 
                    signals={nodeData.signals} 
                    selectedTokenColor={selectedTokenColor}
                  />
                  </Box>
                </TabPanel>

                <TabPanel p={6}>
                  <Box maxW="900px" mx="auto">
                    <Chat />
                  </Box>
                </TabPanel>

                <TabPanel p={6}>
                  <Box maxW="900px" mx="auto">
                    <MyEndpoint nodeData={nodeData} chainId={chainId} onSuccess={refetch} />
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {user?.wallet?.address && (
            <Box 
              p={6} 
              bg={permissionsBg}
              borderTop="1px solid"
              borderColor={borderColor}
              position="sticky"
              bottom={0}
              zIndex={1}
            >
              <HStack justify="space-between" align="center">
                <Text fontWeight="medium">Permissions</Text>
                <HStack spacing={2} wrap="wrap">
                  <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Mint</Badge>
                  <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Burn</Badge>
                  <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Signal</Badge>
                  <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Redistribute</Badge>
                </HStack>
              </HStack>
            </Box>
          )}
        </>
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
    case '1': // Mainnet
      url = process.env.NEXT_PUBLIC_RPC_URL_MAINNET;
      break;
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
import { Network } from 'alchemy-sdk';

type Deployments = { [key: string]: { [key: string]: string } };
type ABIKP = { [key: string]: InterfaceAbi };

  
// === Final Deployment Addresses ===
//   Will: 0x86545166F8B92294b62bD49F0d3134464548d5e9
//   Membrane: 0xcDF21745a4f1f3222545399079eB8a3A6f0160Fc
//   Execution: 0x0A25367D29bC3d30c4C2c7b30C04a3019eDfc08E
//   WillWe: 0xbe69f14c4B5e90dD89F9B0Ed881d3BBA180a843D
//   Kibern Director: 0x0000000000000000000000000000000000000000
//   Control [0,1]: 0x534C773EA14342669FE05f7d9287a518830f8DE1 0x0000000000000000000000000000000000000000
//   Will Price in ETH: 1000000000

export const deployments: Deployments = {
    "RVI": {
        "84532": "0xDf17125350200A99E5c06E5E2b053fc61Be7E6ae",
        "11155420": "0x86545166F8B92294b62bD49F0d3134464548d5e9",
        "167009" : "0x82Cb12995f4861D317a6C7C72917BE3C243222a6"
    },
    "Membrane": {
        "84532": "0xaBbd15F9eD0cab9D174b5e9878E9f104a993B41f",
        "11155420": "0xcDF21745a4f1f3222545399079eB8a3A6f0160Fc",
        "167009" : "0x07BC28304C6D0fb926F25B1917c1F64BeF1587Ac"
    },
    "Execution": {
        "84532": "0x3D52a3A5D12505B148a46B5D69887320Fc756F96",
        "11155420": "0x0A25367D29bC3d30c4C2c7b30C04a3019eDfc08E",
        "167009" : "0x3d7A9839935333C7C373e1338C12B593F78318D3"
    },
    "WillWe": {
        "84532": "0x8f45bEe4c58C7Bb74CDa9fBD40aD86429Dba3E41",
        "11155420": "0xbe69f14c4B5e90dD89F9B0Ed881d3BBA180a843D",
        "167009" : "0x88AB91578876A7fC13F9F4A9332083Ddfb062049"
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

export function getAlchemyNetwork(chainId: number | string): Network {
    // Convert chainId to string for consistent comparison
    const chain = String(chainId);
    
    switch (chain) {
      // Ethereum
      case '1':
        return Network.ETH_MAINNET;
      case '11155111':
        return Network.ETH_SEPOLIA;
      // Polygon
      case '137':
        return Network.MATIC_MAINNET;
      // Arbitrum
      case '42161':
        return Network.ARB_MAINNET;
      case '421614':
        return Network.ARB_SEPOLIA;
      // Optimism
      case '10':
        return Network.OPT_MAINNET;
      case '11155420':
        return Network.OPT_SEPOLIA;
      // Base
      case '8453':
        return Network.BASE_MAINNET;
      case '84532':
        return Network.BASE_SEPOLIA;
      // Default to mainnet if chain is not supported
      default:
        return Network.ETH_MAINNET;
    }
}


export const ABIs: ABIKP = {
    "WillWe" : [
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
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
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
                            "type": "string[11]",
                            "internalType": "string[11]"
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
                            "name": "movementEndpoints",
                            "type": "address[]",
                            "internalType": "address[]"
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
                            "type": "string[11]",
                            "internalType": "string[11]"
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
                            "name": "movementEndpoints",
                            "type": "address[]",
                            "internalType": "address[]"
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
                            "type": "string[11]",
                            "internalType": "string[11]"
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
                            "name": "movementEndpoints",
                            "type": "address[]",
                            "internalType": "address[]"
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
                                    "name": "description",
                                    "type": "string",
                                    "internalType": "string"
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
                    "name": "",
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
            "name": "options",
            "inputs": [
                {
                    "name": "NodeXUserXValue",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "valueAtTime",
                    "type": "uint256",
                    "internalType": "uint256"
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
                },
                {
                    "name": "inflationRate_",
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
                    "name": "description",
                    "type": "string",
                    "internalType": "string"
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
                    "name": "description",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
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
            "name": "Endpoint",
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
            "name": "Overreach",
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
            "name": "SignalOverflow",
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
            "name": "createInitWillWeEndpoint",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
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
            "name": "getLatentMovements",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "latentMovements",
                    "type": "tuple[]",
                    "internalType": "struct LatentMovement[]",
                    "components": [
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
                                    "name": "description",
                                    "type": "string",
                                    "internalType": "string"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "signatureQueue",
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
                                            "name": "description",
                                            "type": "string",
                                            "internalType": "string"
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
                    ]
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
                                    "name": "description",
                                    "type": "string",
                                    "internalType": "string"
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
                            "name": "description",
                            "type": "string",
                            "internalType": "string"
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
                            "name": "description",
                            "type": "string",
                            "internalType": "string"
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
            "name": "lastSalt",
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
                    "name": "description",
                    "type": "string",
                    "internalType": "string"
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
                            "name": "description",
                            "type": "string",
                            "internalType": "string"
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
            "name": "OnlyWillWe",
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
                        },
                        {
                            "name": "createdAt",
                            "type": "uint256",
                            "internalType": "uint256"
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
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "DOMAIN_SEPARATOR",
            "inputs": [],
            "outputs": [
                {
                    "name": "result",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
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
                    "name": "result",
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
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
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
            "name": "crosschainBurn",
            "inputs": [
                {
                    "name": "_from",
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
            "name": "crosschainMint",
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
                }
            ],
            "outputs": [],
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
            "name": "lastBlockSupply",
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
            "name": "lastPrice",
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
            "name": "lastPriceBlock",
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
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "nonces",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
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
            "name": "permit",
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
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "deadline",
                    "type": "uint256",
                    "internalType": "uint256"
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
                    "name": "_interfaceId",
                    "type": "bytes4",
                    "internalType": "bytes4"
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
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [],
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
            "type": "function",
            "name": "version",
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
            "name": "CrosschainBurn",
            "inputs": [
                {
                    "name": "from",
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
                    "name": "sender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "CrosschainMint",
            "inputs": [
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
                    "name": "sender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PriceUpdated",
            "inputs": [
                {
                    "name": "newPrice",
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
            "name": "WillBurned",
            "inputs": [
                {
                    "name": "from",
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
                    "name": "ethReturned",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WillDeconstructBurned",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "willAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "ethAmount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WillMinted",
            "inputs": [
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
                    "name": "ethValue",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AllowanceOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AllowanceUnderflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnRefundF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficentBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientAllowance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientValue",
            "inputs": [
                {
                    "name": "required",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "provided",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ]
        },
        {
            "type": "error",
            "name": "InvalidPermit",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PayCallF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Permit2AllowanceIsFixedAtInfinity",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PermitExpired",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Reentrant",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TotalSupplyOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferFailedFor",
            "inputs": [
                {
                    "name": "failingToken",
                    "type": "address",
                    "internalType": "address"
                }
            ]
        },
        {
            "type": "error",
            "name": "Unauthorized",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ValueMismatch",
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
                },
                {
                    "name": "consensusType_",
                    "type": "uint8",
                    "internalType": "uint8"
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
            "name": "allowedAuthType",
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
                        },
                        {
                            "name": "value",
                            "type": "uint256",
                            "internalType": "uint256"
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



// File: ./config/endpointActions.ts
import { ethers } from 'ethers';
import { ABIs } from './contracts';

interface ActionField {
  name: string;
  label: string;
  type: 'text' | 'number';
  placeholder: string;
  required?: boolean;
}

export interface EndpointActionConfig {
  id: string;
  label: string;
  description: string;
  fields: ActionField[];
  getCallData: (params: Record<string, any>, rootTokenAddress: string) => {
    target: string;
    callData: string;
    value: string;
  };
}

export const getEndpointActions = (rootTokenAddress: string, tokenSymbol: string): EndpointActionConfig[] => [
  {
    id: 'tokenTransfer',
    label: `Transfer ${tokenSymbol}`,
    description: `Transfer ${tokenSymbol} tokens to another address`,
    fields: [
      {
        name: 'to',
        label: 'Recipient Address',
        type: 'text',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '0.0',
        required: true
      }
    ],
    getCallData: (params) => {
      // If we don't have both required params, or if rootTokenAddress is invalid, return empty calldata
      if (!params.to || !params.amount || !rootTokenAddress?.startsWith('0x')) {
        return {
          target: rootTokenAddress,
          callData: '0x',
          value: '0'
        };
      }

      try {
        const contract = new ethers.Contract(rootTokenAddress, ABIs.IERC20);
        // Handle empty amount as 0
        const amount = params.amount?.trim() ? ethers.parseEther(params.amount) : BigInt(0);
        
        return {
          target: rootTokenAddress,
          callData: contract.interface.encodeFunctionData('transfer', [params.to, amount]),
          value: '0'
        };
      } catch (error) {
        console.error('Error generating token transfer calldata:', error);
        return {
          target: rootTokenAddress,
          callData: '0x',
          value: '0'
        };
      }
    }
  },
  {
    id: 'customCall',
    label: 'Custom Call',
    description: 'Execute a custom contract call',
    fields: [
      {
        name: 'target',
        label: 'Target Contract',
        type: 'text',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'calldata',
        label: 'Call Data',
        type: 'text',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'value',
        label: 'ETH Value',
        type: 'number',
        placeholder: '0.0'
      }
    ],
    getCallData: (params) => {
      const value = params.value || '0';
      return {
        target: params.target || ethers.ZeroAddress,
        callData: params.calldata && params.calldata.length >= 10 ? params.calldata : '0x',
        value: value
      };
    }
  }
];



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
import { useAlchemyBalances, AlchemyTokenBalance } from './useAlchemyBalances';
import { useWillBalances } from './useWillBalances';

interface UseBalancesResult {
  balances: AlchemyTokenBalance[];
  protocolBalances: AlchemyTokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBalances(
  userAddress: string | undefined,
  chainId: string | undefined
): UseBalancesResult {
  const alchemyBalancesResult = useAlchemyBalances(userAddress, chainId);
  const balances = alchemyBalancesResult.balances;
  const isBalancesLoading = alchemyBalancesResult.isLoading;
  const balancesError = alchemyBalancesResult.error;

  const {
    willBalanceItems: protocolBalances,
    isLoading: isProtocolBalancesLoading,
    error: protocolBalancesError,
  } = useWillBalances(chainId || '');

  const isLoading = isBalancesLoading || isProtocolBalancesLoading;
  const error = balancesError || protocolBalancesError;
  const refetch = useCallback(() => {
    alchemyBalancesResult.refetch();
    useWillBalances(chainId || '').refetch();
  }, [alchemyBalancesResult, useWillBalances, chainId]);

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
  userBalances: AlchemyTokenBalance[],
  protocolBalances: AlchemyTokenBalance[]
): AlchemyTokenBalance[] {
  const mergedBalances = [...userBalances];
  
  protocolBalances.forEach(protocolBalance => {
    const existingIndex = mergedBalances.findIndex(
      balance => balance.contractAddress === protocolBalance.contractAddress
    );
    
    if (existingIndex === -1) {
      mergedBalances.push(protocolBalance);
    }
  });
  
  return mergedBalances.sort((a: AlchemyTokenBalance, b: AlchemyTokenBalance) => {
    // Convert balance strings to BigInt for proper comparison
    const aUserBalance = BigInt(a.tokenBalance || '0');
    const bUserBalance = BigInt(b.tokenBalance || '0');
    
    const aProtocolBalance = BigInt(
      protocolBalances.find(p => p.contractAddress === a.contractAddress)?.tokenBalance || '0'
    );
    
    const bProtocolBalance = BigInt(
      protocolBalances.find(p => p.contractAddress === b.contractAddress)?.tokenBalance || '0'
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



// File: ./hooks/useMovementForm.ts
import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { FormState, MovementFormValidation, DEFAULT_FORM_STATE } from '../types/movements';
import { getEndpointActions } from '../config/endpointActions';

interface UseMovementFormResult {
  formData: FormState;
  validation: MovementFormValidation;
  isSubmitting: boolean;
  handleInputChange: (field: keyof FormState, value: string) => void;
  handleEndpointChange: (endpoint: string, authType: number) => void;
  handleActionChange: (actionId: string, params?: Record<string, any>) => void;
  handleSubmit: (onSubmit: (data: FormState) => Promise<void>) => Promise<void>;
  getActionFields: () => any[];
  isValid: boolean;
}

export const useMovementForm = (rootTokenAddress: string, tokenSymbol: string): UseMovementFormResult => {
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [validation, setValidation] = useState<MovementFormValidation>({
    target: true,
    calldata: true,
    description: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof FormState, value: string): boolean => {
    switch (name) {
      case 'target':
        return ethers.isAddress(value);
      case 'calldata':
        return value.startsWith('0x') && value.length >= 10;
      case 'description':
        return value.length >= 10;
      default:
        return true;
    }
  }, []);

  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidation(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  }, [validateField]);

  const handleEndpointChange = useCallback((endpoint: string, authType: number) => {
    setFormData(prev => ({
      ...prev,
      endpoint,
      type: authType
    }));
  }, []);

  const actionOptions = useMemo(() => 
    getEndpointActions(rootTokenAddress, tokenSymbol),
    [rootTokenAddress, tokenSymbol]
  );

  const handleActionChange = useCallback((actionId: string, params?: Record<string, any>) => {
    const action = actionOptions.find(a => a.id === actionId);
    if (!action) return;

    const callData = action.getCallData(params || {}, rootTokenAddress);
    setFormData(prev => ({
      ...prev,
      actionType: actionId,
      target: callData.target,
      calldata: callData.callData,
      value: callData.value,
      params
    }));
  }, [actionOptions, rootTokenAddress]);

  const getActionFields = useCallback(() => {
    const action = actionOptions.find(a => a.id === formData.actionType);
    return action ? action.fields : [];
  }, [actionOptions, formData.actionType]);

  const handleSubmit = async (onSubmit: (data: FormState) => Promise<void>) => {
    const newValidation = {
      target: validateField('target', formData.target),
      calldata: validateField('calldata', formData.calldata),
      description: validateField('description', formData.description)
    };
    setValidation(newValidation);

    if (!Object.values(newValidation).every(Boolean)) {
      throw new Error('Please check the form for errors');
    }

    setIsSubmitting(true);
    try {
      // First upload description to IPFS
    
        const metadata = {
          title: formData.description,
          description: formData.description,
        };



        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: metadata }),
        });

  
        if (!response.ok) throw new Error('Failed to upload metadata');
        const { cid } = await response.json();
        console.log("uploadDescription, cid:", cid);


      
      // Get call data from selected action
      const action = actionOptions.find(a => a.id === formData.actionType);
      if (!action) throw new Error('Invalid action type');
      
      const callData = action.getCallData(formData.params || {}, rootTokenAddress);

      // Submit with processed data
      await onSubmit({
        ...formData,
        ...callData,
        cid
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = useMemo(() => 
    Object.values(validation).every(Boolean) && 
    formData.description.length >= 10 &&
    (formData.actionType === 'customCall' ? 
      (ethers.isAddress(formData.target) && formData.calldata.startsWith('0x')) : 
      Object.values(formData.params || {}).every(Boolean)
    ),
    [validation, formData]
  );

  return {
    formData,
    validation,
    isSubmitting,
    handleInputChange,
    handleEndpointChange,
    handleActionChange,
    handleSubmit,
    getActionFields,
    isValid
  };
};



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
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { NodeState, MembraneMetadata } from '../types/chainData';

async function fetchIPFSData(cid: string): Promise<MembraneMetadata | null> {
  const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (!response.ok) throw new Error('IPFS fetch failed');
    const data = await response.json();
    return {
      name: data?.name || '',
      id: data?.id || '',
      characteristics: Array.isArray(data?.characteristics) ? data.characteristics : [],
      membershipConditions: Array.isArray(data?.membershipConditions) ? data.membershipConditions : []
    };
  } catch (error) {
    console.error(`Error fetching IPFS data for CID ${cid}:`, error);
    return null;
  }
}

export async function getMembraneData(chainId: string, nodeIds: string[] = []) {
  if (!chainId || !nodeIds?.length) {
    return {
      membraneMetadata: [],
      getMembraneName: (id: string) => id
    };
  }

  try {
    const cleanChainId = chainId.replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    const willweContract = new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      provider
    );

    const nodesData: NodeState[] = await willweContract.getNodes(nodeIds) || [];
    console.log('Nodes data:', nodesData);
    
    const cids = nodesData.map((node: any) => 
      node && node.membraneMeta ? node.membraneMeta : null
    ).filter(Boolean);

    const membraneDataPromises = cids.map(cid => fetchIPFSData(cid));
    const membraneResults = await Promise.all(membraneDataPromises);
    console.log('Membrane metadata:', membraneResults);
    
    const membraneMetadata: MembraneMetadata[] = membraneResults
      .filter(Boolean)
      .map(data => ({
        name: data?.name || '',
        id: data?.id || '',
        characteristics: data?.characteristics || [],
        membershipConditions: data?.membershipConditions || []
      }));

    const getMembraneName = (id: string): string => {
      if (!membraneMetadata?.length) return id;
      const membrane = membraneMetadata.find(m => m?.id === id);
      return membrane?.name || id;
    };

    return { membraneMetadata, getMembraneName };
  } catch (err) {
    console.error('Error loading membrane metadata:', err);
    return {
      membraneMetadata: [],
      getMembraneName: (id: string) => id
    };
  }
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



// File: ./hooks/getNodeStates.ts
import { useState, useEffect, useCallback } from 'react';
import { NodeState } from '../types/chainData';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

interface UseNodeStatesResult {
    nodeStates: (NodeState | null)[];
    isLoading: boolean;
    errors: (Error | null)[];
    refetch: () => Promise<void>;
}

export function useNodeStates(
    chainId: string | undefined,
    nodeIds: string[] | undefined
): UseNodeStatesResult {
    const [nodeStates, setNodeStates] = useState<(NodeState | null)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<(Error | null)[]>([]);

    const fetchNodeStates = useCallback(async () => {
        if (!chainId || !nodeIds?.length) {
            setNodeStates([]);
            setErrors([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            // Filter out nodeIds that start with '0x'
            const validNodeIds = nodeIds.filter(nodeId => !nodeId.startsWith('0x'));
            
            // Initialize provider and contract
            const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
            const contract = new ethers.Contract(deployments[chainId].address, ABIs.nodeContract, provider);

            // Call the contract's getNodes function
            const result = await contract.getNodes(validNodeIds);
            
            // Transform the result into NodeState array
            const states = validNodeIds.map((_, index) => ({
                // Map contract response to NodeState structure
                // Adjust according to your contract's return structure
                ...result[index]
            }));

            setNodeStates(states);
            setErrors(states.map(() => null));
        } catch (error) {
            setErrors(nodeIds.map(() => error as Error));
            setNodeStates(nodeIds.map(() => null));
        } finally {
            setIsLoading(false);
        }
    }, [chainId, nodeIds]);

    useEffect(() => {
        fetchNodeStates();
    }, [fetchNodeStates]);

    return {
        nodeStates,
        isLoading,
        errors,
        refetch: fetchNodeStates
    };
}

export default useNodeStates;



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



// File: ./hooks/useEndpoints.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getRPCUrl } from '../config/contracts';
import { MovementType } from '../types/chainData';

interface EndpointData {
  address: string;
  authType: MovementType;
  balance: string;
  isActive: boolean;
}

interface UseEndpointsState {
  endpoints: Record<string, EndpointData>;
  isLoading: boolean;
  error: string | null;
}

export const useEndpoints = (nodeData: any, chainId: string) => {
  const [state, setState] = useState<UseEndpointsState>({
    endpoints: {},
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchEndpointData = async () => {
      if (!nodeData?.movementEndpoints?.length) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
        const endpointData: Record<string, EndpointData> = {};

        await Promise.all(
          nodeData.movementEndpoints.map(async (endpoint: string) => {
            const code = await provider.getCode(endpoint);
            const balance = await provider.getBalance(endpoint);
            
            endpointData[endpoint] = {
              address: endpoint,
              authType: nodeData.childrenNodes.includes(endpoint) ? 
                MovementType.AgentMajority : 
                MovementType.EnergeticMajority,
              balance: balance.toString(),
              isActive: code !== '0x'
            };
          })
        );

        setState({
          endpoints: endpointData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load endpoint data'
        }));
      }
    };

    fetchEndpointData();
  }, [nodeData?.movementEndpoints, nodeData?.childrenNodes, chainId]);

  return state;
};



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
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { NodeState } from '../types/chainData';

interface UseNodeDataResult {
  data: NodeState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useNodeData(
  chainId: string | undefined,
  userAddress: string | undefined, 
  nodeIdOrAddress: string | undefined,
  isRootNode: boolean = false
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

    // If we don't have a userAddress, use zero address instead of returning early
    const addressToUse = userAddress || ethers.ZeroAddress;

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

      let formattedId: string;
      if (isRootNode) {
        formattedId = ethers.toBigInt(nodeIdOrAddress).toString();
      } else {
        formattedId = nodeIdOrAddress;
      }

      console.log('Fetching node data:', {
        chainId: cleanChainId,
        nodeIdOrAddress,
        formattedId,
        userAddress: addressToUse,
        isRootNode,
        contractAddress
      });

      const nodeData = await contract.getNodeData(formattedId, addressToUse);

      console.log('Node data received:', nodeData);

      if (!nodeData?.basicInfo) {
        throw new Error('Invalid node data received');
      }

      // Transform data
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

    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeIdOrAddress, userAddress, isRootNode]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when userAddress becomes available
  useEffect(() => {
    if (userAddress) {
      fetchData();
    }
  }, [userAddress, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

export default useNodeData;



// File: ./hooks/useMovements.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { MovementType, SignatureQueueState, LatentMovement } from '../types/chainData';

interface UseMovementsProps {
  nodeId: string;
  chainId: string;
}

interface UseMovementsState {
  movements: LatentMovement[];
  descriptions: Record<string, string>;
  signatures: Record<string, { current: number; required: number }>;
  endpointAuthTypes: Record<string, number>;
  isLoading: boolean;
}

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];

const MOVEMENT_TYPE = [
  { name: 'category', type: 'uint8' },
  { name: 'initiatior', type: 'address' },
  { name: 'exeAccount', type: 'address' },
  { name: 'viaNode', type: 'uint256' },
  { name: 'expiresAt', type: 'uint256' },
  { name: 'descriptionHash', type: 'bytes32' },
  { name: 'executedPayload', type: 'bytes' }
];

// Add utility function to convert CID to bytes32
const cidToBytes32 = (cid: string): string => {
  // Convert CID to bytes32 format
  const bytes = ethers.toUtf8Bytes(cid);
  const hash = ethers.keccak256(bytes);
  return hash;
};

export const useMovements = ({ nodeId, chainId }: UseMovementsProps) => {
  const [state, setState] = useState<UseMovementsState>({
    movements: [],
    descriptions: {},
    signatures: {},
    endpointAuthTypes: {},
    isLoading: true
  });

  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const cleanChainId = chainId.replace('eip155:', '');

  // Fetch all data in parallel
  const fetchMovementData = useCallback(async () => {
    if (!nodeId || !chainId) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
      const executionContract = new ethers.Contract(
        deployments.Execution[cleanChainId],
        ABIs.Execution,
        provider
      );

      // Fetch movements
      const rawMovements = await executionContract.getLatentMovements(nodeId);
      const processedMovements = rawMovements
        .map(processMovementData)
        .filter(m => m.signatureQueue.state !== SignatureQueueState.Stale);

      // Fetch descriptions and signatures in parallel
      const [descriptions, signatureDetails] = await Promise.all([
        // Get descriptions
        Promise.all(processedMovements.map(async (movement) => {
          try {
            const description = await fetchMovementDescription(movement.movement.descriptionHash);
            return { hash: movement.movement.descriptionHash, description };
          } catch (error) {
            console.error('Error fetching description:', error);
            return { hash: movement.movement.descriptionHash, description: 'Failed to load description' };
          }
        })),
        // Get signature counts
        Promise.all(processedMovements.map(async (movement) => {
          try {
            const willWeContract = new ethers.Contract(
              deployments.WillWe[cleanChainId],
              ABIs.WillWe,
              provider
            );

            let currentPower = 0;
            let requiredPower = 0;

            // Calculate current power based on movement type
            for (const signer of movement.signatureQueue.Signers) {
              if (signer === ethers.ZeroAddress) continue;

              if (movement.movement.category === MovementType.EnergeticMajority) {
                const balance = await willWeContract.balanceOf(signer, movement.movement.viaNode);
                currentPower += Number(balance);
              } else {
                currentPower += 1;
              }
            }

            // Calculate required power
            if (movement.movement.category === MovementType.EnergeticMajority) {
              const totalSupply = await willWeContract.totalSupply(movement.movement.viaNode);
              requiredPower = Math.floor(Number(totalSupply) / 2) + 1;
            } else {
              const members = await willWeContract.allMembersOf(movement.movement.viaNode);
              requiredPower = Math.floor(members.length / 2) + 1;
            }

            return { 
              hash: movement.movementHash,
              signatures: { current: currentPower, required: requiredPower }
            };
          } catch (error) {
            console.error('Error calculating signatures:', error);
            return { 
              hash: movement.movementHash,
              signatures: { current: 0, required: 0 }
            };
          }
        }))
      ]);

      // Build state updates
      const descriptionMap: Record<string, string> = {};
      descriptions.forEach(({ hash, description }) => {
        descriptionMap[hash] = description;
      });

      const signatureMap: Record<string, { current: number; required: number }> = {};
      signatureDetails.forEach(({ hash, signatures }) => {
        signatureMap[hash] = signatures;
      });

      setState(prev => ({
        ...prev,
        movements: processedMovements,
        descriptions: descriptionMap,
        signatures: signatureMap,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching movement data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [nodeId, chainId, cleanChainId]);

  // Effect for initial fetch and cleanup
  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      fetchMovementData();
    }

    return () => {
      mounted = false;
    };
  }, [fetchMovementData]);

  // Create movement with proper EIP-712 typing
  const createMovement = async (formData: any) => {
    try {
      // Upload description to IPFS via Filebase
      const descriptionMetadata = {
        description: formData.description,
        timestamp: Date.now()
      };

      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: descriptionMetadata }),
      });

      if (!response.ok) throw new Error('Failed to upload metadata');
      const { cid } = await response.json();

      console.log("uploadDescription, descriptionHash:", { cid });

      // Convert CID to bytes32
      const descriptionHash = cidToBytes32(cid);

      // Create the Call struct array for executedPayload
      const calls = [{
        target: formData.target,
        callData: formData.calldata,
        value: ethers.parseEther(formData.value || '0')
      }];

      // Encode the calls array according to the contract's Call struct
      const executedPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        [{
          type: 'tuple[]',
          components: [
            { name: 'target', type: 'address' },
            { name: 'callData', type: 'bytes' },
            { name: 'value', type: 'uint256' }
          ]
        }],
        [calls]
      );

      return await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            // @ts-ignore
            signer
          );
          
          return contract.startMovement(
            formData.type,
            nodeId,
            formData.expiryDays,
            formData.endpoint === 'new' ? ethers.ZeroAddress : formData.endpoint,
            descriptionHash, // Now using bytes32 hash
            executedPayload
          );
        },
        {
          successMessage: 'Movement created successfully',
          onSuccess: fetchMovementData
        }
      );
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  };

  // Sign movement with EIP-712
  const signMovement = async (movement: LatentMovement) => {
    const provider = await getEthersProvider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // EIP-712 domain
    const domain = {
      name: 'WillWe',
      version: '1',
      chainId: Number(cleanChainId),
      verifyingContract: deployments.Execution[cleanChainId]
    };

    // Prepare the data to be signed
    const message = {
      category: movement.movement.category,
      initiatior: movement.movement.initiatior,
      exeAccount: movement.movement.exeAccount,
      viaNode: movement.movement.viaNode,
      expiresAt: movement.movement.expiresAt,
      descriptionHash: movement.movement.descriptionHash,
      executedPayload: movement.movement.executedPayload
    };

    // Sign using EIP-712
    const signature = await signer.signTypedData(domain, { Movement: MOVEMENT_TYPE }, message);

    return await executeTransaction(
      chainId,
      async () => {
        const contract = new ethers.Contract(
          deployments.WillWe[cleanChainId],
          ABIs.WillWe,
          signer
        );

        return contract.submitSignatures(
          movement.movementHash,
          [address],
          [signature]
        );
      },
      {
        successMessage: 'Movement signed successfully',
        onSuccess: fetchMovementData
      }
    );
  };

  const executeMovement = async (movement: LatentMovement) => {
    return await executeTransaction(
      chainId,
      async () => {
        const provider = await getEthersProvider();
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          deployments.WillWe[cleanChainId],
          ABIs.WillWe,
          signer
        );

        return contract.executeQueue(movement.movementHash);
      },
      {
        successMessage: 'Movement executed successfully',
        onSuccess: fetchMovementData
      }
    );
  };

  // Process movement data with proper EIP-712 hashing
  const processMovementData = (rawMovement: any): LatentMovement => {
    const movement = {
      category: Number(rawMovement.movement.category),
      initiatior: rawMovement.movement.initiatior.toString(),
      exeAccount: rawMovement.movement.exeAccount.toString(),
      viaNode: rawMovement.movement.viaNode.toString(),
      expiresAt: rawMovement.movement.expiresAt.toString(),
      descriptionHash: rawMovement.movement.descriptionHash.toString(),
      executedPayload: rawMovement.movement.executedPayload.toString()
    };

    const domain = {
      name: 'WillWe',
      version: '1',
      chainId: Number(cleanChainId),
      verifyingContract: deployments.Execution[cleanChainId]
    };

    // Calculate EIP-712 hash using ethers v6 syntax
    const movementHash = ethers.TypedDataEncoder.hash(
      domain,
      { Movement: MOVEMENT_TYPE },
      movement
    );

    return {
      movement,
      movementHash,
      signatureQueue: {
        state: Number(rawMovement.signatureQueue.state),
        Action: rawMovement.signatureQueue.Action,
        Signers: Array.isArray(rawMovement.signatureQueue.Signers) 
          ? rawMovement.signatureQueue.Signers.map((s: any) => s.toString())
          : [],
        Sigs: Array.isArray(rawMovement.signatureQueue.Sigs)
          ? rawMovement.signatureQueue.Sigs.map((s: any) => s.toString())
          : []
      }
    };
  };

  // Also update the fetchMovementDescription function (if it exists) to handle bytes32
  const fetchMovementDescription = async (descriptionHash: string): Promise<string> => {
    try {
      // Implement your logic to fetch the description from IPFS using the hash
      const response = await fetch(`/api/get-ipfs-data?hash=${descriptionHash}`);
      if (!response.ok) throw new Error('Failed to fetch description');
      const data = await response.json();
      return data.description;
    } catch (error) {
      console.error('Error fetching description:', error);
      return 'Failed to load description';
    }
  };

  return {
    ...state,
    createMovement,
    signMovement,
    executeMovement,
    refreshMovements: fetchMovementData
  };
};



// File: ./hooks/useAlchemyBalances.ts
import { useState, useEffect } from 'react';
import { Alchemy } from "alchemy-sdk";
import { getAlchemyNetwork } from '../config/deployments';

// New type to replace the Covalent BalanceItem
export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string | null;
  // Metadata fields
  name: string;
  symbol: string;
  decimals: number | null;
  logo?: string | null;
  // Formatted balance in human readable form
  formattedBalance: string;
}

export interface UseAlchemyBalancesResult {
  balances: AlchemyTokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}



const alchemyConfig = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
};

export const useAlchemyBalances = (
  address: string | undefined,
  chainId: string | undefined
): UseAlchemyBalancesResult => {
  const [balances, setBalances] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = async () => {
    if (!address || !chainId) {
      setBalances([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const alchemy = new Alchemy({
        ...alchemyConfig,
        network: getAlchemyNetwork(chainId)
      });

      // Get token balances
      const response = await alchemy.core.getTokenBalances(address);

      // Filter out zero balances
      const nonZeroBalances = response.tokenBalances.filter(
        token => token.tokenBalance !== "0"
      );

      // Fetch metadata and format balances
      const formattedBalances = await Promise.all(
        nonZeroBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );

          // Calculate human readable balance
          const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals ?? 18);
          const formattedBalance = balance.toFixed(2);

          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals: metadata.decimals,
            logo: metadata.logo,
            formattedBalance
          };
        })
      );

      setBalances(formattedBalances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address, chainId]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances
  };
};

export default useAlchemyBalances;



// File: ./hooks/useTransaction.ts
import { useState } from 'react';
import { Contract } from 'ethers';

interface TransactionParams {
  contract: Contract;
  method: string;
  args: any[];
  onSuccess?: () => void;
}

export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);

  const executeTransaction = async ({ 
    contract, 
    method, 
    args, 
    onSuccess 
  }: TransactionParams) => {
    setIsLoading(true);
    try {
      const tx = await contract[method](...args);
      await tx.wait();
      onSuccess?.();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeTransaction, isLoading };
};



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
import { Alchemy } from 'alchemy-sdk';
import { AlchemyTokenBalance } from './useAlchemyBalances';
import { getAlchemyNetwork } from '../config/deployments';
import { deployments } from '../config/deployments';

export function useWillBalances(chainId: string) {
  const [willBalanceItems, setWillBalanceItems] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
        network: getAlchemyNetwork(chainId)
      });

      const response = await alchemy.core.getTokenBalances(deployments.WillWe[chainId]);
      const nonZeroBalances = response.tokenBalances.filter(
        token => token.tokenBalance !== "0"
      );

      const formattedBalances = await Promise.all(
        nonZeroBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals);
          
          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals: metadata.decimals,
            logo: metadata.logo,
            formattedBalance: balance.toFixed(2)
          };
        })
      );

      setWillBalanceItems(formattedBalances);
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
  calculateUserTargetedPreferenceAmount: (
    childId: string,
    parentId: string,
    signal: number,
    user: string
  ) => Promise<bigint>;
  getNodeData: (nodeId: string) => Promise<NodeState>;
  getNodes: (nodeIds: string[]) => Promise<NodeState[]>;
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
      options?: TransactionOptions
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

      let toastId: string | number | undefined;

      try {
        const provider = await getEthersProvider();
        if (!provider) {
          throw new Error('Provider not available');
        }

        // Show pending toast
        toastId = toast({
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        // Execute transaction
        const tx = await transactionFn();
        setCurrentHash(tx.hash);

        // Update toast to processing
        if (toastId) {
          toast.update(toastId, {
            title: 'Processing',
            description: 'Transaction is being processed',
            status: 'loading',
          });
        }

        // Wait for confirmation
        const receipt = await provider.waitForTransaction(tx.hash, 1);

        // Close pending toast
        if (toastId) {
          toast.close(toastId);
        }

        if (receipt && receipt.status === 1) {
          // Success
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
        // Close pending toast if exists
        if (toastId) {
          toast.close(toastId);
        }

        console.error('Transaction error:', error);
        let errorMessage = 'Transaction failed';
        
        if (error instanceof Error) {
          if (error.message.includes('rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else if (error.message.includes('gas required exceeds allowance')) {
            errorMessage = 'Transaction would exceed gas limit';
          } else {
            errorMessage = error.message;
          }
        }

        setError(error instanceof Error ? error : new Error(errorMessage));
        
        toast({
          title: 'Error',
          description: options?.errorMessage || errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsTransacting(false);
        setCurrentHash(null);
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
import {MembraneMetadata} from '../types/chainData';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

export const fetchIPFSMetadata = async (cid: string): Promise<MembraneMetadata> => {
  try {
    // Using IPFS gateway to fetch metadata
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
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

export const getMembraneNameFromCID = async (cid: string): Promise<string> => {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (response.ok) {
      console.log(`Fetched membrane metadata for CID ${cid}:`, response);
      const metadata = await response.json();
      console.log('Metadata name:', metadata.name);
      return metadata.name;
    }
  } catch (err) {
    console.error(`Error fetching membrane metadata for CID ${cid}:`, err);
  }
  return '';
};

interface BatchFetchResult<T> {
  cid: string;
  data: T;
  success: boolean;
  error?: string;
}

export const batchFetchIPFS = async <T>(
  cids: string[],
  fetchFn: (cid: string) => Promise<T>
): Promise<BatchFetchResult<T>[]> => {
  const uniqueCids = Array.from(new Set(cids));

  const fetchPromises = uniqueCids.map(async (cid): Promise<BatchFetchResult<T>> => {
    try {
      const data = await fetchFn(cid);
      return {
        cid,
        data,
        success: true
      };
    } catch (error) {
      return {
        cid,
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  return Promise.all(fetchPromises);
};

export const batchGetMembraneData = (cids: string[]): Promise<BatchFetchResult<MembraneMetadata>[]> => {
  return batchFetchIPFS(cids, fetchIPFSMetadata);
};

export const batchGetMembraneNames = (cids: string[]): Promise<BatchFetchResult<string>[]> => {
  return batchFetchIPFS(cids, getMembraneNameFromCID);
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
    if (!address || address === ethers.ZeroAddress) {
      throw new Error('Empty or zero address');
    }
    if (!isHexString(address)) {
      throw new Error('Invalid address format');
    }
    // Remove '0x' prefix and convert to decimal string
    const nodeId = BigInt(address).toString();
    return nodeId;
  } catch (error) {
    console.error('Error converting address to node ID:', error);
    throw error; // Propagate the specific error
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



// File: ./types/movements.ts
import { MovementType } from './chainData';
import { ethers } from 'ethers';

interface CIDObject {
  cid: string;
}

export interface FormState {
  type: MovementType;
  description: string | CIDObject;
  expiryDays: number;
  endpoint: string;
  target: string;
  calldata: string;
  value: string;
  actionType?: string;
  params?: {
    [key: string]: string | number | { cid: string };
  };
}

export interface EndpointOption {
  value: string;
  label: string;
  authType: MovementType;
  balance?: string;
  isDisabled?: boolean;
}

export interface MovementFormValidation {
  target: boolean;
  calldata: boolean;
  description: boolean;
  [key: string]: boolean; // Allow dynamic field validation
}

export interface MovementFormProps {
  nodeData: any;
  onSubmit: (data: FormState) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<FormState>;
}

export const DEFAULT_FORM_STATE: FormState = {
  type: MovementType.AgentMajority,
  description: '', // Will be updated to CID object when uploaded
  expiryDays: 7,
  endpoint: 'new',
  target: '',  // Leave empty initially
  calldata: '0x',
  value: '0',
  actionType: 'customCall',
  params: {
    to: '',    // Initialize empty recipient for token transfers
    amount: '0', // Initialize zero amount for token transfers
    target: '', // Initialize empty target for custom calls
    calldata: '0x', // Initialize empty calldata for custom calls
    value: '0'  // Initialize zero value for custom calls
  }
};



export const validateFormField = (name: keyof FormState | string, value: string): boolean => {
  // Handle empty values appropriately
  if (!value) {
    if (name === 'value' || name === 'amount') return true; // These default to 0
    return true; // Allow empty during editing
  }

  // Basic validations for common fields
  switch (name) {
    case 'target':
    case 'to':
      return /^0x[a-fA-F0-9]{40}$/.test(value);
    case 'calldata':
      return /^0x([a-fA-F0-9]{8,})?$/.test(value); // Allow empty or valid calldata
    case 'value':
    case 'amount':
      return !isNaN(Number(value));
    case 'description':
      return value.length >= 10;
    default:
      return true;
  }
};

export const validateFormForSubmission = (formData: FormState): Record<string, boolean> => {
  const baseValidation = {
    description: typeof formData.description === 'string' && formData.description.length >= 10,
    value: true // Always valid as it defaults to '0'
  };

  if (formData.actionType === 'tokenTransfer') {
    return {
      ...baseValidation,
      target: true, // Token transfer target is always valid (root token)
      calldata: true, // Calldata is generated automatically
      to: formData.params?.to ? /^0x[a-fA-F0-9]{40}$/.test(formData.params.to) : false
    };
  }

  // Custom call validation
  return {
    ...baseValidation,
    target: /^0x[a-fA-F0-9]{40}$/.test(formData.target),
    calldata: /^0x([a-fA-F0-9]{8,})?$/.test(formData.calldata)
  };
};

// Add hex string validation helper
export const isHexString = (value: string): boolean => {
  return /^0x[0-9a-fA-F]*$/.test(value);
};



// File: ./types/chainData.ts
export interface NodeBasicInfo {
  nodeId: string;                    
  inflation: string;                 
  balanceAnchor: string;            
  balanceBudget: string;            
  rootValuationBudget: string;      
  rootValuationReserve: string;     
  membraneId: string;               
  eligibilityPerSec: string;        
  lastRedistribution: string;       
  balanceOfUser: string;            
  endpointOfUserForNode: string;    
}

export interface UserSignal {
  MembraneInflation: [string, string][];
  lastRedistSignal: string[];           
}

export interface MembraneMetadata {
  name: string;
  id: string;
  description?: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
  }[];
  createdAt: string;
}

export interface NodeState {
  basicInfo: [
    nodeId: string,
    inflation: string,
    reserve: string, 
    budget: string,
    rootValuationBudget: string,
    rootValuationReserve: string,
    membraneId: string,
    eligibilityPerSec: string,
    lastRedistributionTime: string,
    balanceOfUser: string,
    endpointOfUserForNode: string
  ];
  membraneMeta: string;          
  membersOfNode: string[];       
  childrenNodes: string[];
  movementEndpoints: string[];       
  rootPath: string[];            
  signals: UserSignal[];         
}

//  /// @notice returns a node's data given its identifier
//     /// @notice basicInfo: [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, (balance of user), balanceOfUser, childParentEligibilityPerSec, lastParentRedistribution]
//     /// @param nodeId node identifier
//     /// @dev for eth_call
//     function getNodeData(uint256 nodeId) private view returns (NodeState memory NodeData) {
//       /// Node identifier
//       NodeData.basicInfo[0] = nodeId.toString();
//       /// Current inflation rate per second
//       NodeData.basicInfo[1] = inflSec[nodeId][0].toString();
//       /// Reserve balance - amount of tokens held in parent's reserve
//       NodeData.basicInfo[2] = balanceOf(toAddress(nodeId), parentOf[nodeId]).toString();
//       /// Budget balance - amount of tokens held in node's own account
//       NodeData.basicInfo[3] = balanceOf(toAddress(nodeId), nodeId).toString();
//       /// Root valuation of node's budget (denominated in root token)
//       NodeData.basicInfo[4] = (asRootValuation(nodeId, balanceOf(toAddress(nodeId), nodeId))).toString();
//       /// Root valuation of node's reserve (denominated in root token)
//       NodeData.basicInfo[5] = (asRootValuation(nodeId, balanceOf(toAddress(nodeId), parentOf[nodeId]))).toString();
//       /// Active membrane identifier
//       NodeData.basicInfo[6] = (inUseMembraneId[nodeId][0]).toString();
//       /// Redistribution eligibility rate from parent per second in root valuation
//       NodeData.basicInfo[7] = (
//           asRootValuation(options[keccak256(abi.encodePacked(nodeId, parentOf[nodeId]))][0], parentOf[nodeId])
//       ).toString();

//       /// Timestamp of last redistribution
//       NodeData.basicInfo[8] = inflSec[nodeId][2].toString();
//       /// Balance of user
//       /// basicInfo[9];
//       /// Endpoint of user for node if any
//       /// basicInfo[10];

//       /// Membrane Metadata CID
//       NodeData.membraneMeta = M.getMembraneById(inUseMembraneId[nodeId][0]).meta;
//       /// Array of member addresses
//       NodeData.membersOfNode = members[nodeId];

//       NodeData.movementEndpoints = members[toID(executionAddress) + nodeId];
//       /// Array of direct children node IDs
//       NodeData.childrenNodes = uintArrayToStringArray(childrenOf[nodeId]);
//       /// Path from root token to node ID (ancestors)
//       NodeData.rootPath = uintArrayToStringArray(getFidPath(nodeId));
//   }

//   function getNodes(uint256[] memory nodeIds) external view returns (NodeState[] memory nodes) {
//       nodes = new NodeState[](nodeIds.length);
//       for (uint256 i = 0; i < nodeIds.length; i++) {
//           nodes[i] = getNodeData(nodeIds[i]);
//       }
//   }

//   ///
//   function getAllNodesForRoot(address rootAddress, address userIfAny)
//       external
//       view
//       returns (NodeState[] memory nodes)
//   {
//       uint256 rootId = toID(rootAddress);
//       nodes = new NodeState[](members[rootId].length);
//       for (uint256 i = 0; i < members[rootId].length; i++) {
//           nodes[i] = getNodeData(toID(members[rootId][i]), userIfAny);
//       }
//   }

//   /// @notice Returns the array containing signal info for each child node in given originator and parent context
//   /// @param signalOrigin address of originator
//   /// @param parentNodeId node id for which originator has expressed
//   function getUserNodeSignals(address signalOrigin, uint256 parentNodeId)
//       external
//       view
//       returns (uint256[2][] memory UserNodeSignals)
//   {
//       uint256[] memory childNodes = childrenOf[parentNodeId];
//       UserNodeSignals = new uint256[2][](childNodes.length);

//       for (uint256 i = 0; i < childNodes.length; i++) {
//           // Include the signalOrigin (user's address) in the signalKey
//           bytes32 userTargetedPreference = keccak256(abi.encodePacked(signalOrigin, parentNodeId, childNodes[i]));

//           // Store the signal value and the timestamp (assuming options[userKey] structure)
//           UserNodeSignals[i][0] = options[userTargetedPreference][0]; // Signal value
//           UserNodeSignals[i][1] = options[userTargetedPreference][1]; // Last updated timestamp
//       }

//       return UserNodeSignals;
//   }

//   function getNodeData(uint256 nodeId, address user) public view returns (NodeState memory nodeData) {
//       nodeData = getNodeData(nodeId);
//       if (user == address(0)) return nodeData;
//       nodeData.basicInfo[9] = balanceOf(user, nodeId).toString();
//       uint256 userEndpointId = toID(user) + nodeId;
//       if (members[userEndpointId].length > 0) {
//           nodeData.basicInfo[10] = Strings.toHexString(members[userEndpointId][0]);
//       }
//       nodeData.signals = new UserSignal[](1);
//       nodeData.signals[0].MembraneInflation = new string[2][](childrenOf[nodeId].length);
//       nodeData.signals[0].lastRedistSignal = new string[](childrenOf[nodeId].length);

//       for (uint256 i = 0; i < childrenOf[nodeId].length; i++) {
//           nodeData.signals[0].MembraneInflation[i][1] = inflSec[nodeId][0].toString();

//           bytes32 userKey = keccak256(abi.encodePacked(user, nodeId, childrenOf[nodeId][i]));
//           nodeData.signals[0].lastRedistSignal[i] = options[userKey][0].toString();
//       }
//   }


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

export interface TransformedNodeData {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
  ancestors: string[];
}

export interface NodeStats {
  totalValue: string;
  dailyGrowth: string;
  memberCount: number;
  childCount: number;
  pathDepth: number;
}

export interface MembraneState {
  tokens: string[];
  balances: string[];
  meta: string;
  createdAt: string;
}

export interface NodeQueryResponse {
  data: NodeState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface NodeOperationParams {
  nodeId: string;
  chainId: string;
  options?: {
    gasLimit?: number;
    gasPrice?: string;
  };
}

export interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

// Movement and governance types
export enum MovementType {
  Revert = 0,
  AgentMajority = 1,
  EnergeticMajority = 2
}

export enum SignatureQueueState {
  None = 0,
  Initialized = 1,
  Valid = 2,
  Executed = 3,
  Stale = 4
}

export interface Call {
  target: string;
  callData: string;
  value: string;
}

export interface Movement {
  category: MovementType;
  initiatior: string;
  exeAccount: string;
  viaNode: string;
  expiresAt: string;
  descriptionHash: string;
  executedPayload: string;
}

export interface SignatureQueue {
  state: SignatureQueueState;
  Action: Movement;
  Signers: string[];
  Sigs: string[];
  exeSig: string;
}

export interface LatentMovement {
  movement: Movement;
  movementHash: string; // This is derived from the movement data
  signatureQueue: SignatureQueue;
}

export interface IPFSMetadata {
  description: string;
  timestamp: number;
}

export interface MovementDescription {
  description: string;
  timestamp: number;
}

export interface MovementSignatureStatus {
  current: number;
  required: number;
  hasUserSigned: boolean;
}

///////////////////////////////////////////
// Type guard functions
///////////////////////////////////////////
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    Array.isArray(data?.basicInfo) &&
    data.basicInfo.length === 11 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals)
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

export const transformNodeData = (nodeData: NodeState): NodeBasicInfo => {
  return {
    nodeId: nodeData.basicInfo[0],
    inflation: nodeData.basicInfo[1],
    balanceAnchor: nodeData.basicInfo[2],
    balanceBudget: nodeData.basicInfo[3],
    rootValuationBudget: nodeData.basicInfo[4],
    rootValuationReserve: nodeData.basicInfo[5],
    membraneId: nodeData.basicInfo[6],
    eligibilityPerSec: nodeData.basicInfo[7],
    lastRedistribution: nodeData.basicInfo[8],
    balanceOfUser: nodeData.basicInfo[9],
    endpointOfUserForNode: nodeData.basicInfo[10]
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

export const fetchIPFSMetadata = async (cid: string): Promise<MembraneMetadata> => {
export const fetchIPFSMetadata = async (cid: string): Promise<MembraneMetadata> => {
  try {
    // Using IPFS gateway to fetch metadata
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
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

export const getMembraneNameFromCID = async (cid: string): Promise<string> => {
export const getMembraneNameFromCID = async (cid: string): Promise<string> => {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (response.ok) {
      console.log(`Fetched membrane metadata for CID ${cid}:`, response);
      const metadata = await response.json();
      console.log('Metadata name:', metadata.name);
      return metadata.name;
    }
  } catch (err) {
    console.error(`Error fetching membrane metadata for CID ${cid}:`, err);
  }
  return '';
};

export const batchFetchIPFS = async <T>(
export const batchFetchIPFS = async <T>(
  cids: string[],
  fetchFn: (cid: string) => Promise<T>
): Promise<BatchFetchResult<T>[]> => {
  const uniqueCids = Array.from(new Set(cids));

  const fetchPromises = uniqueCids.map(async (cid): Promise<BatchFetchResult<T>> => {
    try {
      const data = await fetchFn(cid);
      return {
        cid,
        data,
        success: true
      };
    } catch (error) {
      return {
        cid,
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  return Promise.all(fetchPromises);
};

export const batchGetMembraneData = (cids: string[]): Promise<BatchFetchResult<MembraneMetadata>[]> => {
export const batchGetMembraneData = (cids: string[]): Promise<BatchFetchResult<MembraneMetadata>[]> => {
  return batchFetchIPFS(cids, fetchIPFSMetadata);
};

export const batchGetMembraneNames = (cids: string[]): Promise<BatchFetchResult<string>[]> => {
export const batchGetMembraneNames = (cids: string[]): Promise<BatchFetchResult<string>[]> => {
  return batchFetchIPFS(cids, getMembraneNameFromCID);
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
    if (!address || address === ethers.ZeroAddress) {
      throw new Error('Empty or zero address');
    }
    if (!isHexString(address)) {
      throw new Error('Invalid address format');
    }
    // Remove '0x' prefix and convert to decimal string
    const nodeId = BigInt(address).toString();
    return nodeId;
  } catch (error) {
    console.error('Error converting address to node ID:', error);
    throw error; // Propagate the specific error
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

export interface FormState {
export interface FormState {
  type: MovementType;
  description: string | CIDObject;
  expiryDays: number;
  endpoint: string;
  target: string;
  calldata: string;
  value: string;
  actionType?: string;
  params?: {
    [key: string]: string | number | { cid: string };
  };
}

export interface EndpointOption {
export interface EndpointOption {
  value: string;
  label: string;
  authType: MovementType;
  balance?: string;
  isDisabled?: boolean;
}

export interface MovementFormValidation {
export interface MovementFormValidation {
  target: boolean;
  calldata: boolean;
  description: boolean;
  [key: string]: boolean; // Allow dynamic field validation
}

export interface MovementFormProps {
export interface MovementFormProps {
  nodeData: any;
  onSubmit: (data: FormState) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<FormState>;
}

export const DEFAULT_FORM_STATE: FormState = {
export const DEFAULT_FORM_STATE: FormState = {
  type: MovementType.AgentMajority,
  description: '', // Will be updated to CID object when uploaded
  expiryDays: 7,
  endpoint: 'new',
  target: '',  // Leave empty initially
  calldata: '0x',
  value: '0',
  actionType: 'customCall',
  params: {
    to: '',    // Initialize empty recipient for token transfers
    amount: '0', // Initialize zero amount for token transfers
    target: '', // Initialize empty target for custom calls
    calldata: '0x', // Initialize empty calldata for custom calls
    value: '0'  // Initialize zero value for custom calls
  }
};

export const validateFormField = (name: keyof FormState | string, value: string): boolean => {
export const validateFormField = (name: keyof FormState | string, value: string): boolean => {
  // Handle empty values appropriately
  if (!value) {
    if (name === 'value' || name === 'amount') return true; // These default to 0
    return true; // Allow empty during editing
  }

  // Basic validations for common fields
  switch (name) {
    case 'target':
    case 'to':
      return /^0x[a-fA-F0-9]{40}$/.test(value);
    case 'calldata':
      return /^0x([a-fA-F0-9]{8,})?$/.test(value); // Allow empty or valid calldata
    case 'value':
    case 'amount':
      return !isNaN(Number(value));
    case 'description':
      return value.length >= 10;
    default:
      return true;
  }
};

export const validateFormForSubmission = (formData: FormState): Record<string, boolean> => {
export const validateFormForSubmission = (formData: FormState): Record<string, boolean> => {
  const baseValidation = {
    description: typeof formData.description === 'string' && formData.description.length >= 10,
    value: true // Always valid as it defaults to '0'
  };

  if (formData.actionType === 'tokenTransfer') {
    return {
      ...baseValidation,
      target: true, // Token transfer target is always valid (root token)
      calldata: true, // Calldata is generated automatically
      to: formData.params?.to ? /^0x[a-fA-F0-9]{40}$/.test(formData.params.to) : false
    };
  }

  // Custom call validation
  return {
    ...baseValidation,
    target: /^0x[a-fA-F0-9]{40}$/.test(formData.target),
    calldata: /^0x([a-fA-F0-9]{8,})?$/.test(formData.calldata)
  };
};

export const isHexString = (value: string): boolean => {
export const isHexString = (value: string): boolean => {
  return /^0x[0-9a-fA-F]*$/.test(value);
};

export interface NodeBasicInfo {
export interface NodeBasicInfo {
  nodeId: string;                    
  inflation: string;                 
  balanceAnchor: string;            
  balanceBudget: string;            
  rootValuationBudget: string;      
  rootValuationReserve: string;     
  membraneId: string;               
  eligibilityPerSec: string;        
  lastRedistribution: string;       
  balanceOfUser: string;            
  endpointOfUserForNode: string;    
}

export interface UserSignal {
export interface UserSignal {
  MembraneInflation: [string, string][];
  lastRedistSignal: string[];           
}

export interface MembraneMetadata {
export interface MembraneMetadata {
  name: string;
  id: string;
  description?: string;
  characteristics: MembraneCharacteristic[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
  }[];
  createdAt: string;
}

export interface NodeState {
export interface NodeState {
  basicInfo: [
    nodeId: string,
    inflation: string,
    reserve: string, 
    budget: string,
    rootValuationBudget: string,
    rootValuationReserve: string,
    membraneId: string,
    eligibilityPerSec: string,
    lastRedistributionTime: string,
    balanceOfUser: string,
    endpointOfUserForNode: string
  ];
  membraneMeta: string;          
  membersOfNode: string[];       
  childrenNodes: string[];
  movementEndpoints: string[];       
  rootPath: string[];            
  signals: UserSignal[];         
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

export interface TransformedNodeData {
export interface TransformedNodeData {
  basicInfo: NodeBasicInfo;
  membraneMeta: string;
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
  ancestors: string[];
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
  createdAt: string;
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

export interface Call {
export interface Call {
  target: string;
  callData: string;
  value: string;
}

export interface Movement {
export interface Movement {
  category: MovementType;
  initiatior: string;
  exeAccount: string;
  viaNode: string;
  expiresAt: string;
  descriptionHash: string;
  executedPayload: string;
}

export interface SignatureQueue {
export interface SignatureQueue {
  state: SignatureQueueState;
  Action: Movement;
  Signers: string[];
  Sigs: string[];
  exeSig: string;
}

export interface LatentMovement {
export interface LatentMovement {
  movement: Movement;
  movementHash: string; // This is derived from the movement data
  signatureQueue: SignatureQueue;
}

export interface IPFSMetadata {
export interface IPFSMetadata {
  description: string;
  timestamp: number;
}

export interface MovementDescription {
export interface MovementDescription {
  description: string;
  timestamp: number;
}

export interface MovementSignatureStatus {
export interface MovementSignatureStatus {
  current: number;
  required: number;
  hasUserSigned: boolean;
}

export const isValidNodeState = (data: any): data is NodeState => {
export const isValidNodeState = (data: any): data is NodeState => {
  return (
    Array.isArray(data?.basicInfo) &&
    data.basicInfo.length === 11 &&
    typeof data.membraneMeta === 'string' &&
    Array.isArray(data.membersOfNode) &&
    Array.isArray(data.childrenNodes) &&
    Array.isArray(data.rootPath) &&
    Array.isArray(data.signals)
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

export const transformNodeData = (nodeData: NodeState): NodeBasicInfo => {
export const transformNodeData = (nodeData: NodeState): NodeBasicInfo => {
  return {
    nodeId: nodeData.basicInfo[0],
    inflation: nodeData.basicInfo[1],
    balanceAnchor: nodeData.basicInfo[2],
    balanceBudget: nodeData.basicInfo[3],
    rootValuationBudget: nodeData.basicInfo[4],
    rootValuationReserve: nodeData.basicInfo[5],
    membraneId: nodeData.basicInfo[6],
    eligibilityPerSec: nodeData.basicInfo[7],
    lastRedistribution: nodeData.basicInfo[8],
    balanceOfUser: nodeData.basicInfo[9],
    endpointOfUserForNode: nodeData.basicInfo[10]
  };
};
</document_content>
</document></documents>
