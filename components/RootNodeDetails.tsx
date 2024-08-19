import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Grid, GridItem, Button, Spinner, Tooltip, Text, Flex, VStack, HStack, Badge } from "@chakra-ui/react";
import { NodeState, getAllNodesForRoot, RootNodeState } from "../lib/chainData";
import { RefreshCw, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { ethers } from 'ethers';
import chroma from 'chroma-js';

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
  selectedTokenColor?: string;
}

interface NodeBoxProps {
  node: NodeState;
  depth: number;
  maxDepth: number;
  parentValue: number;
  rootValue: number;
  color: string;
  onClick: () => void;
}

const NodeBox: React.FC<NodeBoxProps> = ({ node, depth, maxDepth, parentValue, rootValue, color, onClick }) => {
  const [nodeId, inflation, balanceAnchor, balanceBudget] = node.basicInfo;
  const nodeValue = parseFloat(ethers.formatEther(balanceBudget));
  const relativeToParent = parentValue > 0 ? nodeValue / parentValue : 0;
  const relativeToRoot = rootValue > 0 ? nodeValue / rootValue : 0;

  const baseColor = chroma(color);
  const nodeColor = baseColor.saturate(relativeToParent * 2).brighten(3 - relativeToRoot * 3);

  const formattedBA = parseFloat(ethers.formatEther(balanceAnchor)).toFixed(4);
  const formattedBB = parseFloat(ethers.formatEther(balanceBudget)).toFixed(4);
  const formattedInflation = (parseFloat(inflation) / 1e9).toFixed(2);

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}>
      <Box
        width="100%"
        height="120px"
        borderWidth={2}
        borderColor={nodeColor.darken().hex()}
        borderRadius="md"
        overflow="hidden"
        cursor="pointer"
        boxShadow="md"
        bg={nodeColor.hex()}
        position="relative"
        p={3}
      >
        <VStack align="stretch" height="100%" justify="space-between">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="bold">{nodeId.slice(0, 8)}...</Text>
            <HStack>
              <Users size={14} />
              <Text fontSize="xs">{node.membersOfNode.length}</Text>
            </HStack>
          </HStack>
          <VStack align="stretch" spacing={1}>
            <Text fontSize="xs">BA: {formattedBA}</Text>
            <Text fontSize="xs">BB: {formattedBB}</Text>
          </VStack>
          <HStack justify="space-between">
            <Badge colorScheme={parseFloat(formattedInflation) > 0 ? "green" : "red"} fontSize="xs">
              {parseFloat(formattedInflation) > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {formattedInflation}%
            </Badge>
            <Text fontSize="xs">Depth: {depth}</Text>
          </HStack>
        </VStack>
        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          height="4px"
          bg={baseColor.darken(2).hex()}
          opacity={(depth + 1) / (maxDepth + 1)}
        />
      </Box>
    </motion.div>
  );
};

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ chainId, rootToken, selectedTokenColor = '#3182CE' }) => {
  const [nodes, setNodes] = useState<RootNodeState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNodes = await getAllNodesForRoot(chainId, rootToken);
      setNodes(fetchedNodes);
    } catch (error) {
      console.error("Error fetching nodes:", error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, rootToken]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const handleRetry = () => fetchNodes();

  const handleNodeClick = (nodeId: string) => {
    router.push(`/nodes/${nodeId}`);
  };

  const { colorMap, gridData, maxDepth, rootValue, totalNodes, totalValue, totalMembers } = useMemo(() => {
    const baseColor = chroma(selectedTokenColor);
    const colorMap: { [key: string]: string } = {};
    const grid: NodeState[][] = [];
    let maxDepth = 0;
    let rootValue = 0;
    let totalNodes = 0;
    let totalValue = 0;
    let totalMembers = 0;

    const generateColor = (parentColor: string, index: number) => {
      return chroma(parentColor)
        .set('hsl.h', (chroma(parentColor).get('hsl.h') + 60 * index) % 360)
        .hex();
    };

    nodes.forEach((rootNode) => {
      const depth = parseInt(rootNode.depth);
      maxDepth = Math.max(maxDepth, depth);
      
      if (!grid[depth]) {
        grid[depth] = [];
      }
      
      rootNode.nodes.forEach((node, index) => {
        grid[depth].push(node);
        const parentKey = node.rootPath.slice(0, -1).join('-') || 'root';
        const nodeKey = node.rootPath.join('-');
        
        if (!colorMap[nodeKey]) {
          colorMap[nodeKey] = generateColor(colorMap[parentKey] || baseColor.hex(), index);
        }
        
        const nodeValue = parseFloat(ethers.formatEther(node.basicInfo[3]));
        if (depth === 0) {
          rootValue += nodeValue;
        }
        totalValue += nodeValue;
        totalNodes++;
        totalMembers += node.membersOfNode.length;
      });
    });

    grid.forEach(row => row.sort((a, b) => parseFloat(ethers.formatEther(b.basicInfo[3])) - parseFloat(ethers.formatEther(a.basicInfo[3]))));

    return { colorMap, gridData: grid, maxDepth, rootValue, totalNodes, totalValue, totalMembers };
  }, [nodes, selectedTokenColor]);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Button onClick={handleRetry}>Retry</Button>;

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Button leftIcon={<RefreshCw size={16} />} onClick={handleRetry} size="sm">Refresh</Button>
        <VStack align="flex-end" spacing={1}>
          <HStack>
            <Text fontWeight="bold">Total Nodes:</Text>
            <Badge colorScheme="blue">{totalNodes}</Badge>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Total Members:</Text>
            <Badge colorScheme="green">{totalMembers}</Badge>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Total Value:</Text>
            <Badge colorScheme="purple">{totalValue.toFixed(4)}</Badge>
          </HStack>
        </VStack>
      </Flex>
      
      {gridData.length === 0 ? (
        <Text>No nodes found for this root token.</Text>
      ) : (
        <VStack spacing={8}>
          {gridData.map((row, depth) => (
            <Grid
              key={depth}
              templateColumns={`repeat(${Math.min(row.length, 4)}, 1fr)`}
              gap={4}
              width="100%"
            >
              {row.map((node) => {
                const nodeKey = node.rootPath.join('-');
                const parentKey = node.rootPath.slice(0, -1).join('-') || 'root';
                const parentValue = depth > 0 ? parseFloat(ethers.formatEther(gridData[depth - 1].find(n => n.basicInfo[0] === parentKey)?.basicInfo[3] || '0')) : rootValue;
                return (
                  <GridItem key={node.basicInfo[0]}>
                    <NodeBox
                      node={node}
                      depth={depth}
                      maxDepth={maxDepth}
                      parentValue={parentValue}
                      rootValue={rootValue}
                      color={colorMap[nodeKey] || colorMap.root}
                      onClick={() => handleNodeClick(node.basicInfo[0])}
                    />
                  </GridItem>
                );
              })}
            </Grid>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default RootNodeDetails;