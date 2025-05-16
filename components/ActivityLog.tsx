import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Heading, Divider, Spinner, Badge } from '@chakra-ui/react';
import { usePonderData } from '../hooks/usePonderData';
import { formatDistanceToNow } from 'date-fns';
import { useAccount } from 'wagmi';

interface ActivityLogProps {
  nodeId?: string;
  userAddress?: string;
  limit?: number;
  chainId?: string;
}

export default function ActivityLog({ nodeId, userAddress, limit = 10, chainId }: ActivityLogProps) {
  const { address } = useAccount();
  const { getNodeActivityLogs, getUserActivityLogs, getUserFeed, isLoading, error } = usePonderData();
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [view, setView] = useState<'node' | 'user' | 'feed'>('node');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!chainId) return;
      try {
        let logs = [];
        if (view === 'node' && nodeId) {
          logs = await getNodeActivityLogs(nodeId, chainId, limit);
        } else if (view === 'user' && (userAddress || address)) {
          logs = await getUserActivityLogs(userAddress || address as string, chainId, limit);
        } else if (view === 'feed' && address) {
          logs = await getUserFeed(address, chainId, limit);
        }
        setActivityLogs(logs);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
      }
    };

    fetchLogs();
  }, [nodeId, userAddress, address, view, limit, chainId, getNodeActivityLogs, getUserActivityLogs, getUserFeed]);

  // Function to format the activity log message
  const formatActivityLogMessage = (log: any) => {
    const { event_type, data, user_address } = log;
    const shortAddress = user_address ? `${user_address.slice(0, 6)}...${user_address.slice(-4)}` : 'Unknown';

    switch (event_type) {
      case 'MembershipMinted':
        return `${shortAddress} minted a membership for node ${data.branchId}`;
      case 'InflationMinted':
        return `Inflation of ${data.amount} tokens minted for node ${data.branchId}`;
      case 'MembraneCreated':
        return `${shortAddress} created a new membrane (ID: ${data.membraneId})`;
      case 'MovementCreated':
        return `${shortAddress} created a new ${data.type} movement: "${data.description}"`;
      case 'MovementSigned':
        return `${shortAddress} signed a movement`;
      case 'MovementExecuted':
        return `${shortAddress} executed a movement`;
      default:
        return `${event_type} event occurred`;
    }
  };

  // Function to get badge color based on event type
  const getBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'MembershipMinted':
        return 'green';
      case 'InflationMinted':
        return 'purple';
      case 'MembraneCreated':
        return 'blue';
      case 'MovementCreated':
        return 'orange';
      case 'MovementSigned':
        return 'yellow';
      case 'MovementExecuted':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="red.500">Error loading activity logs: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Activity Log</Heading>
      <Box className="flex border-b">
        {nodeId && (
          <button
            className={`px-4 py-2 text-sm font-medium ${view === 'node' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setView('node')}
          >
            Node Activity
          </button>
        )}
        <button
          className={`px-4 py-2 text-sm font-medium ${view === 'user' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setView('user')}
        >
          User Activity
        </button>
        {address && (
          <button
            className={`px-4 py-2 text-sm font-medium ${view === 'feed' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setView('feed')}
          >
            My Feed
          </button>
        )}
      </Box>
      {activityLogs.length === 0 ? (
        <Text>No activity logs found.</Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {activityLogs.map((log, index) => (
            <Box key={index} p={3} borderWidth="1px" borderRadius="md" shadow="sm">
              <Badge colorScheme={getBadgeColor(log.event_type)}>{log.event_type}</Badge>
              <Text mt={2}>{formatActivityLogMessage(log)}</Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
