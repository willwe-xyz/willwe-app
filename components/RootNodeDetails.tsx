import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, Input, VStack, HStack, Button, useToast } from '@chakra-ui/react';
import { Search, Plus } from 'lucide-react';
import { NodePill } from './NodePill';
import { useRootNodes } from '../hooks/useRootNodes';
import { spawnBranch, mintMembership, redistributePath } from '../utils/compose';

const RootNodeDetails = ({ 
  chainId, 
  rootToken, 
  userAddress, 
  tokenColor,
  onNodeSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransacting, setIsTransacting] = useState(false);
  const toast = useToast();
  
  const { rootNodeStates, isLoading, error, refetch } = useRootNodes(chainId, rootToken, userAddress);

  const handleMintMembership = useCallback(async (nodeId) => {
    try {
      await mintMembership(chainId, window.ethereum, nodeId, setIsTransacting, toast, refetch);
    } catch (error) {
      console.error('Membership action failed:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  }, [chainId, toast, refetch]);

  const handleSpawnNode = useCallback(async (parentNodeId) => {
    try {
      await spawnBranch(chainId, window.ethereum, parentNodeId, setIsTransacting, toast, refetch);
    } catch (error) {
      console.error('Failed to spawn node:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  }, [chainId, toast, refetch]);

  const handleTrickle = useCallback(async (nodeId) => {
    try {
      await redistributePath(chainId, window.ethereum, nodeId, setIsTransacting, toast, refetch);
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  }, [chainId, toast, refetch]);

  // Build node hierarchy using childrenNodes array
  const { rootNodes, nodeHierarchy, allNodes } = useMemo(() => {
    if (!rootNodeStates?.length) {
      return { rootNodes: [], nodeHierarchy: {}, allNodes: [] };
    }

    const allNodes = rootNodeStates.flatMap(state => state.nodes);
    
    // Create a map of nodes for quick lookup
    const nodesMap = new Map(allNodes.map(node => [node.basicInfo[0], node]));

    // Build hierarchy using childrenNodes
    const hierarchy = {};
    allNodes.forEach(node => {
      const nodeId = node.basicInfo[0];
      const childrenIds = node.childrenNodes;
      hierarchy[nodeId] = childrenIds
        .map(childId => nodesMap.get(childId))
        .filter(Boolean); // Remove any undefined values
    });

    // Find root nodes (nodes with rootPath.length === 1)
    const roots = allNodes.filter(node => node.rootPath.length === 1);

    console.log('Hierarchy:', hierarchy);
    console.log('Root nodes:', roots);

    return {
      rootNodes: roots,
      nodeHierarchy: hierarchy,
      allNodes
    };
  }, [rootNodeStates]);

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return allNodes;
    return allNodes.filter(node =>
      node.basicInfo[0].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allNodes, searchTerm]);

  const totalValue = useMemo(() => {
    return filteredNodes.reduce((sum, node) => sum + parseInt(node.basicInfo[4]), 0);
  }, [filteredNodes]);

  // Render node hierarchy recursively
  const renderNodeHierarchy = useCallback((node) => {
    const children = nodeHierarchy[node.basicInfo[0]] || [];
    
    if (children.length === 0) return null;

    return (
      <VStack align="stretch" spacing={1} ml={4}>
        {children.map(childNode => (
          <Box key={childNode.basicInfo[0]}>
            <NodePill
              node={childNode}
              totalValue={totalValue}
              color={tokenColor}
              onNodeClick={onNodeSelect}
              onMintMembership={handleMintMembership}
              onSpawnNode={handleSpawnNode}
              onTrickle={handleTrickle}
              backgroundColor={`${tokenColor}15`}
              textColor={tokenColor}
              borderColor={tokenColor}
            />
            {renderNodeHierarchy(childNode)}
          </Box>
        ))}
      </VStack>
    );
  }, [nodeHierarchy, totalValue, tokenColor, onNodeSelect, handleMintMembership, handleSpawnNode, handleTrickle]);

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading nodes...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">Error: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <HStack spacing={4} mb={4}>
        <Button
          leftIcon={<Plus size={14} />}
          onClick={() => handleSpawnNode(rootToken)}
          size="sm"
          colorScheme="gray"
          variant="outline"
          isLoading={isTransacting}
        >
          New Root Node
        </Button>
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          maxW="300px"
        />
      </HStack>

      <VStack align="stretch" spacing={2}>
        {rootNodes.map(node => (
          <Box key={node.basicInfo[0]}>
            <NodePill
              node={node}
              totalValue={totalValue}
              color={tokenColor}
              onNodeClick={onNodeSelect}
              onMintMembership={handleMintMembership}
              onSpawnNode={handleSpawnNode}
              onTrickle={handleTrickle}
              backgroundColor={`${tokenColor}15`}
              textColor={tokenColor}
              borderColor={tokenColor}
            />
            {renderNodeHierarchy(node)}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default RootNodeDetails;