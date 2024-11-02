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
  Check,
  AlertTriangle,
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

interface TransactionLog {
  operation: string;
  hash?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
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
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);

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

  // Transaction handler with fixed confirmation pattern
  const executeTransaction = useCallback(async (
    contract: ethers.Contract,
    methodName: string,
    args: any[],
    options: any = {}
  ) => {
    // Execute transaction and get response
    const response = await contract[methodName](...args, options);
    const hash = response.hash;
    
    // Get transaction object
    const tx = await response.getTransaction();
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    return { hash, receipt };
  }, []);

  // Generic operation handler
  const handleOperation = useCallback(async (
    operationName: string,
    operation: () => Promise<{ hash: string; receipt: any }>
  ) => {
    const log: TransactionLog = {
      operation: operationName,
      status: 'pending'
    };

    setIsProcessing(true);
    setTransactionLogs(prev => [...prev, log]);

    try {
      const { hash, receipt } = await operation();
      log.hash = hash;

      if (receipt && receipt.status === 1) {
        log.status = 'success';
        setTransactionLogs(prev => [...prev, log]);
        
        toast({
          title: "Success",
          description: `${operationName} completed successfully`,
          status: "success",
          duration: 5000,
          icon: <Check size={16} />,
        });

        onSuccess?.();
        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error(`${operationName} error:`, error);
      log.status = 'error';
      log.error = error instanceof Error ? error.message : 'Transaction failed';
      setTransactionLogs(prev => [...prev, log]);

      toast({
        title: `${operationName} Failed`,
        description: log.error,
        status: "error",
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast, onSuccess]);

  // Operation handlers
  const handleSpawn = useCallback(async () => {
    const contract = await getContract();
    return handleOperation('Spawn Node', async () => {
      return executeTransaction(
        contract,
        'spawnBranch',
        [nodeId],
        { gasLimit: 400000 }
      );
    });
  }, [nodeId, getContract, handleOperation, executeTransaction]);

  const handleMintMembership = useCallback(async () => {
    const contract = await getContract();
    return handleOperation('Mint Membership', async () => {
      return executeTransaction(
        contract,
        'mintMembership',
        [nodeId],
        { gasLimit: 200000 }
      );
    });
  }, [nodeId, getContract, handleOperation, executeTransaction]);

  const handleRedistribute = useCallback(async () => {
    const contract = await getContract();
    return handleOperation('Redistribute', async () => {
      return executeTransaction(
        contract,
        'redistributePath',
        [nodeId],
        { gasLimit: 500000 }
      );
    });
  }, [nodeId, getContract, handleOperation, executeTransaction]);

  const handleSignal = useCallback(async (signals: number[] = []) => {
    const contract = await getContract();
    return handleOperation('Send Signal', async () => {
      return executeTransaction(
        contract,
        'sendSignal',
        [nodeId, signals],
        { gasLimit: 300000 }
      );
    });
  }, [nodeId, getContract, handleOperation, executeTransaction]);

  const handleOperationSubmit = useCallback(async (params: any) => {
    const contract = await getContract();

    try {
      let success = false;
      
      switch (currentOperation) {
        case 'mint':
          success = await handleOperation('Mint Tokens', async () => {
            return executeTransaction(
              contract,
              'mint',
              [nodeId, ethers.parseUnits(params.amount, 18)],
              { gasLimit: 300000 }
            );
          });
          break;

        case 'burn':
          success = await handleOperation('Burn Tokens', async () => {
            return executeTransaction(
              contract,
              'burn',
              [nodeId, ethers.parseUnits(params.amount, 18)],
              { gasLimit: 300000 }
            );
          });
          break;

        case 'mintPath':
          success = await handleOperation('Mint Path', async () => {
            return executeTransaction(
              contract,
              'mintPath',
              [params.targetNodeId, ethers.parseUnits(params.amount, 18)],
              { gasLimit: 400000 }
            );
          });
          break;

        case 'burnPath':
          success = await handleOperation('Burn Path', async () => {
            return executeTransaction(
              contract,
              'burnPath',
              [params.targetNodeId, ethers.parseUnits(params.amount, 18)],
              { gasLimit: 400000 }
            );
          });
          break;

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
        icon: <AlertTriangle size={16} />,
      });
    }
  }, [currentOperation, nodeId, getContract, handleOperation, executeTransaction, toast]);

  // Calculate stats
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
              isDisabled={isProcessing}
            >
              Mint Tokens
            </MenuItem>
            <MenuItem
              icon={<Plus size={16} />}
              onClick={() => {
                setCurrentOperation('mintPath');
                setIsModalOpen(true);
              }}
              isDisabled={isProcessing}
            >
              Mint Along Path
            </MenuItem>
            <Divider />
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => {
                setCurrentOperation('burn');
                setIsModalOpen(true);
              }}
              isDisabled={isProcessing}
            >
              Burn Tokens
            </MenuItem>
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => {
                setCurrentOperation('burnPath');
                setIsModalOpen(true);
              }}
              isDisabled={isProcessing}
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
            isDisabled={isProcessing}
          >
            Node
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<GitBranch size={16} />}
              onClick={handleSpawn}
              isDisabled={isProcessing}
            >
              Spawn Sub-Node
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
              <Text fontSize="sm" fontWeight="medium">
                Value:
              </Text>
            </HStack>
            <Text fontSize="sm">
              {nodeStats.value}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <HStack>
              <Users size={16} color={selectedTokenColor} />
              <Text fontSize="sm" fontWeight="medium">
                Members:
              </Text>
            </HStack>
            <Text fontSize="sm">
              {nodeStats.memberCount}
            </Text>
          </HStack>

          {nodeStats.hasSignals && (
            <Box>
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Signal size={16} color={selectedTokenColor} />
                  <Text fontSize="sm" fontWeight="medium">
                    Active Signals:
                  </Text>
                </HStack>
                <Text fontSize="sm">
                  {nodeStats.signalCount}
                </Text>
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