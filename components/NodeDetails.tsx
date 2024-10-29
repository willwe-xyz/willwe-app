import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon,
  useDisclosure,
} from "@chakra-ui/react";
import { 
  Users, 
  ArrowUpRight, 
  GitBranch,
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { formatBalance } from '../hooks/useBalances';
import { NodeState } from '../types/chainData';
import { NodeOperations } from './Node/NodeOperations';
import { TokenOperationModal } from './Node/TokenOperationModal';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
  selectedTokenColor: string;
}

interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  onNodeSelect,
  selectedTokenColor
}) => {
  const { user } = usePrivy();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentOperation, setCurrentOperation] = useState<string>('');
  
  const cleanChainId = useMemo(() => 
    chainId?.includes('eip155:') ? chainId.replace('eip155:', '') : chainId,
    [chainId]
  );

  // Style hooks
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const permissionsBg = useColorModeValue('gray.50', 'gray.900');

  const { data: nodeData, error, isLoading } = useNodeData(cleanChainId, nodeId);
  const { permissions, transactions, isProcessing } = useNodeOperations(
    cleanChainId,
    nodeData,
    user?.wallet?.address
  );

  // Operation handlers
  const handleOperation = useCallback((operation: string) => {
    setCurrentOperation(operation);
    onOpen();
  }, [onOpen]);

  const handleOperationSubmit = useCallback(async (params: OperationParams) => {
    if (!nodeData?.basicInfo?.[0]) return;
    
    try {
      switch (currentOperation) {
        case 'mint':
          if (params.amount) await transactions.mint(params.amount);
          break;
        case 'burn':
          if (params.amount) await transactions.burn(params.amount);
          break;
        case 'mintPath':
          if (params.amount) await transactions.mintPath(nodeData.basicInfo[0], params.amount);
          break;
        case 'burnPath':
          if (params.amount) await transactions.burnPath(nodeData.basicInfo[0], params.amount);
          break;
        case 'spawn':
          await transactions.spawn();
          break;
        case 'spawnWithMembrane':
          if (params.membraneId) await transactions.spawnBranchWithMembrane(params.membraneId);
          break;
        default:
          console.warn('Unknown operation:', currentOperation);
      }
    } catch (err) {
      console.error(`${currentOperation} operation failed:`, err);
    }
  }, [currentOperation, nodeData?.basicInfo, transactions]);

  const handleRedistribute = useCallback(async () => {
    if (!permissions.canRedistribute) return;
    try {
      await transactions.redistribute();
    } catch (err) {
      console.error('Redistribution failed:', err);
    }
  }, [permissions.canRedistribute, transactions]);

  const handleSignal = useCallback(async () => {
    if (!permissions.canSignal) return;
    try {
      await transactions.signal([]);
    } catch (err) {
      console.error('Signal failed:', err);
    }
  }, [permissions.canSignal, transactions]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!nodeData?.basicInfo) return {
      totalValue: '0',
      dailyGrowth: '0',
      memberCount: 0,
      childCount: 0,
      pathDepth: 0
    };

    try {
      const totalValue = nodeData.basicInfo[4] ? BigInt(nodeData.basicInfo[4]) : BigInt(0);
      const inflation = nodeData.basicInfo[1] ? BigInt(nodeData.basicInfo[1]) : BigInt(0);
      const dailyGrowth = inflation * BigInt(86400);

      return {
        totalValue: formatBalance(totalValue.toString()),
        dailyGrowth: formatBalance(dailyGrowth.toString()),
        memberCount: nodeData.membersOfNode?.length || 0,
        childCount: nodeData.childrenNodes?.length || 0,
        pathDepth: nodeData.rootPath?.length || 0
      };
    } catch (err) {
      console.error('Error calculating stats:', err);
      return {
        totalValue: '0',
        dailyGrowth: '0',
        memberCount: 0,
        childCount: 0,
        pathDepth: 0
      };
    }
  }, [nodeData]);

  // Format path data for modal
  const modalData = useMemo(() => ({
    path: nodeData?.rootPath?.map(id => ({
      id,
      name: `Node ${id.slice(-6)}`
    })) || [],
    membranes: [] // Add membrane data when available
  }), [nodeData?.rootPath]);

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
      </Alert>
    );
  }

  if (!nodeData?.basicInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>No data available for this node</Text>
      </Alert>
    );
  }

  return (
    <Box
      borderRadius="lg"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
    >
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontSize="lg" fontWeight="bold">
                Node {nodeId.slice(-6)}
              </Text>
              <Badge colorScheme="purple">
                Depth {stats.pathDepth}
              </Badge>
            </HStack>
            <Text fontSize="sm" color={textColor}>
              {nodeData.basicInfo[0]}
            </Text>
          </VStack>
          
          <NodeOperations
            permissions={permissions}
            isProcessing={isProcessing}
            onOperation={handleOperation}
            onRedistribute={handleRedistribute}
            onSignal={handleSignal}
            selectedTokenColor={selectedTokenColor}
          />
        </HStack>

        <HStack spacing={8} wrap="wrap">
          <Tooltip label="Total Value">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Total Value</Text>
              <Text fontSize="lg" fontWeight="semibold">
                {stats.totalValue}
              </Text>
            </VStack>
          </Tooltip>
          <Tooltip label="Daily Growth">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Daily Growth</Text>
              <Text fontSize="lg" fontWeight="semibold" color="green.500">
                +{stats.dailyGrowth}
              </Text>
            </VStack>
          </Tooltip>
          <Tooltip label="Members">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Members</Text>
              <HStack>
                <Users size={16} />
                <Text fontSize="lg" fontWeight="semibold">
                  {stats.memberCount}
                </Text>
              </HStack>
            </VStack>
          </Tooltip>
          <Tooltip label="Child Nodes">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Child Nodes</Text>
              <HStack>
                <GitBranch size={16} />
                <Text fontSize="lg" fontWeight="semibold">
                  {stats.childCount}
                </Text>
              </HStack>
            </VStack>
          </Tooltip>
        </HStack>
      </Box>

      {/* Path Display */}
      {nodeData.rootPath.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <Text fontWeight="medium" mb={2}>Path</Text>
          <HStack spacing={2}>
            {nodeData.rootPath.map((pathNodeId, index) => (
              <React.Fragment key={pathNodeId}>
                {index > 0 && <ArrowUpRight size={14} />}
                <Badge
                  cursor="pointer"
                  onClick={() => onNodeSelect?.(pathNodeId)}
                  _hover={{ bg: 'purple.100' }}
                >
                  {pathNodeId.slice(-6)}
                </Badge>
              </React.Fragment>
            ))}
          </HStack>
        </Box>
      )}

      {/* Signal History */}
      {nodeData.signals.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <Text fontWeight="medium" mb={4}>Recent Signals</Text>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Membrane</Th>
                <Th>Inflation</Th>
                <Th>Timestamp</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {nodeData.signals.slice(0, 5).map((signal, index) => (
                <Tr key={index}>
                  <Td>{signal.MembraneInflation[0] || 'Unknown'}</Td>
                  <Td>{signal.MembraneInflation[1] || '0'}</Td>
                  <Td>{new Date(Number(signal.lastRedistSignal[0])).toLocaleString()}</Td>
                  <Td isNumeric>{formatBalance(signal.MembraneInflation[1] || '0')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Permissions */}
      {user?.wallet?.address && (
        <Box p={6} bg={permissionsBg}>
          <Text fontWeight="medium" mb={2}>Permissions</Text>
          <HStack spacing={4} wrap="wrap">
            {Object.entries(permissions).map(([permission, isAllowed]) => (
              <Badge
                key={permission}
                colorScheme={isAllowed ? 'green' : 'gray'}
                variant="subtle"
              >
                {permission.replace('can', '')}
              </Badge>
            ))}
          </HStack>
        </Box>
      )}

      {/* Token Operation Modal */}
      <TokenOperationModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleOperationSubmit}
        operation={currentOperation}
        isLoading={isProcessing}
        nodeId={nodeId}
        chainId={cleanChainId}
        data={modalData}
      />
    </Box>
  );
};

export default React.memo(NodeDetails);