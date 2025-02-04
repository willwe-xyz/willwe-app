import React, { useState, useCallback, useEffect } from 'react';
import { ethers, ContractRunner } from 'ethers';
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
  FormHelperText
} from '@chakra-ui/react';
import {
  GitBranch,
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
  initialTab?: 'spawn' | 'membrane' | 'mint' | 'burn' | null;
  showToolbar?: boolean;
};

export const NodeOperations = ({
  nodeId,
  chainId,
  selectedTokenColor,
  userAddress,
  onSuccess,
  initialTab = null,
  showToolbar = false // Set default value to false
}: NodeOperationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(initialTab);
  const [membraneId, setMembraneId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [burnAmount, setBurnAmount] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [formData, setFormData] = useState<SpawnFormData>({
    name: '',
    characteristics: [],
    tokenRequirements: [],
    inflation: 0
  });
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isValidatingMembrane, setIsValidatingMembrane] = useState(false);
  const [membraneError, setMembraneError] = useState<string | null>(null);

  const toast = useToast();
  const { user, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  
  const { data: nodeData } = useNodeData(chainId,userAddress, nodeId);
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address || '');

  // Effect to handle initialTab prop changes
  useEffect(() => {
    setActiveModal(initialTab);
  }, [initialTab]);

  // Add these handlers after the state declarations but before the validateMembrane function:


  const checkAllowance = useCallback(async () => {
    try {
      if (!nodeData?.rootPath?.[0] || !user?.wallet?.address) {
        console.warn('Token address or user address not available');
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
          'function approve(address,uint256) returns (bool)'
        ],
        //@ts-ignore
        signer
      );
  
      const currentAllowance = await tokenContract.allowance(
        user.wallet.address,
        willWeAddress
      );
      
      setAllowance(currentAllowance.toString());
      const requiredAmount = ethers.parseUnits(mintAmount || '0', 18);
      setNeedsApproval(BigInt(currentAllowance) < BigInt(requiredAmount));
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
      
      console.log('Approval parameters:', {
        tokenAddress: rootTokenAddress,
        spender: willWeAddress,
        amount: ethers.parseUnits(mintAmount, 18).toString()
      });
  
      const tokenContract = new ethers.Contract(
        rootTokenAddress,
        [
          'function approve(address,uint256) returns (bool)',
          'function allowance(address,address) view returns (uint256)'
        ],
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
        duration: 5000,
        isClosable: true
      });
    }
  }, [
    chainId,
    nodeData?.rootPath,
    mintAmount,
    getEthersProvider,
    checkAllowance,
    isProcessing,
    executeTransaction,
    toast
  ]);
  
  useEffect(() => {
    if (mintAmount) {
      checkAllowance();
    }
  }, [mintAmount, checkAllowance]);
  
  useEffect(() => {
    // Reset states when modal closes
    if (!activeModal) {
      setMintAmount('');
      setBurnAmount('');
      setNeedsApproval(false);
      setAllowance('0');
    }
  }, [activeModal]);


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
      
      const tokenContract = new ethers.Contract(
        contractAddress,
        [
          'function balanceOf(address account, uint256 id) view returns (uint256)'
        ],
        //@ts-ignore
        signer
      );
  
      const balance = await tokenContract.balanceOf(
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
            //@ts-ignore
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
        //@ts-ignore
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, executeTransaction, toast, onSuccess]);

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
            //@ts-ignore
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
  }, [chainId, nodeId, executeTransaction, getEthersProvider, toast, onSuccess, isProcessing]);

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
            //@ts-ignore
            signer
          );
          
          return await contract.mintPath(nodeId, ethers.parseUnits(mintAmount, 18), {
            gasLimit: BigInt(500000)
          });
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
    }
  }, [chainId, nodeId, mintAmount, executeTransaction, getEthersProvider, onSuccess, isProcessing]);

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
            //@ts-ignore
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
          } 
        }
      );
    } catch (error) {
      console.error('Failed to burn path:', error);
      toast({
        title: 'Error',
        //@ts-ignore
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [chainId, nodeId, burnAmount, executeTransaction, getEthersProvider, toast, onSuccess]);

  const handleSpawn = async () => {
    setIsProcessing(true);
    try {
      // Prepare metadata for IPFS
      const metadata = {
        name: formData.name,
        characteristics: formData.characteristics
      };

      // Upload to IPFS
      const ipfsResponse = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadata }),
      });
      
      if (!ipfsResponse.ok) throw new Error('Failed to upload metadata');
      const { cid } = await ipfsResponse.json();

      // Format token requirements
      const tokens = formData.tokenRequirements.map(req => req.tokenAddress);
      const balances = formData.tokenRequirements.map(req => 
        ethers.parseUnits(req.requiredBalance, 18)
      );

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            // @ts-ignore
            signer
          );

          // Convert inflation rate to gwei and then to bigint
          const inflationRate = formData.inflation === 0 ? 
            BigInt(0) : 
            BigInt(Math.floor(formData.inflation * 1e9));

          return contract.spawnBranchWithMembrane(
            nodeId,
            tokens,
            balances,
            cid,
            inflationRate,
            { gasLimit: BigInt(600000) }
          );
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
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addCharacteristic = () => {
    setFormData((prevData) => ({
      ...prevData,
      characteristics: [...prevData.characteristics, { title: '', link: '' }]
    }));
  };

  const updateCharacteristic = (index: number, field: string, value: string) => {
    setFormData((prevData) => {
      const updatedCharacteristics = [...prevData.characteristics];
      updatedCharacteristics[index] = {
        ...updatedCharacteristics[index],
        [field]: value
      };
      return { ...prevData, characteristics: updatedCharacteristics };
    });
  };

  const removeCharacteristic = (index: number) => {
    setFormData((prevData) => {
      const updatedCharacteristics = [...prevData.characteristics];
      updatedCharacteristics.splice(index, 1);
      return { ...prevData, characteristics: updatedCharacteristics };
    });
  };

  const addTokenRequirement = () => {
    setFormData((prevData) => ({
      ...prevData,
      tokenRequirements: [...prevData.tokenRequirements, { tokenAddress: '', requiredBalance: '' }]
    }));
  };

  const updateTokenRequirement = (index: number, field: string, value: string) => {
    setFormData((prevData) => {
      const updatedTokenRequirements = [...prevData.tokenRequirements];
      updatedTokenRequirements[index] = {
        ...updatedTokenRequirements[index],
        [field]: value
      };
      return { ...prevData, tokenRequirements: updatedTokenRequirements };
    });
  };

  const removeTokenRequirement = (index: number) => {
    setFormData((prevData) => {
      const updatedTokenRequirements = [...prevData.tokenRequirements];
      updatedTokenRequirements.splice(index, 1);
      return { ...prevData, tokenRequirements: updatedTokenRequirements };
    });
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
            sx={{
              '& button': {
                minWidth: '120px',
                height: '36px',
                justifyContent: 'center',
                borderWidth: '1.5px',
                borderRadius: 'md',
                fontWeight: 'medium',
                transition: 'all 0.2s',
                _hover: {
                  transform: 'translateY(-1px)',
                  shadow: 'sm'
                }
              }
            }}
          >
            <Tooltip label="Spawn new node with optional membrane">
              <Button
                leftIcon={<GitBranch size={16} />}
                onClick={() => setActiveModal('spawn')}
                colorScheme="purple"
                variant="outline"
              >
                Spawn Node
              </Button>
            </Tooltip>

            <Tooltip label={isMember ? "Already a member" : "Mint membership"}>
              <Button
                leftIcon={<UserPlus size={16} />}
                onClick={handleMintMembership}
                isDisabled={isMember}
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                Join
              </Button>
            </Tooltip>

            <Tooltip label="Redistribute value">
              <Button
                leftIcon={<RefreshCw size={16} />}
                onClick={handleRedistribute}
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                Redistribute
              </Button>
            </Tooltip>

            <Tooltip label="Mint path tokens">
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => setActiveModal('mint')}
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                Mint
              </Button>
            </Tooltip>

            <Tooltip label="Burn path tokens">
              <Button
                leftIcon={<Trash size={16} />}
                onClick={() => {
                  setActiveModal('burn');
                  checkNodeBalance();
                }}
                colorScheme="purple"
                variant="outline"
                size="sm"
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
        onClose={() => setActiveModal(null)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Spawn New Node</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Node Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value
                  })}
                  placeholder="Enter node name (minimum 3 characters)"
                  isInvalid={formData.name.length > 0 && formData.name.length < 3}
                />
                {formData.name.length > 0 && formData.name.length < 3 && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    Name must be at least 3 characters long
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={1}>
                    <Text>Inflation Rate</Text>
                    <Tooltip label="Initial inflation rate in gwei/sec (optional). Rate at which shares devalue over time. Or, rate at which news shares are generated relative to reserve value. Each mint happens at a 1 to 1 ratio. Burns are share dependent, thereby allways growing and bigger than reserve (parent) tokens.">
                      <Box as="span" cursor="help">
                        <Info size={14} />
                      </Box>
                    </Tooltip>
                  </HStack>
                </FormLabel>
                <Input
                  value={formData.inflation === 0 ? '' : formData.inflation}
                  onChange={(e) => setFormData({
                    ...formData,
                    inflation: e.target.value === '' ? 0 : parseFloat(e.target.value)
                  })}
                  placeholder="Enter inflation rate (gwei/sec)"
                  type="number"
                  min="0"
                  max="1000000000"
                />
                <FormHelperText>Maximum rate: 1,000,000 gwei/sec</FormHelperText>
              </FormControl>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <FormLabel mb={0}>Characteristics</FormLabel>
                  <Button
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={addCharacteristic}
                  >
                    Add
                  </Button>
                </HStack>
                <VStack spacing={2}>
                  {formData.characteristics.map((char, idx) => (
                    <HStack key={idx}>
                      <Input
                        placeholder="Title"
                        value={char.title}
                        onChange={(e) => updateCharacteristic(idx, 'title', e.target.value)}
                        size="sm"
                      />
                      <Input
                        placeholder="Link"
                        value={char.link}
                        onChange={(e) => updateCharacteristic(idx, 'link', e.target.value)}
                        size="sm"
                      />
                      <IconButton
                        aria-label="Remove characteristic"
                        icon={<Trash2 size={14} />}
                        onClick={() => removeCharacteristic(idx)}
                        size="sm"
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <FormLabel mb={0}>Token Requirements</FormLabel>
                  <Button
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={addTokenRequirement}
                  >
                    Add
                  </Button>
                </HStack>
                <VStack spacing={2}>
                  {formData.tokenRequirements.map((req, idx) => (
                    <HStack key={idx}>
                      <Input
                        placeholder="Token Address"
                        value={req.tokenAddress}
                        onChange={(e) => updateTokenRequirement(idx, 'tokenAddress', e.target.value)}
                        size="sm"
                      />
                      <Input
                        placeholder="Required Balance"
                        value={req.requiredBalance}
                        onChange={(e) => updateTokenRequirement(idx, 'requiredBalance', e.target.value)}
                        size="sm"
                        type="number"
                      />
                      <IconButton
                        aria-label="Remove requirement"
                        icon={<Trash2 size={14} />}
                        onClick={() => removeTokenRequirement(idx)}
                        size="sm"
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Button
                colorScheme="purple"
                onClick={handleSpawn}
                isLoading={isProcessing}
                width="100%"
                mt={4}
              >
                Spawn Node
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Mint Path Modal */}
      <Modal 
        isOpen={activeModal === 'mint'} 
        onClose={() => setActiveModal(null)}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent 
          mx={4}
          bg="white" 
          shadow="xl"
          borderRadius="xl"
        >
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
      <Modal 
        isOpen={activeModal === 'burn'} 
        onClose={() => setActiveModal(null)}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent 
          mx={4}
          bg="white" 
          shadow="xl"
          borderRadius="xl"
        >
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