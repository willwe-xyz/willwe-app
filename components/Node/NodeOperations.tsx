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
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
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
  Info,
  AlertTriangle,
  Check
} from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { deployments, getChainById } from '../../config/deployments';
import { ABIs } from '../../config/contracts';
import { nodeIdToAddress } from '../../utils/formatters';
import { formatBalance } from '../../utils/formatters';
import SpawnNodeForm from './SpawnNodeForm';

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
  const [rootTokenSymbol, setRootTokenSymbol] = useState('PSC');
  const [formData, setFormData] = useState<SpawnFormData>({
    name: '',
    characteristics: [],
    tokenRequirements: [],
    inflation: 0
  });
  const [burnBalance, setBurnBalance] = useState('0');

  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { wallets } = useWallets();
  const { executeTransaction } = useTransaction();
  const { data: nodeData } = useNodeData(chainId || '', userAddress || '', nodeId);
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address || '');

  // Find supported networks from deployments
  const supportedChainIds = Object.keys(deployments.WillWe);
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const isValidChain = supportedChainIds.includes(cleanChainId);

  // Function to get network name from chain ID
  const getNetworkName = (chainId: string): string => {
    try {
      const chain = getChainById(chainId);
      return chain.name;
    } catch (error) {
      return chainId; // Return chain ID if name not found
    }
  };

  // Function to check and switch network if needed
  const checkAndSwitchNetwork = async () => {
    if (!wallets[0]) return false;
    
    const walletChainId = wallets[0]?.chainId?.replace('eip155:', '');
    
    // If already on the correct network, return true
    if (walletChainId === cleanChainId) return true;
    
    try {
      // If on an unsupported network, switch to the node's network
      if (!supportedChainIds.includes(walletChainId)) {
        await wallets[0].switchChain(Number(cleanChainId));
        toast({
          title: "Network Switched",
          description: `Switched to ${getNetworkName(cleanChainId)}`,
          status: "success",
          duration: 5000,
        });
        return true;
      }
      
      // If on a different supported network, prompt to switch
      toast({
        title: "Network Mismatch",
        description: `Please switch to ${getNetworkName(cleanChainId)} to perform this operation`,
        status: "warning",
        duration: 5000,
      });
      return false;
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        status: "error",
        duration: 5000,
      });
      return false;
    }
  };

  // Wrapper function for operations that require network check
  const withNetworkCheck = async (operation: () => Promise<void>) => {
    if (isProcessing) return;
    
    const isCorrectNetwork = await checkAndSwitchNetwork();
    if (!isCorrectNetwork) {
      // If we're on a different supported network, don't proceed with the operation
      return;
    }
    
    setIsProcessing(true);
    try {
      await operation();
    } finally {
      setIsProcessing(false);
    }
  };

  // Get root token symbol
  const getRootTokenSymbol = useCallback(async () => {
    try {
      const provider = await getEthersProvider();
      let tokenAddress;

      // If we have a direct token address in nodeId, use that first
      if (nodeId && nodeId.startsWith('0x')) {
        tokenAddress = ethers.getAddress(nodeId);
      } else if (nodeData?.rootPath?.[0] && nodeData.rootPath[0] !== '0') {
        // Only use root path if it's not "0"
        const rootNodeId = nodeData.rootPath[0];
        tokenAddress = ethers.getAddress(ethers.toBeHex(rootNodeId, 20));
      } else {
        // If we don't have a valid address, return default
        return 'PSC';
      }
      

      // Verify we have a valid non-zero address
      if (tokenAddress === ethers.ZeroAddress) {
        return 'PSC';
      }

      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function symbol() view returns (string)',
          'function name() view returns (string)'
        ],
        provider as unknown as ethers.ContractRunner
      );

      try {
        // First try to get the symbol
        const symbol = await tokenContract.symbol();
        return symbol || 'PSC';
      } catch (symbolError) {
        try {
          // If symbol fails, try to get the name
          const name = await tokenContract.name();
          // Use first 3-4 characters of name as symbol if name exists
          return name ? name.slice(0, 4).toUpperCase() : 'PSC';
        } catch (nameError) {
          // If both fail, return default
          return 'PSC';
        }
      }
    } catch (error) {
      return 'PSC';
    }
  }, [nodeData?.rootPath, nodeId, getEthersProvider]);

  useEffect(() => {
    getRootTokenSymbol().then(symbol => {
      setRootTokenSymbol(symbol);
    });
  }, [getRootTokenSymbol]);

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
        return;
      }
  
      const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
  
      if (!willWeAddress) {
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

    } catch (error) {
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
        return;
      }
  
      const cleanChainId = chainId.replace('eip155:', '');
      const rootTokenAddress = ethers.getAddress(ethers.toBeHex(nodeData.rootPath[0], 20));
      
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      // Use ERC20 interface for root token balance
      const rootTokenContract = new ethers.Contract(
        rootTokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        //@ts-ignore
        signer
      );
  
      const balance = await rootTokenContract.balanceOf(user.wallet.address);
      
      setUserBalance(balance.toString());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check root token balance',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeData?.rootPath, user?.wallet?.address, getEthersProvider, toast]);

  // Call checkNodeBalance when the modal opens
  useEffect(() => {
    if (activeModal === 'mint') {
      checkNodeBalance();
      checkAllowance();
    }
  }, [activeModal, checkNodeBalance, checkAllowance]);

  // Continue to Part 3 for handler functions

  const handleMintPath = useCallback(async () => {
    if (!mintAmount) return;
    
    await withNetworkCheck(async () => {
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
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to mint tokens',
          status: 'error',
          duration: 5000
        });
      }
    });
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleMint = useCallback(async () => {
    if (!mintAmount) return;
    
    await withNetworkCheck(async () => {
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
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to mint tokens',
          status: 'error',
          duration: 5000
        });
      }
    });
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleBurnPath = useCallback(async () => {
    if (!burnAmount) return;
    
    await withNetworkCheck(async () => {
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
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to burn tokens',
          status: 'error',
          duration: 5000
        });
      }
    });
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleBurn = useCallback(async () => {
    if (!burnAmount) return;
    
    await withNetworkCheck(async () => {
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
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to burn tokens',
          status: 'error',
          duration: 5000
        });
      }
    });
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const handleMintMembership = useCallback(async () => {
    await withNetworkCheck(async () => {
      try {
        // Double check the network before proceeding
        const walletChainId = wallets[0]?.chainId?.replace('eip155:', '');
        if (walletChainId !== cleanChainId) {
          toast({
            title: "Network Error",
            description: `Please switch to ${getNetworkName(cleanChainId)} before joining`,
            status: "error",
            duration: 5000,
          });
          return;
        }

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
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to mint membership',
          status: 'error',
          duration: 5000
        });
      }
    });
  }, [chainId, nodeId, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast, wallets, cleanChainId, getNetworkName]);

  const handleRedistribute = useCallback(async () => {
    await withNetworkCheck(async () => {
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
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Transaction failed',
          status: 'error',
          duration: 5000
        });
      }
    });
  }, [chainId, nodeId, executeTransaction, getEthersProvider, onSuccess, isProcessing, toast]);

  const checkBurnBalance = useCallback(async () => {
    try {
      if (!user?.wallet?.address) {
        return;
      }
  
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        return;
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
      
      setBurnBalance(balance.toString());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check token balance',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, user?.wallet?.address, getEthersProvider, toast]);

  // Call checkBurnBalance when the burn modal opens
  useEffect(() => {
    if (activeModal === 'burn') {
      checkBurnBalance();
    }
  }, [activeModal, checkBurnBalance]);

  // Mint Modal Content
  const renderMintModalContent = () => {
    // Calculate max amount user can mint based on actual token balance
    const maxBalance = parseFloat(formatBalance(userBalance)).toFixed(4);
    const currentAllowance = parseFloat(ethers.formatUnits(allowance || '0', 18)).toFixed(4);
    const hasTokens = parseFloat(maxBalance) > 0;

    return (
    <VStack spacing={6} align="stretch">
      {/* Mint Type Switch */}
      <Box bg="gray.50" p={4} borderRadius="lg">
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel htmlFor="mint-from-parent" mb="0" fontWeight="medium">
            Mint from Parent
          </FormLabel>
          <Switch 
            id="mint-from-parent"
            isChecked={useDirectParentMint}
            onChange={(e) => setUseDirectParentMint(e.target.checked)}
            colorScheme="purple"
            size="lg"
          />
        </FormControl>
      </Box>

      {/* Amount Input Section */}
      <FormControl isRequired>
        <FormLabel fontWeight="medium">Amount</FormLabel>
        <VStack width="100%" spacing={4}>
          <HStack width="100%" spacing={3}>
            <NumberInput
              value={mintAmount}
              onChange={(valueString) => {
                const value = parseFloat(valueString || '0');
                const newAmount = isNaN(value) ? '0' : value.toFixed(4);
                setMintAmount(newAmount);
                if (!newAmount || parseFloat(newAmount) === 0) {
                  setNeedsApproval(false);
                  return;
                }
                checkAllowance();
              }}
              onBlur={() => {
                // Validate and format on blur
                const value = parseFloat(mintAmount || '0');
                if (isNaN(value)) {
                  setMintAmount('0.0000');
                } else {
                  const formatted = value.toFixed(4);
                  setMintAmount(formatted);
                  checkAllowance();
                }
              }}
              min={0}
              max={parseFloat(maxBalance)}
              step={1}
              precision={4}
              isDisabled={!hasTokens}
              flex={1}
              size="lg"
              keepWithinRange={true}
              clampValueOnBlur={true}
            >
              <NumberInputField 
                borderColor="gray.200" 
                _hover={{ borderColor: selectedTokenColor }}
                _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              size="lg"
              onClick={() => {
                setMintAmount(maxBalance);
                checkAllowance();
              }}
              variant="outline"
              borderColor={selectedTokenColor}
              color={selectedTokenColor}
              _hover={{ bg: `${selectedTokenColor}10` }}
              isDisabled={!hasTokens}
              minW="80px"
            >
              Max
            </Button>
          </HStack>

          <Box width="100%" px={1}>
            <Slider
              value={parseFloat(mintAmount || '0')}
              onChange={(value) => {
                const newAmount = value.toFixed(4);
                setMintAmount(newAmount);
                if (!newAmount || parseFloat(newAmount) === 0) {
                  setNeedsApproval(false);
                  return;
                }
                checkAllowance();
              }}
              onChangeEnd={(value) => {
                const newAmount = value.toFixed(4);
                setMintAmount(newAmount);
                checkAllowance();
              }}
              min={0}
              max={parseFloat(maxBalance)}
              step={1}
              isDisabled={!hasTokens}
            >
              <SliderTrack bg="gray.200">
                <SliderFilledTrack bg={selectedTokenColor} />
              </SliderTrack>
              <SliderThumb 
                boxSize={6} 
                bg={needsApproval ? 'yellow.400' : selectedTokenColor}
                _focus={{ boxShadow: `0 0 0 3px ${needsApproval ? 'yellow.200' : `${selectedTokenColor}40`}` }}
              >
                <Box 
                  color="white" 
                  as={needsApproval ? AlertTriangle : Check} 
                  size={needsApproval ? "12px" : "10px"}
                  style={{ strokeWidth: needsApproval ? 3 : 2 }}
                />
              </SliderThumb>
            </Slider>
          </Box>

          <Alert status="info" size="sm">
            <AlertIcon />
            <Text fontSize="sm">
              Approved amount: {currentAllowance} {rootTokenSymbol}
            </Text>
          </Alert>
        </VStack>

        <Text fontSize="sm" color="gray.600" mt={3} textAlign="center">
          {useDirectParentMint 
            ? "Mints tokens directly from parent node's reserve"
            : "Mints tokens through the entire path from root"
          }
        </Text>
      </FormControl>

      {/* Status and Action Section */}
      <Box>
        {hasTokens ? (
          mintAmount && parseFloat(mintAmount) > 0 && (
            <Alert 
              status={needsApproval ? "warning" : "success"}
              borderRadius="lg"
              bg={needsApproval ? "orange.50" : "green.50"}
            >
              <AlertIcon />
              <VStack align="start" spacing={1} width="100%">
                <Text fontWeight="medium">
                  {needsApproval 
                    ? "Approval required before minting" 
                    : "Ready to mint"}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Available balance: {maxBalance} {rootTokenSymbol}
                  {needsApproval && ` (Need to approve: ${parseFloat(mintAmount).toFixed(4)})`}
                </Text>
              </VStack>
            </Alert>
          )
        ) : (
          <Alert 
            status="warning"
            borderRadius="lg"
            bg="orange.50"
          >
            <AlertIcon />
            <Text>No tokens available to mint</Text>
          </Alert>
        )}

        {hasTokens && (
          <Button
            onClick={needsApproval ? handleApprove : () => useDirectParentMint ? handleMint() : handleMintPath()}
            isLoading={isProcessing}
            width="100%"
            size="lg"
            mt={4}
            isDisabled={!mintAmount || parseFloat(mintAmount) === 0}
            bg={selectedTokenColor}
            color="white"
            _hover={{ bg: `${selectedTokenColor}90` }}
            _active={{ bg: `${selectedTokenColor}80` }}
            _disabled={{ bg: `${selectedTokenColor}40`, cursor: 'not-allowed' }}
          >
            {needsApproval ? 'Approve Tokens' : (useDirectParentMint ? 'Mint from Parent' : 'Mint')}
          </Button>
        )}
      </Box>
    </VStack>
    );
  };

  // Burn Modal Content
  const renderBurnModalContent = () => {
    const maxBurnBalance = formatBalance(burnBalance);
    const hasTokensToBurn = parseFloat(maxBurnBalance) > 0;

    return (
    <VStack spacing={4} align="stretch">
      <Alert status="info" mb={4}>
        <AlertIcon />
        Available to burn: {Number(maxBurnBalance).toFixed(4)} {rootTokenSymbol}
      </Alert>
      <Box bg="gray.50" p={4} borderRadius="lg" mb={4}>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel htmlFor="burn-to-parent" mb="0" fontWeight="medium">
            Burn to Parent
          </FormLabel>
          <Switch 
            id="burn-to-parent"
            isChecked={useDirectParentBurn}
            onChange={(e) => setUseDirectParentBurn(e.target.checked)}
            colorScheme="purple"
            size="lg"
          />
        </FormControl>
      </Box>
      
      <FormControl isRequired>
        <FormLabel fontWeight="medium">Amount</FormLabel>
        <VStack width="100%" spacing={4}>
          <HStack width="100%" spacing={3}>
            <NumberInput
              value={burnAmount}
              onChange={(valueString) => {
                const value = parseFloat(valueString || '0');
                const newAmount = isNaN(value) ? '0' : value.toFixed(4);
                setBurnAmount(newAmount);
              }}
              onBlur={() => {
                const value = parseFloat(burnAmount || '0');
                if (isNaN(value)) {
                  setBurnAmount('0.0000');
                } else {
                  setBurnAmount(value.toFixed(4));
                }
              }}
              min={0}
              max={parseFloat(maxBurnBalance)}
              step={1}
              precision={4}
              isDisabled={!hasTokensToBurn}
              flex={1}
              size="lg"
              keepWithinRange={true}
              clampValueOnBlur={true}
            >
              <NumberInputField 
                borderColor="gray.200" 
                _hover={{ borderColor: selectedTokenColor }}
                _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              size="lg"
              onClick={() => setBurnAmount(maxBurnBalance)}
              variant="outline"
              borderColor={selectedTokenColor}
              color={selectedTokenColor}
              _hover={{ bg: `${selectedTokenColor}10` }}
              isDisabled={!hasTokensToBurn}
              minW="80px"
            >
              Max
            </Button>
          </HStack>

          <Box width="100%" px={1}>
            <Slider
              value={parseFloat(burnAmount || '0')}
              onChange={(value) => setBurnAmount(value.toFixed(4))}
              min={0}
              max={parseFloat(maxBurnBalance)}
              step={1}
              isDisabled={!hasTokensToBurn}
            >
              <SliderTrack bg="gray.200">
                <SliderFilledTrack bg={selectedTokenColor} />
              </SliderTrack>
              <SliderThumb 
                boxSize={6} 
                bg={selectedTokenColor}
                _focus={{ boxShadow: `0 0 0 3px ${selectedTokenColor}40` }}
              />
            </Slider>
          </Box>
        </VStack>

        <Text fontSize="sm" color="gray.600" mt={3} textAlign="center">
          {useDirectParentBurn 
            ? "Burns tokens directly to parent node"
            : "Burns tokens through the entire path to root"
          }
        </Text>
      </FormControl>

      {hasTokensToBurn ? (
        burnAmount && parseFloat(burnAmount) > 0 && (
          <Alert 
            status="info"
            borderRadius="lg"
            bg="blue.50"
            mt={4}
          >
            <AlertIcon />
            <Text fontWeight="medium">
              Ready to burn {parseFloat(burnAmount).toFixed(4)} {rootTokenSymbol}
            </Text>
          </Alert>
        )
      ) : (
        <Alert 
          status="warning"
          borderRadius="lg"
          bg="orange.50"
          mt={4}
        >
          <AlertIcon />
          <Text>No tokens available to burn</Text>
        </Alert>
      )}

      {hasTokensToBurn && (
        <Button
          onClick={() => useDirectParentBurn ? handleBurn() : handleBurnPath()}
          isLoading={isProcessing}
          width="100%"
          size="lg"
          mt={4}
          isDisabled={!burnAmount || parseFloat(burnAmount) === 0}
          bg={selectedTokenColor}
          color="white"
          _hover={{ bg: `${selectedTokenColor}90` }}
          _active={{ bg: `${selectedTokenColor}80` }}
          _disabled={{ bg: `${selectedTokenColor}40`, cursor: 'not-allowed' }}
        >
          {useDirectParentBurn ? 'Burn to Parent' : 'Burn'}
        </Button>
      )}
    </VStack>
    );
  };

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
                isDisabled={!isMember}
              >
                Add Node
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

            <Tooltip label="Mint token">
              <Button
                leftIcon={<Plus size={16} color={selectedTokenColor} />}
                onClick={() => setActiveModal('mint')}
                colorScheme="purple"
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{ bg: `${selectedTokenColor}20` }}
              >
                Deposit
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
                Withdraw
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
              rootTokenSymbol={rootTokenSymbol}
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
            Mint Node Shares
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
            Burn Node Shares
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
