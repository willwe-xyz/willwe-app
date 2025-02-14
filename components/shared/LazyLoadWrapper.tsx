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