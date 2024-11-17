import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  ButtonGroup,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Progress,
  useToast,
  Text,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react';
import {
  GitBranch,
  Shield,
  UserPlus,
  RefreshCw,
  Plus,
  Trash,
  ChevronDown,
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { deployments, ABIs } from '../../config/contracts';
import { nodeIdToAddress } from '../../utils/formatters';

export type NodeOperationsProps = {
  nodeId: string;
  chainId: string;
  selectedTokenColor?: string;
  onSuccess?: () => void;
};

export const NodeOperations = ({
  nodeId,
  chainId,
  selectedTokenColor,
  onSuccess
}: NodeOperationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [membraneId, setMembraneId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [burnAmount, setBurnAmount] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  
  // Fetch node data to check membership
  const { data: nodeData } = useNodeData(chainId, nodeId);
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address);

  const checkAllowance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address) {
        console.warn('Token address or user address not available');
        return;
      }

      const tokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];

      if (!willWeAddress) {
        console.warn('WillWe contract address not available');
        return;
      }

      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      // Get ERC20 token contract
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function allowance(address,address) view returns (uint256)'],
        signer
      );

      const currentAllowance = await tokenContract.allowance(
        user.wallet.address,
        willWeAddress
      );
      
      setAllowance(currentAllowance.toString());
      const allowanceBigInt = BigInt(currentAllowance);
      const requiredAmount = ethers.parseUnits(mintAmount || '0', 18);
      setNeedsApproval(allowanceBigInt < BigInt(requiredAmount));
    } catch (error) {
      console.error('Error checking allowance:', error);
      toast({
        title: 'Error',
        description: 'Failed to check token allowance',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, user?.wallet?.address, mintAmount, getEthersProvider, toast]);

  const handleApprove = useCallback(async () => {
    if (!nodeData?.rootPath?.[0]) {
      toast({
        title: 'Error',
        description: 'Token address not available',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setIsProcessing(true);
    try {
      const tokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address,uint256)'],
        signer
      );

      const tx = await tokenContract.approve(
        deployments.WillWe[chainId.replace('eip155:', '')],
        ethers.MaxUint256
      );
      await tx.wait();
      
      await checkAllowance();
      toast({
        title: 'Success',
        description: 'Approval granted successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeData?.rootPath, getEthersProvider, checkAllowance, toast]);

  const checkNodeBalance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address) {
        console.warn('Token address or user address not available');
        return;
      }

      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      // Use WillWe contract address instead of token address
      const tokenContract = new ethers.Contract(
        contractAddress,
        [
          'function balanceOf(address account, uint256 id) view returns (uint256)'
        ],
        signer
      );

      console.log('Checking ERC1155 balance:', {
        userAddress: user.wallet.address,
        nodeId,
        contractAddress
      });

      const balance = await tokenContract.balanceOf(
        user.wallet.address,
        BigInt(nodeId)
      );
      
      console.log('Node token balance received:', balance.toString());
      setUserBalance(balance.toString());
    } catch (error) {
      console.error('Error checking node balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to check node token balance',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, user?.wallet?.address, nodeId, getEthersProvider, toast]);

  // Operation handlers
  const handleSpawnNode = useCallback(async () => {
    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer
          );
          return contract.spawnBranch(nodeId, { gasLimit: 400000 });
        },
        {
          successMessage: 'Node spawned successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to spawn node:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getEthersProvider, toast, onSuccess]);

  const handleSpawnWithMembrane = useCallback(async () => {
    if (!membraneId) {
      toast({
        title: 'Error',
        description: 'Please enter a membrane ID',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer
          );
          return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
        },
        {
          successMessage: 'Node spawned with membrane successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to spawn node with membrane:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, membraneId, executeTransaction, getEthersProvider, toast, onSuccess]);

  const handleMintMembership = useCallback(async () => {
    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async (contract) => contract.mintMembership(nodeId),
        {
          successMessage: 'Membership minted successfully',
          onSuccess
        }
      );
    } catch (error) {
      console.error('Failed to mint membership:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, toast, onSuccess]);

  const handleRedistribute = useCallback(async () => {
    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer
          );
          return contract.redistributePath(nodeId, { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getEthersProvider, toast, onSuccess]);

  const handleMintPath = useCallback(async () => {
    if (!mintAmount) return;
    
    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer
          );
          return contract.mintPath(nodeId, ethers.parseUnits(mintAmount, 18), { gasLimit: 500000 });
        },
        {
          successMessage: 'Tokens minted successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, toast, onSuccess]);

  const handleBurnPath = useCallback(async () => {
    if (!burnAmount) return;
    
    setIsProcessing(true);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            [
              'function burnPath(uint256 target_, uint256 amount) external'
            ],
            signer
          );
          
          const nodeIdBigInt = BigInt(nodeId);
          const amountToBurn = ethers.parseUnits(burnAmount || '0', 18);
          return contract.burnPath(nodeIdBigInt, amountToBurn);
        },
        {
          successMessage: 'Path burned successfully',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          },
          gasLimit: 300000
        }
      );
    } catch (error) {
      console.error('Failed to burn path:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, toast, onSuccess]);

  return (
    <>
      <ButtonGroup size="sm" spacing={2} flexWrap="wrap">
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
          >
            Actions
          </MenuButton>
          <MenuList>
            <MenuItem icon={<GitBranch size={16} />} onClick={() => setActiveModal('spawn')}>
              Spawn Node
            </MenuItem>
            <MenuItem icon={<Shield size={16} />} onClick={() => setActiveModal('membrane')}>
              Spawn with Membrane
            </MenuItem>
            <MenuItem 
              icon={<UserPlus size={16} />} 
              onClick={handleMintMembership}
              isDisabled={isMember}
            >
              Mint Membership
            </MenuItem>
            <MenuItem icon={<RefreshCw size={16} />} onClick={handleRedistribute}>
              Redistribute
            </MenuItem>
            <MenuItem icon={<Plus size={16} />} onClick={() => setActiveModal('mint')}>
              Mint Path
            </MenuItem>
            <MenuItem 
              icon={<Trash size={16} />} 
              onClick={() => {
                setActiveModal('burn');
                checkNodeBalance();
              }}
            >
              Burn Path
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>

      {/* Spawn Node Modal */}
      <Modal isOpen={activeModal === 'spawn'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Spawn New Node</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Text>This will create a new sub-node under the current node.</Text>
              </Alert>
              
              <Button
                colorScheme="purple"
                onClick={handleSpawnNode}
                isLoading={isProcessing}
                width="100%"
              >
                Spawn Node
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Membrane Modal */}
      <Modal isOpen={activeModal === 'membrane'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Spawn Node with Membrane</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Membrane ID</FormLabel>
                <Input
                  value={membraneId}
                  onChange={(e) => setMembraneId(e.target.value)}
                  placeholder="Enter membrane ID"
                  type="number"
                />
              </FormControl>

              {isProcessing && (
                <Progress size="xs" isIndeterminate colorScheme="purple" />
              )}

              <Button
                colorScheme="purple"
                onClick={handleSpawnWithMembrane}
                isLoading={isProcessing}
                width="100%"
                isDisabled={!membraneId}
              >
                Create Node with Membrane
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Mint Path Modal */}
      <Modal isOpen={activeModal === 'mint'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mint Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  value={mintAmount}
                  onChange={(e) => {
                    setMintAmount(e.target.value);
                    checkAllowance();
                  }}
                  placeholder="Enter amount to mint"
                  type="number"
                />
              </FormControl>

              {mintAmount && (
                <Alert status={needsApproval ? "warning" : "success"}>
                  <AlertIcon />
                  <Text>
                    {needsApproval 
                      ? "Approval required before minting" 
                      : "Ready to mint"}
                  </Text>
                </Alert>
              )}

              {needsApproval ? (
                <Button
                  colorScheme="blue"
                  onClick={handleApprove}
                  isLoading={isProcessing}
                  width="100%"
                >
                  Approve Tokens
                </Button>
              ) : (
                <Button
                  colorScheme="purple"
                  onClick={handleMintPath}
                  isLoading={isProcessing}
                  width="100%"
                  isDisabled={!mintAmount}
                >
                  Mint Tokens
                </Button>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Burn Path Modal */}
      <Modal isOpen={activeModal === 'burn'} onClose={() => setActiveModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Burn Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  value={burnAmount}
                  onChange={(e) => {
                    setBurnAmount(e.target.value);
                    checkNodeBalance();
                  }}
                  placeholder="Enter amount to burn"
                  type="number"
                />
              </FormControl>

              {burnAmount && (
                <Alert 
                  status={
                    BigInt(ethers.parseUnits(burnAmount || '0', 18)) <= BigInt(userBalance)
                      ? "success" 
                      : "error"
                  }
                >
                  <AlertIcon />
                  <Text>
                    {BigInt(ethers.parseUnits(burnAmount || '0', 18)) <= BigInt(userBalance)
                      ? "Ready to burn"
                      : "Insufficient balance"
                    }
                  </Text>
                </Alert>
              )}

              <Button
                colorScheme="purple"
                onClick={handleBurnPath}
                isLoading={isProcessing}
                width="100%"
                isDisabled={!burnAmount}
              >
                Burn Tokens
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NodeOperations;