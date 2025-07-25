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
import { NodeState } from '../types/chainData';
import { formatBalance, addressToNodeId } from '../utils/formatters';
import { useTransaction } from '../contexts/TransactionContext';
import { SankeyChart } from './Node/SankeyChart';
import { StatsCard } from './Node/StatsCards'; 
import { NodeFilters } from './Node/NodeFilters';
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
  tokenSymbol: string;
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({
  chainId,
  selectedToken,
  selectedTokenColor,
  onNodeSelect,
  nodes = [],
  isLoading,
  error,
  onRefresh,
  tokenSymbol
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
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

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

  const formatValue = (value: string | bigint): string => {
    const formatted = formatBalance(value.toString());
    return Number(formatted).toFixed(4);
  };

  const fetchRootNodeEvents = useCallback(async () => {
    if (!selectedToken || !chainId) return;
    setRefreshLoading(true);
    setRefreshError(null);
    try {
      // Use internal API endpoint that will proxy to Ponder
      const response = await fetch(`/api/rootnode/events?nodeId=${selectedToken}&networkId=${chainId}`);
      if (!response.ok) {
        throw new Error(`Error fetching root node events: ${response.statusText}`);
      }
      const data = await response.json();
      setActivities(data.events || []);
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setRefreshLoading(false);
    }
  }, [selectedToken, chainId]);

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
    <Box 
      bg="white" 
    
      shadow="sm"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      padding={1}
      
    >
      <Box p={3} pb={3}>
        <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }}
          gap={3}
        >
          <StatsCard
            title="Total Value"
            value={formatValue(totalSupplyValue)}
            icon={<Activity size={14} />}
            color={selectedTokenColor}
            tooltip="Total value locked in the network"
            size="sm"
            valueSize="md"
            decimalSize="40%"
          />
          
          <StatsCard
            title="Members"
            value={totalMembers.toString()}
            icon={<Users size={14} />}
            color={selectedTokenColor}
            tooltip="Total unique members across all nodes"
            size="sm"
          />
          
          <StatsCard
            title="Max Depth"
            value={maxDepth.toString()}
            icon={<GitBranch size={14} />}
            color={selectedTokenColor}
            tooltip="Maximum depth of the node tree"
            size="sm"
          />
          
          <StatsCard
            title="Active Signals"
            value={totalSignals.toString()}
            icon={<Signal size={14} />}
            color={selectedTokenColor}
            tooltip="Total active signals in the network"
            size="sm"
          />
          
          <StatsCard
            title="Average Expense"
            value={formatValue(averageExpense.toString())}
            icon={<Wallet size={14} />}
            color="red.500"
            tooltip="Average expense per node in ETH/day"
            size="sm"
            valueSize="md"
            decimalSize="40%"
          />
        </Grid>
      </Box>

      <Flex direction="column" flex="1" overflow="hidden">


        <Box p={1} pt={1}>
          <Box pb={8}>
            <SankeyChart
              nodes={nodes}
              selectedTokenColor={selectedTokenColor}
              onNodeSelect={onNodeSelect}
              nodeValues={nodeValues}
              chainId={chainId}
              selectedToken={selectedToken}
              onCreateNode={() => setShowSpawnModal(true)}
              isProcessing={isProcessing}
              canCreateNode={!!selectedToken && !isProcessing && !!wallets[0]?.address}
              tokenName={tokenSymbol}
            />
          </Box>
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
        isOpen={showSpawnModal}
        onClose={() => setShowSpawnModal(false)}
        showToolbar={false}
      />
    
    </Box>
  );
};

export default RootNodeDetails;