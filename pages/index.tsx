import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { Spinner, Heading, Text, Button, VStack, Box, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AllStacks } from '../components/AllStacks';
import DashboardPage from './dashboard';

const WideText = chakra(Text, {
  baseStyle: {
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  },
});

const BackgroundLetter = React.memo(({ children, color, x, y, z }) => (
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

export default function HomePage() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const handleMouseMove = useCallback((e) => {
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

  const getTransform = useCallback((baseX, baseY, baseZ, letter) => {
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
            <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Roboto+Mono&family=Open+Sans&display=swap" rel="stylesheet" />
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

  




