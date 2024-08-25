import React from 'react';
import { Box, Skeleton, VStack, HStack } from '@chakra-ui/react';

const LoadingSkeleton: React.FC = () => (
  <VStack spacing={4} align="stretch" height="100vh" p={4}>
    <HStack justify="space-between">
      <Skeleton height="40px" width="40px" />
      <Skeleton height="40px" width="200px" />
    </HStack>
    <HStack align="stretch" spacing={0} flex={1}>
      <Box width="80px">
        <VStack spacing={2}>
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} height="60px" width="100%" />
          ))}
        </VStack>
      </Box>
      <Box flex={1} ml={4}>
        <Skeleton height="200px" mb={4} />
        <VStack spacing={2}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="40px" width="100%" />
          ))}
        </VStack>
      </Box>
    </HStack>
  </VStack>
);

export default LoadingSkeleton;