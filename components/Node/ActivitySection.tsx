import React from 'react';
import { Box, Text, VStack, Alert, AlertIcon, Heading, Button, HStack, Center, Spinner } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { SignalHistory } from './SignalHistory';
import { UserSignal } from '../../types/chainData';
import { usePonderData } from '../../hooks/usePonderData';

interface ActivitySectionProps {
  signals?: UserSignal[];
  isLoading?: boolean;
  nodeId?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  signals = [],
  isLoading: signalsLoading = false,
  nodeId
}) => {
  const { getNodeActivities, isLoading, error, syncActivities } = usePonderData();
  const [activities, setActivities] = React.useState<any[]>([]);
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);

  const fetchActivities = React.useCallback(async () => {
    if (!nodeId) return;
    
    try {
      const data = await getNodeActivities(nodeId);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [nodeId, getNodeActivities]);

  React.useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSync = async () => {
    if (!nodeId) return;
    
    setSyncLoading(true);
    setSyncError(null);
    
    try {
      await syncActivities(nodeId);
      await fetchActivities(); // Refresh activities after sync
    } catch (error) {
      console.error('Error syncing activities:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to sync activities');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <Box>
        <HStack justify="space-between" align="center" mb={4}>
          <Heading size="md">Recent Activity</Heading>
          <HStack>
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              onClick={handleSync}
              isLoading={syncLoading}
              colorScheme="teal"
            >
              Sync
            </Button>
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              onClick={fetchActivities}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>
        
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Text>Error loading activities: {error.message}</Text>
          </Alert>
        )}

        {syncError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Text>Error syncing activities: {syncError}</Text>
          </Alert>
        )}
        
        {isLoading ? (
          <Center py={8}>
            <Spinner size="lg" />
          </Center>
        ) : activities.length === 0 ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">No recent activity</Text>
            <Button 
              mt={4} 
              size="sm" 
              onClick={handleSync}
              colorScheme="teal"
            >
              Sync Activities
            </Button>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {activities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </VStack>
        )}
      </Box>
      
      {signals && signals.length > 0 && (
        <Box>
          <Heading as="h3" size="md" mb={4}>
            Signal History
          </Heading>
          <SignalHistory signals={signals} isLoading={signalsLoading} />
        </Box>
      )}
    </VStack>
  );
};

// ActivityItem component
const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp: string | number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" shadow="sm">
      <HStack spacing={3} align="start">
        <Box>
          <Text fontWeight="bold">{activity.event_type}</Text>
          <Text fontSize="sm" color="gray.500">{formatTimestamp(activity.timestamp)}</Text>
          <Text mt={2}>{activity.description || activity.content}</Text>
          {activity.transactionHash && (
            <Text fontSize="sm" color="blue.500" mt={1}>
              <a 
                href={`https://etherscan.io/tx/${activity.transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Transaction
              </a>
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
};