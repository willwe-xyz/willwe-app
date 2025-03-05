// File: ./components/ActivityFeed/ActivityFeed.tsx

import React, { useMemo } from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Badge, 
  Spinner, 
  Button, 
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  GitBranch,
  Signal,
  Users,
  Sliders,
  Percent,
  Filter,
  FileSignature,
  CheckCircle,
  XCircle,
  Trash2,
  Globe,
  Layers,
  ArrowLeftRight,
  Repeat
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ActivityItem } from '../../types/activity';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  error?: Error | string | null;
  onRefresh?: () => void;
  selectedToken?: string;
  emptyStateMessage?: string;
}

export function ActivityFeed({
  activities = [],
  isLoading = false,
  error = null,
  onRefresh,
  selectedToken,
  emptyStateMessage = "No activities to display"
}: ActivityFeedProps) {
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const emptyStateBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <ArrowUpRight className="text-green-500" size={16} />;
      case 'burn':
        return <ArrowDownRight className="text-red-500" size={16} />;
      case 'transfer':
        return <ArrowLeftRight className="text-blue-500" size={16} />;
      case 'spawn':
        return <GitBranch className="text-purple-500" size={16} />;
      case 'signal':
        return <Signal className="text-blue-500" size={16} />;
      case 'resignal':
        return <Repeat className="text-blue-500" size={16} />;
      case 'membership':
        return <Users className="text-orange-500" size={16} />;
      case 'inflationChange':
        return <Percent className="text-yellow-500" size={16} />;
      case 'membraneChange':
        return <Filter className="text-teal-500" size={16} />;
      case 'configSignal':
        return <Sliders className="text-indigo-500" size={16} />;
      case 'endpoint':
        return <Globe className="text-cyan-500" size={16} />;
      case 'newMovement':
        return <Layers className="text-pink-500" size={16} />;
      case 'newSignatures':
        return <FileSignature className="text-blue-500" size={16} />;
      case 'queueExecuted':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'signatureRemoved':
        return <XCircle className="text-red-500" size={16} />;
      case 'latentActionRemoved':
        return <Trash2 className="text-orange-500" size={16} />;
      case 'redistribute':
        return <ArrowUpRight className="text-purple-500" size={16} />;
      default:
        return <Activity className="text-gray-500" size={16} />;
    }
  };

  const sortedActivities = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }
    
    // Convert string timestamps to Date objects for sorting
    return [...activities].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [activities]);

  if (isLoading) {
    return (
      <Box
        p={8}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="200px"
      >
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        p={8}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="center">
          <Text color="red.500" fontWeight="medium">
            Error loading activities: {typeof error === 'string' ? error : error.message}
          </Text>
          {onRefresh && (
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={onRefresh}
              colorScheme="purple"
              size="sm"
            >
              Retry
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Box
        p={8}
        bg={emptyStateBg}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="200px"
      >
        <Text color={textColor} mb={4} textAlign="center">
          {emptyStateMessage}
        </Text>
        {onRefresh && (
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={onRefresh}
            colorScheme="purple"
            size="sm"
          >
            Refresh
          </Button>
        )}
      </Box>
    );
  }

  return (
    <VStack spacing={0} align="stretch" bg={bgColor} borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="hidden">
      {sortedActivities.map((activity, index) => (
        <Box
          key={activity.id || index}
          p={4}
          borderBottom={index < sortedActivities.length - 1 ? "1px solid" : "none"}
          borderColor={borderColor}
          _hover={{ bg: hoverBg }}
          transition="background-color 0.2s"
        >
          <HStack spacing={4} align="flex-start">
            <Box
              p={2}
              borderRadius="full"
              bg={`${getStatusColor(activity.status || 'success')}.100`}
              color={`${getStatusColor(activity.status || 'success')}.500`}
            >
              {getActivityIcon(activity.type)}
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="medium">{activity.description}</Text>
              <HStack spacing={2}>
                <Badge colorScheme={getStatusColor(activity.status || 'success')} variant="subtle">
                  {activity.status || 'success'}
                </Badge>
                {activity.timestamp && (
                  <Text fontSize="sm" color={textColor}>
                    {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                  </Text>
                )}
                {activity.nodeId && (
                  <Badge colorScheme="purple" variant="outline">
                    Node {activity.nodeId}
                  </Badge>
                )}
                {activity.eventType && (
                  <Badge colorScheme="blue" variant="outline">
                    {activity.eventType}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}

export default ActivityFeed;