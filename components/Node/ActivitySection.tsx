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
  Text,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { usePonderData } from '../../hooks/usePonderData';
import { ActivityFeed } from '../ActivityFeed/ActivityFeed';
import { useMemo } from 'react';

interface ActivitySectionProps {
  nodeId?: string;
  selectedTokenColor?: string;
  chainId?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  nodeId,
  selectedTokenColor = 'blue.500',
  chainId,
}) => {
  const { getNodeActivityLogs, isLoading } = usePonderData();
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if social features are enabled
  const isSocialEnabled = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOCIAL_ENABLED === 'true';
  }, []);

  const fetchActivities = useCallback(async () => {
    if (!nodeId || !chainId) return;
    
    // Don't fetch if social features are disabled
    if (!isSocialEnabled) {
      console.log('Social features are disabled. Skipping activities fetch.');
      setActivities([]);
      return;
    }
    
    setRefreshLoading(true);
    setError(null);
    
    try {
      // Use internal API endpoint that will proxy to Ponder
      const response = await fetch(`/api/node/events?nodeId=${nodeId}&networkId=${chainId}`);
      
      // Don't show error if social features are disabled
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          console.log('Node events API not available. Social features may be disabled.');
          setActivities([]);
          return;
        }
        throw new Error(`Error fetching node events: ${response.statusText}`);
      }
      
      const data = await response.json();
      setActivities(data.events || []);
    } catch (err) {
      // Don't show error if social features are disabled
      if (err instanceof Error && 
          (err.message.includes('Failed to fetch') || 
           err.message.includes('NetworkError'))) {
        console.log('Node events API not available. Social features may be disabled.');
        setActivities([]);
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setRefreshLoading(false);
    }
  }, [nodeId, chainId, isSocialEnabled]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const isFeedLoading = (isLoading || refreshLoading) && activities.length === 0;

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center" p={4} pb={2}>
        <Heading size="sm">Node Activity</Heading>
        {isSocialEnabled && (
          <Button
            size="sm"
            onClick={fetchActivities}
            isLoading={refreshLoading}
            colorScheme="blue"
            variant="outline"
            isDisabled={!isSocialEnabled}
          >
            <RepeatIcon />
          </Button>
        )}
      </Flex>
      
      {!isSocialEnabled ? (
        <Alert status="info" borderRadius="md" mx={4} mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Social features are currently disabled</Text>
            <Text fontSize="sm" mt={1}>
              Node activity and chat features are temporarily unavailable. Please check back later.
            </Text>
          </Box>
        </Alert>
      ) : (
        <>
          {error && (
            <Alert status="error" mb={2} mx={4}>
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
        </>
      )}
    </VStack>
  );
};