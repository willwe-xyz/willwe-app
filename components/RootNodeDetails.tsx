// File: components/RootNodeDetails.tsx
import React, { useMemo, useState, useCallback } from 'react';
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
  BrainCircuit,
  GitBranchPlus,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNodeTransactions } from '../hooks/useNodeTransactions';
import { useTransaction } from '../contexts/TransactionContext';
import { NodeState } from '../types/chainData';
import { formatBalance, formatPercentage } from '../utils/formatters';
import { TokenOperationModal } from './TokenOperations/TokenOperationModal';

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
  // State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hoveredNode, setHoveredNode] = useState<NodeState | null>(null);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const toast = useToast();

  // Hooks
  const { spawnNode } = useNodeTransactions(chainId);
  const { isTransacting } = useTransaction();

  // Calculate totals and values
  const { totalValue, nodeValues, totalMembers, maxDepth, totalSignals } = useMemo(() => {
    if (!nodes?.length) return {
      totalValue: BigInt(0),
      nodeValues: {},
      totalMembers: 0,
      maxDepth: 0,
      totalSignals: 0
    };

    // Calculate total value
    const total = nodes.reduce((sum, node) => {
      if (!node?.basicInfo?.[4]) return sum;
      try {
        return sum + BigInt(node.basicInfo[4]);
      } catch {
        return sum;
      }
    }, BigInt(0));

    // Calculate individual node values as percentages
    const values: Record<string, number> = {};
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
      try {
        const nodeValue = BigInt(node.basicInfo[4]);
        values[node.basicInfo[0]] = total > 0 
          ? Number((nodeValue * BigInt(10000)) / total) / 100
          : 0;
      } catch {
        values[node.basicInfo[0]] = 0;
      }
    });

    // Calculate additional stats
    const members = nodes.reduce((sum, node) => 
      sum + (node.membersOfNode?.length || 0), 0
    );
    const depth = Math.max(...nodes.map(node => 
      node.rootPath?.length || 0
    ));
    const signals = nodes.reduce((sum, node) => 
      sum + (node.signals?.length || 0), 0
    );

    return {
      totalValue: total,
      nodeValues: values,
      totalMembers: members,
      maxDepth: depth,
      totalSignals: signals
    };
  }, [nodes]);

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
      tooltip: 'Total number of unique members across all nodes'
    },
    {
      title: 'Max Depth',
      value: maxDepth.toString(),
      icon: GitBranch,
      bgColor: 'green.50',
      textColor: 'green.600',
      tooltip: 'Maximum depth of the node hierarchy'
    },
    {
      title: 'Total Signals',
      value: totalSignals.toString(),
      icon: Signal,
      bgColor: 'orange.50',
      textColor: 'orange.600',
      tooltip: 'Total number of active signals'
    }
  ], [totalValue, totalMembers, maxDepth, totalSignals]);

  // Handle spawn root node
  const handleSpawnRoot = useCallback(async () => {
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
      const tx = await spawnNode(selectedToken);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast({
          title: "Success",
          description: "Root node spawned successfully",
          status: "success",
          duration: 5000,
          icon: <Check size={16} />,
        });
        // Refresh data after successful spawn
        onRefresh?.();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error('Error spawning root node:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to spawn root node",
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    }
  }, [selectedToken, spawnNode, toast, onRefresh]);

  // Handle operation modal
  const handleOperation = useCallback((operation: string) => {
    setCurrentOperation(operation);
    onOpen();
  }, [onOpen]);

  const handleOperationSubmit = useCallback(async (params: any) => {
    // Operation handling will be implemented here
    onClose();
  }, [onClose]);

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
      {/* Header with Spawn Button */}
      <HStack justify="space-between" mb={8}>
        <HStack spacing={4}>
          <Button
            leftIcon={<Plus size={16} />}
            rightIcon={<GitBranchPlus size={16} />}
            onClick={handleSpawnRoot}
            variant="outline"
            colorScheme="purple"
            isLoading={isTransacting}
            loadingText="Spawning..."
            isDisabled={!selectedToken || isTransacting}
          >
            Spawn Root Node
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
            Selected Token: {selectedToken.slice(0, 6)}...{selectedToken.slice(-4)}
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

      {/* Nodes Display */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Value Flow</Text>
        
        {nodes.length === 0 ? (
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
                No nodes found. Start by spawning a root node.
              </Text>
              <Button
                leftIcon={<Plus size={16} />}
                onClick={handleSpawnRoot}
                variant="outline"
                colorScheme="purple"
                isLoading={isTransacting}
              >
                Spawn Root Node
              </Button>
            </VStack>
          </Box>
        ) : (
          <Box 
            overflowX="auto" 
            overflowY="hidden"
            position="relative"
            maxH="600px"
            pb={4}
          >
            <HStack spacing={8} align="start">
              {nodes.map((node, index) => {
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
              })}
            </HStack>
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
                          >
                            {pathNode.slice(-6)}
                          </Badge>
                        </React.Fragment>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Show Signal Information if exists */}
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
              </VStack>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Token Operation Modal */}
      <TokenOperationModal
        isOpen={isOpen}
        onClose={onClose}
        operation={currentOperation}
        nodeId={selectedToken}
        chainId={chainId}
        isLoading={isTransacting}
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

interface NodeStatsProps {
  value: string | number;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  color?: string;
}

// Helper component for consistent node stats display
const NodeStat: React.FC<NodeStatsProps> = ({
  value,
  label,
  icon: Icon,
  color = "gray.600"
}) => (
  <HStack spacing={1}>
    <Icon size={14} />
    <Tooltip label={label}>
      <Text fontSize="sm" color={color}>
        {value}
      </Text>
    </Tooltip>
  </HStack>
);

export default RootNodeDetails;