// components/Node/NodeCard.tsx
import { VStack } from '@chakra-ui/react';
import { Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatBalance } from '../../utils/formatters';
import { NodeState } from '../../types/chainData';

interface NodeCardProps {
  node: NodeState;
  index: number;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  index,
  selectedTokenColor,
  onNodeSelect,
  nodeValues
}) => {
  if (!node?.basicInfo?.[0]) return null;
  
  const nodeId = node.basicInfo[0];
  const memberCount = node.membersOfNode?.length || 0;
  const signalCount = node.signals?.length || 0;
  const nodeValue = node.basicInfo[4];
  const percentage = nodeValues[nodeId] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Box
        p={4}
        bg="white"
        rounded="lg"
        shadow="sm"
        border="1px solid"
        borderColor={selectedTokenColor}
        minW="240px"
        cursor="pointer"
        onClick={() => onNodeSelect(nodeId)}
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        transition="all 0.2s"
      >
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="medium">
            Node {nodeId.slice(-6)}
          </Text>
          {signalCount > 0 && (
            <Box
              w="2"
              h="2"
              rounded="full"
              bg={selectedTokenColor}
              animation="pulse 2s infinite"
            />
          )}
        </HStack>

        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <HStack>
              <Activity size={14} />
              <Text fontSize="sm">
                {formatBalance(nodeValue)}
              </Text>
            </HStack>
            <HStack>
              <Users size={14} />
              <Text fontSize="sm">{memberCount}</Text>
            </HStack>
          </HStack>

          <Box bg="gray.100" rounded="full" h="2" overflow="hidden">
            <Box
              bg={selectedTokenColor}
              h="full"
              w={`${percentage}%`}
              transition="width 0.3s ease"
            />
          </Box>
          <Text fontSize="xs" color="gray.500" textAlign="right">
            {percentage.toFixed(1)}%
          </Text>
        </VStack>
      </Box>
    </motion.div>
  );
};

// components/Node/StatsCard.tsx
import React from 'react';
import { Box, HStack, Text, Tooltip } from '@chakra-ui/react';
import { IconType } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: IconType;
  bgColor: string;
  textColor: string;
  tooltip: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  tooltip
}) => (
  <Tooltip label={tooltip}>
    <Box
      p={4}
      bg={bgColor}
      rounded="lg"
      flex="1"
      minW="200px"
      role="group"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md'
      }}
    >
      <HStack color={textColor} mb={1}>
        <Icon size={16} />
        <Text fontSize="sm">{title}</Text>
      </HStack>
      <Text fontSize="2xl" fontWeight="semibold">
        {value}
      </Text>
    </Box>
  </Tooltip>
);