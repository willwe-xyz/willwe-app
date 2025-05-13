import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  Flex,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { usePonderData } from '../../hooks/usePonderData';
import { ActivityFeed } from '../ActivityFeed/ActivityFeed';
import { useRouter } from 'next/router';

interface ActivitySectionProps {
  nodeId?: string;
  selectedTokenColor?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  nodeId,
  selectedTokenColor = 'blue.500',
}) => {
  const router = useRouter();
  const { chainId } = router.query;
  const { getNodeActivityLogs, isLoading } = usePonderData();
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log for component props and state
  useEffect(() => {
    console.log('ActivitySection Debug:', {
      nodeId,
      chainId,
      routerReady: router.isReady,
      currentActivities: activities,
      isLoading,
      refreshLoading,
      error,
      routerQuery: router.query,
      fullUrl: window.location.href
    });
  }, [nodeId, chainId, router.isReady, activities, isLoading, refreshLoading, error, router.query]);

  const fetchActivities = useCallback(async () => {
    console.log('fetchActivities called with:', { 
      nodeId, 
      chainId,
      routerQuery: router.query,
      fullUrl: window.location.href
    });
    
    if (!nodeId || !chainId) {
      console.log('Missing required params:', { nodeId, chainId });
      return;
    }

    setRefreshLoading(true);
    setError(null);
    
    try {
      console.log('Making API request for activities...', {
        nodeId,
        chainId,
        apiEndpoint: `/events?nodeId=${nodeId}&limit=50&networkId=${chainId}`
      });
      
      const data = await getNodeActivityLogs(nodeId, chainId as string);
      
      console.log('API Response:', {
        data,
        dataLength: data?.length,
        dataType: typeof data,
        isArray: Array.isArray(data),
        firstItem: data?.[0],
        lastItem: data?.[data?.length - 1]
      });
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data received:', {
          data,
          type: typeof data,
          isArray: Array.isArray(data)
        });
        setActivities([]);
        return;
      }

      setActivities(data);
      console.log('Activities state updated:', {
        newActivitiesCount: data.length,
        firstActivity: data[0],
        lastActivity: data[data.length - 1]
      });
    } catch (err) {
      console.error('Error in fetchActivities:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack : undefined,
        nodeId,
        chainId
      });
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setRefreshLoading(false);
      console.log('fetchActivities completed', {
        finalActivitiesCount: activities.length,
        error: error
      });
    }
  }, [nodeId, chainId, getNodeActivityLogs, router.query]);

  useEffect(() => {
    console.log('useEffect triggered:', {
      routerReady: router.isReady,
      nodeId,
      chainId,
      routerQuery: router.query
    });
    
    if (router.isReady) {
      console.log('Router is ready, fetching activities...');
      fetchActivities();
    }
  }, [fetchActivities, router.isReady]);

  const isFeedLoading = (isLoading || refreshLoading) && activities.length === 0;
  
  console.log('Render state:', {
    isFeedLoading,
    activitiesCount: activities.length,
    hasError: !!error,
    errorMessage: error,
    nodeId,
    chainId
  });

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center" p={4} pb={2}>
        <Heading size="sm">Node Activity</Heading>
        <Button
          size="sm"
          leftIcon={<RepeatIcon />}
          onClick={() => {
            console.log('Refresh button clicked', {
              nodeId,
              chainId,
              currentActivitiesCount: activities.length
            });
            fetchActivities();
          }}
          isLoading={refreshLoading}
          colorScheme="blue"
          variant="outline"
        >
          Refresh
        </Button>
      </Flex>
      {error && (
        <Alert status="error" mb={2}>
          <AlertIcon />
          <Box>{error}</Box>
        </Alert>
      )}
      {isFeedLoading ? (
        <Flex align="center" justify="center" py={8}>
          <Spinner size="xl" color={selectedTokenColor} />
        </Flex>
      ) : (
        <Box px={2} pb={2}>
          <ActivityFeed
            activities={activities}
            isLoading={isLoading || refreshLoading}
            error={error}
            emptyStateMessage="No recent activity found for this node."
            selectedTokenColor={selectedTokenColor}
          />
        </Box>
      )}
    </VStack>
  );
};