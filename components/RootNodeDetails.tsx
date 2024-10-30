import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  Activity,
  GitBranch,
  Signal,
  Shield,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  useToast
} from '@chakra-ui/react';

const RootNodeDetails = ({
  nodes = [],
  totalValue = BigInt(0),
  selectedTokenColor,
  onNodeSelect,
  onSpawnNode
}) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const toast = useToast();

  // Handle spawn root node
  const handleSpawnRoot = async () => {
    try {
      await onSpawnNode();
      toast({
        title: "Spawning root node",
        description: "Please wait while the transaction is processed",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to spawn root node:', error);
      toast({
        title: "Failed to spawn root node",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Value',
      value: (Number(totalValue) / 10 ** 18).toFixed(4),
      icon: Activity,
      bgColor: 'purple.50',
      textColor: 'purple.600',
    },
    {
      title: 'Total Members',
      value: nodes.reduce((sum, node) => sum + (node.membersOfNode?.length || 0), 0),
      icon: Users,
      bgColor: 'blue.50',
      textColor: 'blue.600',
    },
    {
      title: 'Node Depth',
      value: Math.max(...nodes.map(node => node.rootPath?.length || 0), 0),
      icon: GitBranch,
      bgColor: 'green.50',
      textColor: 'green.600',
    },
    {
      title: 'Total Signals',
      value: nodes.reduce((sum, node) => sum + (node.signals?.length || 0), 0),
      icon: Signal,
      bgColor: 'orange.50',
      textColor: 'orange.600',
    }
  ];

  return (
    <Box p={6} bg="white" rounded="xl" shadow="sm">
      {/* Action Bar */}
      <HStack justify="space-between" mb={8}>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={handleSpawnRoot}
          variant="outline"
          size="md"
          colorScheme="purple"
        >
          Spawn Root Node
        </Button>
      </HStack>

      {/* Summary Stats */}
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

      {/* Value Flow */}
      <Box>
        <Heading size="md" mb={6}>Value Flow</Heading>
        
        {nodes.length === 0 ? (
          // Empty state
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
              >
                Spawn Root Node
              </Button>
            </VStack>
          </Box>
        ) : (
          // Node visualization
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
                const value = node.basicInfo[4] ? 
                  Number(BigInt(node.basicInfo[4]) / BigInt(10 ** 18)) : 0;
                const memberCount = node.membersOfNode?.length || 0;
                const signalCount = node.signals?.length || 0;

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
                            <Text fontSize="sm">{value.toFixed(4)}</Text>
                          </HStack>
                          <HStack>
                            <Users size={14} />
                            <Text fontSize="sm">{memberCount}</Text>
                          </HStack>
                        </HStack>

                        {/* Value progress bar */}
                        <Box bg="gray.100" rounded="full" h="2" overflow="hidden">
                          <Box
                            bg={selectedTokenColor}
                            h="full"
                            w={`${(value / (Number(totalValue) / 10 ** 18)) * 100}%`}
                          />
                        </Box>
                      </VStack>
                    </Box>
                  </motion.div>
                );
              })}
            </HStack>
          </Box>
        )}
      </Box>

      {/* Hover details */}
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
                    {(Number(BigInt(hoveredNode.basicInfo[4]) / BigInt(10 ** 18))).toFixed(4)}
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