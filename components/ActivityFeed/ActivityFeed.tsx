import React from 'react';
import { Box, VStack, Text, Badge, HStack, Link } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '../../types/chainData';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  emptyStateMessage: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading, error, emptyStateMessage }) => {
  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Text fontWeight="bold">Error:</Text>
        <Text>{error}</Text>
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text>{emptyStateMessage}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {activities.map((activity, index) => (
        <Box 
          key={`${activity.id}-${index}`} 
          p={4} 
          borderWidth="1px" 
          borderRadius="md"
        >
          <HStack justifyContent="space-between">
            <Text fontWeight="bold">{activity.eventName}</Text>
            <Badge colorScheme="blue">{activity.eventType}</Badge>
          </HStack>
          <Text fontSize="sm" color="gray.500">{`By: ${activity.who}`}</Text>
          <Text fontSize="sm" color="gray.500">
            Node:{' '}
            <Link 
              href={`/nodes/${activity.networkId}/${activity.nodeId}`}
              color="blue.500"
              _hover={{ textDecoration: 'underline' }}
            >
              {activity.nodeId}
            </Link>
          </Text>
          <Text fontSize="sm" color="gray.500">{`Network: ${activity.network} (${activity.networkId})`}</Text>
          <Text fontSize="sm" color="gray.500">{`Block: ${activity.createdBlockNumber}`}</Text>
          <Text fontSize="sm" color="gray.500">
            {`When: ${
              activity.when && !isNaN(new Date(activity.when).getTime())
                ? formatDistanceToNow(new Date(activity.when), { addSuffix: true })
                : 'Unknown time'
            }`}
          </Text>
          {activity.amount && activity.tokenSymbol && (
            <Text fontSize="sm" color="gray.500">{`Amount: ${activity.amount} ${activity.tokenSymbol}`}</Text>
          )}
        </Box>
      ))}
    </VStack>
  );
};