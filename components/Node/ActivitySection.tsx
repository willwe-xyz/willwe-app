import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  Alert, 
  AlertIcon, 
  Heading, 
  Button, 
  HStack, 
  Center, 
  Spinner,
  Badge,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { usePonderData } from '../../hooks/usePonderData';
import { ActivityType } from '../../types/activity';

interface ActivitySectionProps {
  nodeId?: string;
  selectedTokenColor?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  nodeId,
  selectedTokenColor = 'blue.500'
}) => {
  const { getNodeActivityLogs, isLoading } = usePonderData();
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchActivities = useCallback(async () => {
    if (!nodeId) return;
    
    setRefreshLoading(true);
    setError(null);
    
    try {
      // Use Optimism Sepolia Chain ID as the default network
      const networkId = '11155420';
      const data = await getNodeActivityLogs(nodeId, networkId);
      console.log('Fetched activities:', data);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setRefreshLoading(false);
    }
  }, [nodeId, getNodeActivityLogs]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <Box>
        <HStack justify="space-between" align="center" mb={4}>
          <Heading size="md">Recent Activity</Heading>
          <Button
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={fetchActivities}
            isLoading={refreshLoading}
            colorScheme="blue"
          >
            Refresh
          </Button>
        </HStack>
        
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Text>Error: {error}</Text>
          </Alert>
        )}
        
        {(isLoading || refreshLoading) && activities.length === 0 ? (
          <Center py={8}>
            <Spinner size="lg" color={selectedTokenColor} />
          </Center>
        ) : activities.length === 0 ? (
          <Box py={8} textAlign="center" bg={backgroundColor} borderRadius="md" p={4} borderWidth="1px" borderColor={borderColor}>
            <Text color="gray.500">No recent activity found for this node</Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {activities.map((activity) => (
              <ActivityItem 
                key={activity.id || activity.when} 
                activity={activity}
                selectedColor={selectedTokenColor}
              />
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

const ActivityItem: React.FC<{ activity: any, selectedColor?: string }> = ({ 
  activity, 
  selectedColor = 'blue.500'
}) => {
  const backgroundColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Format the timestamp properly, handling different formats
  const formatTimestamp = (timestamp: string | number) => {
    try {
      // If timestamp is a number, it might be in seconds, so convert to milliseconds if needed
      let date: Date;
      
      if (typeof timestamp === 'number' || !isNaN(Number(timestamp))) {
        const numericTimestamp = Number(timestamp);
        // If timestamp is in seconds (typically ~10 digits), convert to milliseconds
        const timestampMs = numericTimestamp < 10000000000 
          ? numericTimestamp * 1000 
          : numericTimestamp;
        date = new Date(timestampMs);
      } else {
        // Handle string timestamps
        date = new Date(timestamp);
      }
      
      // Verify date is valid before formatting
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", timestamp);
        return 'Unknown time';
      }
      
      // Format using native Date toLocaleString
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error("Error formatting timestamp:", timestamp, e);
      return 'Unknown time';
    }
  };
  
  // Get event type and determine badge color
  const getEventType = () => {
    const eventType = activity.eventType || activity.event_type || 'unknown';
    
    // Convert to title case for display
    return eventType.charAt(0).toUpperCase() + eventType.slice(1);
  };
  
  const getBadgeColor = () => {
    const eventType = (activity.eventType || activity.event_type || '').toLowerCase();
    
    switch (eventType) {
      case ActivityType.MINT:
        return 'green';
      case ActivityType.BURN:
        return 'red';
      case ActivityType.SIGNAL:
      case ActivityType.RESIGNAL:
        return 'purple';
      case ActivityType.MEMBERSHIP:
        return 'blue';
      case ActivityType.CONFIG_SIGNAL:
        return 'teal';
      case ActivityType.NEW_MOVEMENT:
        return 'yellow';
      default:
        return 'gray';
    }
  };
  
  // Get description
  const getDescription = () => {
    // Parse data if it's a string
    const data = typeof activity.data === 'string' 
      ? JSON.parse(activity.data) 
      : activity.data;
      
    return activity.description 
      || activity.content 
      || data?.description 
      || `${getEventType()} event`;
  };
  
  // Get who initiated the activity
  const getActor = () => {
    return activity.who 
      || activity.userAddress 
      || activity.user_address 
      || 'Unknown';
  };
  
  // Format an address for display
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="md" 
      bg={backgroundColor}
      borderColor={borderColor}
      shadow="sm"
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Flex alignItems="center" mb={2}>
            <Badge colorScheme={getBadgeColor()} mr={2}>
              {getEventType()}
            </Badge>
            <Text fontSize="sm" color="gray.500">
              {formatTimestamp(activity.timestamp || activity.when || Date.now())}
            </Text>
          </Flex>
          
          <Text mt={1} fontWeight="medium">{getDescription()}</Text>
          
          {getActor() && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              By: {formatAddress(getActor())}
            </Text>
          )}
        </Box>
        
        {activity.transactionHash && (
          <Button 
            as="a"
            size="xs"
            variant="outline"
            colorScheme="blue"
            href={`https://optimistic.etherscan.io/tx/${activity.transactionHash}`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            View Tx
          </Button>
        )}
      </Flex>
    </Box>
  );
};