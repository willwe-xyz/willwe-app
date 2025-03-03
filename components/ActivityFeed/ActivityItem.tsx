import React from 'react';
import { Box, Text, Flex, Badge, Icon, Tooltip, HStack } from '@chakra-ui/react';
import { FiArrowUp, FiArrowDown, FiSettings, FiUsers, FiStar, FiZap, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { ActivityItem as ActivityItemType } from '../../types/activity';

interface ActivityItemProps {
  activity: ActivityItemType;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
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

  const { icon, color, label } = getActivityIcon(activity.type);
  
  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="md" 
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={3}>
          <Tooltip label={label}>
            <Box>
              <Icon as={icon} color={color} boxSize={5} />
            </Box>
          </Tooltip>
          <Box>
            <Text fontWeight="bold">{activity.description}</Text>
            <Text fontSize="sm" color="gray.500">
              {activity.userAddress && `By: ${activity.userAddress.slice(0, 6)}...${activity.userAddress.slice(-4)}`}
            </Text>
          </Box>
        </HStack>
        <Box textAlign="right">
          <Badge colorScheme={color.split('.')[0]}>{label}</Badge>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {formatDate(activity.timestamp)}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
