import React, { useMemo, useCallback } from 'react';
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
  Button,
  useColorModeValue,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { 
  Users, 
  GitBranch, 
  ArrowUpRight, 
  Activity,
  Signal,
  Clock
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { formatBalance } from '../hooks/useBalances';
import { NodeState } from '../types/chainData';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
}

const safeFormatBalance = (value: any): string => {
  if (!value) return '0';
  try {
    return formatBalance(value.toString());
  } catch (e) {
    console.error('Error in safeFormatBalance:', e);
    return '0';
  }
};

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  onNodeSelect
}) => {
  const { user } = usePrivy();
  
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

  const stats = useMemo(() => {
    if (!nodeData?.basicInfo) {
      return {
        totalValue: '0',
        dailyGrowth: '0',
        memberCount: 0,
        childCount: 0,
        pathDepth: 0
      };
    }

    try {
      const totalValue = nodeData.basicInfo[4] ? BigInt(nodeData.basicInfo[4]) : BigInt(0);
      const inflation = nodeData.basicInfo[1] ? BigInt(nodeData.basicInfo[1]) : BigInt(0);
      const dailyGrowth = inflation * BigInt(86400);

      return {
        totalValue: safeFormatBalance(totalValue),
        dailyGrowth: safeFormatBalance(dailyGrowth),
        memberCount: Array.isArray(nodeData.membersOfNode) ? nodeData.membersOfNode.length : 0,
        childCount: Array.isArray(nodeData.childrenNodes) ? nodeData.childrenNodes.length : 0,
        pathDepth: Array.isArray(nodeData.rootPath) ? nodeData.rootPath.length : 0
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

  const signalData = useMemo(() => {
    if (!nodeData?.signals || !Array.isArray(nodeData.signals)) {
      return {
        recentSignals: [],
        hasActiveSignals: false,
        lastSignalTime: 0
      };
    }

    try {
      const processedSignals = nodeData.signals
        .filter(signal => signal && Array.isArray(signal.MembraneInflation))
        .flatMap(signal => {
          if (!Array.isArray(signal.MembraneInflation)) return [];
          
          return signal.MembraneInflation.map(([membrane, inflation], index) => {
            const safeValue = inflation?.toString() || '0';
            return {
              membrane: String(membrane || ''),
              inflation: safeValue,
              timestamp: signal.lastRedistSignal && Array.isArray(signal.lastRedistSignal) 
                ? Number(signal.lastRedistSignal[index]) || Date.now()
                : Date.now(),
              value: safeValue
            };
          });
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      return {
        recentSignals: processedSignals.slice(0, 10),
        hasActiveSignals: processedSignals.length > 0,
        lastSignalTime: processedSignals[0]?.timestamp || Date.now()
      };
    } catch (err) {
      console.error('Error processing signals:', err);
      return {
        recentSignals: [],
        hasActiveSignals: false,
        lastSignalTime: 0
      };
    }
  }, [nodeData]);

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

  const handlePathNodeClick = useCallback((pathNodeId: string) => {
    if (onNodeSelect && pathNodeId) {
      onNodeSelect(pathNodeId);
    }
  }, [onNodeSelect]);

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
                Node {nodeId ? nodeId.slice(-6) : 'Unknown'}
              </Text>
              <Badge colorScheme="purple">
                Depth {stats.pathDepth}
              </Badge>
            </HStack>
            <Text fontSize="sm" color={textColor}>
              {nodeData.basicInfo[0] || 'Unknown ID'}
            </Text>
          </VStack>
          <HStack>
            <Button
              leftIcon={<Activity size={16} />}
              size="sm"
              onClick={handleRedistribute}
              colorScheme="purple"
              variant="outline"
              isDisabled={!permissions.canRedistribute || isProcessing}
              isLoading={isProcessing}
            >
              Redistribute
            </Button>
            <Button
              leftIcon={<Signal size={16} />}
              size="sm"
              onClick={handleSignal}
              colorScheme="purple"
              variant="outline"
              isDisabled={!permissions.canSignal || isProcessing}
              isLoading={isProcessing}
            >
              Signal
            </Button>
          </HStack>
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

      {Array.isArray(nodeData.rootPath) && nodeData.rootPath.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <Text fontWeight="medium" mb={2}>Path</Text>
          <HStack spacing={2}>
            {nodeData.rootPath.map((pathNodeId, index) => (
              <React.Fragment key={pathNodeId}>
                {index > 0 && <ArrowUpRight size={14} />}
                <Badge
                  cursor="pointer"
                  onClick={() => handlePathNodeClick(pathNodeId)}
                  _hover={{ bg: 'purple.100' }}
                >
                  {pathNodeId ? pathNodeId.slice(-6) : 'Unknown'}
                </Badge>
              </React.Fragment>
            ))}
          </HStack>
        </Box>
      )}

      {signalData.recentSignals.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="medium">Recent Signals</Text>
            {signalData.hasActiveSignals && (
              <Text fontSize="sm" color={textColor}>
                Last activity: {new Date(signalData.lastSignalTime).toLocaleString()}
              </Text>
            )}
          </HStack>
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
              {signalData.recentSignals.map((signal, index) => (
                <Tr key={index}>
                  <Td>{signal.membrane || 'Unknown'}</Td>
                  <Td>{signal.inflation || '0'}</Td>
                  <Td>{new Date(signal.timestamp).toLocaleString()}</Td>
                  <Td isNumeric>{safeFormatBalance(signal.value)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

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
    </Box>
  );
};

export default React.memo(NodeDetails);