'use client';

import React, { Suspense } from 'react';
import { Box, Tr, Td, Skeleton } from '@chakra-ui/react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  height?: string | number;
  isTableRow?: boolean;
  colSpan?: number;
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  height = '100px',
  isTableRow = false,
  colSpan = 6
}) => {
  const LoadingSkeleton = isTableRow ? (
    <Tr>
      <Td colSpan={colSpan}>
        <Skeleton height={height} />
      </Td>
    </Tr>
  ) : (
    <Box height={height} display="flex" alignItems="center" justifyContent="center">
      <Skeleton height={height} width="100%" />
    </Box>
  );

  return (
    <Suspense fallback={LoadingSkeleton}>
      {children}
    </Suspense>
  );
};