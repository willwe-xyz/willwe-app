import React, { useState, useCallback } from 'react';
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
  ToastId
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
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { deployments, ABIs } from '../../config/contracts';
import { nodeIdToAddress } from '../../utils/formatters';
import { RequirementsTable } from '../TokenOperations/RequirementsTable';
import { MembraneMetadata, MembraneRequirement } from '../../types/chainData';
import { Link as ChakraLink } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';



const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

export type NodeOperationsProps = {
  nodeId: string;
  chainId: string;
  selectedTokenColor?: string;
  onSuccess?: () => void;
};

interface MembraneCharacteristic {
  title: string;
  description?: string;
  link?: string;
}

// Add this type definition near the top of the file
type ModalType = 'spawn' | 'membrane' | 'mint' | 'burn' | null;

export const NodeOperations = ({
  nodeId,
  chainId,
  selectedTokenColor,
  onSuccess
}: NodeOperationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
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
  const isMember = nodeData?.membersOfNode?.includes(user?.wallet?.address || '');

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

      const tokenContract = new ethers.Contract(
        tokenAddress,
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
    if (!nodeData?.rootPath?.[0] || isProcessing) {
      return;
    }

    try {
      const tokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
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
            deployments.WillWe[chainId.replace('eip155:', '')],
            ethers.MaxUint256
          );
          return tx;
        },
        {
          successMessage: 'Approval granted successfully',
          onSuccess: async () => {
            await checkAllowance();
          }
        }
      );
    } catch (error) {
      console.error('Approval error:', error);
    }
  }, [chainId, nodeData?.rootPath, getEthersProvider, checkAllowance, isProcessing]);

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
        //@ts-ignore
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

  const handleSpawnNode = useCallback(async () => {
    if (isProcessing) return;
    
    let confirmToastId: ToastId | undefined;
    let pendingToastId: ToastId | undefined;
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      confirmToastId = toast({
        title: 'Confirm Transaction',
        description: 'Please sign the transaction in your wallet',
        status: 'info',
        duration: null
      });

      await executeTransaction(
        chainId,
        async () => {
          if (confirmToastId) toast.close(confirmToastId);
          
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer as unknown as ContractRunner
          );
          
          pendingToastId = toast({
            title: 'Transaction Pending',
            description: 'Your transaction is being processed',
            status: 'loading',
            duration: null
          });

          const tx = await contract.spawnBranch(nodeId, {
            gasLimit: BigInt(400000)
          });
          return tx;
        },
        {
          successMessage: 'Node spawned successfully',
          onSuccess: () => {
            if (pendingToastId) toast.close(pendingToastId);
            setActiveModal(null);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      if (confirmToastId) toast.close(confirmToastId);
      if (pendingToastId) toast.close(pendingToastId);
      
      console.error('Failed to spawn node:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    }
  }, [chainId, nodeId, isProcessing, executeTransaction, getEthersProvider, toast, onSuccess, setActiveModal]);

  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isValidatingMembrane, setIsValidatingMembrane] = useState(false);
  const [membraneError, setMembraneError] = useState<string | null>(null);

  const validateMembrane = useCallback(async (membraneId: string) => {
    setIsValidatingMembrane(true);
    setMembraneError(null);
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      
      if (!provider) {
        throw new Error('Provider not available');
      }
  
      const contract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        //@ts-ignore
        provider.getSigner()
      );
  
      const membrane = await contract.getMembraneById(membraneId);
      if (!membrane) throw new Error('Membrane not found');
  
      const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
      if (!response.ok) throw new Error('Failed to fetch membrane metadata');
      
      const metadata = await response.json();
      setMembraneMetadata(metadata);
  
      setIsLoadingTokens(true);
      const requirements = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
            //@ts-ignore  
            provider.getSigner()
          );
  
          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);
  
          return {
            tokenAddress,
            symbol,
            requiredBalance: membrane.balances[index].toString(),
            formattedBalance: ethers.formatUnits(membrane.balances[index], decimals)
          };
        })
      );
  
      setRequirements(requirements);
    } catch (error) {
      console.error('Error validating membrane:', error);
      setMembraneError('Invalid membrane ID');
      setMembraneMetadata(null);
      setRequirements([]);
    } finally {
      setIsValidatingMembrane(false);
      setIsLoadingTokens(false);
    }
  }, [
    chainId,
    getEthersProvider,
    setIsValidatingMembrane,
    setMembraneError,
    setMembraneMetadata,
    setRequirements,
    setIsLoadingTokens,
    IPFS_GATEWAY
  ]);


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
            //@ts-ignore
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
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    chainId,
    nodeId,
    membraneId,
    executeTransaction,
    getEthersProvider,
    toast,
    onSuccess,
    setActiveModal,
    setIsProcessing
  ]);  

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
    
    let confirmToastId: ToastId | undefined;
    let pendingToastId: ToastId | undefined;
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      confirmToastId = toast({
        title: 'Confirm Transaction',
        description: 'Please sign the transaction in your wallet',
        status: 'info',
        duration: null
      });

      await executeTransaction(
        chainId,
        async () => {
          if (confirmToastId) toast.close(confirmToastId);
          
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            //@ts-ignore
            signer
          );

          pendingToastId = toast({
            title: 'Transaction Pending',
            description: 'Your transaction is being processed',
            status: 'loading',
            duration: null
          });

          return contract.redistributePath(nodeId, { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess: () => {
            if (pendingToastId) toast.close(pendingToastId);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      if (confirmToastId) toast.close(confirmToastId);
      if (pendingToastId) toast.close(pendingToastId);
      
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

  return (
    <>
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
          <Tooltip label="Spawn new node" placement="top">
            <Button
              leftIcon={<GitBranch size={16} />}
              onClick={() => setActiveModal('spawn')}
              colorScheme="purple"
              variant="outline"
            >
              Spawn
            </Button>
          </Tooltip>
          
          <Tooltip label="Spawn with membrane">
            <Button
              leftIcon={<Shield size={16} />}
              onClick={() => setActiveModal('membrane')}
              colorScheme="purple"
              variant="outline"
              size="sm"
            >
              Membrane
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

      {/* Spawn Node Modal */}
      <Modal 
        isOpen={activeModal === 'spawn'} 
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
      <Modal 
        isOpen={activeModal === 'membrane'} 
        onClose={() => setActiveModal(null)}
        size="lg"
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent 
          mx={4}
          bg="white" 
          shadow="xl"
          borderRadius="xl"
        >
          <ModalHeader>
            <Text>Spawn Node with Membrane</Text>
            <ModalCloseButton />
          </ModalHeader>
          
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Membrane ID</FormLabel>
                <Input
                  value={membraneId}
                  onChange={(e) => {
                    setMembraneId(e.target.value);
                    if (e.target.value) {
                      validateMembrane(e.target.value);
                    } else {
                      setMembraneMetadata(null);
                      setRequirements([]);
                      setMembraneError(null);
                    }
                  }}
                  placeholder="Enter membrane ID"
                  size="sm"
                  fontFamily="mono"
                  fontSize="sm"
                />
              </FormControl>

              {(isValidatingMembrane || isLoadingTokens) && (
                <Box py={2}>
                  <Progress size="xs" isIndeterminate colorScheme="purple" />
                  <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
                    {isValidatingMembrane ? 'Validating membrane...' : 'Loading token details...'}
                  </Text>
                </Box>
              )}

              {membraneError && (
                <Alert status="error" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">{membraneError}</Text>
                </Alert>
              )}

              {membraneMetadata && !membraneError && (
                <Box>
                  <Card variant="outline" bg="purple.50">
                    <CardBody p={4}>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="bold">{membraneMetadata.name}</Text>
                          <Badge colorScheme="purple" fontSize="xs">ID: {membraneId.slice(0, 8)}...</Badge>
                        </HStack>
                        
                        {membraneMetadata.characteristics?.map((char, idx) => (
                          <Box
                            key={idx}
                            p={2}
                            bg="white"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="purple.100"
                          >
                            <HStack justify="space-between">
                              <Text fontSize="sm">{char.title}</Text>
                              {char.link && (
                                <ChakraLink 
                                  href={char.link} 
                                  isExternal 
                                  color="purple.500"
                                  fontSize="xs"
                                >
                                  <HStack spacing={1}>
                                    <Text>Open</Text>
                                    <ExternalLinkIcon width={5} height={5} />
                                  </HStack>
                                </ChakraLink>
                              )}
                            </HStack>
                            {char.title && (
                              <Text fontSize="xs" color="gray.600" mt={1}>
                                {char.title}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Token Requirements:</Text>
                    <RequirementsTable
                      requirements={requirements}
                      chainId={chainId}
                    />
                  </Box>
                </Box>
              )}

              <Button
                colorScheme="purple"
                onClick={handleSpawnWithMembrane}
                isLoading={isProcessing}
                width="100%"
                mt={4}
                isDisabled={!membraneId || !!membraneError || isValidatingMembrane || isLoadingTokens}
              >
                Spawn Node with Membrane
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