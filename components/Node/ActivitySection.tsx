import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Button, HStack, Center, Spinner } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { SignalHistory } from './SignalHistory';
import { UserSignal } from '../../types/chainData';
import { ActivityItem } from '../ActivityFeed/ActivityItem';
import { transformActivities } from '../../utils/activityTransformers';
import { ActivityLogEntry, ActivityItem as ActivityItemType } from '../../types/activity';

interface ActivitySectionProps {
  signals?: UserSignal[];
  isLoading?: boolean;
  nodeId?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  signals = [],
  isLoading = false,
  nodeId
}) => {
  const [activities, setActivities] = useState<ActivityItemType[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<Error | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any | null>(null);

  const fetchActivities = async () => {
    if (!nodeId) return;
    
    setActivityLoading(true);
    try {
      console.log(`Fetching activities for node ${nodeId} (type: ${typeof nodeId})`);
      
      const response = await fetch(`/api/ponder/activities?nodeId=${nodeId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from server: ${errorText}`);
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Retrieved ${data.length} activities for node ${nodeId}`);
      
      if (data.length === 0) {
        console.log(`No activities found for node ${nodeId}. Checking database...`);
        // Try to insert a test activity for this node to check if the database is working
        try {
          const testResponse = await fetch(`/api/ponder/debug-database?action=test-insert&nodeId=${nodeId}`);
          if (testResponse.ok) {
            console.log('Test activity inserted successfully');
            // Try to fetch activities again
            const retryResponse = await fetch(`/api/ponder/activities?nodeId=${nodeId}`);
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log(`After test insert: Retrieved ${retryData.length} activities for node ${nodeId}`);
              if (retryData.length > 0) {
                console.log('Database is working, but no real activities were found');
              }
            }
          }
        } catch (testError) {
          console.error('Error inserting test activity:', testError);
        }
      }
      
      console.log('Activity types:', data.map((a: any) => a.event_type).join(', '));
      
      // Transform the data using the utility function
      const transformedActivities = transformActivities(data, false);
      console.log('Transformed activities:', transformedActivities);
      
      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivityError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (nodeId) {
      console.log(`ActivitySection: Initializing with node ID ${nodeId} (type: ${typeof nodeId})`);
      fetchActivities();
    }
  }, [nodeId]);

  /**
   * Sync activities from Ponder to our database
   */
  const syncActivitiesFromPonder = async () => {
    try {
      setSyncLoading(true);
      setSyncError(null);
      
      console.log(`[ActivitySection] Syncing activities for node ${nodeId}`);
      
      const response = await fetch(`/api/ponder/sync-activities?nodeId=${nodeId}&limit=100`);
      
      if (!response.ok) {
        throw new Error(`Failed to sync activities: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[ActivitySection] Sync result:`, data);
      
      // If we synced any activities, refresh the list
      if (data.synced > 0) {
        fetchActivities();
      }
      
      setSyncResult(data);
    } catch (error) {
      console.error('[ActivitySection] Error syncing activities:', error);
      setSyncError(error instanceof Error ? error.message : String(error));
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
              onClick={syncActivitiesFromPonder}
              isLoading={syncLoading}
              colorScheme="teal"
            >
              Sync
            </Button>
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              onClick={fetchActivities}
              isLoading={activityLoading}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>
        
        {activityError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle>Error loading activities</AlertTitle>
            <AlertDescription>{activityError.message}</AlertDescription>
          </Alert>
        )}
        
        {syncError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle>Error syncing activities</AlertTitle>
            <AlertDescription>{syncError}</AlertDescription>
          </Alert>
        )}
        
        {activityLoading ? (
          <Center py={8}>
            <Spinner size="lg" />
          </Center>
        ) : activities.length === 0 ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">No recent activity</Text>
            <Button 
              mt={4} 
              size="sm" 
              onClick={syncActivitiesFromPonder}
              colorScheme="teal"
            >
              Sync Activities from Ponder
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
          <SignalHistory signals={signals} isLoading={isLoading} />
        </Box>
      )}
    </VStack>
  );
};