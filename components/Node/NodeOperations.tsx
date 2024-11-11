import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
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
  GitBranch,
  Signal,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { TokenOperationModal } from '../TokenOperations/TokenOperationModal';
import { deployments, ABIs } from '../../config/contracts';

export const NodeOperations: React.FC<{
  nodeId: string;
  chainId: string;
  selectedTokenColor: string;
  onSuccess?: () => void;
}> = ({
  nodeId,
  chainId,
  selectedTokenColor,
  onSuccess
}) => {
  const router = useRouter();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

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

  const handleSpawnNode = useCallback(async () => {
    setIsProcessing(true);
    try {
      const result = await executeTransaction(
        chainId,
        async () => {
          const contract = await getContract();
          return await contract.spawnBranch(nodeId, { gasLimit: 400000 });
        },
        {
          successMessage: 'Node spawned successfully',
          onSuccess: () => {
            router.push(`/nodes/${chainId}/${nodeId}`);
            if (onSuccess) onSuccess();
          }
        }
      );

      if (!result) throw new Error('Transaction failed');

      // Extract new node ID from events if needed
      const receipt = result.receipt;
      if (receipt.logs) {
        const event = receipt.logs.find(log => {
          try {
            return log.topics[0] === ethers.id("BranchSpawned(uint256,uint256,address)");
          } catch {
            return false;
          }
        });
        
        if (event && event.topics[2]) {
          const newNodeId = ethers.getBigInt(event.topics[2]).toString();
          router.push(`/nodes/${chainId}/${newNodeId}`);
        }
      }
    } catch (error: any) {
      console.error('Failed to spawn node:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, getContract, executeTransaction, router, onSuccess]);

  const handleMintMembership = useCallback(async () => {
    try {
      await executeTransaction(
        chainId,
        async () => {
          const contract = await getContract();
          return contract.mintMembership(nodeId, { gasLimit: 200000 });
        },
        {
          successMessage: 'Membership minted successfully',
          onSuccess
        }
      );
    } catch (error: any) {
      console.error('Failed to mint membership:', error);
    }
  }, [chainId, nodeId, getContract, executeTransaction, onSuccess]);

  const handleRedistribute = useCallback(async () => {
    try {
      await executeTransaction(
        chainId,
        async () => {
          const contract = await getContract();
          return contract.redistributePath(nodeId, { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess
        }
      );
    } catch (error: any) {
      console.error('Failed to redistribute:', error);
    }
  }, [chainId, nodeId, getContract, executeTransaction, onSuccess]);

  const handleSignal = useCallback(async () => {
    try {
      await executeTransaction(
        chainId,
        async () => {
          const contract = await getContract();
          return contract.sendSignal(nodeId, [], { gasLimit: 300000 });
        },
        {
          successMessage: 'Signal sent successfully',
          onSuccess
        }
      );
    } catch (error: any) {
      console.error('Failed to send signal:', error);
    }
  }, [chainId, nodeId, getContract, executeTransaction, onSuccess]);

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <ButtonGroup size="sm" spacing={2} flexWrap="wrap">
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
              onClick={() => {
                setCurrentOperation('spawnWithMembrane');
                setIsModalOpen(true);
              }}
            >
              Spawn with Membrane
            </MenuItem>
          </MenuList>
        </Menu>

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
            onClick={handleSignal}
            colorScheme="purple"
            variant="outline"
            isDisabled={isProcessing}
          >
            Signal
          </Button>
        </Tooltip>
      </ButtonGroup>

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

      <TokenOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operation={currentOperation}
        onSubmit={async (params: any) => {
          try {
            await executeTransaction(
              chainId,
              async () => {
                const contract = await getContract();
                switch (currentOperation) {
                  case 'spawnWithMembrane':
                    return contract.spawnBranchWithMembrane(nodeId, params.membraneId, {
                      gasLimit: 600000
                    });
                  default:
                    throw new Error('Unknown operation');
                }
              },
              {
                successMessage: 'Operation completed successfully',
                onSuccess: () => {
                  setIsModalOpen(false);
                  if (onSuccess) onSuccess();
                }
              }
            );
          } catch (error: any) {
            console.error('Operation error:', error);
          }
        }}
        nodeId={nodeId}
        chainId={chainId}
        isLoading={isProcessing}
      />
    </VStack>
  );
};

export default NodeOperations;