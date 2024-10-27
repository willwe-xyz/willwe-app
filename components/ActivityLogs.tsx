import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Divider,
  HStack,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { Activity, Clock } from 'lucide-react';

interface ActivityLog {
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'redistribution';
  timestamp: Date;
  nodeId: string;
  details: string;
  status: 'pending' | 'completed' | 'failed';
}

const ActivityLogs: React.FC = () => {
  // In a real implementation, this would come from a context or prop
  const recentActivities: ActivityLog[] = [];
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  const getStatusColor = (status: ActivityLog['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <Heading size="md">Recent Activity</Heading>
          <Activity size={20} />
        </HStack>
        
        <Divider />
        
        {recentActivities.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {recentActivities.map((activity, index) => (
              <Box
                key={index}
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <HStack justify="space-between" mb={2}>
                  <Badge colorScheme={getStatusColor(activity.status)}>
                    {activity.type.toUpperCase()}
                  </Badge>
                  <HStack spacing={1} color="gray.500">
                    <Clock size={14} />
                    <Text fontSize="sm">{formatTimestamp(activity.timestamp)}</Text>
                  </HStack>
                </HStack>
                <Text fontSize="sm" fontWeight="medium">
                  Node: {activity.nodeId}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {activity.details}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No recent activity</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ActivityLogs;