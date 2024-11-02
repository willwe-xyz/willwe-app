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
