import React from 'react';
import { Box, VStack, Text, Badge, HStack, Link, useColorModeValue } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '../../types/chainData';
import { Users, ArrowUpRight } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItem[];
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
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Text fontWeight="medium">Error:</Text>
        <Text>{error}</Text>
      </Box>
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

  const getBadgeStyle = (eventType: string) => {
    const baseStyle = {
      bg: `${selectedTokenColor}10`,
      color: selectedTokenColor,
      borderColor: `${selectedTokenColor}30`
    };

    // Special cases can still have different styling if needed
    switch (eventType.toLowerCase()) {
      case 'burn':
        return {
          bg: 'red.50',
          color: 'red.500',
          borderColor: 'red.200'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      {activities.map((activity, index) => (
        <Box 
          key={`${activity.id}-${index}`} 
          p={4} 
          borderWidth="1px" 
          borderRadius="lg"
          borderColor={borderColor}
          transition="all 0.2s"
          _hover={{
            bg: bgHover,
            transform: 'translateY(-1px)',
            shadow: 'sm'
          }}
        >
          <HStack justify="space-between" mb={2}>
            <Badge 
              px={2}
              py={1}
              borderRadius="full"
              variant="subtle"
              borderWidth="1px"
              {...getBadgeStyle(activity.eventType)}
            >
              {activity.eventType}
            </Badge>
            <Text 
              fontSize="sm" 
              color={selectedTokenColor}
              fontWeight="medium"
            >
              {activity.when && !isNaN(new Date(activity.when).getTime())
                ? formatDistanceToNow(new Date(activity.when), { addSuffix: true })
                : 'Unknown time'
              }
            </Text>
          </HStack>

          <Text fontSize="sm" fontWeight="medium" mb={2}>
            {activity.eventName}
          </Text>

          <HStack spacing={4} fontSize="sm" color="gray.500">
            <HStack spacing={1}>
              <Users size={14} />
              <Text>{`${activity.who.slice(0, 6)}...${activity.who.slice(-4)}`}</Text>
            </HStack>

            <Link 
              href={`/nodes/${activity.networkId}/${activity.nodeId}`}
              color={selectedTokenColor}
              display="inline-flex"
              alignItems="center"
              _hover={{ 
                textDecoration: 'none', 
                color: selectedTokenColor,
                opacity: 0.8 
              }}
            >
              <Text mr={1}>{`${activity.nodeId.slice(0, 6)}...${activity.nodeId.slice(-4)}`}</Text>
              <ArrowUpRight size={14} />
            </Link>
          </HStack>

          {activity.amount && activity.tokenSymbol && (
            <Text fontSize="sm" color="gray.600" mt={2}>
              Amount: {activity.amount} {activity.tokenSymbol}
            </Text>
          )}
        </Box>
      ))}
    </VStack>
  );
};