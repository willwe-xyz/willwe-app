import React from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import { useAppKit } from '../../hooks/useAppKit';

const DashboardPage: React.FC = () => {
  const { user } = useAppKit();

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Dashboard</Heading>
        <Text>Welcome, {user?.wallet?.address || 'User'}</Text>
      </VStack>
    </Box>
  );
};

export default DashboardPage; 