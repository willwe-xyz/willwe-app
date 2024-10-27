import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useColorModeValue,
  Tooltip,
  Skeleton
} from "@chakra-ui/react";
import { 
  Users, 
  GitBranch, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Signal,
  Clock
} from 'lucide-react';
import { useNodeData } from '../hooks/useNodeData';
import { useTransaction } from '../contexts/TransactionContext';
import { NodeState, UserSignal } from '../types/chainData';
import { formatBalance } from '../hooks/useBalances';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  onNodeSelect
}) => {
  // Hooks
  const { data: nodeData, error, isLoading } = useNodeData(chainId, nodeId);
  const { executeTransaction } = useTransaction();

  // Color modes
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Memoized calculations
  const stats = useMemo(() => {
    if (!nodeData) return null;

    const totalValue = BigInt(nodeData.basicInfo[4]);
    const inflation = BigInt(nodeData.basicInfo[1]);
    const dailyGrowth = (inflation * BigInt(86400)); // seconds in a day

    return {
      totalValue: formatBalance(totalValue.toString()),
      dailyGrowth: formatBalance(dailyGrowth.toString()),
      memberCount: nodeData.membersOfNode.length,
      childCount: nodeData.childrenNodes.length,
      pathDepth: nodeData.rootPath.length
    };
  }, [nodeData]);

  const formattedSignals = useMemo(() => {
    if (!nodeData?.signals) return [];

    return nodeData.signals.map((signal: UserSignal) => ({
      membrane: signal.MembraneAndInflation.map(([m]) => m).join(', '),
      inflation: signal.MembraneAndInflation.map(([, i]) => i).join(', '),
      lastRedistribution: signal.lastReidstriSig.join(', ')
    }));
  }, [nodeData]);

  // Transaction Handlers
  const handleRedistribute = async () => {
    if (!nodeData) return;

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.redistributePath(nodeId);
      },
      {
        successMessage: 'Path redistributed successfully',
      }
    );
  };

  const handleSignal = async () => {
    if (!nodeData) return;

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.sendSignal(nodeId, []); // Add signal params as needed
      },
      {
        successMessage: 'Signal sent successfully',
      }
    );
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  if (error || !nodeData) {
    return (
      <Box p={6} textAlign="center" color="red.500">
        <Text>Error loading node data: {error?.message || 'Node not found'}</Text>
      </Box>
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
      {/* Header */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontSize="lg" fontWeight="bold">Node {nodeId.slice(-6)}</Text>
              <Badge colorScheme="purple">Depth {nodeData.rootPath.length}</Badge>
            </HStack>
            <Text fontSize="sm" color={textColor}>
              {nodeData.basicInfo[0]}
            </Text>
          </VStack>
          <HStack>
            <Button
              leftIcon={<Activity size={16} />}
              size="sm"
              onClick={handleRedistribute}
              colorScheme="purple"
              variant="outline"
            >
              Redistribute
            </Button>
            <Button
              leftIcon={<Signal size={16} />}
              size="sm"
              onClick={handleSignal}
              colorScheme="purple"
              variant="outline"
            >
              Signal
            </Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <HStack spacing={8} wrap="wrap">
          <Tooltip label="Total Value">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Total Value</Text>
              <Text fontSize="lg" fontWeight="semibold">{stats?.totalValue}</Text>
            </VStack>
          </Tooltip>
          <Tooltip label="Daily Growth">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Daily Growth</Text>
              <Text fontSize="lg" fontWeight="semibold" color="green.500">
                +{stats?.dailyGrowth}
              </Text>
            </VStack>
          </Tooltip>
          <Tooltip label="Members">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Members</Text>
              <HStack>
                <Users size={16} />
                <Text fontSize="lg" fontWeight="semibold">{stats?.memberCount}</Text>
              </HStack>
            </VStack>
          </Tooltip>
          <Tooltip label="Child Nodes">
            <VStack align="start">
              <Text fontSize="sm" color={textColor}>Child Nodes</Text>
              <HStack>
                <GitBranch size={16} />
                <Text fontSize="lg" fontWeight="semibold">{stats?.childCount}</Text>
              </HStack>
            </VStack>
          </Tooltip>
        </HStack>
      </Box>

      {/* Path */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <Text fontWeight="medium" mb={2}>Path</Text>
        <HStack spacing={2}>
          {nodeData.rootPath.map((nodeId, index) => (
            <React.Fragment key={nodeId}>
              {index > 0 && <ArrowUpRight size={14} />}
              <Badge
                cursor="pointer"
                onClick={() => onNodeSelect?.(nodeId)}
                _hover={{ bg: 'purple.100' }}
              >
                {nodeId.slice(-6)}
              </Badge>
            </React.Fragment>
          ))}
        </HStack>
      </Box>

      {/* Signals */}
      {formattedSignals.length > 0 && (
        <Box p={6}>
          <Text fontWeight="medium" mb={4}>Recent Signals</Text>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Membrane</Th>
                <Th>Inflation</Th>
                <Th>Last Redistribution</Th>
              </Tr>
            </Thead>
            <Tbody>
              {formattedSignals.map((signal, index) => (
                <Tr key={index}>
                  <Td>{signal.membrane}</Td>
                  <Td>{signal.inflation}</Td>
                  <Td>{signal.lastRedistribution}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(NodeDetails);