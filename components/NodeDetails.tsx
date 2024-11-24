// File: ./components/NodeDetails.tsx

import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  Text,
  useColorModeValue,
  useDisclosure,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { NodeOperations } from './Node/NodeOperations';
import SignalForm from './Node/SignalForm/index';
import NodeInfo from './Node/NodeInfo';
  import { SignalHistory } from './Node/SignalHistory';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
  selectedTokenColor: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  onNodeSelect,
  selectedTokenColor,
}) => {
  // Hooks
  const { user } = usePrivy();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Clean chain ID
  const cleanChainId = chainId?.replace('eip155:', '') || '';

  // Style hooks
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const permissionsBg = useColorModeValue('gray.50', 'gray.900');

  // Fetch node data
  const { data: nodeData, error, isLoading, refetch } = useNodeData(cleanChainId, nodeId);

  // Loading state
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
      </Alert>
    );
  }

  // No data state
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
      overflow="auto"
      maxHeight="calc(100vh - 200px)"
      display="flex"
      flexDirection="column"
    >
      {/* Node Info Section */}
      <Box mb={4}>
        <NodeInfo 
          node={nodeData} 
          chainId={chainId}
          onNodeSelect={onNodeSelect}
        />
      </Box>

      {/* Operations */}
      <Box px={6} pb={4}>
        <NodeOperations
          nodeId={nodeId}
          chainId={chainId}
          selectedTokenColor={selectedTokenColor}
          onSuccess={refetch}
        />
      </Box>

      {/* Signal Configuration */}
      {nodeData?.basicInfo && (
        <SignalForm
          chainId={cleanChainId}
          nodeId={nodeId}
          parentNodeData={nodeData}
          onSuccess={refetch}
        />
      )}

      {/* Signal History */}
      {nodeData.signals.length > 0 && (
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          <SignalHistory 
            signals={nodeData.signals} 
            selectedTokenColor={selectedTokenColor}
          />
        </Box>
      )}

      {/* Permissions */}
      {user?.wallet?.address && (
        <Box p={6} bg={permissionsBg}>
          <Text fontWeight="medium" mb={2}>Permissions</Text>
          <HStack spacing={4} wrap="wrap">
            <Badge colorScheme="green" variant="subtle">Mint</Badge>
            <Badge colorScheme="green" variant="subtle">Burn</Badge>
            <Badge colorScheme="green" variant="subtle">Signal</Badge>
            <Badge colorScheme="green" variant="subtle">Redistribute</Badge>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default NodeDetails;