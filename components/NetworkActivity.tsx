import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Flex, Text, useToast, VStack, Heading, Spinner, Alert, AlertIcon, HStack, useColorModeValue } from '@chakra-ui/react';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem } from '../types/chainData';
import { transformActivities } from '../utils/activityTransformers';
import { usePonderData } from '@/hooks/usePonderData';
import { Activity, RefreshCw } from 'lucide-react';

interface NetworkActivityProps {
  chainId: string;
  showDebug?: boolean;
  selectedTokenColor?: string;
}

export const NetworkActivity: React.FC<NetworkActivityProps> = ({ 
  chainId,
  showDebug = false,
  selectedTokenColor = 'blue.500'
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [transformedActivities, setTransformedActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, limit: 50, offset: 0 });
  
  const { getNetworkEvents, isLoading: isPonderLoading, error: ponderError } = usePonderData();
  const toast = useToast();

  // Check if social features are enabled
  const socialEnabled = process.env.NEXT_PUBLIC_SOCIAL_ENABLED === 'true';
  const bgColor = useColorModeValue('white', 'gray.800');

  // Function to fetch activities using the getNetworkEvents endpoint
  const fetchActivities = useCallback(async () => {
    if (!chainId) return;
    
    // Don't fetch if social features are disabled
    if (!socialEnabled) {
      console.log('Social features are disabled. Not fetching network activities.');
      setActivities([]);
      setTransformedActivities([]);
      setPaginationMeta({ total: 0, limit: 50, offset: 0 });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getNetworkEvents(chainId, 50, 0);
      setActivities(result.events || []);
      setPaginationMeta(result.meta || { total: 0, limit: 50, offset: 0 });
    } catch (err) {
      console.error('Error fetching network events:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        title: 'Error fetching activities',
        description: err instanceof Error ? err.message : 'Unknown error fetching activities',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [chainId, getNetworkEvents, toast, socialEnabled]);

  // Fetch activities on component mount and when dependencies change
  useEffect(() => {
    if (socialEnabled) {
      fetchActivities();
    } else {
      // Clear any existing data if social features are disabled
      setActivities([]);
      setTransformedActivities([]);
      setPaginationMeta({ total: 0, limit: 50, offset: 0 });
    }
  }, [fetchActivities, socialEnabled]);

  // Transform activities when they change
  useEffect(() => {
    if (activities.length) {
      try {
        const transformed = transformActivities(activities);
        setTransformedActivities(transformed as ActivityItem[]);
      } catch (err) {
        console.error('Error transforming activities:', err);
        toast({
          title: 'Error processing activities',
          description: err instanceof Error ? err.message : 'Unknown error in data transformation',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        
        // If transformation fails, create a simple version of the activities
        const simpleActivities = activities.map((activity, index) => ({
          id: activity.id || `activity-${index}`,
          nodeId: activity.nodeId || '',
          who: activity.who || '',
          eventName: activity.eventName || 'Unknown Activity',
          eventType: activity.eventType || 'unknown',
          when: activity.when || new Date().toISOString(),
          createdBlockNumber: activity.createdBlockNumber || 0,
          network: activity.network || 'unknown',
          networkId: activity.networkId || '',
          description: `Activity related to node ${activity.nodeId}`
        }));
        
        setTransformedActivities(simpleActivities);
      }
    } else {
      setTransformedActivities([]);
    }
  }, [activities, toast]);

  // Function to manually refresh activities
  const handleRefresh = () => {
    fetchActivities();
    
    toast({
      title: 'Refreshing activities',
      description: 'Fetching latest activities...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Combine errors from both sources
  const combinedError = error || ponderError;

  // Don't render anything if social features are disabled
  if (!socialEnabled) {
    return (
      <Alert status="info" borderRadius="md" mb={4}>
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Social features are disabled</Text>
          <Text fontSize="sm">Enable social features in your environment variables to view network activities.</Text>
        </Box>
      </Alert>
    );
  }

  return (
    <Box
      bg={bgColor}
      shadow="sm"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box p={4} borderBottom="1px" borderColor="gray.100" bg="gray.50">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={2}>
            <Box p={2} borderRadius="lg" bg={`${selectedTokenColor}10`}>
              <Activity size={14} color={selectedTokenColor} />
            </Box>
            <Heading size="md">Network Activity</Heading>
          </HStack>
          <Button 
            size="sm" 
            leftIcon={<RefreshCw size={16} />} 
            onClick={handleRefresh}
            isLoading={isLoading || isPonderLoading}
            variant="ghost"
            disabled={!socialEnabled}
          >
            Refresh
          </Button>
        </Flex>
      </Box>
      
      {combinedError && (
        <Alert status="error" variant="left-accent" borderRadius="none">
          <AlertIcon />
          <Text fontSize="sm">{combinedError.message}</Text>
        </Alert>
      )}

      <Box flex="1" overflowY="auto" p={4}>
        <ActivityFeed 
          activities={transformedActivities}
          isLoading={isLoading || isPonderLoading} 
          error={combinedError ? combinedError.message : null}
          emptyStateMessage="No network activities found. Activities will appear here when users interact with nodes in the network."
          selectedTokenColor={selectedTokenColor}
        />
      </Box>
    </Box>
  );
}; 