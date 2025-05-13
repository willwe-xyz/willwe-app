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
    const transformAndSetActivities = async () => {
      if (activities.length) {
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
            nodeId: activity.nodeId || activity.node_id || '0',
            who: activity.who || activity.userAddress || activity.user_address || 'unknown',
            eventName: activity.eventName || 'Unknown Activity',
            eventType: activity.eventType || activity.event_type || 'unknown',
            when: activity.when || activity.timestamp || new Date().toISOString(),
            createdBlockNumber: activity.createdBlockNumber || activity.blockNumber || 0,
            network: activity.network || 'unknown',
            networkId: activity.networkId || activity.chainId || '0',
            description: `Activity related to node ${activity.nodeId || activity.node_id || 'unknown'}`
          }));
          setTransformedActivities(simpleActivities);
        }
      } else {
        setTransformedActivities([]);
      }
    };
    transformAndSetActivities();
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
    <Box
      bg="white"
      shadow="sm"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box p={4} borderBottom="1px" borderColor="gray.100" bg="gray.50">
        <Flex 
          justifyContent="space-between" 
          alignItems="center"
        >
          <HStack spacing={2}>
            <Box
              
              borderRadius="lg"
              bg={`${selectedTokenColor}10`}
            >
              <Activity size={14} color={selectedTokenColor} />
            </Box>
            <Heading size="sm">Network Activity</Heading>
          </HStack>
          <Button 
            size="sx" 
            onClick={handleRefresh} 
            isLoading={isLoading || isPonderLoading}
            borderColor={selectedTokenColor}
            variant="outline"
            color={selectedTokenColor}
            bg="transparent"
            _hover={{
              bg: selectedTokenColor,
              opacity: 0.9,
              color: 'white'
            }}
          >
            <RefreshCw size={16}/>
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
      
      <Box flex="1" position="relative" minH="400px" h="100%">
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
            maxH="calc(100vh - 200px)"
            minH="400px"
            h="100%"
            p={4}
            sx={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
                bg: 'gray.50',
              },
              '&::-webkit-scrollbar-thumb': {
                bg: 'gray.300',
                borderRadius: '24px',
              },
            }}
          >
            <ActivityFeed 
              activities={transformedActivities}
              isLoading={isLoading || isPonderLoading}
              error={combinedError ? combinedError.message : null}
              emptyStateMessage="No activities found for this root node. Activities will appear here when events occur in this node or any of its derived nodes."
              selectedTokenColor={selectedTokenColor}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};