import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Flex, Text, useToast, VStack, Heading, Code, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Spinner } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem } from '../types/chainData';
import { transformActivities } from '../utils/activityTransformers';
import { usePonderData } from '@/hooks/usePonderData';

interface RootActivityFeedProps {
  tokenAddress: string;
  chainId: string;
  showDebug?: boolean;
  selectedTokenColor?: string;
}

/**
 * Component for displaying activities from a root node and all its derived nodes
 */
export const RootActivityFeed: React.FC<RootActivityFeedProps> = ({ 
  tokenAddress, 
  chainId,
  showDebug = false,
  selectedTokenColor = 'blue.500'
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [transformedActivities, setTransformedActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, limit: 50, offset: 0, nodeCount: 0 });
  
  const { getRootNodeEvents, isLoading: isPonderLoading, error: ponderError } = usePonderData();
  
  interface DebugInfo {
    fetchStarted?: string;
    tokenAddress?: string;
    activitiesCount?: number;
    transformedCount?: number;
    error?: string;
    meta?: typeof paginationMeta;
    [key: string]: any;
  }
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const toast = useToast();

  // Function to convert token address to root node ID (uint160)
  const getRootNodeId = useCallback((address: string): string => {
    if (!address || !address.startsWith('0x')) return '';
    
    // Remove '0x' prefix if present
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    
    try {
      // Use BigInt to handle the conversion from hex to decimal
      const uint160Value = BigInt('0x' + cleanAddress.toLowerCase()).toString();
      return uint160Value;
    } catch (error) {
      console.error('Error converting address to uint160:', error);
      return '0'; // Return a safe fallback value if conversion fails
    }
  }, []);

  // Function to fetch activities using the getRootNodeEvents endpoint
  const fetchActivities = useCallback(async () => {
    if (!tokenAddress || !chainId) return;
    
    setIsLoading(true);
    setError(null);
    
    const rootNodeId = getRootNodeId(tokenAddress);
    
    try {
      console.log(`Fetching activities for root node ID: ${rootNodeId}, chainId: ${chainId}`);
      setDebugInfo(prev => ({
        ...prev,
        fetchRequested: new Date().toISOString(),
        rootNodeId,
        tokenAddress,
        chainId
      }));
      
      const result = await getRootNodeEvents(rootNodeId, chainId, 50, 0);
      setActivities(result.events || []);
      setPaginationMeta(result.meta || { total: 0, limit: 50, offset: 0, nodeCount: 0 });
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        fetchCompleted: new Date().toISOString(),
        responseData: result,
        meta: result.meta
      }));
      
    } catch (err) {
      console.error('Error fetching root node events:', err);
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
  }, [tokenAddress, chainId, getRootNodeEvents, getRootNodeId, toast]);

  // Fetch activities on component mount and when dependencies change
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Transform activities when they change
  useEffect(() => {
    if (activities.length) {
      try {
        const transformed = transformActivities(activities, true);
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
            name: activity.nodeName || 'Unknown Node'
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
  }, [activities, toast]);

  // Update debug info on mount
  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      fetchStarted: new Date().toISOString(),
      tokenAddress,
      chainId
    }));
  }, [tokenAddress, chainId]);

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

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md">Root Node Activity</Heading>
        <Button 
          size="sm" 
          colorScheme="blue" 
          onClick={handleRefresh} 
          isLoading={isLoading || isPonderLoading}
          bg={selectedTokenColor}
        >
          Refresh Activities
        </Button>
      </Flex>
      
      {combinedError && (
        <Box p={4} bg="red.50" color="red.500" borderRadius="md">
          <Text fontWeight="bold">Error:</Text>
          <Text>{combinedError.message}</Text>
        </Box>
      )}
      
      {showDebug && (
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Debug Information
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Root Node ID (Token Address):</Text>
                <Code p={2} borderRadius="md" w="100%">{tokenAddress}</Code>
                
                <Text fontWeight="bold">Chain ID:</Text>
                <Code p={2} borderRadius="md">{chainId}</Code>
                
                <Text fontWeight="bold">Activities Count:</Text>
                <Text>{activities.length} raw / {transformedActivities.length} transformed</Text>
                
                <Text fontWeight="bold">Pagination:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {JSON.stringify(paginationMeta, null, 2)}
                </Code>
                
                <Text fontWeight="bold">Loading State:</Text>
                <Text>{(isLoading || isPonderLoading) ? 'Loading...' : 'Completed'}</Text>
                
                <Text fontWeight="bold">Activity Types:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {JSON.stringify(
                    transformedActivities.reduce((acc, activity) => {
                      acc[activity.type] = (acc[activity.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>),
                    null,
                    2
                  )}
                </Code>
                
                <Text fontWeight="bold">First Activity:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {transformedActivities.length > 0 
                    ? JSON.stringify(transformedActivities[0], null, 2) 
                    : 'No activities found'}
                </Code>
                
                <Text fontWeight="bold">Debug Info:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </Code>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      
      {(isLoading || isPonderLoading) && transformedActivities.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" color={selectedTokenColor} />
          <Text mt={4}>Loading activities...</Text>
        </Box>
      ) : (
        <ActivityFeed 
          activities={transformedActivities.map((activity, index) => ({
            ...activity,
            // Ensure each activity has a unique id and valid timestamp to prevent previous errors
            id: activity.id || `activity-${index}`,
            when: activity.when || Date.now(),
            timeAgo: activity.timestamp && !isNaN(new Date(activity.timestamp).getTime()) 
              ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
              : 'Unknown time'
          }))} 
          isLoading={isLoading || isPonderLoading} 
          error={combinedError ? combinedError.message : null}
          emptyStateMessage={`No activities found for this root node. Activities will appear here when events occur in this node or any of its derived nodes.`}
        />
      )}
    </VStack>
  );
};