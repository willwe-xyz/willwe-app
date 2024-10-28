import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { formatBalance } from '../../hooks/useBalances';

interface NodeStatsProps {
  totalValue: string;
  selectedTokenColor: string;
}

const NodeStats: React.FC<NodeStatsProps> = ({ totalValue, selectedTokenColor }) => {
  return (
    <Box p={4} borderRadius="md" bg={`${selectedTokenColor}10`}>
      <Text fontSize="sm" color="gray.600" mb={1}>
        Total Value Locked
      </Text>
      <Text fontSize="xl" fontWeight="bold">
        {formatBalance(totalValue)}
      </Text>
    </Box>
  );
};

export default NodeStats;