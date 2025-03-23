import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, useToast, VStack, Heading, Code, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem } from '../types/activity';
import { transformActivities } from '../utils/activityTransformers';

interface UserActivityFeedProps {
  userAddress: string;
  showDebug?: boolean;
}

/**
 * Component for displaying a user's activity feed
 */
export const UserActivityFeed: React.FC<UserActivityFeedProps> = ({ userAddress, showDebug = true }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  interface DebugInfo {
    fetchStarted?: string;
    fetchCompleted?: string;
    activityCount?: number;
    userAddress?: string;
    forceSync?: boolean;
    error?: string;
    [key: string]: any;
  }
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const toast = useToast();

  /**
   * Fetch user activities from the API
   */
  const fetchUserActivities = React.useCallback(async (forceSync: boolean = false) => {
    if (!userAddress) {
      setError('No user address provided');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Update debug info
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        fetchStarted: new Date().toISOString(),
        userAddress,
        forceSync
      }));
      
      // Fetch activities with optional force sync
      console.log(`[UserActivityFeed] Fetching activities for user ${userAddress}, forceSync: ${forceSync}`);
      const response = await fetch(`/api/ponder/activities?userAddress=${userAddress}&forceSync=${forceSync}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch activities: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      // Update debug info with API response
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        fetchCompleted: new Date().toISOString(),
        apiResponse: data,
        activitiesCount: Array.isArray(data.activities) ? data.activities.length : 0,
        responseDebug: data.debug || {}
      }));
      
      console.log(`[UserActivityFeed] Fetched ${Array.isArray(data.activities) ? data.activities.length : 0} activities for user ${userAddress}`);
      
      // If no activities found and we didn't force sync, try syncing
      if (Array.isArray(data.activities) && data.activities.length === 0 && !forceSync) {
        console.log(`[UserActivityFeed] No activities found, trying to sync`);
        return fetchUserActivities(true);
      }
      
      // Transform activities
      const transformedActivities = transformActivities(data.activities || [], true);
      
      // Update debug info
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        transformedActivities,
        transformedCount: transformedActivities.length
      }));
      
      setActivities(transformedActivities);
    } catch (err) {
      console.error('[UserActivityFeed] Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Update debug info
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error'
      }));
      
      toast({
        title: 'Error fetching activities',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, toast]);

  // Fetch activities on component mount
  useEffect(() => {
    if (userAddress) {
      fetchUserActivities();
    }
  }, [userAddress, fetchUserActivities]);

  // Function to manually refresh activities
  const handleRefresh = () => {
    fetchUserActivities(true);
    toast({
      title: 'Refreshing activities',
      description: 'Syncing and fetching latest activities...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md">User Activity</Heading>
        <Button 
          size="sm" 
          colorScheme="blue" 
          onClick={handleRefresh} 
          isLoading={isLoading}
        >
          Refresh Activities
        </Button>
      </Flex>
      
      {error && (
        <Box p={4} bg="red.50" color="red.500" borderRadius="md">
          <Text fontWeight="bold">Error:</Text>
          <Text>{error}</Text>
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
                <Text fontWeight="bold">User Address:</Text>
                <Code p={2} borderRadius="md" w="100%">{userAddress}</Code>
                
                <Text fontWeight="bold">Activities Count:</Text>
                <Text>{activities.length} activities found</Text>
                
                <Text fontWeight="bold">API Response Source:</Text>
                <Text>{debugInfo.responseDebug?.source || 'N/A'}</Text>
                
                <Text fontWeight="bold">Sync Result:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {JSON.stringify(debugInfo.responseDebug?.syncResult || {}, null, 2)}
                </Code>
                
                <Text fontWeight="bold">Activity Types:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {JSON.stringify(
                    activities.reduce((acc, activity) => {
                      acc[activity.type] = (acc[activity.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>),
                    null,
                    2
                  )}
                </Code>
                
                <Text fontWeight="bold">First Activity:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto">
                  {activities.length > 0 
                    ? JSON.stringify(activities[0], null, 2) 
                    : 'No activities found'}
                </Code>
                
                <Text fontWeight="bold">Raw API Response:</Text>
                <Code p={2} borderRadius="md" w="100%" overflowX="auto" maxH="300px" overflowY="auto">
                  {JSON.stringify(debugInfo.apiResponse || {}, null, 2)}
                </Code>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      
      <ActivityFeed 
        activities={activities} 
        isLoading={isLoading} 
        error={error}
        emptyStateMessage={`No activities found for user ${userAddress}. Try refreshing to sync from the blockchain.`}
      />
    </VStack>
  );
};
