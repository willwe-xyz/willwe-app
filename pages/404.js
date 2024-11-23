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
