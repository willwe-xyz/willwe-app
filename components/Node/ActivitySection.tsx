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
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { usePonderData } from '../../hooks/usePonderData';
import { ActivityFeed } from '../ActivityFeed/ActivityFeed';

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

  const fetchActivities = useCallback(async () => {
    if (!nodeId || !chainId) return;
    setRefreshLoading(true);
    setError(null);
    try {
      const data = await getNodeActivityLogs(nodeId, chainId);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setRefreshLoading(false);
    }
  }, [nodeId, chainId, getNodeActivityLogs]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const isFeedLoading = (isLoading || refreshLoading) && activities.length === 0;

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center" p={4} pb={2}>
        <Heading size="sm">Node Activity</Heading>
        <Button
          size="sm"
          onClick={fetchActivities}
          isLoading={refreshLoading}
          colorScheme="blue"
          variant="outline"
        >
          <RepeatIcon />
        </Button>
      </Flex>
      {error && (
        <Alert status="error" mb={2}>
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
    </VStack>
  );
};