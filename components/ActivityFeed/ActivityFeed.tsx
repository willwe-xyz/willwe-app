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

interface ActivityItem {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'spawn' | 'membership' | 
        'inflationChange' | 'membraneChange' | 'configSignal' | 'endpoint' | 
        'newMovement' | 'willWeSet' | 'membraneCreated' | 'newSignatures' | 
        'queueExecuted' | 'signatureRemoved' | 'latentActionRemoved' | 'redistribute' |
        'resignal';
  timestamp: number;
  description: string;
  account: string;
  nodeId?: string;
  amount?: string;
  tokenSymbol?: string;
  status: 'success' | 'pending' | 'failed';
  transactionHash?: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  selectedToken?: string;
}

export function ActivityFeed({
  activities = [],
  isLoading = false,
  error = null,
  onRefresh,
  selectedToken
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
    return [...activities].sort((a, b) => b.timestamp - a.timestamp);
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
        minH="400px"
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
            Error loading activities: {error.message}
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

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      height="100%"
      minH="400px"
    >
      <VStack spacing={6} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            Recent Activity
          </Text>
          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCw size={16} />}
              onClick={onRefresh}
              colorScheme="purple"
            >
              Refresh
            </Button>
          )}
        </Box>

        {sortedActivities.length === 0 ? (
          <Box
            py={12}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg={emptyStateBg}
            borderRadius="lg"
          >
            <Activity size={32} className="text-gray-400 mb-4" />
            <Text color={textColor}>No recent activity</Text>
            {selectedToken && (
              <Text color={textColor} fontSize="sm" mt={2}>
                Select a token to view its activity
              </Text>
            )}
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {sortedActivities.map((activity) => (
              <Box
                key={activity.id}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'sm',
                  bg: hoverBg
                }}
              >
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      {getActivityIcon(activity.type)}
                      <Text fontWeight="medium">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Text>
                    </HStack>
                    <Badge colorScheme={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </HStack>
                  
                  <Text color={textColor} fontSize="sm">
                    {activity.description}
                  </Text>
                  
                  {activity.amount && (
                    <Text fontSize="sm" fontWeight="medium">
                      Amount: {activity.amount} {activity.tokenSymbol}
                    </Text>
                  )}
                  
                  <HStack justify="space-between" fontSize="xs" color={textColor}>
                    <Text>
                      {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
                    </Text>
                    <HStack spacing={4}>
                      {activity.nodeId && (
                        <Text fontFamily="mono">
                          Node: {activity.nodeId.slice(0, 6)}...{activity.nodeId.slice(-4)}
                        </Text>
                      )}
                      <Text fontFamily="mono">
                        {activity.account.slice(0, 6)}...{activity.account.slice(-4)}
                      </Text>
                    </HStack>
                  </HStack>

                  {activity.transactionHash && (
                    <Text fontSize="xs" color="purple.500" fontFamily="mono">
                      Tx: {activity.transactionHash.slice(0, 10)}...
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default ActivityFeed;