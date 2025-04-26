import React, { useState, useCallback, useEffect } from 'react';
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
  Table,
  Tbody,
  Tr,
  Td,
  Box,
  Card,
  CardHeader,
  CardBody,
  Badge,
  HStack,
  Link,
  ToastId,
  IconButton,
  FormHelperText,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';
import {
  GitBranchPlus,
  Shield,
  UserPlus,
  RefreshCw,
  Plus,
  Trash,
  ChevronDown,
  Trash2,
  Info
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { deployments } from '../../config/deployments';
import { ABIs } from '../../config/contracts';
import { nodeIdToAddress } from '../../utils/formatters';
import { formatBalance } from '../../utils/formatters';
import  SpawnNodeForm  from './SpawnNodeForm';

type ModalType = 'spawn' | 'membrane' | 'mint' | 'burn' | null;


interface TokenRequirement {
  tokenAddress: string;
  requiredBalance: string;
}

interface SpawnFormData {
  name: string;
  characteristics: { title: string; link: string }[];
  tokenRequirements: TokenRequirement[];
  inflation: number;
}

interface MembraneMetadata {
  name: string;
  description?: string;
  characteristics: string[];
}

interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export type NodeOperationsProps = {
  nodeId: string;
  chainId: string;
  selectedTokenColor?: string;
  userAddress?: string;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  showToolbar?: boolean;
};

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  selectedTokenColor,
  userAddress,
  onSuccess,
  isOpen = false,
  onClose,
  showToolbar = true
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [membraneId, setMembraneId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [burnAmount, setBurnAmount] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [useDirectParentMint, setUseDirectParentMint] = useState(false);
  const [useDirectParentBurn, setUseDirectParentBurn] = useState(false);
  const [formData, setFormData] = useState<SpawnFormData>({
    name: '',
    characteristics: [],
    tokenRequirements: [],
    inflation: 0
  });

  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const { data: nodeData } = useNodeData(chainId, userAddress, nodeId);
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address || '');

  useEffect(() => {
    // If isOpen prop changes to true, set activeModal to 'spawn'
    if (isOpen) {
      setActiveModal('spawn');
    }
  }, [isOpen]);

  const handleClose = () => {
    setActiveModal(null);
    if (onClose) onClose();
  };

  // Effect to handle initialTab prop changes
  useEffect(() => {
    setActiveModal(null);
  }, []);

  // Reset states when modal closes
  useEffect(() => {
    if (!activeModal) {
      setMintAmount('');
      setBurnAmount('');
      setNeedsApproval(false);
      setAllowance('0');
      setUseDirectParentMint(false);
      setUseDirectParentBurn(false);
    }
  }, [activeModal]);

  const checkAllowance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address || !mintAmount) {
        console.warn('Required data not available');
        return;
      }
  
      const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
  
      if (!willWeAddress) {
        console.warn('WillWe contract address not available');
        return;
      }
  
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
  
      const tokenContract = new ethers.Contract(
        rootTokenAddress,
        [
          'function allowance(address,address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        signer as unknown as ethers.ContractRunner
      );
  
      const [currentAllowance, decimals] = await Promise.all([
        tokenContract.allowance(user.wallet.address, willWeAddress),
        tokenContract.decimals()
      ]);

      // Convert amount to BigInt with proper decimals
      const requiredAmount = ethers.parseUnits(mintAmount, decimals);
      
      // Store both values
      setAllowance(currentAllowance.toString());
      
      // Strict BigInt comparison
      setNeedsApproval(currentAllowance < requiredAmount);

      console.log('Allowance check:', {
        currentAllowance: currentAllowance.toString(),
        requiredAmount: requiredAmount.toString(),
        needsApproval: currentAllowance < requiredAmount
      });

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
    if (!nodeData?.rootPath?.[0] || isProcessing || !mintAmount) {
      return;
    }
  
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
  
      const tokenContract = new ethers.Contract(
        rootTokenAddress,
        ['function approve(address,uint256) returns (bool)'],
        //@ts-ignore
        signer
      );
  
      await executeTransaction(
        chainId,
        async () => {
          const tx = await tokenContract.approve(
            willWeAddress,
            ethers.parseUnits(mintAmount, 18)
          );
          return tx;
        },
        {
          successMessage: 'Token approval granted successfully',
          errorMessage: 'Failed to approve token spending',
          onSuccess: async () => {
            await checkAllowance();
            setNeedsApproval(false);
          }
        }
      );
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, mintAmount, getEthersProvider, checkAllowance, isProcessing, executeTransaction, toast]);

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
      
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address account, uint256 id) view returns (uint256)'],
        //@ts-ignore
        signer
      );
  
      const balance = await contract.balanceOf(
        user.wallet.address,
        BigInt(nodeId)
      );
      
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

  // Continue to Part 3 for handler functions

  const handleMintPath = useCallback(async () => {
    if (!mintAmount || isProcessing) return;
    
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
            // @ts-ignore
            signer
          );
          
          return await contract.mintPath(nodeId, ethers.parseUnits(mintAmount, 18), {
            gasLimit: BigInt(500000)
          });
        },
        {
          successMessage: 'Tokens minted successfully via path',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to mint tokens via path:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleMint = useCallback(async () => {
    if (!mintAmount || isProcessing) return;
    
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
            // @ts-ignore
            signer
          );
          
          return await contract.mint(nodeId, ethers.parseUnits(mintAmount, 18), {
            gasLimit: BigInt(300000)
          });
        },
        {
          successMessage: 'Tokens minted successfully from parent',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to mint tokens from parent:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleBurnPath = useCallback(async () => {
    if (!burnAmount || isProcessing) return;
    
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
            // @ts-ignore
            signer
          );
          
          const amountToBurn = ethers.parseUnits(burnAmount, 18);
          return contract.burnPath(nodeId, amountToBurn);
        },
        {
          successMessage: 'Tokens burned successfully via path',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          } 
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens via path:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleBurn = useCallback(async () => {
    if (!burnAmount || isProcessing) return;
    
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
            /// @ts-ignore
            signer
          );
          
          const amountToBurn = ethers.parseUnits(burnAmount, 18);
          return contract.burn(nodeId, amountToBurn);
        },
        {
          successMessage: 'Tokens burned successfully to parent',
          onSuccess: () => {
            setActiveModal(null);
            onSuccess?.();
          } 
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens to parent:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleMintMembership = useCallback(async () => {
    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            /// @ts-ignore
            signer
          );
          return contract.mintMembership(nodeId);
        },
        {
          successMessage: 'Membership minted successfully',
          onSuccess
        }
      );
    } catch (error) {
      console.error('Failed to mint membership:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint membership',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getEthersProvider, onSuccess, toast]);

  const handleRedistribute = useCallback(async () => {
    if (isProcessing) return;
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
            // @ts-ignore
            signer
          );
  
          return contract.redistributePath(nodeId, { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess: () => {
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  // Mint Modal Content
  const renderMintModalContent = () => (
    <VStack spacing={4}>
      <HStack width="100%" justify="space-between" align="center" pb={2}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="mint-from-parent" mb="0">
            Mint from Parent
          </FormLabel>
          <Switch 
            id="mint-from-parent"
            isChecked={useDirectParentMint}
            onChange={(e) => setUseDirectParentMint(e.target.checked)}
            colorScheme="purple"
          />
        </FormControl>
      </HStack>
      
      <FormControl isRequired>
        <FormLabel>Amount</FormLabel>
        <HStack width="100%" spacing={4}>
          <Slider
            value={parseFloat(mintAmount) || 0}
            onChange={(value) => {
              const newAmount = value.toFixed(4);
              setMintAmount(newAmount);
              // Skip allowance check if amount is empty or 0
              if (!newAmount || parseFloat(newAmount) === 0) {
                setNeedsApproval(false);
                return;
              }
              checkAllowance();
            }}
            min={0}
            max={parseFloat(formatBalance(userBalance))}
            step={0.01}
            colorScheme="purple"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Button
            size="sm"
            onClick={() => {
              const maxBalance = formatBalance(userBalance);
              setMintAmount(maxBalance);
              checkAllowance();
            }}
            colorScheme="purple"
            variant="outline"
          >
            Max
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
          {parseFloat(mintAmount || '0').toFixed(4)}
        </Text>
        <FormHelperText>
          {useDirectParentMint 
            ? "Mints tokens directly from parent node's reserve"
            : "Mints tokens through the entire path from root"
          }
        </FormHelperText>
      </FormControl>

      {mintAmount && parseFloat(mintAmount) > 0 && (
        <Alert status={needsApproval ? "warning" : "success"}>
          <AlertIcon />
          <VStack align="start" spacing={1} width="100%">
            <Text>
              {needsApproval 
                ? "Approval required before minting" 
                : "Ready to mint"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Current allowance: {ethers.formatUnits(allowance || '0', 18)}
              {needsApproval && ` (Need: ${mintAmount})`}
            </Text>
          </VStack>
        </Alert>
      )}

      {needsApproval ? (
        <Button
          onClick={handleApprove}
          isLoading={isProcessing}
          width="100%"
          bg={selectedTokenColor}
          color="white"
          _hover={{ bg: `${selectedTokenColor}90` }}
        >
          Approve Tokens
        </Button>
      ) : (
        <Button
          onClick={() => useDirectParentMint ? handleMint() : handleMintPath()}
          isLoading={isProcessing}
          width="100%"
          isDisabled={!mintAmount || parseFloat(mintAmount) === 0}
          bg={selectedTokenColor}
          color="white"
          _hover={{ bg: `${selectedTokenColor}90` }}
        >
          {useDirectParentMint ? 'Mint from Parent' : 'Mint Path'}
        </Button>
      )}
    </VStack>
  );

  // Burn Modal Content
  const renderBurnModalContent = () => (
    <VStack spacing={4}>
      <HStack width="100%" justify="space-between" align="center" pb={2}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="burn-to-parent" mb="0">
            Burn to Parent
          </FormLabel>
          <Switch 
            id="burn-to-parent"
            isChecked={useDirectParentBurn}
            onChange={(e) => setUseDirectParentBurn(e.target.checked)}
            colorScheme="purple"
          />
        </FormControl>
      </HStack>

      <FormControl isRequired>
        <FormLabel>Amount</FormLabel>
        <HStack width="100%" spacing={4}>
          <Slider
            value={parseFloat(burnAmount) || 0}
            onChange={(value) => {
              const newAmount = value.toFixed(4);
              setBurnAmount(newAmount);
              checkNodeBalance();
            }}
            min={0}
            max={parseFloat(formatBalance(userBalance))}
            step={0.01}
            colorScheme="purple"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Button
            size="sm"
            onClick={() => {
              const maxBalance = formatBalance(userBalance);
              setBurnAmount(maxBalance);
              checkNodeBalance();
            }}
            colorScheme="purple"
            variant="outline"
          >
            Max
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
          {parseFloat(burnAmount || '0').toFixed(4)}
        </Text>
        <FormHelperText>
          {useDirectParentBurn 
            ? "Burns tokens directly to parent node"
            : "Burns tokens through the entire path to root"
          }
        </FormHelperText>
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
        onClick={() => useDirectParentBurn ? handleBurn() : handleBurnPath()}
        isLoading={isProcessing}
        width="100%"
        isDisabled={!burnAmount}
        bg={selectedTokenColor}
        color="white"
        _hover={{ bg: `${selectedTokenColor}90` }}
      >
        {useDirectParentBurn ? 'Burn to Parent' : 'Burn Path'}
      </Button>
    </VStack>
  );

  return (
    <>
      {showToolbar && (
        <Box 
          display="flex" 
          justifyContent="flex-end" 
          mb={4} 
          px={6}
          borderBottom="1px solid"
          borderColor="gray.200"
          py={4}
          bg="gray.50"
        >
          <ButtonGroup 
            size="sm" 
            spacing={3} 
            display="flex" 
            flexWrap="wrap" 
            gap={2}
          >
            <Tooltip label="Mint membership">
              <Button
                leftIcon={<UserPlus size={16} color={selectedTokenColor} />}
                onClick={handleMintMembership}
                isDisabled={isMember}
                colorScheme="purple"
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{ bg: `${selectedTokenColor}20` }}
              >
                Join
              </Button>
            </Tooltip>

            <Tooltip label="Create new node">
              <Button
                leftIcon={<GitBranchPlus size={16} color={selectedTokenColor} />}
                onClick={() => setActiveModal('spawn')}
                colorScheme="purple"
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{ bg: `${selectedTokenColor}20` }}
              >
                Spawn Node
              </Button>
            </Tooltip>

            <Tooltip label="Redistribute value">
              <Button
                leftIcon={<RefreshCw size={16} color={selectedTokenColor} />}
                onClick={handleRedistribute}
                colorScheme="purple"
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{ bg: `${selectedTokenColor}20` }}
              >
                Redistribute
              </Button>
            </Tooltip>

            <Tooltip label="Mint tokens">
              <Button
                leftIcon={<Plus size={16} color={selectedTokenColor} />}
                onClick={() => setActiveModal('mint')}
                colorScheme="purple"
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{ bg: `${selectedTokenColor}20` }}
              >
                Mint
              </Button>
            </Tooltip>

            <Tooltip label="Burn tokens">
              <Button
                leftIcon={<Trash size={16} color={selectedTokenColor} />}
                onClick={() => {
                  setActiveModal('burn');
                  checkNodeBalance();
                }}
                colorScheme="purple"
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{ bg: `${selectedTokenColor}20` }}
              >
                Burn
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
      )}

      {/* Spawn Node Modal */}
      <Modal 
        isOpen={activeModal === 'spawn'} 
        onClose={handleClose}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4} bg="white" shadow="xl" borderRadius="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            Create New Node
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SpawnNodeForm
              nodeId={nodeId}
              chainId={chainId}
              onSuccess={onSuccess}
              onClose={handleClose}
              selectedTokenColor={selectedTokenColor}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Mint Modal */}
      <Modal 
        isOpen={activeModal === 'mint'} 
        onClose={handleClose}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4} bg="white" shadow="xl" borderRadius="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            Mint Tokens
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderMintModalContent()}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Burn Modal */}
      <Modal 
        isOpen={activeModal === 'burn'} 
        onClose={handleClose}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4} bg="white" shadow="xl" borderRadius="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200">
            Burn Tokens
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderBurnModalContent()}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NodeOperations;
