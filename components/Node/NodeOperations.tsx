import React, { useState, useCallback } from 'react';
import {
  ButtonGroup,
  Button,
  useToast,
  VStack,
  Text,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Tooltip,
  HStack,
  Progress,
} from '@chakra-ui/react';
import {
  Plus,
  Minus,
  GitBranch,
  Signal,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Shield,
  Activity,
  Users,
} from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { TokenOperationModal } from '../TokenOperations/TokenOperationModal';
import { deployments, ABIs } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import { formatBalance } from '../../utils/formatters';

interface NodeOperationsProps {
  nodeId: string;
  chainId: string;
  node: NodeState;
  selectedTokenColor: string;
  onNodeSelect?: (nodeId: string) => void;
  onSuccess?: () => void;
}

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  node,
  selectedTokenColor,
  onNodeSelect,
  onSuccess
}) => {
  const { user, getEthersProvider } = usePrivy();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Contract interaction helper
  const getContract = useCallback(async () => {
    if (!user?.wallet?.address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];

      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${chainId}`);
      }

      return new ethers.Contract(contractAddress, ABIs.WillWe, signer);
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw new Error('Failed to initialize contract');
    }
  }, [chainId, getEthersProvider, user?.wallet?.address]);

  // Generic operation handler
  const handleOperation = useCallback(async (
    operationName: string,
    operation: () => Promise<any>
  ) => {
    if (!user?.wallet?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await operation();
      
      toast({
        title: "Success",
        description: `${operationName} completed successfully`,
        status: "success",
        duration: 5000,
      });

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (error: any) {
      console.error(`${operationName} error:`, error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user?.wallet?.address, toast, onSuccess]);

  // Node operations
  const handleSpawn = useCallback(async () => {
    return handleOperation('Spawn Node', async () => {
      const contract = await getContract();
      const tx = await contract.spawnBranch(nodeId, { gasLimit: 400000 });
      await tx.wait();
    });
  }, [nodeId, getContract, handleOperation]);

  const handleSpawnWithMembrane = useCallback(() => {
    setCurrentOperation('spawnWithMembrane');
    setIsModalOpen(true);
  }, []);

  const handleMintMembership = useCallback(async () => {
    return handleOperation('Mint Membership', async () => {
      const contract = await getContract();
      const tx = await contract.mintMembership(nodeId, { gasLimit: 200000 });
      await tx.wait();
    });
  }, [nodeId, getContract, handleOperation]);

  const handleRedistribute = useCallback(async () => {
    return handleOperation('Redistribute', async () => {
      const contract = await getContract();
      const tx = await contract.redistributePath(nodeId, { gasLimit: 500000 });
      await tx.wait();
    });
  }, [nodeId, getContract, handleOperation]);

  const handleSignal = useCallback(async (signals: number[] = []) => {
    return handleOperation('Send Signal', async () => {
      const contract = await getContract();
      const tx = await contract.sendSignal(nodeId, signals, { gasLimit: 300000 });
      await tx.wait();
    });
  }, [nodeId, getContract, handleOperation]);

  // Modal operation handler
  const handleOperationSubmit = useCallback(async (params: any) => {
    const contract = await getContract();

    try {
      let success = false;
      
      switch (currentOperation) {
        case 'spawnWithMembrane':
          success = await handleOperation('Spawn With Membrane', async () => {
            const tx = await contract.spawnBranchWithMembrane(nodeId, params.membraneId, { gasLimit: 600000 });
            await tx.wait();
          });
          break;

        case 'mint':
          success = await handleOperation('Mint Tokens', async () => {
            const parsedAmount = ethers.parseUnits(params.amount, 18);
            const tx = await contract.mint(nodeId, parsedAmount, { gasLimit: 300000 });
            await tx.wait();
          });
          break;

        case 'burn':
          success = await handleOperation('Burn Tokens', async () => {
            const parsedAmount = ethers.parseUnits(params.amount, 18);
            const tx = await contract.burn(nodeId, parsedAmount, { gasLimit: 300000 });
            await tx.wait();
          });
          break;

        // ... other operations ...

        default:
          throw new Error('Unknown operation');
      }

      if (success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Operation error:', error);
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        status: "error",
        duration: 5000,
      });
    }
  }, [currentOperation, nodeId, getContract, handleOperation, toast]);

  // Stats for display
  const nodeStats = {
    value: formatBalance(node?.basicInfo?.[4] || '0'),
    memberCount: node?.membersOfNode?.length || 0,
    hasSignals: (node?.signals?.length || 0) > 0,
    signalCount: node?.signals?.length || 0
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      {/* Operation Buttons */}
      <ButtonGroup size="sm" spacing={2} flexWrap="wrap">
        {/* Value Operations */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Value
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<Plus size={16} />}
              onClick={() => {
                setCurrentOperation('mint');
                setIsModalOpen(true);
              }}
            >
              Mint Tokens
            </MenuItem>
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => {
                setCurrentOperation('burn');
                setIsModalOpen(true);
              }}
            >
              Burn Tokens
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
            isDisabled={isProcessing}
          >
            Node
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<GitBranch size={16} />}
              onClick={handleSpawn}
            >
              Spawn Sub-Node
            </MenuItem>
            <MenuItem
              icon={<Shield size={16} />}
              onClick={handleSpawnWithMembrane}
            >
              Spawn with Membrane
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Direct Actions */}
        <Tooltip label="Mint membership">
          <Button
            leftIcon={<UserPlus size={16} />}
            onClick={handleMintMembership}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Membership
          </Button>
        </Tooltip>

        <Tooltip label="Redistribute value">
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRedistribute}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Redistribute
          </Button>
        </Tooltip>

        <Tooltip label="Send signal">
          <Button
            leftIcon={<Signal size={16} />}
            onClick={() => handleSignal([])}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Signal
          </Button>
        </Tooltip>
      </ButtonGroup>

      {/* Node Stats */}
      <Box 
        p={4} 
        bg={`${selectedTokenColor}10`}
        borderRadius="md"
        border="1px solid"
        borderColor={`${selectedTokenColor}20`}
      >
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <HStack>
              <Activity size={16} color={selectedTokenColor} />
              <Text fontSize="sm" fontWeight="medium">Value:</Text>
            </HStack>
            <Text fontSize="sm">{nodeStats.value}</Text>
          </HStack>

          <HStack justify="space-between">
            <HStack>
              <Users size={16} color={selectedTokenColor} />
              <Text fontSize="sm" fontWeight="medium">Members:</Text>
            </HStack>
            <Text fontSize="sm">{nodeStats.memberCount}</Text>
          </HStack>

          {nodeStats.hasSignals && (
            <Box>
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Signal size={16} color={selectedTokenColor} />
                  <Text fontSize="sm" fontWeight="medium">Active Signals:</Text>
                </HStack>
                <Text fontSize="sm">{nodeStats.signalCount}</Text>
              </HStack>
              <Progress 
                size="xs" 
                value={nodeStats.signalCount * 10} 
                colorScheme="purple" 
                borderRadius="full"
              />
            </Box>
          )}
        </VStack>
      </Box>

      {/* Processing Indicator */}
      {isProcessing && (
        <Box 
          position="fixed" 
          bottom={4} 
          right={4} 
          bg="white" 
          p={4} 
          borderRadius="md" 
          boxShadow="lg"
        >
          <HStack spacing={3}>
            <Progress 
              size="xs" 
              isIndeterminate 
              colorScheme="purple" 
              width="100px"
            />
            <Text fontSize="sm" color="gray.600">
              Processing transaction...
            </Text>
          </HStack>
        </Box>
      )}

      {/* Operation Modal */}
      <TokenOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operation={currentOperation}
        onSubmit={handleOperationSubmit}
        isLoading={isProcessing}
        nodeId={nodeId}
        chainId={chainId}
        node={node}
      />
    </VStack>
  );
};

export default NodeOperations;