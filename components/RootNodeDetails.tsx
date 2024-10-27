import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Button, 
  InputGroup,
  Input, 
  InputRightElement,
  Text,
  useColorModeValue,
  Portal,
  Tooltip
} from '@chakra-ui/react';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { NodePill } from './NodePill';
import { useTransaction } from '../contexts/TransactionContext';
import { useNode } from '../contexts/NodeContext';
import { useRootNodes } from '../hooks/useRootNodes';
import { NodeState } from '../types/chainData';
import { formatBalance } from '../hooks/useBalances';

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
  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Hooks
  const { user } = usePrivy();
  const { executeTransaction } = useTransaction();
  const { 
    rootNodeStates, 
    isLoading, 
    error, 
    refetch 
  } = useRootNodes(chainId, rootToken, userAddress);

  // Styling
  const searchBorderColor = useColorModeValue('gray.200', 'gray.600');
  const searchHoverBorderColor = useColorModeValue('gray.300', 'gray.500');
  const buttonHoverBg = useColorModeValue(`${selectedTokenColor}15`, `${selectedTokenColor}30`);

  // Compute total value across all nodes
  const totalValue = useMemo(() => {
    return rootNodeStates.reduce((sum, state) => {
      return sum + state.nodes.reduce((nodeSum, node) => 
        nodeSum + BigInt(node.basicInfo[4]), BigInt(0)
      );
    }, BigInt(0));
  }, [rootNodeStates]);

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return rootNodeStates;

    return rootNodeStates.map(state => ({
      ...state,
      nodes: state.nodes.filter(node => 
        node.basicInfo[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.membersOfNode.some(member => 
          member.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    })).filter(state => state.nodes.length > 0);
  }, [rootNodeStates, searchTerm]);

  // Transaction handlers
  const handleSpawnNode = useCallback(async (parentNodeId: string) => {
    if (!user?.wallet?.address) {
      throw new Error('Please connect your wallet');
    }

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.spawnBranch(parentNodeId);
      },
      {
        successMessage: 'Node spawned successfully',
        onSuccess: refetch
      }
    );
  }, [chainId, user?.wallet?.address, executeTransaction, refetch]);

  const handleMintMembership = useCallback(async (nodeId: string) => {
    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.mintMembership(nodeId);
      },
      {
        successMessage: 'Membership minted successfully',
        onSuccess: refetch
      }
    );
  }, [chainId, executeTransaction, refetch]);

  const handleTrickle = useCallback(async (nodeId: string) => {
    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.redistributePath(nodeId);
      },
      {
        successMessage: 'Redistribution completed successfully',
        onSuccess: refetch
      }
    );
  }, [chainId, executeTransaction, refetch]);

  // Recursive node rendering
  const renderNodeHierarchy = useCallback((nodeState: NodeState, depth: number = 0) => {
    const childNodes = nodeState.childrenNodes
      .map(childId => 
        rootNodeStates
          .flatMap(state => state.nodes)
          .find(node => node.basicInfo[0] === childId)
      )
      .filter((node): node is NodeState => node !== undefined);

    return (
      <Box key={nodeState.basicInfo[0]} ml={depth * 4}>
        <NodePill
          node={nodeState}
          totalValue={Number(totalValue)}
          color={selectedTokenColor}
          onNodeClick={onNodeSelect}
          onMintMembership={handleMintMembership}
          onSpawnNode={handleSpawnNode}
          onTrickle={handleTrickle}
          backgroundColor={`${selectedTokenColor}15`}
          textColor={selectedTokenColor}
          borderColor={selectedTokenColor}
        />
        {childNodes.length > 0 && (
          <VStack align="stretch" spacing={1} mt={1}>
            {childNodes.map(childNode => renderNodeHierarchy(childNode, depth + 1))}
          </VStack>
        )}
      </Box>
    );
  }, [rootNodeStates, totalValue, selectedTokenColor, onNodeSelect, handleMintMembership, handleSpawnNode, handleTrickle]);

  // Loading state
  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading nodes...</Text>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={4}>
        <HStack spacing={2} color="red.500">
          <AlertTriangle size={20} />
          <Text>Error: {error.message}</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* Header Controls */}
      <HStack spacing={4} mb={4}>
        <Button
          leftIcon={<Plus size={14} />}
          onClick={() => handleSpawnNode(rootToken)}
          size="sm"
          colorScheme="gray"
          variant="outline"
          isDisabled={!user?.wallet?.address}
          _hover={{ bg: buttonHoverBg }}
        >
          New Root Node
        </Button>
        <InputGroup size="sm" maxW="300px">
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderColor={searchBorderColor}
            _hover={{ borderColor: searchHoverBorderColor }}
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

      {/* Node List */}
      {rootNodeStates.length === 0 ? (
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
          {filteredNodes.map(state => 
            state.nodes
              .filter(node => node.rootPath.length === 1)
              .map(rootNode => renderNodeHierarchy(rootNode))
          )}
        </VStack>
      )}

      {/* Search Results */}
      {filteredNodes.length === 0 && searchTerm && (
        <Box p={4} textAlign="center">
          <Text color="gray.500">
            No nodes found matching "{searchTerm}"
          </Text>
        </Box>
      )}

      {/* Transaction Status Indicator */}
      <Portal>
        <Box
          position="fixed"
          bottom={4}
          right={4}
          zIndex={1000}
        >
          {/* Transaction notifications would go here */}
        </Box>
      </Portal>
    </Box>
  );
};

export default React.memo(RootNodeDetails, (prevProps, nextProps) => {
  return (
    prevProps.chainId === nextProps.chainId &&
    prevProps.rootToken === nextProps.rootToken &&
    prevProps.userAddress === nextProps.userAddress &&
    prevProps.selectedTokenColor === nextProps.selectedTokenColor
  );
});