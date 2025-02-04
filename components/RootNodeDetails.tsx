import React, { useMemo, useCallback, useState, useEffect } from 'react';
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
  Flex,
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
  ArrowUpRight,
  Wallet,
  Copy
} from 'lucide-react';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';
import { formatBalance, addressToNodeId } from '../utils/formatters';
import { useTransaction } from '../contexts/TransactionContext';
import { NodeHierarchyView } from './Node/NodeHierarchyView';
import { SankeyChart } from './Node/SankeyChart';
import { StatsCard } from './Node/StatsCards'; 
import { NodeFilters } from './Node/NodeFilters';
import { NodeActions } from './Node/NodeActions';
import { TokenNameDisplay } from './Token/TokenNameDisplay';
import { useWillWeContract } from '../hooks/useWillWeContract';
import { NodeOperations } from './Node/NodeOperations';

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
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const toast = useToast();
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const willweContract = useWillWeContract(chainId);
  const [totalSupplyValue, setTotalSupplyValue] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const fetchTotalSupply = async () => {
      if (!selectedToken || !willweContract) return;
      try {
        const tokenId = addressToNodeId(selectedToken);
        const supply = await willweContract.totalSupply(tokenId);
        setTotalSupplyValue(supply);
      } catch (error) {
        console.error('Error fetching total supply:', error);
      }
    };

    if (willweContract) {
      fetchTotalSupply();
    }
  }, [selectedToken, willweContract]);

  const {
    baseNodes,
    derivedNodes,
    nodeValues,
    totalMembers,
    maxDepth,
    totalSignals,
    averageExpense
  } = useMemo(() => {
    if (!nodes?.length || !selectedToken) return {
      baseNodes: [],
      derivedNodes: [],
      nodeValues: {},
      totalMembers: 0,
      maxDepth: 0,
      totalSignals: 0,
      averageExpense: 0
    };

    const base = nodes.filter(node => node.rootPath.length === 1);
    const derived = nodes.filter(node => node.rootPath.length > 1);

    const uniqueAddresses = new Set<string>();
    nodes.forEach(node => {
      if (node.membersOfNode) {
        node.membersOfNode.forEach((member: string) => uniqueAddresses.add(member));
      }
    });

    const depth = nodes.reduce((max, node) => {
      return node.rootPath ? Math.max(max, node.rootPath.length) : max;
    }, 0);

    const totalExpensePerSec = nodes.reduce((sum, node) => {
      const expensePerSec = node.basicInfo?.[1] ? BigInt(node.basicInfo[1]) : BigInt(0);
      return sum + expensePerSec;
    }, BigInt(0));
    
    const nodesWithExpense = nodes.filter(node => node.basicInfo?.[1] && BigInt(node.basicInfo[1]) > 0).length;
    const avgExpensePerSecGwei = nodesWithExpense > 0 ? 
      Number(totalExpensePerSec) / nodesWithExpense : 
      0;
    
    const avgExpensePerDay = (avgExpensePerSecGwei * 86400) / 1e9;

    const values: Record<string, number> = {};
    if (totalSupplyValue > BigInt(0)) {
      nodes.forEach(node => {
        if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
        try {
          const nodeValue = BigInt(node.basicInfo[4]);
          values[node.basicInfo[0]] = Number((nodeValue * BigInt(10000)) / totalSupplyValue) / 100;
        } catch {
          values[node.basicInfo[0]] = 0;
        }
      });
    }

    return {
      baseNodes: base,
      derivedNodes: derived,
      nodeValues: values,
      totalMembers: uniqueAddresses.size,
      maxDepth: depth,
      totalSignals: 0,
      averageExpense: avgExpensePerDay
    };
  }, [nodes, selectedToken, totalSupplyValue]);

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
    <Flex 
      direction="column" 
      h="calc(100vh - 80px)"
      bg="white" 
      rounded="xl" 
      shadow="sm"
      overflow="hidden"
    >
      <Box p={4} borderBottom="1px" borderColor="gray.100">
        <HStack justify="space-between" mb={4}>
          <NodeActions
            onSpawnNode={() => setShowSpawnModal(true)}
            isProcessing={isProcessing}
            selectedToken={selectedToken}
            userAddress={userAddress}
            onRefresh={onRefresh}
          />
          {selectedToken && (
            <TokenNameDisplay 
              tokenAddress={selectedToken}  
              chainId={chainId}
            />
          )}
        </HStack>

        <Grid 
          templateColumns="repeat(5, 1fr)"
          gap={3}
          maxW="100%"
          mx="auto"
        >
          <StatsCard
            title="Total Value"
            value={Number(formatBalance(totalSupplyValue)).toFixed(3)}
            icon={<Wallet size={14} />}
            color="purple"
            tooltip="Total supply of the token"
            size="sm"
          />
          <StatsCard
            title="Members"
            value={totalMembers}
            icon={<Users size={14} />}
            color="blue"
            tooltip="Total unique members across all nodes"
            size="sm"
          />
          <StatsCard
            title="Max Depth"
            value={maxDepth}
            icon={<GitBranch size={14} />}
            color="green"
            tooltip="Maximum depth of the node hierarchy"
            size="sm"
          />
          <StatsCard
            title="Active Signals"
            value={totalSignals}
            icon={<Signal size={14} />}
            color="orange"
            tooltip="Total active signals across all nodes"
            size="sm"
          />
          <StatsCard
            title="Average Expense"
            value={formatBalance(averageExpense.toString())}
            icon={<Wallet size={14} />}
            color="red"
            tooltip="Average expense per node in ETH/day"
            size="sm"
          />
        </Grid>
      </Box>

      <Flex direction="column" flex="1" overflow="hidden">
        <Box px={6} py={4} borderBottom="1px" borderColor="gray.100">
          <NodeFilters
            nodes={nodes}
            onFilterChange={(filteredNodes) => {
              // Implement filtering logic
            }}
          />
        </Box>

        <Box flex="1" overflowY="auto" px={6} py={4} pb={20}>
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
                  No nodes found. Create a new node to get started.
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  onClick={() => setShowSpawnModal(true)}
                  colorScheme="purple"
                  isLoading={isProcessing}
                  isDisabled={!selectedToken || isProcessing || !wallets[0]?.address}
                >
                  Create Node
                </Button>
              </VStack>
            </Box>
          ) : (
            <Box pb={16}>
              <SankeyChart
                nodes={nodes}
                selectedTokenColor={selectedTokenColor}
                onNodeSelect={onNodeSelect}
                nodeValues={nodeValues}
                chainId={chainId}
              />
            </Box>
          )}
        </Box>
      </Flex>

      <NodeOperations
  nodeId={selectedToken}
  chainId={chainId}
  selectedTokenColor={selectedTokenColor}
  userAddress={userAddress}
  onSuccess={() => {
    setShowSpawnModal(false);
    if (onRefresh) onRefresh();
  }}
  initialTab={showSpawnModal ? 'spawn' : null}
  showToolbar={false}
/>
    </Flex>
  );
};

export default RootNodeDetails;