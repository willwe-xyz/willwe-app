import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, VStack, HStack, Button, useToast, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { Search, Plus } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { NodePill } from './NodePill';
import { useRootNodes } from '../hooks/useRootNodes';
import { spawnBranch, mintMembership, redistributePath } from '../utils/compose';
import { NodeState } from '../types/chainData';
import { BrowserProvider } from 'ethers';

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
  userAddress: string;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
}

const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ 
  chainId, 
  rootToken, 
  userAddress, 
  selectedTokenColor,
  onNodeSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  
  const { rootNodeStates, isLoading, error, refetch } = useRootNodes(chainId, rootToken, userAddress);

  const verifyNetworkAndGetProvider = useCallback(async () => {
    if (!user?.wallet?.address) {
      throw new Error('Please connect your wallet');
    }

    const provider = await getEthersProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }

    const currentNetwork = await provider.getNetwork();
    const targetChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
    
    if (currentNetwork.chainId.toString() !== targetChainId) {
      throw new Error(`Please switch to chain ID ${targetChainId}`);
    }

    return provider;
  }, [chainId, user?.wallet?.address, getEthersProvider]);

  const handleSpawnNode = useCallback(async (parentNodeId: string) => {
    try {
      const provider = await verifyNetworkAndGetProvider();
      await spawnBranch(
        chainId,
        provider,
        parentNodeId,
        setIsTransacting,
        toast,
        refetch
      );
    } catch (error: any) {
      console.error('Failed to spawn node:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to spawn node',
        status: 'error',
        duration: 5000,
      });
    }
  }, [chainId, verifyNetworkAndGetProvider, toast, refetch]);

  const handleMintMembership = useCallback(async (nodeId: string) => {
    try {
      const provider = await verifyNetworkAndGetProvider();
      await mintMembership(
        chainId,
        provider,
        nodeId,
        setIsTransacting,
        toast,
        refetch
      );
    } catch (error: any) {
      console.error('Failed to mint membership:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mint membership',
        status: 'error',
        duration: 5000,
      });
    }
  }, [chainId, verifyNetworkAndGetProvider, toast, refetch]);

  const handleTrickle = useCallback(async (nodeId: string) => {
    try {
      const provider = await verifyNetworkAndGetProvider();
      await redistributePath(
        chainId,
        provider,
        nodeId,
        setIsTransacting,
        toast,
        refetch
      );
    } catch (error: any) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to redistribute',
        status: 'error',
        duration: 5000,
      });
    }
  }, [chainId, verifyNetworkAndGetProvider, toast, refetch]);

  // Build node hierarchy using childrenNodes array
  const { rootNodes, nodeHierarchy, allNodes } = useMemo(() => {
    if (!rootNodeStates?.length) {
      return { rootNodes: [], nodeHierarchy: {}, allNodes: [] };
    }

    const allNodes = rootNodeStates.flatMap(state => state.nodes);
    
    // Create a map of nodes for quick lookup
    const nodesMap = new Map(allNodes.map(node => [node.basicInfo[0], node]));

    // Build hierarchy using childrenNodes
    const hierarchy: { [key: string]: NodeState[] } = {};
    allNodes.forEach(node => {
      const nodeId = node.basicInfo[0];
      const childrenIds = node.childrenNodes;
      hierarchy[nodeId] = childrenIds
        .map(childId => nodesMap.get(childId))
        .filter((node): node is NodeState => node !== undefined);
    });

    // Find root nodes (nodes with rootPath.length === 1)
    const roots = allNodes.filter(node => node.rootPath.length === 1);

    console.log('Hierarchy built:', {
      rootsCount: roots.length,
      allNodesCount: allNodes.length,
      hierarchyDepth: Object.keys(hierarchy).length
    });

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
  const renderNodeHierarchy = useCallback((node: NodeState) => {
    const children = nodeHierarchy[node.basicInfo[0]] || [];
    
    if (children.length === 0) return null;

    return (
      <VStack align="stretch" spacing={1} ml={4}>
        {children.map(childNode => (
          <Box key={childNode.basicInfo[0]}>
            <NodePill
              node={childNode}
              totalValue={totalValue}
              color={selectedTokenColor}
              onNodeClick={onNodeSelect}
              onMintMembership={handleMintMembership}
              onSpawnNode={handleSpawnNode}
              onTrickle={handleTrickle}
              backgroundColor={`${selectedTokenColor}15`}
              textColor={selectedTokenColor}
              borderColor={selectedTokenColor}
            />
            {renderNodeHierarchy(childNode)}
          </Box>
        ))}
      </VStack>
    );
  }, [nodeHierarchy, totalValue, selectedTokenColor, onNodeSelect, handleMintMembership, handleSpawnNode, handleTrickle]);

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
          isDisabled={!user?.wallet?.address}
          _hover={{ bg: `${selectedTokenColor}15` }}
        >
          New Root Node
        </Button>
        <InputGroup size="sm" maxW="300px">
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pr="2.5rem"
            borderColor={selectedTokenColor}
            _focus={{ 
              borderColor: selectedTokenColor,
              boxShadow: `0 0 0 1px ${selectedTokenColor}`
            }}
          />
          <InputRightElement>
            <Search size={14} color={selectedTokenColor} />
          </InputRightElement>
        </InputGroup>
      </HStack>

      {rootNodes.length === 0 ? (
        <Box 
          p={8} 
          textAlign="center" 
          border="1px dashed" 
          borderColor={selectedTokenColor}
          borderRadius="md"
        >
          <Text color="gray.500">
            {user?.wallet?.address 
              ? 'No nodes found. Create a new root node to get started.'
              : 'Please connect your wallet to view or create nodes.'}
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={2}>
          {rootNodes.map(node => (
            <Box key={node.basicInfo[0]}>
              <NodePill
                node={node}
                totalValue={totalValue}
                color={selectedTokenColor}
                onNodeClick={onNodeSelect}
                onMintMembership={handleMintMembership}
                onSpawnNode={handleSpawnNode}
                onTrickle={handleTrickle}
                backgroundColor={`${selectedTokenColor}15`}
                textColor={selectedTokenColor}
                borderColor={selectedTokenColor}
              />
              {renderNodeHierarchy(node)}
            </Box>
          ))}
        </VStack>
      )}

      {filteredNodes.length === 0 && searchTerm && (
        <Box p={4} textAlign="center">
          <Text color="gray.500">
            No nodes found matching "{searchTerm}"
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default RootNodeDetails;