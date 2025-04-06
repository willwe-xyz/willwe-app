import React, { useEffect, useState, useCallback, ReactElement } from 'react';
import { Box, Button, Flex, Text, useToast, VStack, Heading, Code, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Spinner, HStack, Alert, AlertIcon } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem } from '../types/chainData';
import { transformActivities } from '../utils/activityTransformers';
import { usePonderData } from '@/hooks/usePonderData';
import { Activity, RefreshCw } from 'lucide-react';

interface RootActivityFeedProps {
  tokenAddress: string;
  chainId: string;
  showDebug?: boolean;
  selectedTokenColor?: string;
}

interface ExtendedActivityItem extends ActivityItem {
  timeAgo: string;
  when: string;
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
  const [transformedActivities, setTransformedActivities] = useState<ExtendedActivityItem[]>([]);
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
    <VStack 
      spacing={4} 
      align="stretch" 
      w="100%" 
      bg="white" 
      borderRadius="xl" 
      shadow="sm" 
      overflow="hidden"
    >
      <Box 
        p={4} 
        borderBottom="1px" 
        borderColor="gray.100"
        bg="white"
      >
        <Flex 
          justifyContent="space-between" 
          alignItems="center"
        >
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="lg"
              bg={`${selectedTokenColor}10`}
            >
              <Activity size={20} color={selectedTokenColor} />
            </Box>
            <Heading size="md">Root Node Activity</Heading>
          </HStack>
          <Button 
            size="sm" 
            onClick={handleRefresh} 
            isLoading={isLoading || isPonderLoading}
            bg={selectedTokenColor}
            color="white"
            _hover={{
              bg: selectedTokenColor,
              opacity: 0.9,
            }}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        </Flex>
      </Box>
      
      {combinedError && (
        <Alert 
          status="error" 
          variant="left-accent"
          borderRadius="none"
        >
          <AlertIcon />
          <Text fontSize="sm">{combinedError.message}</Text>
        </Alert>
      )}
      
      <Box flex="1" position="relative" minH="400px">
        {(isLoading || isPonderLoading) && activities.length === 0 ? (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            py={8}
            h="100%"
            bg="gray.50"
          >
            <Spinner 
              size="xl" 
              color={selectedTokenColor} 
              thickness="3px"
              speed="0.8s"
            />
            <Text mt={4} color="gray.600">Loading activities...</Text>
          </Flex>
        ) : (
          <Box 
            overflowY="auto" 
            maxH="calc(100vh - 300px)"
            sx={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
                background: 'gray.50',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'gray.300',
                borderRadius: '24px',
              },
            }}
          >
            <ActivityFeed 
              activities={activities}
              isLoading={isLoading || isPonderLoading}
              error={combinedError ? combinedError.message : null}
              emptyStateMessage="No activities found for this root node. Activities will appear here when events occur in this node or any of its derived nodes."
            />
          </Box>
        )}
      </Box>

      {showDebug && (
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton 
              _hover={{ bg: 'gray.50' }}
              px={4}
            >
              <Box flex="1" textAlign="left">
                <Text fontSize="sm" color="gray.600">Debug Information</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel 
              pb={4} 
              bg="gray.50"
              fontSize="sm"
            >
              <VStack align="start" spacing={3}>
                <Box w="100%">
                  <Text fontWeight="medium" mb={1}>Root Node ID (Token Address):</Text>
                  <Code p={2} borderRadius="md" w="100%" fontSize="xs">{tokenAddress}</Code>
                </Box>
                
                <Box w="100%">
                  <Text fontWeight="medium" mb={1}>Chain ID:</Text>
                  <Code p={2} borderRadius="md" fontSize="xs">{chainId}</Code>
                </Box>
                
                <Box w="100%">
                  <Text fontWeight="medium" mb={1}>Activities Count:</Text>
                  <Text color="gray.600">{activities.length} activities</Text>
                </Box>
                
                <Box w="100%">
                  <Text fontWeight="medium" mb={1}>Loading State:</Text>
                  <Text color="gray.600">{(isLoading || isPonderLoading) ? 'Loading...' : 'Completed'}</Text>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </VStack>
  );
};