import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Portal,
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
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNodeTransactions } from '../hooks/useNodeTransactions';
import { useTransaction } from '../contexts/TransactionContext';
import { NodeState } from '../types/chainData';
import { formatBalance, formatPercentage } from '../utils/formatters';
import { TokenOperationModal } from './TokenOperations/TokenOperationModal';
import { ethers } from 'ethers';

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
  // State and hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hoveredNode, setHoveredNode] = useState<NodeState | null>(null);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const toast = useToast();

  // Contract interactions
  const { spawnBranch, error: txError } = useNodeTransactions(chainId);
  const { isTransacting } = useTransaction();

  // Handle transaction errors
  useEffect(() => {
    if (txError) {
      toast({
        title: "Transaction Error",
        description: txError.message,
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    }
  }, [txError, toast]);

  // Organize nodes into hierarchy
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

    // Convert token address to ID consistently
    const tokenBigInt = ethers.toBigInt(selectedToken);
    const tokenId = tokenBigInt.toString();

    // Debug logging
    console.log('Filtering nodes:', {
      selectedToken,
      tokenId,
      nodesCount: nodes.length,
      firstNode: nodes[0],
      rootPaths: nodes.map(n => n.rootPath)
    });

    // Separate nodes into base and derived
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

    // Calculate statistics
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

  // Stats cards data
  const statsCards = useMemo(() => [
    {
      title: 'Total Value',
      value: formatBalance(totalValue),
      icon: Activity,
      bgColor: 'purple.50',
      textColor: 'purple.600',
      tooltip: 'Total value locked in all nodes'
    },
    {
      title: 'Members',
      value: totalMembers.toString(),
      icon: Users,
      bgColor: 'blue.50',
      textColor: 'blue.600',
      tooltip: 'Total number of unique members'
    },
    {
      title: 'Max Depth',
      value: maxDepth.toString(),
      icon: GitBranch,
      bgColor: 'green.50',
      textColor: 'green.600',
      tooltip: 'Maximum depth of node hierarchy'
    },
    {
      title: 'Active Signals',
      value: totalSignals.toString(),
      icon: Signal,
      bgColor: 'orange.50',
      textColor: 'orange.600',
      tooltip: 'Total number of active signals'
    }
  ], [totalValue, totalMembers, maxDepth, totalSignals]);

  // Handle spawning new branch
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

    try {
      const tokenBigInt = ethers.toBigInt(selectedToken);
      const tokenId = tokenBigInt.toString();
      
      // Show pending toast
      toast({
        title: "Transaction Pending",
        description: "Spawning new branch...",
        status: "info",
        duration: null,
        id: "spawn-pending"
      });

      const tx = await spawnBranch(tokenId);
      const receipt = await tx.wait();

      // Close pending toast
      toast.close("spawn-pending");

      if (receipt && receipt.status === 1) {
        toast({
          title: "Success",
          description: "New branch spawned successfully",
          status: "success",
          duration: 5000,
          icon: <Check size={16} />,
        });

        if (receipt.hash) {
          toast({
            title: "View Transaction",
            description: (
              <Text
                as="a"
                href={`https://explorer.testnet.mantle.xyz/tx/${receipt.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                color="blue.500"
                textDecoration="underline"
              >
                View on Explorer
              </Text>
            ),
            status: "info",
            duration: 8000,
            isClosable: true,
          });
        }

        onRefresh?.();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      // Close pending toast if it exists
      toast.close("spawn-pending");

      console.error('Error spawning branch:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to spawn branch",
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    }
  }, [selectedToken, spawnBranch, toast, onRefresh]);

  // Render node card
  const renderNodeCard = useCallback((node: NodeState, index: number) => {
    if (!node?.basicInfo?.[0]) return null;
    
    const nodeId = node.basicInfo[0];
    const memberCount = node.membersOfNode?.length || 0;
    const signalCount = node.signals?.length || 0;
    const nodeValue = node.basicInfo[4];
    const percentage = nodeValues[nodeId] || 0;

    return (
      <motion.div
        key={nodeId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Box
          p={4}
          bg="white"
          rounded="lg"
          shadow="sm"
          border="1px solid"
          borderColor={selectedTokenColor}
          minW="240px"
          cursor="pointer"
          onClick={() => onNodeSelect(nodeId)}
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="medium">
              Node {nodeId.slice(-6)}
            </Text>
            {signalCount > 0 && (
              <Box
                w="2"
                h="2"
                rounded="full"
                bg={selectedTokenColor}
                animation="pulse 2s infinite"
              />
            )}
          </HStack>

          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <HStack>
                <Activity size={14} />
                <Text fontSize="sm">
                  {formatBalance(nodeValue)}
                </Text>
              </HStack>
              <HStack>
                <Users size={14} />
                <Text fontSize="sm">{memberCount}</Text>
              </HStack>
            </HStack>

            <Box bg="gray.100" rounded="full" h="2" overflow="hidden">
              <Box
                bg={selectedTokenColor}
                h="full"
                w={`${percentage}%`}
                transition="width 0.3s ease"
              />
            </Box>
            <Text fontSize="xs" color="gray.500" textAlign="right">
              {formatPercentage(percentage)}
            </Text>
          </VStack>
        </Box>
      </motion.div>
    );
  }, [nodeValues, onNodeSelect, selectedTokenColor]);

  // Loading state
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

  // Error state
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
            isLoading={isTransacting}
            loadingText="Spawning..."
            isDisabled={!selectedToken || isTransacting}
          >
            New Branch
          </Button>
          {onRefresh && (
            <Button
              variant="ghost"
              colorScheme="purple"
              onClick={onRefresh}
              isDisabled={isTransacting}
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

      {/* Stats Display */}
      <Box mb={8}>
        <HStack spacing={4} wrap="wrap">
          {statsCards.map((stat, index) => (
            <Tooltip key={index} label={stat.tooltip}>
              <Box
                p={4}
                bg={stat.bgColor}
                rounded="lg"
                flex="1"
                minW="200px"
                role="group"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md'
                }}
              >
                <HStack color={stat.textColor} mb={1}>
                  <stat.icon size={16} />
                  <Text fontSize="sm">{stat.title}</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="semibold">
                  {stat.value}
                </Text>
              </Box>
            </Tooltip>
          ))}
        </HStack>
      </Box>

      {/* Node Display */}
      <Box>
        {/* Base Nodes */}
        {baseNodes.length > 0 && (
          <VStack align="stretch" spacing={4} mb={8}>
            <Text fontSize="lg" fontWeight="semibold">Base Nodes</Text>
            <Box 
              overflowX="auto" 
              overflowY="hidden"
              position="relative"
              pb={4}
            >
              <HStack spacing={4}>
                {baseNodes.map((node, index) => renderNodeCard(node, index))}
              </HStack>
            </Box>
          </VStack>
        )}

        {/* Derived Nodes */}
{/* Derived Nodes */}
{derivedNodes.length > 0 && (
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">Derived Nodes</Text>
            <Box 
              overflowX="auto" 
              overflowY="hidden"
              position="relative"
              pb={4}
            >
              <HStack spacing={4}>
                {derivedNodes.map((node, index) => renderNodeCard(node, index))}
              </HStack>
            </Box>
          </VStack>
        )}

        {/* Empty State */}
        {baseNodes.length === 0 && derivedNodes.length === 0 && (
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
                isLoading={isTransacting}
              >
                Create Branch
              </Button>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Node Details Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                zIndex: 50,
                padding: 16,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${selectedTokenColor}`
              }}
            >
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="medium">
                  Node {hoveredNode.basicInfo[0].slice(-6)}
                </Text>
                <HStack spacing={4}>
                  <HStack>
                    <Activity size={14} />
                    <Text fontSize="sm">
                      {formatBalance(hoveredNode.basicInfo[4])}
                    </Text>
                  </HStack>
                  <HStack>
                    <Users size={14} />
                    <Text fontSize="sm">
                      {hoveredNode.membersOfNode?.length || 0}
                    </Text>
                  </HStack>
                  <HStack>
                    <Signal size={14} />
                    <Text fontSize="sm">
                      {hoveredNode.signals?.length || 0}
                    </Text>
                  </HStack>
                  <HStack>
                    <GitBranch size={14} />
                    <Text fontSize="sm">
                      {hoveredNode.childrenNodes?.length || 0}
                    </Text>
                  </HStack>
                </HStack>

                {/* Show Path Information */}
                {hoveredNode.rootPath && hoveredNode.rootPath.length > 0 && (
                  <VStack align="start" spacing={1} mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      Path:
                    </Text>
                    <HStack spacing={1}>
                      {hoveredNode.rootPath.map((pathNode, idx) => (
                        <React.Fragment key={pathNode}>
                          {idx > 0 && (
                            <Text color="gray.400" fontSize="xs">
                              →
                            </Text>
                          )}
                          <Badge
                            size="sm"
                            colorScheme="purple"
                            variant="outline"
                            cursor="pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNodeSelect(pathNode);
                            }}
                          >
                            {pathNode.slice(-6)}
                          </Badge>
                        </React.Fragment>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Show Signal Information */}
                {hoveredNode.signals && hoveredNode.signals.length > 0 && (
                  <VStack align="start" spacing={1} mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      Recent Signals:
                    </Text>
                    {hoveredNode.signals.slice(0, 3).map((signal, idx) => (
                      <HStack key={idx} spacing={2}>
                        <Badge size="sm" colorScheme="green">
                          Signal
                        </Badge>
                        <Text fontSize="xs">
                          {new Date(
                            Number(signal.lastRedistSignal?.[0] || 0)
                          ).toLocaleString()}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                )}

                {/* Show Member Information */}
                {hoveredNode.membersOfNode && hoveredNode.membersOfNode.length > 0 && (
                  <VStack align="start" spacing={1} mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      Members ({hoveredNode.membersOfNode.length}):
                    </Text>
                    <HStack spacing={2} wrap="wrap">
                      {hoveredNode.membersOfNode.slice(0, 3).map((member, idx) => (
                        <Badge
                          key={idx}
                          size="sm"
                          colorScheme="blue"
                          variant="subtle"
                        >
                          {member.slice(0, 6)}...{member.slice(-4)}
                        </Badge>
                      ))}
                      {hoveredNode.membersOfNode.length > 3 && (
                        <Badge
                          size="sm"
                          colorScheme="blue"
                          variant="subtle"
                        >
                          +{hoveredNode.membersOfNode.length - 3} more
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Operation Modal */}
      <TokenOperationModal
        isOpen={isOpen}
        onClose={onClose}
        operation={currentOperation}
        nodeId={selectedToken}
        chainId={chainId}
        isLoading={isTransacting}
        onSubmit={handleSpawnBranch}
      />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }

        .node-container {
          scroll-behavior: smooth;
        }

        .node-container::-webkit-scrollbar {
          height: 6px;
        }

        .node-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .node-container::-webkit-scrollbar-thumb {
          background: ${selectedTokenColor}40;
          border-radius: 3px;
        }

        .node-container::-webkit-scrollbar-thumb:hover {
          background: ${selectedTokenColor}80;
        }
      `}</style>
    </Box>
  );
};

export default RootNodeDetails;