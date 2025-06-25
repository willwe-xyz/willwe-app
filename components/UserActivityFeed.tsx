import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Flex, Text, useToast, VStack, Heading, Code, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Spinner, Link, IconButton, Alert, AlertIcon } from '@chakra-ui/react';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem } from '../types/chainData';
import { transformActivities } from '../utils/activityTransformers';
import { usePonderData } from '@/hooks/usePonderData';
import { RefreshCw } from 'lucide-react';

interface UserActivityFeedProps {
  userAddress: string;
  chainId: string;
  showDebug?: boolean;
}

/**
 * Component for displaying a user's activity feed
 */
export const UserActivityFeed: React.FC<UserActivityFeedProps> = ({ 
  userAddress, 
  chainId,
  showDebug = true 
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [transformedActivities, setTransformedActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, limit: 50, offset: 0, nodeCount: 0 });
  
  const { getUserFeed, isLoading: isPonderLoading, error: ponderError } = usePonderData();
  
  interface DebugInfo {
    fetchStarted?: string;
    userAddress?: string;
    activitiesCount?: number;
    transformedCount?: number;
    error?: string;
    meta?: typeof paginationMeta;
    [key: string]: any;
  }
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const toast = useToast();

  // Check if social features are enabled
  const socialEnabled = process.env.NEXT_PUBLIC_SOCIAL_ENABLED === 'true';

  // Function to fetch activities using the new getUserFeed endpoint
  const fetchActivities = useCallback(async () => {
    if (!userAddress || !chainId) return;
    
    // Don't fetch if social features are disabled
    if (!socialEnabled) {
      console.log('Social features are disabled. Not fetching activities.');
      setActivities([]);
      setTransformedActivities([]);
      setPaginationMeta({ total: 0, limit: 50, offset: 0, nodeCount: 0 });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getUserFeed(userAddress, chainId, 50, 0);
      if (!result || !Array.isArray(result.events)) {
        throw new Error('Invalid response format from getUserFeed');
      }
      setActivities(result.events);
      setPaginationMeta(result.meta || { total: 0, limit: 50, offset: 0, nodeCount: 0 });
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        fetchCompleted: new Date().toISOString(),
        responseData: result,
        meta: result.meta
      }));
      
    } catch (err) {
      console.error('Error fetching user feed:', err);
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
  }, [userAddress, chainId, getUserFeed, toast, socialEnabled]);

  // Fetch activities on component mount and when dependencies change
  useEffect(() => {
    if (socialEnabled) {
      fetchActivities();
    } else {
      // Clear any existing data if social features are disabled
      setActivities([]);
      setTransformedActivities([]);
      setPaginationMeta({ total: 0, limit: 50, offset: 0, nodeCount: 0 });
    }
  }, [fetchActivities, socialEnabled]);

  // Transform activities when they change
  useEffect(() => {
    const transformAndSetActivities = async () => {
      if (activities.length > 0) {
        try {
          const transformed = await transformActivities(activities);
          setTransformedActivities(transformed);
          
          // Update debug info
          setDebugInfo(prev => ({
            ...prev,
            activitiesCount: activities.length,
            transformedCount: transformed.length,
            sampleActivity: activities[0],
            sampleTransformed: transformed[0]
          }));
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
            type: activity.eventType || 'unknown',
            timestamp: activity.when || new Date().toISOString(),
            title: activity.eventName || 'Unknown Activity',
            description: `Activity related to node ${activity.nodeId}`,
            node: {
              id: activity.nodeId || '',
              name: activity.nodeName || 'Unknown Node',
              link: `/nodes/${chainId}/${activity.nodeId}`
            },
            network: activity.network || 'unknown',
            user: {
              address: activity.who || ''
            }
          }));
          
          setTransformedActivities(simpleActivities);
        }
      } else {
        setTransformedActivities([]);
      }
    };

    transformAndSetActivities();
  }, [activities, toast, chainId]);

  // Update debug info on mount
  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      fetchStarted: new Date().toISOString(),
      userAddress,
      chainId
    }));
  }, [userAddress, chainId]);

  // Function to manually refresh activities
  const handleRefresh = () => {
    setDebugInfo(prev => ({
      ...prev,
      refreshTriggered: new Date().toISOString()
    }));
    
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
        </Box>
      </Alert>
    );
  }

  return (
    <VStack spacing={3} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center">
      <Heading size="md">Feed</Heading>
      <Button 
        size="xs" 
        colorScheme="blue" 
        onClick={handleRefresh} 
        isLoading={isLoading || isPonderLoading}
        variant="outline"
      >
        <RefreshCw size={16} />
      </Button>
      </Flex>
      
      {combinedError && (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Text fontWeight="bold">Error:</Text>
        <Text>{combinedError.message}</Text>
      </Box>
      )}
      

      
      {(isLoading || isPonderLoading) && transformedActivities.length === 0 ? (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading activities...</Text>
      </Box>
      ) : (
      <ActivityFeed 
        activities={transformedActivities}
        isLoading={isLoading || isPonderLoading} 
        error={combinedError ? combinedError.message : null}
        emptyStateMessage={`No activities found or social feed has been disabled. Activities will appear here when you interact with nodes or when activity occurs in nodes where you're a member.`}
      />
      )}
    </VStack>
  );
};
