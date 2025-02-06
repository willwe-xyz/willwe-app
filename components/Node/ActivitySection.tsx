import React from 'react';
import { Box, Text, VStack, Skeleton, Alert, AlertIcon } from '@chakra-ui/react';
import { SignalHistory } from './SignalHistory';
import { UserSignal } from '../../types/chainData';

interface ActivitySectionProps {
  signals?: UserSignal[];
  selectedTokenColor?: string;
  isLoading?: boolean;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  signals,
  selectedTokenColor,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <VStack spacing={4} w="full">
        <Skeleton height="60px" w="full" />
        <Skeleton height="100px" w="full" />
        <Skeleton height="100px" w="full" />
      </VStack>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Text>No activity recorded yet</Text>
      </Alert>
    );
  }

  return (
    <Box w="full">
      <VStack align="stretch" spacing={6}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Recent Activity
        </Text>
        
        <SignalHistory 
          signals={signals} 
          selectedTokenColor={selectedTokenColor || 'purple.500'}
        />
      </VStack>
    </Box>
  );
};

export default ActivitySection;