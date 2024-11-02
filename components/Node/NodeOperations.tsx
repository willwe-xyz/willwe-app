import React, { useState, useCallback } from 'react';
import {
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  useDisclosure,
  Tooltip,
  useToast,
  Box,
  VStack,
  Text,
} from '@chakra-ui/react';
import {
  Plus,
  Minus,
  GitBranch,
  Signal,
  Activity,
  ChevronDown,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { TokenOperationModal } from '../TokenOperations/TokenOperationModal';
import { useNodeOperations } from '../../hooks/useNodeOperations';
import { useNodeData } from '../../hooks/useNodeData';
import { usePrivy } from '@privy-io/react-auth';
import { NodeState } from '../../types/chainData';
import { ethers } from 'ethers';
import { formatBalance } from '../../utils/formatters';

interface NodeOperationsProps {
  nodeId: string;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
  onSuccess?: () => void;
  selectedTokenColor: string;
}

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  onNodeSelect,
  onSuccess,
  selectedTokenColor,
}) => {
  const { user } = usePrivy();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentOperation, setCurrentOperation] = useState<string>('');

  // Fetch node data
  const { 
    data: nodeData, 
    rawData: node,
    isLoading: isNodeLoading,
    refetch: refetchNode,
    value: nodeValue,
    memberCount,
    hasSignals
  } = useNodeData(chainId, nodeId);

  // Get operations and permissions
  const { 
    permissions, 
    transactions, 
    isProcessing 
  } = useNodeOperations(chainId, node, user?.wallet?.address);

  // Operation Handlers
  const handleOperationSelect = useCallback((operation: string) => {
    if (!user?.wallet?.address) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setCurrentOperation(operation);
    onOpen();
  }, [user?.wallet?.address, onOpen, toast]);

  const handleSubmit = async (params: any) => {
    if (!node || !nodeData) {
      toast({
        title: "Error",
        description: "Node data not available",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      switch (currentOperation) {
        case 'mint':
          await transactions.mint(nodeId, params.amount);
          break;

        case 'burn':
          await transactions.burn(nodeId, params.amount);
          break;

        case 'mintPath':
          await transactions.mintPath(params.targetNodeId, params.amount);
          break;

        case 'burnPath':
          await transactions.burnPath(params.targetNodeId, params.amount);
          break;

        case 'spawn':
          await transactions.spawn(nodeId);
          break;

        case 'spawnWithMembrane':
          await transactions.spawnBranchWithMembrane(nodeId, params.membraneId);
          break;

        case 'mintMembership':
          await transactions.mintMembership(nodeId);
          break;

        case 'redistribute':
          await transactions.redistribute(nodeId);
          break;

        case 'signal':
          await transactions.signal(nodeId, params.signals || []);
          break;

        default:
          throw new Error('Unknown operation');
      }

      onClose();
      refetchNode();
      onSuccess?.();

      toast({
        title: "Success",
        description: "Operation completed successfully",
        status: "success",
        duration: 5000,
        icon: <Check size={16} />,
      });
    } catch (error) {
      console.error('Operation error:', error);
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    }
  };

  // Loading state
  if (isNodeLoading) {
    return (
      <Box p={4}>
        <Text>Loading node operations...</Text>
      </Box>
    );
  }

  // No data state
  if (!node || !nodeData) {
    return (
      <Box p={4}>
        <Text color="red.500">Node data unavailable</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Operations Interface */}
      <ButtonGroup size="sm" spacing={2}>
        {/* Value Operations */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
            isDisabled={!permissions.canMint && !permissions.canBurn || isProcessing}
          >
            Value
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<Plus size={16} />}
              onClick={() => handleOperationSelect('mint')}
              isDisabled={!permissions.canMint || isProcessing}
            >
              Mint Tokens
            </MenuItem>
            <MenuItem
              icon={<Plus size={16} />}
              onClick={() => handleOperationSelect('mintPath')}
              isDisabled={!permissions.canMint || isProcessing}
            >
              Mint Along Path
            </MenuItem>
            <Divider />
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => handleOperationSelect('burn')}
              isDisabled={!permissions.canBurn || isProcessing}
            >
              Burn Tokens
            </MenuItem>
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => handleOperationSelect('burnPath')}
              isDisabled={!permissions.canBurn || isProcessing}
            >
              Burn Along Path
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Node Operations */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
            isDisabled={!permissions.canSpawn || isProcessing}
          >
            Node
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<GitBranch size={16} />}
              onClick={() => handleOperationSelect('spawn')}
              isDisabled={!permissions.canSpawn || isProcessing}
            >
              Spawn Sub-Node
            </MenuItem>
            <MenuItem
              icon={<GitBranch size={16} />}
              onClick={() => handleOperationSelect('spawnWithMembrane')}
              isDisabled={!permissions.canSpawn || isProcessing}
            >
              Spawn With Membrane
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Direct Actions */}
        <Tooltip label={permissions.isMember ? "Already a member" : "Mint membership"}>
          <Button
            leftIcon={<UserPlus size={16} />}
            onClick={() => handleOperationSelect('mintMembership')}
            colorScheme="purple"
            variant="outline"
            isDisabled={permissions.isMember || isProcessing}
          >
            Membership
          </Button>
        </Tooltip>

        <Tooltip label={permissions.canRedistribute ? "Redistribute value" : "Must be member to redistribute"}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={() => handleOperationSelect('redistribute')}
            colorScheme="purple"
            variant="outline"
            isDisabled={!permissions.canRedistribute || isProcessing}
          >
            Redistribute
          </Button>
        </Tooltip>

        <Tooltip label={permissions.canSignal ? "Send signal" : "Must be member to signal"}>
          <Button
            leftIcon={<Signal size={16} />}
            onClick={() => handleOperationSelect('signal')}
            colorScheme="purple"
            variant="outline"
            isDisabled={!permissions.canSignal || isProcessing}
          >
            Signal
          </Button>
        </Tooltip>
      </ButtonGroup>

      {/* Node Stats */}
      <Box>
        <VStack spacing={2} align="start">
          <Text fontSize="sm">
            Value: {formatBalance(nodeValue)}
          </Text>
          <Text fontSize="sm">
            Members: {memberCount}
          </Text>
          {hasSignals && (
            <Text fontSize="sm" color={selectedTokenColor}>
              Active Signals Present
            </Text>
          )}
        </VStack>
      </Box>

      {/* Operation Modal */}
      <TokenOperationModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        operation={currentOperation}
        isLoading={isProcessing}
        nodeId={nodeId}
        chainId={chainId}
        node={node}
      />
    </VStack>
  );
};

export default NodeOperations;