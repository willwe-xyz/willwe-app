import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  RadioGroup,
  Radio,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Text,
  Alert,
  AlertIcon,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  IconButton
} from '@chakra-ui/react';
import { Copy, ExternalLink } from 'lucide-react';
import { deployments, ABIs } from '../../config/contracts';

export const TokenOperationModal = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  nodeId,
  chainId
}) => {
  const { getEthersProvider } = usePrivy();
  
  // State
  const [membraneId, setMembraneId] = useState('');
  const [membraneInputType, setMembraneInputType] = useState('manual');
  const [membranes, setMembranes] = useState([]);
  const [membraneError, setMembraneError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Fetch token details from contract
  const fetchTokenDetails = async (tokenAddress) => {
    try {
      const provider = await getEthersProvider();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ABIs.IERC20,
        provider
      );
      const symbol = await tokenContract.symbol();
      return symbol;
    } catch (error) {
      console.error('Error fetching token details:', error);
      return 'Unknown';
    }
  };

  // Load membrane data when ID changes
  const loadMembraneRequirements = useCallback(async (id) => {
    if (!id || !chainId) return;
    setIsLoadingTokens(true);
    
    try {
      const provider = await getEthersProvider();
      const cleanChainId = chainId.includes('eip155:') ? 
        chainId.replace('eip155:', '') : 
        chainId;
      
      const membraneAddress = deployments.Membrane[cleanChainId];
      if (!membraneAddress) {
        throw new Error(`No membrane contract found for chain ${cleanChainId}`);
      }

      const membraneContract = new ethers.Contract(
        membraneAddress,
        ABIs.Membrane,
        provider
      );

      // Fetch membrane data from contract
      const membraneData = await membraneContract.getMembraneById(BigInt(id));
      
      // Fetch IPFS metadata
      if (membraneData.meta) {
        const response = await fetch(`https://underlying-tomato-locust.myfilebase.com/ipfs/${membraneData.meta}`);
        if (!response.ok) throw new Error('Failed to fetch IPFS data');
        const metadata = await response.json();
        setMembraneMetadata(metadata);
      }

      // Process token requirements
      const processedRequirements = await Promise.all(
        membraneData.tokens.map(async (tokenAddress, index) => {
          const symbol = await fetchTokenDetails(tokenAddress);
          const balance = membraneData.balances[index];
          return {
            tokenAddress,
            symbol,
            requiredBalance: balance.toString(),
            formattedBalance: ethers.formatEther(balance)
          };
        })
      );

      setRequirements(processedRequirements);
      setMembraneError('');
    } catch (error) {
      console.error('Error loading membrane requirements:', error);
      setMembraneError(error.message);
      setMembraneMetadata(null);
      setRequirements([]);
    } finally {
      setIsLoadingTokens(false);
    }
  }, [chainId, getEthersProvider]);

  // Handle membrane ID change
  const handleMembraneIdChange = useCallback(async (value) => {
    setMembraneId(value);
    if (value && membraneInputType === 'manual') {
      await loadMembraneRequirements(value);
    }
  }, [membraneInputType, loadMembraneRequirements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ membraneId });
    onClose();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMembraneId('');
      setMembraneError('');
      setMembraneMetadata(null);
      setRequirements([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Spawn With Membrane
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel>Select Input Method</FormLabel>
                <RadioGroup
                  onChange={setMembraneInputType}
                  value={membraneInputType}
                >
                  <Stack direction="row">
                    <Radio value="manual">Enter Membrane ID</Radio>
                    <Radio value="dropdown" isDisabled>Select </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Enter Membrane ID</FormLabel>
                <Input
                  value={membraneId}
                  onChange={(e) => handleMembraneIdChange(e.target.value)}
                  placeholder="Enter membrane ID"
                />
              </FormControl>

              {isLoadingTokens && (
                <Alert status="info">
                  <AlertIcon />
                  Loading membrane data...
                </Alert>
              )}

              {membraneError && (
                <Alert status="error">
                  <AlertIcon />
                  {membraneError}
                </Alert>
              )}

              {membraneMetadata && (
                <Box 
                  p={4} 
                  bg="purple.50" 
                  borderRadius="md"
                  w="100%"
                >
                  <Text fontWeight="bold" mb={2}>
                    Operation Summary:
                  </Text>
                  <Text>• Creating sub-node with membrane restrictions</Text>
                  <Text>• Token requirements: {requirements.length}</Text>
                  <Text>• Characteristics: {membraneMetadata.characteristics?.length || 0}</Text>
                  
                  <Box mt={4}>
                    <Text fontWeight="bold" mb={2}>Characteristics:</Text>
                    {membraneMetadata.characteristics?.map((char, idx) => (
                      <HStack key={idx} justify="space-between" mb={2}>
                        <Text>{char.title}</Text>
                        <Link 
                          href={char.link} 
                          isExternal
                          color="blue.500"
                          display="flex"
                          alignItems="center"
                        >
                          View <ExternalLink size={14} className="ml-1" />
                        </Link>
                      </HStack>
                    ))}
                  </Box>

                  {requirements.length > 0 && (
                    <Box mt={4}>
                      <Text fontWeight="bold" mb={2}>Token Requirements:</Text>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Token</Th>
                            <Th>Required Balance</Th>
                            <Th>Address</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {requirements.map((req, idx) => (
                            <Tr key={idx}>
                              <Td>{req.symbol}</Td>
                              <Td>{req.formattedBalance}</Td>
                              <Td>
                                <HStack spacing={1}>
                                  <Text isTruncated maxW="120px">
                                    {req.tokenAddress}
                                  </Text>
                                  <IconButton
                                    aria-label="Copy address"
                                    icon={<Copy size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(req.tokenAddress)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isLoading}
              loadingText="Processing..."
              isDisabled={!membraneId || !!membraneError || isLoading}
            >
              Spawn With Membrane
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TokenOperationModal;