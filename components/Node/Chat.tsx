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