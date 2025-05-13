import React from 'react';
import { Box, VStack, Text, Alert, AlertIcon, Spinner, Flex } from '@chakra-ui/react';
import { ActivityItem } from './ActivityItem';
import { ActivityItem as ActivityItemType } from '../../types/chainData';

interface ActivityFeedProps {
  activities: ActivityItemType[];
  isLoading: boolean;
  error: string | null;
  emptyStateMessage: string;
  selectedTokenColor?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  isLoading, 
  error, 
  emptyStateMessage,
  selectedTokenColor = 'blue.500'
}) => {
  if (error) {
    return (
      <Alert status="error" variant="left-accent" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  if (isLoading && activities.length === 0) {
    return (
      <Flex align="center" justify="center" py={8}>
        <Spinner size="xl" color={selectedTokenColor} />
      </Flex>
    );
  }

  if (activities.length === 0) {
    return (
      <Box 
        textAlign="center" 
        py={8}
        px={4}
        bg="gray.50"
        borderRadius="md"
        color="gray.600"
      >
        <Text>{emptyStateMessage}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {activities.map((activity, index) => (
        <ActivityItem
          key={`${activity.id}-${index}`}
          activity={activity}
          selectedTokenColor={selectedTokenColor}
        />
      ))}
    </VStack>
  );
};