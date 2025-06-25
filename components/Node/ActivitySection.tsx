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
  useDisclosure,
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
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  const { getNodeActivityLogs, isLoading } = usePonderData();
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!nodeId || !chainId || !isMounted) return;
    
    setRefreshLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/node/events?nodeId=${nodeId}&chainId=${chainId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const activities = data.events?.map((event: any) => ({
        id: event.id,
        type: event.eventType,
        timestamp: event.timestamp,
        user: event.userAddress,
        content: event.data,
        nodeId: event.nodeId
      })) || [];
      
      setActivities(activities);
    } catch (err) {
      console.error('Error fetching node activities:', err);
      setError('Activity feed is currently unavailable');
    } finally {
      setRefreshLoading(false);
    }
  }, [nodeId, chainId, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, fetchActivities]);

  const isFeedLoading = (isLoading || refreshLoading) && activities.length === 0;

  if (!isMounted) return null;

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center" p={4} pb={2}>
        <Heading size="sm">Node Activity</Heading>
        <Button
          size="sm"
          onClick={onToggle}
          isLoading={refreshLoading}
          colorScheme="blue"
          variant={isOpen ? "solid" : "outline"}
          rightIcon={<RepeatIcon />}
        >
          {isOpen ? 'Hide Activity' : 'Show Activity'}
        </Button>
      </Flex>
      
      {isOpen && (
        <>
          {error && (
            <Alert status="warning" mb={2} mx={4}>
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
                isLoading={isLoading}
                error={error}
                emptyStateMessage="No recent activity"
                selectedTokenColor={selectedTokenColor}
              />
            </Box>
          )}
        </>
      )}
    </VStack>
  );
};