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
} from '@chakra-ui/react';
import { 
  Users,
  Activity,
  GitBranch, 
  Signal,
  Plus,
  GitBranchPlus,
  Check,
  AlertTriangle
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';
import { formatBalance } from '../utils/formatters';

// Helper functions
const getContract = async (chainId: string, getEthersProvider: () => Promise<any>) => {
  try {
    const provider = await getEthersProvider();
    const signer = await provider.getSigner();
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.WillWe[cleanChainId];

    if (!contractAddress) {
      throw new Error(`No contract deployment found for chain ${chainId}`);
    }

    return new ethers.Contract(contractAddress, ABIs.WillWe, signer);
  } catch (error) {
    console.error('Contract initialization error:', error);
    throw new Error('Failed to initialize contract');
  }
};

const executeTransaction = async (
  contract: ethers.Contract,
  methodName: string,
  args: any[],
  options: any = {}
) => {
  const response = await contract[methodName](...args, options);
  const hash = response.hash;
  const tx = await response.getTransaction();
  const receipt = await tx.wait(1);
  return { hash, receipt };
};

interface RootNodeDetailsProps {
  chainId: string;
  selectedToken: string;
  userAddress: string;
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
  userAddress,
  selectedTokenColor,
  onNodeSelect,
  nodes,
  isLoading,
  error,
  onRefresh
}) => {
  const toast = useToast();
  const { getEthersProvider } = usePrivy();
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

    const base = nodes.filter(node => {
      return node.rootPath?.length > 0 && 
             BigInt(node.rootPath[0]).toString() === tokenId &&
             node.rootPath.length === 1;
    });
    
    const derived = nodes.filter(node => {
      return node.rootPath?.length > 0 && 
             BigInt(node.rootPath[0]).toString() === tokenId &&
             node.rootPath.length > 1;
    });

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

    const values: Record<string, number> = {};
    if (stats.totalValue > 0) {
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
      nodeValues: values
    };
  }, [nodes, selectedToken]);

  const handleSpawnBranch = useCallback(async () => {
    if (!selectedToken) {
      toast({
        title: "Error",
        description: "No token selected",
        status: "error",
        duration: 3000
      });
      return;
    }

    setIsProcessing(true);

    try {
      const tokenBigInt = ethers.toBigInt(selectedToken);
      const tokenId = tokenBigInt.toString();
      
      const contract = await getContract(chainId, getEthersProvider);
      const { hash, receipt } = await executeTransaction(
        contract,
        'spawnBranch',
        [tokenId],
        { gasLimit: 400000 }
      );

      if (receipt && receipt.status === 1) {
        toast({
          title: "Success",
          description: "New branch created successfully",
          status: "success",
          duration: 5000,
          icon: <Check size={16} />,
        });
        onRefresh?.();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error('Error spawning branch:', error);
      toast({
        title: "Failed to Create Branch",
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedToken, chainId, getEthersProvider, onRefresh, toast]);

  const statsCards = [
    {
      title: 'Total Value',
      value: formatBalance(totalValue),
      icon: <Activity size={16} />,
      color: 'purple'
    },
    {
      title: 'Members',
      value: totalMembers.toString(),
      icon: <Users size={16} />,
      color: 'blue'
    },
    {
      title: 'Max Depth',
      value: maxDepth.toString(),
      icon: <GitBranch size={16} />,
      color: 'green'
    },
    {
      title: 'Active Signals',
      value: totalSignals.toString(),
      icon: <Signal size={16} />,
      color: 'orange'
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
            onClick={handleSpawnBranch}
            variant="outline"
            colorScheme="purple"
            isLoading={isProcessing}
            loadingText="Creating Branch..."
            isDisabled={!selectedToken || isProcessing}
          >
            New Branch
          </Button>
          {onRefresh && (
            <Button
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
      <Box mb={8}>
        <HStack spacing={4} wrap="wrap">
          {statsCards.map((stat, index) => (
            <Box
              key={index}
              p={4}
              bg={`${stat.color}.50`}
              rounded="lg"
              flex="1"
              minW="200px"
            >
              <HStack color={`${stat.color}.600`} mb={1}>
                {stat.icon}
                <Text fontSize="sm">{stat.title}</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="semibold">
                {stat.value}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Node Sections */}
      <Box>
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
                No branches found. Create a new branch to get started.
              </Text>
              <Button
                leftIcon={<Plus size={16} />}
                onClick={handleSpawnBranch}
                variant="outline"
                colorScheme="purple"
                isLoading={isProcessing}
              >
                Create Branch
              </Button>
            </VStack>
          </Box>
        ) : (
          <>
            {baseNodes.length > 0 && (
              <VStack align="stretch" spacing={4} mb={8}>
                <Text fontSize="lg" fontWeight="semibold">Base Nodes</Text>
                <Box overflowX="auto" overflowY="hidden" pb={4}>
                  <HStack spacing={4}>
                    {baseNodes.map(node => (
                      <Box
                        key={node.basicInfo[0]}
                        p={4}
                        bg="white"
                        rounded="lg"
                        shadow="sm"
                        border="1px solid"
                        borderColor={selectedTokenColor}
                        minW="240px"
                        cursor="pointer"
                        onClick={() => onNodeSelect(node.basicInfo[0])}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="medium">
                            Node {node.basicInfo[0].slice(-6)}
                          </Text>
                          {node.signals?.length > 0 && (
                            <Box
                              w="2"
                              h="2"
                              rounded="full"
                              bg={selectedTokenColor}
                              animation="pulse 2s infinite"
                            />
                          )}
                        </HStack>
                        <HStack justify="space-between">
                          <HStack>
                            <Activity size={14} />
                            <Text fontSize="sm">
                              {formatBalance(node.basicInfo[4])}
                            </Text>
                          </HStack>
                          <HStack>
                            <Users size={14} />
                            <Text fontSize="sm">
                              {node.membersOfNode?.length || 0}
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            )}

            {derivedNodes.length > 0 && (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">Derived Nodes</Text>
                <Box overflowX="auto" overflowY="hidden" pb={4}>
                  <HStack spacing={4}>
                    {derivedNodes.map(node => (
                      <Box
                        key={node.basicInfo[0]}
                        p={4}
                        bg="white"
                        rounded="lg"
                        shadow="sm"
                        border="1px solid"
                        borderColor={selectedTokenColor}
                        minW="240px"
                        cursor="pointer"
                        onClick={() => onNodeSelect(node.basicInfo[0])}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="medium">
                            Node {node.basicInfo[0].slice(-6)}
                          </Text>
                          {node.signals?.length > 0 && (
                            <Box
                              w="2"
                              h="2"
                              rounded="full"
                              bg={selectedTokenColor}
                              animation="pulse 2s infinite"
                            />
                          )}
                        </HStack>
                        <HStack justify="space-between">
                          <HStack>
                            <Activity size={14} />
                            <Text fontSize="sm">
                              {formatBalance(node.basicInfo[4])}
                            </Text>
                          </HStack>
                          <HStack>
                            <Users size={14} />
                            <Text fontSize="sm">
                              {node.membersOfNode?.length || 0}
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default RootNodeDetails;