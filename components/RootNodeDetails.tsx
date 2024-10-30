import React, { useMemo, useState } from 'react';
import { 
  Users, Activity, GitBranch, Signal, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button, Box, Text, VStack, HStack, Heading, useToast,
  Spinner, Alert, AlertIcon
} from '@chakra-ui/react';
import { useRootNodes } from '../hooks/useRootNodes';
import { NodeState } from '../types/chainData';
import { formatBalance, formatPercentage } from '../utils/formatters';


interface RootNodeDetailsProps {
  chainId: string;
  selectedToken: string;
  userAddress: string;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  onSpawnNode: () => Promise<void>;
  nodes: NodeState[];
  isLoading: boolean;
  error: Error | null;
}

const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({
  chainId,
  selectedToken,
  userAddress,
  selectedTokenColor,
  onNodeSelect,
  onSpawnNode,
  nodes,
  isLoading,
  error
}) => {
  const [hoveredNode, setHoveredNode] = useState<NodeState | null>(null);
  const [isSpawning, setIsSpawning] = useState(false);
  const toast = useToast();


  const { totalValue, nodeValues } = useMemo(() => {
    if (!nodes) return { totalValue: BigInt(0), nodeValues: {} };

    const total = nodes.reduce((sum, node) => {
      if (!node?.basicInfo?.[4]) return sum;
      try {
        return sum + BigInt(node.basicInfo[4]);
      } catch {
        return sum;
      }
    }, BigInt(0));

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

    return { totalValue: total, nodeValues: values };
  }, [nodes]);

  const statsCards = useMemo(() => [
    {
      title: 'Total Value',
      value: formatBalance(totalValue),
      icon: Activity,
      bgColor: 'purple.50',
      textColor: 'purple.600',
    },
    {
      title: 'Total Members',
      value: (nodes || []).reduce((sum, node) => sum + (node.membersOfNode?.length || 0), 0).toString(),
      icon: Users,
      bgColor: 'blue.50',
      textColor: 'blue.600',
    },
    {
      title: 'Node Depth',
      value: Math.max(...(nodes || []).map(node => node.rootPath?.length || 0), 0).toString(),
      icon: GitBranch,
      bgColor: 'green.50',
      textColor: 'green.600',
    },
    {
      title: 'Total Signals',
      value: (nodes || []).reduce((sum, node) => sum + (node.signals?.length || 0), 0).toString(),
      icon: Signal,
      bgColor: 'orange.50',
      textColor: 'orange.600',
    }
  ], [nodes, totalValue]);

  const handleSpawnRoot = async () => {
    try {
      setIsSpawning(true);
      await onSpawnNode();
      await refetch();
      toast({
        title: "Success",
        description: "Root node spawned successfully",
        status: "success",
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to spawn root node",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSpawning(false);
    }
  };

  if (isLoading) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm" textAlign="center">
        <Spinner size="xl" color={selectedTokenColor} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm">
        <Alert status="error">
          <AlertIcon />
          Error loading node data: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!nodes) {
    return (
      <Box p={6} bg="white" rounded="xl" shadow="sm">
        <Alert status="info">
          <AlertIcon />
          No nodes found
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" rounded="xl" shadow="sm">
      <HStack justify="space-between" mb={8}>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={handleSpawnRoot}
          variant="outline"
          size="md"
          colorScheme="purple"
          isLoading={isSpawning}
          loadingText="Spawning..."
        >
          Spawn Root Node
        </Button>
      </HStack>

      <Box mb={8}>
        <HStack spacing={4} wrap="wrap">
          {statsCards.map((stat, index) => (
            <Box
              key={index}
              p={4}
              bg={stat.bgColor}
              rounded="lg"
              flex="1"
              minW="200px"
            >
              <HStack color={stat.textColor} mb={1}>
                <stat.icon size={16} />
                <Text fontSize="sm">{stat.title}</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="semibold">
                {stat.value}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>

      <Box>
        <Heading size="md" mb={6}>Value Flow</Heading>
        
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
                isLoading={isSpawning}
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
          >
            <HStack spacing={8} align="start" pb={4}>
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

      <AnimatePresence>
        {hoveredNode && (
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
              </HStack>
            </VStack>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }
      `}</style>
    </Box>
  );
};

export default RootNodeDetails;