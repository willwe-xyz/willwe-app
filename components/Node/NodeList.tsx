// File: ./components/Node/NodeList.tsx
import React from 'react';
import { VStack } from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';
import NodePill from './NodePill';

interface NodeListProps {
  nodes: NodeState[];
  totalValue: bigint;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  onMintMembership: (nodeId: string) => void;
  onSpawnNode: (nodeId: string) => void;
  onTrickle: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  isProcessing: boolean;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes = [], // Provide default empty array
  totalValue = BigInt(0), // Provide default value
  selectedTokenColor,
  onNodeSelect,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  nodeValues = {}, // Provide default empty object
  isProcessing = false
}) => {
  return (
    <VStack align="stretch" spacing={4}>
      {nodes.map(node => {
        // Safety check for node and required properties
        if (!node?.basicInfo?.[0]) return null;

        const nodeId = node.basicInfo[0];
        const nodeValue = nodeValues[nodeId] || 0;

        return (
          <NodePill
            key={nodeId}
            node={node}
            totalValue={Number(totalValue)}
            color={selectedTokenColor}
            onNodeClick={onNodeSelect}
            onMintMembership={onMintMembership}
            onSpawnNode={onSpawnNode}
            onTrickle={onTrickle}
            backgroundColor={`${selectedTokenColor}15`}
            textColor={selectedTokenColor}
            borderColor={selectedTokenColor}
            percentage={nodeValue}
            isProcessing={isProcessing}
          />
        );
      })}
    </VStack>
  );
};

export default NodeList;