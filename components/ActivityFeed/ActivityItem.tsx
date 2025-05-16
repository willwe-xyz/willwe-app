import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Badge, Icon, Tooltip, HStack, VStack, Link } from '@chakra-ui/react';
import { FiArrowUp, FiArrowDown, FiSettings, FiUsers, FiStar, FiZap, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { ActivityItem as ActivityItemType } from '../../types/chainData';
import { formatDistanceToNow } from 'date-fns';
import { resolveENS } from '../../utils/ensUtils';

interface ActivityItemProps {
  activity: ActivityItemType;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const resolveName = async () => {
      if (activity.userAddress) {
        const resolvedName = await resolveENS(activity.userAddress);
        setDisplayName(resolvedName);
        console.log(resolvedName);

      }
    };
    resolveName();
  }, [activity.userAddress]);

  // Define icon and color based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return { icon: FiArrowUp, color: 'green.500', label: 'Mint' };
      case 'burn':
        return { icon: FiArrowDown, color: 'red.500', label: 'Burn' };
      case 'signal':
        return { icon: FiStar, color: 'yellow.500', label: 'Signal' };
      case 'resignal':
        return { icon: FiRefreshCw, color: 'blue.500', label: 'Resignal' };
      case 'transfer':
        return { icon: FiArrowUp, color: 'purple.500', label: 'Transfer' };
      case 'inflationChange':
        return { icon: FiSettings, color: 'orange.500', label: 'Inflation Change' };
      case 'membraneChange':
        return { icon: FiSettings, color: 'teal.500', label: 'Membrane Change' };
      case 'membership':
        return { icon: FiUsers, color: 'blue.500', label: 'Membership' };
      case 'configSignal':
        return { icon: FiSettings, color: 'gray.500', label: 'Config Signal' };
      case 'endpoint':
        return { icon: FiZap, color: 'yellow.500', label: 'Endpoint Created' };
      case 'newMovement':
        return { icon: FiUsers, color: 'green.500', label: 'New Movement' };
      case 'queueExecuted':
        return { icon: FiZap, color: 'purple.500', label: 'Queue Executed' };
      default:
        return { icon: FiStar, color: 'gray.500', label: type };
    }
  };

  const { icon, color, label } = getActivityIcon(activity.eventType);

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="md" 
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
      position="relative"
    >
      {/* Badge in top right */}
      <Box position="absolute" top={3} right={3}>
        <Badge colorScheme={color.split('.')[0]}>{label}</Badge>
      </Box>

      <VStack align="stretch" spacing={3}>
        {/* Main content */}
        <Flex justify="space-between" align="flex-start">
          <HStack spacing={3} flex={1}>
            <Tooltip label={label}>
              <Box>
                <Icon as={icon} color={color} boxSize={5} />
              </Box>
            </Tooltip>
            <Box>
              <Text fontWeight="bold">{activity.description}</Text>
              {activity.userAddress && (
                <Link 
                  href={`https://etherscan.io/address/${activity.userAddress}`}
                  isExternal
                  fontSize="sm" 
                  color="gray.500"
                  _hover={{ color: color }}
                >
                  By: {displayName}
                </Link>
              )}
            </Box>
          </HStack>
        </Flex>

        {/* Timestamp in bottom right */}
        <Flex justify="flex-end">
          <Text fontSize="xs" color="gray.500">
            {formatDistanceToNow(new Date(activity.timestamp || activity.when || Date.now()), { addSuffix: true })}
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
};
