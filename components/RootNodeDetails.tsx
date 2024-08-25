import React, { useState, useCallback } from 'react';
import { Box, Button, Spinner, Text, Flex, VStack, HStack, Badge } from "@chakra-ui/react";
import { NodeState } from "../types/chainData";
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/router';
import NodeDetails from './NodeDetails';
import { useRootNodes } from '../hooks/useRootNodes';

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ chainId, rootToken, selectedTokenColor, onNodeSelect }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const router = useRouter();

  const { rootNodeStates, isLoading, error, refetch } = useRootNodes(chainId, rootToken);

  const handleNodeClick = useCallback((node: NodeState) => {
    setSelectedNode(node);
    onNodeSelect(node.basicInfo[0]);
  }, [onNodeSelect]);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Button leftIcon={<RefreshCw size={16} />} onClick={refetch} size="sm">Refresh</Button>
        <Text>Total Nodes: {rootNodeStates.reduce((acc, curr) => acc + curr.nodes.length, 0)}</Text>
      </Flex>
      
      <Flex>
        <Box flex={1} mr={4}>
          <VStack align="stretch" spacing={2}>
            {rootNodeStates.map((rootNodeState, index) => (
              <Box key={index}>
                <Text fontWeight="bold">Depth: {rootNodeState.depth}</Text>
                {rootNodeState.nodes.map((node) => (
                  <Box
                    key={node.basicInfo[0]}
                    p={2}
                    bg={node === selectedNode ? selectedTokenColor : 'gray.100'}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    <Text fontWeight="bold">{node.basicInfo[0]}</Text>
                    <Text fontSize="sm">Value: {node.basicInfo[4]}</Text>
                  </Box>
                ))}
              </Box>
            ))}
          </VStack>
        </Box>
        <Box width="300px">
          {selectedNode && (
            <NodeDetails
              node={selectedNode}
              chainId={chainId}
              onNodeSelect={(nodeId) => {
                const node = rootNodeStates.flatMap(rns => rns.nodes).find(n => n.basicInfo[0] === nodeId);
                if (node) handleNodeClick(node);
              }}
            />
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default RootNodeDetails;