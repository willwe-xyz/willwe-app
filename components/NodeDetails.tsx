import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { NodeState } from '../types/chainData';
import NodeOperations from './Node/NodeOperations';
import { useNodeData, getNodeValue, getNodeInflation, isNodeMember } from '../hooks/useNodeData';
import { useTransaction } from '../contexts/TransactionContext';
import { formatEther, formatUnits } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { MembersList } from './Node/MembersList';
import { ChildrenList } from './Node/ChildrenList';
import { SignalHistory } from './Node/SignalHistory';
import { formatAddress } from '../utils/formatting';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  selectedTokenColor: string;
  onNodeSelect?: (nodeId: string) => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  selectedTokenColor,
  onNodeSelect
}) => {
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address || '';
  const { isTransacting } = useTransaction();
  const toast = useToast();
  
  const { 
    data: nodeData,
    isLoading,
    error,
    redistribute,
    signal,
    refetch
  } = useNodeData(chainId, nodeId);

  const nodeStats = useMemo(() => {
    if (!nodeData) return null;

    const value = getNodeValue(nodeData);
    const inflation = getNodeInflation(nodeData);
    const memberCount = nodeData.membersOfNode.length;
    const childCount = nodeData.childrenNodes.length;
    const pathDepth = nodeData.rootPath.length;

    return {
      value: formatEther(value),
      inflation: formatUnits(inflation, 9),
      memberCount,
      childCount,
      pathDepth
    };
  }, [nodeData]);

  const isMember = useMemo(() => {
    if (!nodeData || !userAddress) return false;
    return isNodeMember(nodeData, userAddress);
  }, [nodeData, userAddress]);

  const handleRedistribute = async () => {
    try {
      const success = await redistribute();
      if (success) {
        toast({
          title: "Success",
          description: "Value redistributed successfully",
          status: "success",
          duration: 5000,
        });
        refetch();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to redistribute value",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleSignal = async (signals: number[]) => {
    try {
      const success = await signal(signals);
      if (success) {
        toast({
          title: "Success",
          description: "Signal sent successfully",
          status: "success",
          duration: 5000,
        });
        refetch();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send signal",
        status: "error",
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Spinner size="xl" color={selectedTokenColor} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  if (!nodeData) {
    return (
      <Alert status="warning">
        <AlertIcon />
        No node data available
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={selectedTokenColor}>
            Node Details
          </Heading>
          <Badge 
            colorScheme={isMember ? "green" : "gray"}
            fontSize="md"
            padding={2}
          >
            {isMember ? "Member" : "Non-Member"}
          </Badge>
        </HStack>
        <Text color="gray.600">ID: {nodeId}</Text>
      </Box>

      <Divider />

      {/* Node Statistics */}
      <Box>
        <Heading size="md" mb={4}>Statistics</Heading>
        <Table variant="simple">
          <Tbody>
            <Tr>
              <Th>Total Value</Th>
              <Td>{nodeStats?.value} ETH</Td>
            </Tr>
            <Tr>
              <Th>Inflation Rate</Th>
              <Td>{nodeStats?.inflation}%</Td>
            </Tr>
            <Tr>
              <Th>Members</Th>
              <Td>{nodeStats?.memberCount}</Td>
            </Tr>
            <Tr>
              <Th>Children</Th>
              <Td>{nodeStats?.childCount}</Td>
            </Tr>
            <Tr>
              <Th>Path Depth</Th>
              <Td>{nodeStats?.pathDepth}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      <Divider />

      {/* Node Operations */}
      <NodeOperations
        nodeId={nodeId}
        chainId={chainId}
        selectedTokenColor={selectedTokenColor}
        onRedistribute={handleRedistribute}
        onSignal={handleSignal}
        isTransacting={isTransacting}
        isMember={isMember}
      />

      <Divider />

      {/* Members List */}
      <MembersList 
        members={nodeData.membersOfNode}
        selectedTokenColor={selectedTokenColor}
      />

      <Divider />

      {/* Children List */}
      <ChildrenList
        children={nodeData.childrenNodes}
        selectedTokenColor={selectedTokenColor}
        onNodeSelect={onNodeSelect}
      />

      <Divider />

      {/* Signal History */}
      <SignalHistory
        signals={nodeData.signals}
        selectedTokenColor={selectedTokenColor}
      />
    </VStack>
  );
};

export default NodeDetails;