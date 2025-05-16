import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppKit } from '../hooks/useAppKit';
import Head from "next/head";
import { Spinner, Heading, Text, Button, VStack, Box, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import DashboardPage from './dashboard';
import Image from 'next/image';
import { useRouter } from 'next/router';

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

const BackgroundLetter = React.memo<BackgroundLetterProps>(({ children, color, x, y, z }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      style={{
        position: 'absolute',
        fontSize: '26vw',
        fontWeight: 'bold',
        color: color,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
        WebkitTextStroke: '1px rgba(255,255,255,0.1)',
      }}
      animate={{ 
        x: x + mousePosition.x * 0.02,
        y: y + mousePosition.y * 0.02,
        rotateX: [-2, 2, -2],
        rotateY: [2, -2, 2],
        opacity: [0.15, 0.25, 0.15],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <motion.div
        animate={{
          filter: [
            'blur(0px) brightness(1)',
            'blur(2px) brightness(1.2)',
            'blur(0px) brightness(1)'
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Box
          position="relative"
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, transparent 80%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 40px ${color.replace('0.4', '0.2')}`,
          }}
        >
          {children}
        </Box>
      </motion.div>
    </motion.div>
  );
});

BackgroundLetter.displayName = 'BackgroundLetter';

const Home: React.FC = () => {
  const { user, isInitializing } = useAppKit();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const router = useRouter();

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

  useEffect(() => {
    if (!isInitializing && user.isAuthenticated && user.wallet.address) {
      router.replace('/dashboard');
    }
  }, [isInitializing, user.isAuthenticated, user.wallet.address, router]);

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

  if (windowSize.width === 0) return null;
  if (!isInitializing && user.isAuthenticated && user.wallet.address) {
    // Prevent rendering the landing page while redirecting
    return null;
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>WillWe · Home</title>
      </Head>

      <motion.main
        className="flex min-h-screen min-w-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 overflow-hidden"
        style={{ perspective: 1500 }}
      >
        <BackgroundLetter 
          color="rgba(255,255,0,0.4)" 
          {...getTransform(-150 + rightShift, -150, -400, 'Y')}
        >
          Y
        </BackgroundLetter>
        <BackgroundLetter 
          color="rgba(0,255,255,0.4)" 
          {...getTransform(150 + rightShift, 150, -600, 'X')}
        >
          X
        </BackgroundLetter>
        <BackgroundLetter 
          color="rgba(255,0,255,0.4)" 
          {...getTransform(0 + rightShift, 200, -500, 'Z')}
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

            <Box position="relative" width="100%">
              <Text 
                align="center" 
                fontSize="2xl" 
                lineHeight="tall" 
                color="white"
                fontFamily="'Roboto Mono', monospace"
                position="relative"
                zIndex={1}
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
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {text}
                  </motion.span>
                ))}
              </Text>
              
              {/* Pixelated shadow */}
              <Box
                position="absolute"
                bottom="-20px"
                left="50%"
                transform="translateX(-50%)"
                width="60%"
                height="20px"
                sx={{
                  background: `
                    linear-gradient(to bottom,
                      rgba(0,0,0,0.1) 0%,
                      transparent 100%
                    )
                  `,
                  maskImage: `
                    repeating-linear-gradient(to right,
                      #000 0px,
                      #000 4px,
                      transparent 4px,
                      transparent 8px
                    )
                  `,
                  WebkitMaskImage: `
                    repeating-linear-gradient(to right,
                      #000 0px,
                      #000 4px,
                      transparent 4px,
                      transparent 8px
                    )
                  `,
                  opacity: 0.5,
                }}
              />
            </Box>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ 
                scale: [0.95, 1.05, 0.95],
                y: [-2, 2, -2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                marginTop: '20px',
                width: '100%',
                textAlign: 'center'
              }}
            >
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
            </motion.div>

            <VStack spacing={4} width="100%" position="relative">
              <appkit-button
                style={{
                  display: 'block',
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.9rem 2.5rem',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  letterSpacing: '0.04em',
                  minWidth: '200px',
                  textAlign: 'center',
                }}
              />

              <Box
                width="32%"
                position="relative"
                sx={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 'md',
                  overflow: 'visible',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  transition: 'all 0.3s ease',
                  _hover: {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
                  }
                }}
              >
                <Image 
                  src="/images/buildbyethereum.gif"
                  alt="Built on Ethereum"
                  width={500}
                  height={300}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
                <Box
                  position="absolute"
                  bottom="-40px"
                  left="0"
                  width="100%"
                  height="40px"
                  sx={{
                    background: `
                      linear-gradient(to bottom,
                        rgba(0,0,0,0.9) 0%,
                        rgba(0,0,0,0) 100%
                      )
                    `,
                    clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
                    zIndex: 1,
                    _before: {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      backgroundImage: `
                        repeating-linear-gradient(to right,
                          rgba(255,255,255,0.03) 0px,
                          rgba(255,255,255,0.03) 2px,
                          transparent 2px,
                          transparent 4px
                        )
                      `,
                      clipPath: 'inherit'
                    }
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

Home.displayName = 'Home';

export default Home;

  




