import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, useToast, VStack, Heading, Code, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Spinner } from '@chakra-ui/react';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem, ActivityLogEntry } from '../types/activity';
import { transformActivities } from '../utils/activityTransformers';
import { useActivityFeed } from '../hooks/useActivityFeed';

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
  const { activities, isLoading, error, refresh } = useActivityFeed(chainId, userAddress);
  const [transformedActivities, setTransformedActivities] = useState<ActivityItem[]>([]);
  
  interface DebugInfo {
    fetchStarted?: string;
    userAddress?: string;
    activitiesCount?: number;
    transformedCount?: number;
    error?: string;
    [key: string]: any;
  }
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const toast = useToast();

  // Transform activities when they change
  useEffect(() => {
    if (activities.length) {
      try {
        const transformed = transformActivities(activities as unknown as ActivityLogEntry[], true);
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
        
        // If transformation fails, use the original activities
        setTransformedActivities(activities as unknown as ActivityItem[]);
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
      userAddress
    }));
  }, [userAddress]);

  // Function to manually refresh activities
  const handleRefresh = () => {
    setDebugInfo(prev => ({
      ...prev,
      refreshTriggered: new Date().toISOString()
    }));
    
    refresh();
    
    toast({
      title: 'Refreshing activities',
      description: 'Fetching latest activities...',
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
          <Text>{error.message}</Text>
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
                
                <Text fontWeight="bold">Chain ID:</Text>
                <Code p={2} borderRadius="md">{chainId}</Code>
                
                <Text fontWeight="bold">Activities Count:</Text>
                <Text>{activities.length} raw / {transformedActivities.length} transformed</Text>
                
                <Text fontWeight="bold">Loading State:</Text>
                <Text>{isLoading ? 'Loading...' : 'Completed'}</Text>
                
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
      
      {isLoading && transformedActivities.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4}>Loading activities...</Text>
        </Box>
      ) : (
        <ActivityFeed 
          activities={transformedActivities} 
          isLoading={isLoading} 
          error={error ? error.message : null}
          emptyStateMessage={`No activities found for this user. Activities will appear here when you interact with nodes or when activity occurs in nodes where you're a member.`}
        />
      )}
    </VStack>
  );
};
