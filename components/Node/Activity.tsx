import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

export const ActivitySection = () => {
  return (
    <Box p={6}>
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">Activity</Text>
        <Text>Recent activity will appear here...</Text>
      </VStack>
    </Box>
  );
};