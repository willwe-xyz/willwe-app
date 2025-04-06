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
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 0.2,
      scale: 1,
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
  >
    <Box
      position="relative"
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 40px rgba(255,255,255,0.4)',
      }}
    >
      {children}
    </Box>
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
            <BackgroundLetter 
              color="rgba(255,255,0,0.4)" 
              {...getTransform(-100 + rightShift, -100, -200, 'Y')}
            >
              Y
            </BackgroundLetter>
            <BackgroundLetter 
              color="rgba(0,255,255,0.4)" 
              {...getTransform(100 + rightShift, 100, -300, 'X')}
            >
              X
            </BackgroundLetter>
            <BackgroundLetter 
              color="rgba(255,0,255,0.4)" 
              {...getTransform(0 + rightShift, 200, -250, 'Z')}
            >
              Z
            </BackgroundLetter>
    
            <motion.div
              style={{
                position: 'absolute',
                left: '10%',
                bottom: '20%',
                width: '36px',
                height: '36px',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transform: `translate3d(${squareDotPosition.x}px, ${squareDotPosition.y}px, ${squareDotPosition.z}px)`,
              }}
            />
    
            <Box 
              className="flex flex-1 p-6 justify-center items-center relative"
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              <VStack spacing={8} align="center" maxWidth="400px">
                <Heading 
                  as="h1" 
                  size="3xl" 
                  mb={4} 
                  color="white" 
                  fontFamily="'Dancing Script', cursive"
                  textShadow="0 0 20px rgba(255,255,255,0.5)"
                  sx={{
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                    }
                  }}
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
                    alignItems: 'center',
                  }}
                >
                  {['a', 'token', 'use pattern', 'enabling safe', 'self-explanatory', 'co-operative efforts'].map((text, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        textShadow: '0 0 15px rgba(255,255,255,0.3)',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        margin: '2px 0',
                      }}
                    >
                      {text}
                    </motion.span>
                  ))}
                </Text>
    
                <WideText 
                  fontWeight="bold" 
                  fontSize="3xl" 
                  color="white" 
                  mt={1}
                  fontFamily="'Open Sans', sans-serif"
                  textShadow="0 0 20px rgba(255,255,255,0.4)"
                  letterSpacing="0.2em"
                  sx={{
                    background: 'linear-gradient(90deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
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
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                      transition: 'all 0.3s ease',
                      _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
                      }
                    }}
                    fontFamily="'Open Sans', sans-serif"
                  >
                    Log in
                  </Button>
                  <Box
                    width="32%"
                    position="relative"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 'md',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                      transition: 'all 0.3s ease',
                      _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
                      }
                    }}
                  >
                    <img
                      src="/images/buildbyethereum.gif"
                      alt="Built on Ethereum"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </Box>
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

  




