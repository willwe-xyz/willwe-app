import React from 'react';
import { VStack, Box, Text, HStack } from '@chakra-ui/react';
import { NodeCard } from '../Node/NodeCard';
import { NodeState } from '../../types/chainData';

interface NodeSectionProps {
  title: string;
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
}

export const NodeSection: React.FC<NodeSectionProps> = ({
  title,
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues
}) => (
  <VStack align="stretch" spacing={4} mb={8}>
    <Text fontSize="lg" fontWeight="semibold">{title}</Text>
    <Box 
      overflowX="auto" 
      overflowY="hidden"
      position="relative"
      pb={4}
    >
      <HStack spacing={4}>
        {nodes.map((node, index) => (
          <NodeCard
            key={node.basicInfo[0]}
            node={node}
            index={index}
            selectedTokenColor={selectedTokenColor}
            onNodeSelect={onNodeSelect}
            nodeValues={nodeValues}
          />
        ))}
      </HStack>
    </Box>
  </VStack>
);