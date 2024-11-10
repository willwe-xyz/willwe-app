import React from 'react';
import { useRouter } from 'next/router';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatBalance } from '../../utils/formatters';
import { NodeState } from '../../types/chainData';

interface NodeCardProps {
  node: NodeState;
  index: number;
  selectedTokenColor: string;
  onNodeSelect?: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  chainId: string;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  index,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
  chainId
}) => {
  const router = useRouter();

  // Guard against invalid node data
  if (!node?.basicInfo?.[0]) return null;
  
  const nodeId = node.basicInfo[0];
  const memberCount = node.membersOfNode?.length || 0;
  const signalCount = node.signals?.length || 0;
  const nodeValue = node.basicInfo[4] || '0';
  const percentage = nodeValues[nodeId] || 0;

  // Handle node click with fallback to direct navigation
  const handleNodeClick = () => {
    if (onNodeSelect && typeof onNodeSelect === 'function') {
      onNodeSelect(nodeId);
    } else {
      // Direct navigation fallback
      const cleanChainId = chainId.replace('eip155:', '');
      router.push({
        pathname: '/nodes/[chainId]/[nodeId]',
        query: { chainId: cleanChainId, nodeId }
      });
    }
  };

  return (
    <motion.div
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
        onClick={handleNodeClick}
        _hover={{ 
          transform: 'translateY(-2px)', 
          shadow: 'md',
          borderColor: `${selectedTokenColor}`,
          bg: `${selectedTokenColor}05`
        }}
        transition="all 0.2s"
        position="relative"
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
              sx={{
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                  '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                },
                animation: 'pulse 2s infinite'
              }}
            />
          )}
        </HStack>

        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <HStack>
              <Activity size={14} color={selectedTokenColor} />
              <Text fontSize="sm" color={selectedTokenColor}>
                {formatBalance(nodeValue)}
              </Text>
            </HStack>
            <HStack>
              <Users size={14} color={selectedTokenColor} />
              <Text fontSize="sm" color={selectedTokenColor}>
                {memberCount}
              </Text>
            </HStack>
          </HStack>

          <Box 
            bg={`${selectedTokenColor}10`}
            rounded="full" 
            h="2"
            overflow="hidden"
          >
            <Box
              bg={selectedTokenColor}
              h="full"
              w={`${percentage}%`}
              transition="width 0.3s ease"
            />
          </Box>
          
          <Text 
            fontSize="xs" 
            color="gray.500" 
            textAlign="right"
          >
            {percentage.toFixed(1)}%
          </Text>
        </VStack>
      </Box>
    </motion.div>
  );
};

export default React.memo(NodeCard, (prevProps, nextProps) => {
  return (
    prevProps.node?.basicInfo?.[0] === nextProps.node?.basicInfo?.[0] &&
    prevProps.nodeValues[prevProps.node?.basicInfo?.[0]] === nextProps.nodeValues[nextProps.node?.basicInfo?.[0]] &&
    prevProps.selectedTokenColor === nextProps.selectedTokenColor &&
    prevProps.chainId === nextProps.chainId
  );
});