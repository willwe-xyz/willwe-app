import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Spinner, Text, Flex, VStack, HStack, Badge } from "@chakra-ui/react";
import { NodeState, getAllNodesForRoot } from "../lib/chainData";
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/router';
import GridNavigation from './GridNavigation';
import NodeDetails from './NodeDetails';

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
  selectedTokenColor?: string;
  onNodeSelect: (nodeId: string) => void;
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ chainId, rootToken, selectedTokenColor = '#3182CE', onNodeSelect }) => {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const router = useRouter();

  // Remove "eip155:" prefix from chainId
  const cleanChainId = chainId.replace(/^eip155:/, '');

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching nodes for chainId:", cleanChainId, "rootToken:", rootToken);
      const fetchedNodes = await getAllNodesForRoot(cleanChainId, rootToken);
      console.log("Raw fetched nodes:", fetchedNodes);
      const flattenedNodes = fetchedNodes.flatMap(rootNode => 
        rootNode.nodes.map(nodeArray => {
          const [basicInfo, membersOfNode, childrenNodes, rootPath, signals] = nodeArray;
          return {
            basicInfo,
            membersOfNode,
            childrenNodes,
            rootPath,
            signals
          };
        })
      );
      console.log("Flattened nodes:", flattenedNodes);
      setNodes(flattenedNodes);
      
      // If there's a node ID in the URL, select it
      const { nodeid } = router.query;
      if (nodeid && typeof nodeid === 'string') {
        const foundNode = flattenedNodes.find(node => node.basicInfo[0] === nodeid);
        setSelectedNode(foundNode || null);
      } else if (flattenedNodes.length > 0) {
        setSelectedNode(flattenedNodes[0]);
      }
    } catch (error) {
      console.error("Error fetching nodes:", error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [cleanChainId, rootToken, router.query]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const handleNodeClick = useCallback((node: NodeState) => {
    console.log("Node clicked in RootNodeDetails:", node.basicInfo[0]);
    setSelectedNode(node);
    onNodeSelect(node.basicInfo[0]);
    router.push(`/nodes/${cleanChainId}/${node.basicInfo[0]}`, undefined, { shallow: true });
  }, [onNodeSelect, router, cleanChainId]);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Button leftIcon={<RefreshCw size={16} />} onClick={fetchNodes} size="sm">Refresh</Button>
        <Text>Total Nodes: {nodes.length}</Text>
      </Flex>
      
      <Flex>
        <Box flex={1} mr={4}>
          <GridNavigation
            nodes={nodes}
            initialNodeId={selectedNode?.basicInfo[0] || ''}
            onNodeSelect={handleNodeClick}
            selectedNodeId={selectedNode?.basicInfo[0] || null}
          />
        </Box>
        <Box width="300px">
          <NodeDetails
            node={selectedNode}
            chainId={cleanChainId}
            onNodeSelect={(nodeId) => {
              const node = nodes.find(n => n.basicInfo[0] === nodeId);
              if (node) handleNodeClick(node);
            }}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default RootNodeDetails;