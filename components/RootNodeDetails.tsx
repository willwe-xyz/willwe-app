// File: ./components/RootNodeDetails.tsx

import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Grid,
  Tooltip,
} from '@chakra-ui/react';
import { 
  Users,
  Activity,
  GitBranch, 
  Signal,
  Plus,
  GitBranchPlus,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';
import { formatBalance } from '../utils/formatters';
import { useTransaction } from '../contexts/TransactionContext';
import { useContractOperation } from '../hooks/useContractOperation';
import { NodeCard } from './Node/NodeCard';

interface RootNodeDetailsProps {
  chainId: string;
  selectedToken: string;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodes: NodeState[];
  isLoading: boolean;
  error: Error | null;
  onRefresh?: () => void;
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({
  chainId,
  selectedToken,
  selectedTokenColor,
  onNodeSelect,
  nodes = [],
  isLoading,
  error,
  onRefresh
}) => {
  const toast = useToast();
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate stats and organize nodes
  const {
    baseNodes,
    derivedNodes,
    totalValue,
    nodeValues,
    totalMembers,
    maxDepth,
    totalSignals
  } = useMemo(() => {
    if (!nodes?.length || !selectedToken) return {
      baseNodes: [],
      derivedNodes: [],
      totalValue: BigInt(0),
      nodeValues: {},
      totalMembers: 0,
      maxDepth: 0,
      totalSignals: 0
    };

    const tokenBigInt = ethers.toBigInt(selectedToken);
    const tokenId = tokenBigInt.toString();

    // Filter base and derived nodes
    const base = nodes.filter(node => 
      node?.rootPath?.length === 1 && 
      BigInt(node.rootPath[0]).toString() === tokenId
    );

    const derived = nodes.filter(node =>
      node?.rootPath?.length > 1 && 
      BigInt(node.rootPath[0]).toString() === tokenId
    );

    // Calculate stats
    const stats = nodes.reduce((acc, node) => {
      if (!node?.basicInfo?.[4]) return acc;

      try {
        const nodeValue = BigInt(node.basicInfo[4]);
        return {
          totalValue: acc.totalValue + nodeValue,
          totalMembers: acc.totalMembers + (node.membersOfNode?.length || 0),
          maxDepth: Math.max(acc.maxDepth, node.rootPath?.length || 0),
          totalSignals: acc.totalSignals + (node.signals?.length || 0)
        };
      } catch {
        return acc;
      }
    }, {
      totalValue: BigInt(0),
      totalMembers: 0,
      maxDepth: 0,
      totalSignals: 0
    });

    // Calculate node value percentages
    const values: Record<string, number> = {};
    if (stats.totalValue > BigInt(0)) {
      nodes.forEach(node => {
        if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
        try {
          const nodeValue = BigInt(node.basicInfo[4]);
          values[node.basicInfo[0]] = Number((nodeValue * BigInt(10000)) / stats.totalValue) / 100;
        } catch {
          values[node.basicInfo[0]] = 0;
        }
      });
    }

    return {
      baseNodes: base,
      derivedNodes: derived,
      ...stats,
      nodeValues: values,
    };
  }, [nodes, selectedToken]);

  // Handle spawning a new root node
  const handleSpawnNode = useCallback(async () => {
    if (!selectedToken) {
      toast({
        title: "Error",
        description: "Please select a token first",
        status: "error",
        duration: 3000
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await executeTransaction(
        chainId,
        async () => {
          const cleanChainId = chainId.replace('eip155:', '');
          const contractAddress = deployments.WillWe[cleanChainId];
          
          if (!contractAddress) {
            throw new Error(`No contract deployment found for chain ${cleanChainId}`);
          }

          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer
          );

          return contract.spawnRootBranch(selectedToken, { gasLimit: 500000 });
        },
        {
          successMessage: 'New root node created successfully',
          errorMessage: 'Failed to create root node',
          onSuccess: onRefresh
        }
      );

      if (!result) {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('Error spawning root node:', error);
      toast({
        title: "Failed to Create Node",
        description: error.message || 'Transaction failed',
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, selectedToken, executeTransaction, getEthersProvider, toast, onRefresh]);

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Value',
      value: formatBalance(totalValue),
      icon: <Activity size={16} />,
      color: 'purple',
      tooltip: 'Total value locked in all nodes'
    },
    {
      title: 'Members',
      value: totalMembers.toString(),
      icon: <Users size={16} />,
      color: 'blue',
      tooltip: 'Total unique members across all nodes'
    },
    {
      title: 'Max Depth',
      value: maxDepth.toString(),
      icon: <GitBranch size={16} />,
      color: 'green',
      tooltip: 'Maximum depth of the node hierarchy'
    },
    {
      title: 'Active Signals',
      value: totalSignals.toString(),
      icon: <Signal size={16} />,
      color: 'orange',
      tooltip: 'Total active signals across all nodes'
    }
  ];

  if (isLoading) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm">
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="xl" color={selectedTokenColor} />
          <Text color="gray.600">Loading node data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="400px"
          rounded="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <Text mt={4} mb={2} fontSize="lg">
            Error loading node data
          </Text>
          <Text color="gray.600">
            {error.message}
          </Text>
          {onRefresh && (
            <Button
              mt={4}
              size="sm"
              colorScheme="purple"
              onClick={onRefresh}
            >
              Retry
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" rounded="xl" shadow="sm">
      {/* Header */}
      <HStack justify="space-between" mb={8}>
        <HStack spacing={4}>
          <Button
            leftIcon={<Plus size={16} />}
            rightIcon={<GitBranchPlus size={16} />}
            onClick={handleSpawnNode}
            variant="outline"
            colorScheme="purple"
            isLoading={isProcessing}
            loadingText="Creating Node..."
            isDisabled={!selectedToken || isProcessing}
          >
            New Root Node
          </Button>
          {onRefresh && (
            <Button
              leftIcon={<RefreshCw size={16} />}
              variant="ghost"
              colorScheme="purple"
              onClick={onRefresh}
              isDisabled={isProcessing}
            >
              Refresh
            </Button>
          )}
        </HStack>
        {selectedToken && (
          <Badge colorScheme="purple" p={2}>
            Token: {selectedToken.slice(0, 6)}...{selectedToken.slice(-4)}
          </Badge>
        )}
      </HStack>

      {/* Stats Cards */}
      <Grid 
        templateColumns={{ 
          base: "1fr", 
          md: "repeat(2, 1fr)", 
          lg: "repeat(4, 1fr)" 
        }}
        gap={4}
        mb={8}
      >
        {statsCards.map((stat, index) => (
          <Tooltip key={index} label={stat.tooltip}>
            <Box
              p={4}
              bg={`${stat.color}.50`}
              rounded="lg"
              border="1px solid"
              borderColor={`${stat.color}.100`}
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            >
              <HStack color={`${stat.color}.600`} mb={2}>
                {stat.icon}
                <Text fontSize="sm" fontWeight="medium">
                  {stat.title}
                </Text>
              </HStack>
              <Text 
                fontSize="2xl" 
                fontWeight="bold"
                color={`${stat.color}.900`}
              >
                {stat.value}
              </Text>
            </Box>
          </Tooltip>
        ))}
      </Grid>

      {/* Node Sections */}
      {baseNodes.length === 0 && derivedNodes.length === 0 ? (
        <Box 
          p={8} 
          bg="gray.50" 
          rounded="lg" 
          textAlign="center"
          border="2px dashed"
          borderColor="gray.200"
        >
          <VStack spacing={4}>
            <Text color="gray.600">
              No nodes found. Create a new root node to get started.
            </Text>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={handleSpawnNode}
              colorScheme="purple"
              isLoading={isProcessing}
              isDisabled={!selectedToken || isProcessing}
            >
              Create Root Node
            </Button>
          </VStack>
        </Box>
      ) : (
        <>
          {/* Base Nodes Section */}
          {baseNodes.length > 0 && (
            <VStack align="stretch" spacing={4} mb={8}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Base Nodes
              </Text>
              <Box 
                overflowX="auto" 
                overflowY="hidden" 
                pb={4}
                sx={{
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bg: 'gray.100',
                    borderRadius: 'full',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bg: 'purple.200',
                    borderRadius: 'full',
                    '&:hover': {
                      bg: 'purple.300',
                    },
                  },
                }}
              >
                <HStack spacing={4}>
                  {baseNodes.map((node, index) => (
                    <NodeCard
                      key={node.basicInfo[0]}
                      node={node}
                      index={index}
                      selectedTokenColor={selectedTokenColor}
                      onNodeSelect={onNodeSelect}
                      nodeValues={nodeValues}
                      chainId={chainId}
                    />
                  ))}
                </HStack>
              </Box>
            </VStack>
          )}

          {/* Derived Nodes Section */}
          {derivedNodes.length > 0 && (
            <VStack align="stretch" spacing={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Derived Nodes
              </Text>
              <Box 
                overflowX="auto" 
                overflowY="hidden" 
                pb={4}
                sx={{
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bg: 'gray.100',
                    borderRadius: 'full',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bg: 'purple.200',
                    borderRadius: 'full',
                    '&:hover': {
                      bg: 'purple.300',
                    },
                  },
                }}
              >
                <HStack spacing={4}>
                  {derivedNodes.map((node, index) => (
                    <NodeCard
                      key={node.basicInfo[0]}
                      node={node}
                      index={index}
                      selectedTokenColor={selectedTokenColor}
                      onNodeSelect={onNodeSelect}
                      nodeValues={nodeValues}
                      chainId={chainId}
                    />
                  ))}
                </HStack>
              </Box>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export default RootNodeDetails;