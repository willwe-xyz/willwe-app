import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, useColorModeValue, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { ActivityFeed } from './ActivityFeed/ActivityFeed';
import { ActivityItem, transformActivities } from '../utils/activityTransformers';

interface UserActivityFeedProps {
  userAddress: string;
  selectedTokenColor?: string;
}

export const UserActivityFeed: React.FC<UserActivityFeedProps> = ({
  userAddress,
  selectedTokenColor
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const fetchUserActivities = async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[UserActivityFeed] Fetching activities for user ${userAddress}`);
      const response = await fetch(`/api/ponder/activities?userAddress=${userAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user activities: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[UserActivityFeed] Received ${Array.isArray(data) ? data.length : 0} activities`);
      
      // Make sure data is an array before transforming
      if (!Array.isArray(data)) {
        console.warn('[UserActivityFeed] Expected array of activities but received:', data);
        setActivities([]);
        return;
      }
      
      // Transform the data using the utility function
      const transformedActivities = transformActivities(data, true);
      
      setActivities(transformedActivities);
    } catch (error) {
      console.error('[UserActivityFeed] Error fetching user activities:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserActivities();
  }, [userAddress]);
  
  return (
    <Box 
      p={6} 
      bg={bgColor} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">Your Recent Activity</Heading>
        
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle>Error loading activities</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        
        <ActivityFeed 
          activities={activities}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchUserActivities}
        />
      </VStack>
    </Box>
  );
};

export default UserActivityFeed;
