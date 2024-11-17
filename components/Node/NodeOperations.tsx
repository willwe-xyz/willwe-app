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
  useDisclosure,
} from '@chakra-ui/react';
import {
  Plus,
  GitBranch,
  Signal,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Shield,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { TokenOperationModal } from '../TokenOperations/TokenOperationModal';
import { deployments, ABIs } from '../../config/contracts';

interface NodeOperationsProps {
  nodeId: string;
  chainId: string;
  selectedTokenColor: string;
  node?: any;
  onSuccess?: () => void;
}

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  selectedTokenColor,
  node,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');
  const { isOpen: isModalOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();

  const getContract = useCallback(async () => {
    if (!user?.wallet?.address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const provider = await getEthersProvider();
      if (!provider) throw new Error('Provider not available');

      const signer = await provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      const address = deployments.WillWe[cleanChainId];

      if (!address) throw new Error(`No contract deployment found for chain ${chainId}`);
      return new ethers.Contract(address, ABIs.WillWe, signer);
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw error;
    }
  }, [chainId, getEthersProvider, user?.wallet?.address]);

  // Node management operations
  const handleSpawnNode = useCallback(async () => {
    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async () => {
          const contract = await getContract();
          return contract.spawnBranch(nodeId, { gasLimit: 400000 });
        },
        {
          successMessage: 'Node spawned successfully',
          onSuccess
        }
      );
    } catch (error: any) {
      toast({
        title: 'Failed to spawn node',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getContract, toast, onSuccess]);

  // Token operations
  const handleOperation = useCallback((operation: string) => {
    setCurrentOperation(operation);
    onOpen();
  }, [onOpen]);

  const handleModalSubmit = useCallback(async (params: any) => {
    try {
      await executeTransaction(
        chainId,
        async () => {
          const contract = await getContract();
          switch (currentOperation) {
            case 'mint':
              return contract.mint(nodeId, ethers.parseUnits(params.amount, 18), { gasLimit: 300000 });
            case 'mintPath':
              return contract.mintPath(nodeId, ethers.parseUnits(params.amount, 18), { gasLimit: 400000 });
            case 'burn':
              return contract.burn(nodeId, ethers.parseUnits(params.amount, 18), { gasLimit: 300000 });
            case 'burnPath':
              return contract.burnPath(nodeId, ethers.parseUnits(params.amount, 18), { gasLimit: 400000 });
            default:
              throw new Error('Unknown operation');
          }
        },
        {
          successMessage: `${currentOperation} completed successfully`,
          onSuccess: () => {
            onClose();
            if (onSuccess) onSuccess();
          }
        }
      );
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, currentOperation, nodeId, executeTransaction, getContract, onClose, onSuccess, toast]);

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <ButtonGroup size="sm" spacing={2} flexWrap="wrap">
        {/* Node Management Menu */}
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
              onClick={handleSpawnNode}
            >
              Spawn Sub-Node
            </MenuItem>
            <MenuItem
              icon={<Shield size={16} />}
              onClick={() => handleOperation('spawnWithMembrane')}
            >
              Spawn with Membrane
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Token Operations Menu */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Token
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<ArrowUpRight size={16} />}
              onClick={() => handleOperation('mint')}
            >
              Mint
            </MenuItem>
            <MenuItem
              icon={<ArrowUpRight size={16} />}
              onClick={() => handleOperation('mintPath')}
            >
              Mint Path
            </MenuItem>
            <Divider />
            <MenuItem
              icon={<ArrowDownRight size={16} />}
              onClick={() => handleOperation('burn')}
            >
              Burn
            </MenuItem>
            <MenuItem
              icon={<ArrowDownRight size={16} />}
              onClick={() => handleOperation('burnPath')}
            >
              Burn Path
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Quick Action Buttons */}
        <Tooltip label="Mint membership">
          <Button
            leftIcon={<UserPlus size={16} />}
            onClick={() => handleOperation('mintMembership')}
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
            onClick={() => handleOperation('redistribute')}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Redistribute
          </Button>
        </Tooltip>
      </ButtonGroup>

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
          zIndex={1000}
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
        onClose={onClose}
        operation={currentOperation}
        onSubmit={handleModalSubmit}
        nodeId={nodeId}
        chainId={chainId}
        isLoading={isProcessing}
        node={node}
      />
    </VStack>
  );
};

export default NodeOperations;