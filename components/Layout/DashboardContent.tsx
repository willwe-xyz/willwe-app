import React, { useState, useCallback, useMemo } from 'react';
import { Box, VStack, Text, Spinner, Alert, AlertIcon, useToast } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { NodeState } from '../../types/chainData';
import { useNode } from '../../contexts/NodeContext';
import { useRootNodes } from '../../hooks/useRootNodes';
import NodeList from '../Node/NodeList';
import NodeControls from '../Node/NodeControls';
import StatsCards from '../Node/StatsCards';

interface DashboardContentProps {
  colorState: {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  };
  tokenAddress?: string;
  onRefresh?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  colorState,
  tokenAddress,
  onRefresh
}) => {
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'members'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Hooks
  const { user } = usePrivy();
  const toast = useToast();
  const { selectToken } = useNode();
  
  const chainId = user?.wallet?.chainId?.toString() || '';
  const userAddress = user?.wallet?.address || '';

  // Fetch nodes data
  const { 
    data: nodesData, 
    isLoading, 
    error, 
    refetch 
  } = useRootNodes(chainId, tokenAddress || '', userAddress);

  // Process and filter nodes
  const processedNodes = useMemo(() => {
    // Early return if no data or invalid data
    if (!nodesData || !Array.isArray(nodesData)) return [];

    // Create a mutable copy of the nodes array
    const filteredNodes = [...nodesData].filter((node): node is NodeState => {
      if (!node?.basicInfo?.[0]) return false;
      
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return (
          node.basicInfo[0].toLowerCase().includes(searchLower) ||
          (node.membersOfNode || []).some(addr => 
            addr.toLowerCase().includes(searchLower)
          )
        );
      }
      return true;
    });

    // Sort the mutable copy
    return filteredNodes.sort((a, b) => {
      try {
        if (sortBy === 'value') {
          const aVal = BigInt(a.basicInfo?.[4] || '0');
          const bVal = BigInt(b.basicInfo?.[4] || '0');
          return sortDirection === 'desc' 
            ? Number(bVal - aVal)
            : Number(aVal - bVal);
        } else {
          const aMembers = a.membersOfNode?.length || 0;
          const bMembers = b.membersOfNode?.length || 0;
          return sortDirection === 'desc'
            ? bMembers - aMembers
            : aMembers - bMembers;
        }
      } catch (error) {
        console.error('Sorting error:', error);
        return 0;
      }
    });
  }, [nodesData, searchValue, sortBy, sortDirection]);

  // Calculate stats safely
  const stats = useMemo(() => {
    const defaultStats = {
      totalValue: BigInt(0),
      totalMembers: 0,
      totalSignals: 0,
      avgValue: '0',
      nodeCount: 0
    };

    if (!Array.isArray(processedNodes) || processedNodes.length === 0) {
      return defaultStats;
    }

    try {
      return processedNodes.reduce((acc, node) => {
        if (!node?.basicInfo) return acc;

        const value = BigInt(node.basicInfo[4] || '0');
        const members = node.membersOfNode?.length || 0;
        const signals = node.signals?.length || 0;

        return {
          totalValue: acc.totalValue + value,
          totalMembers: acc.totalMembers + members,
          totalSignals: acc.totalSignals + signals,
          avgValue: ((acc.totalValue + value) / BigInt(acc.nodeCount + 1)).toString(),
          nodeCount: acc.nodeCount + 1
        };
      }, defaultStats);
    } catch (error) {
      console.error('Stats calculation error:', error);
      return defaultStats;
    }
  }, [processedNodes]);

  // Calculate node values safely
  const nodeValues = useMemo(() => {
    const values: Record<string, number> = {};
    
    if (!stats.totalValue || stats.totalValue === BigInt(0)) {
      return values;
    }

    try {
      processedNodes.forEach(node => {
        if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
        const nodeValue = BigInt(node.basicInfo[4]);
        values[node.basicInfo[0]] = Number((nodeValue * BigInt(10000)) / stats.totalValue) / 100;
      });
    } catch (error) {
      console.error('Node values calculation error:', error);
    }

    return values;
  }, [processedNodes, stats.totalValue]);

  // Node spawn handler
  const handleSpawnNode = useCallback(async () => {
    if (!tokenAddress) {
      toast({
        title: "Error",
        description: "No token selected",
        status: "error",
        duration: 3000
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Implement spawn logic here
      await onRefresh?.();
      toast({
        title: "Success",
        description: "New node created successfully",
        status: "success",
        duration: 3000
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [tokenAddress, onRefresh, toast]);

  // Loading state
  if (isLoading) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        status="error" 
        variant="subtle" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        height="400px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <Text mt={4} mb={2} fontSize="lg">
          Error loading data
        </Text>
        <Text color="gray.600">
          {error.message}
        </Text>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="100%" p={6}>
      <NodeControls 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onNewRootNode={handleSpawnNode}
        onSortChange={() => setSortBy(prev => prev === 'value' ? 'members' : 'value')}
        onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        sortBy={sortBy}
        sortDirection={sortDirection}
        selectedTokenColor={colorState.contrastingColor}
        isProcessing={isProcessing}
        buttonHoverBg={`${colorState.contrastingColor}20`}
        searchBorderColor={colorState.contrastingColor}
        searchHoverBorderColor={`${colorState.contrastingColor}60`}
        userAddress={userAddress}
      />

      <StatsCards 
        stats={stats}
        color={colorState.contrastingColor}
      />

      <NodeList
        nodes={processedNodes}
        totalValue={stats.totalValue}
        selectedTokenColor={colorState.contrastingColor}
        onNodeSelect={(nodeId) => {
          // Implement node selection logic
        }}
        onMintMembership={(nodeId) => {
          // Implement mint membership logic
        }}
        onSpawnNode={(nodeId) => {
          // Implement spawn node logic
        }}
        onTrickle={(nodeId) => {
          // Implement trickle logic
        }}
        nodeValues={nodeValues}
        isProcessing={isProcessing}
      />
    </VStack>
  );
};

export default DashboardContent;