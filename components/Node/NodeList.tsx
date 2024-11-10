import React from 'react';
import { useRouter } from 'next/router';
import { VStack } from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';
import NodePill from './NodePill';

interface NodeListProps {
  nodes: NodeState[];
  totalValue: bigint;
  selectedTokenColor: string;
  chainId: string; // Make chainId required
  onNodeSelect: (nodeId: string) => void;
  onMintMembership: (nodeId: string) => void;
  onSpawnNode: (nodeId: string) => void;
  onTrickle: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  isProcessing: boolean;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes = [],
  totalValue = BigInt(0),
  selectedTokenColor,
  chainId, // Required prop
  onNodeSelect,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  nodeValues = {},
  isProcessing = false
}) => {
  const router = useRouter();

  const handleNodeClick = async (nodeId: string) => {
    const cleanChainId = chainId.replace('eip155:', '');
    
    try {
      await router.push({
        pathname: '/nodes/[chainId]/[nodeId]',
        query: {
          chainId: cleanChainId,
          nodeId
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {nodes.map(node => {
        if (!node?.basicInfo?.[0]) return null;

        const nodeId = node.basicInfo[0];
        const nodeValue = nodeValues[nodeId] || 0;

        return (
          <NodePill
            key={nodeId}
            node={node}
            totalValue={Number(totalValue)}
            color={selectedTokenColor}
            onNodeClick={() => handleNodeClick(nodeId)}
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