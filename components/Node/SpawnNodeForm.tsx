import React, { useState, useCallback } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Switch,
  HStack,
  IconButton,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Link,
  Progress,
  Divider,
  Tooltip,
  Card,
  CardBody,
  CardHeader,
  Badge,
  ToastId,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';
import { Plus, Trash2, ExternalLink, Copy, Activity, Info, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';
import { useAppKit } from '@/hooks/useAppKit';
import { deployments, ABIs, getExplorerLink } from '../../config/contracts';
import { validateToken } from '../../utils/tokenValidation';
import { useTransaction } from '../../contexts/TransactionContext';
import { useNodeData } from '../../hooks/useNodeData';
import { nodeIdToAddress } from '@/utils/formatters';
import { formatBalance } from '@/utils/formatters';

interface Characteristic {
  title: string;
  link: string;
}

interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol?: string;
}

interface SpawnNodeFormProps {
  nodeId: string;
  chainId: string;
  onSuccess?: () => void;
  onClose?: () => void;
  selectedTokenColor?: string;
  rootTokenSymbol?: string;
}

const SpawnNodeForm: React.FC<SpawnNodeFormProps> = ({
  nodeId,
  chainId,
  onSuccess,
  onClose,
  selectedTokenColor = '#805AD5',
  rootTokenSymbol = 'PSC' // Default to PSC if not provided
}) => {
  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');
  const [inflationRate, setInflationRate] = useState(1);
  const [useMembrane, setUseMembrane] = useState(true);

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Hooks
  const { getEthersProvider } = useAppKit();
  const toast = useToast();
  const { executeTransaction } = useTransaction();

  // Token validation and handling
  const validateAndAddToken = useCallback(async () => {
    if (!newTokenAddress || !newTokenBalance) {
      toast({
        title: 'Error',
        description: 'Both token address and balance are required',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setValidatingToken(true);
    console.log('Validating token:', { address: newTokenAddress, balance: newTokenBalance });

    try {
      const tokenInfo = await validateToken(newTokenAddress, chainId);
      if (!tokenInfo) throw new Error('Invalid token address');

      const isDuplicate = membershipConditions.some(
        mc => mc.tokenAddress.toLowerCase() === newTokenAddress.toLowerCase()
      );

      if (isDuplicate) {
        throw new Error('Token already added to conditions');
      }

      setMembershipConditions(prev => [...prev, {
        tokenAddress: newTokenAddress.toLowerCase(),
        requiredBalance: newTokenBalance,
        symbol: tokenInfo.symbol
      }]);

      setNewTokenAddress('');
      setNewTokenBalance('');

      toast({
        title: 'Success',
        description: `Added ${tokenInfo.symbol} token requirement`,
        status: 'success',
        duration: 2000
      });

    } catch (error: any) {
      console.error('Token validation error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    } finally {
      setValidatingToken(false);
    }
  }, [newTokenAddress, newTokenBalance, chainId, membershipConditions, toast]);

  // Characteristic handling
  const addCharacteristic = useCallback(() => {
    if (!newCharTitle || !newCharLink) {
      toast({
        title: 'Error',
        description: 'Both title and link are required',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setCharacteristics(prev => [...prev, {
      title: newCharTitle,
      link: newCharLink
    }]);

    setNewCharTitle('');
    setNewCharLink('');
  }, [newCharTitle, newCharLink, toast]);

  const submitTransaction = async (cid: string = '') => {
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.WillWe[cleanChainId];
    
    if (!contractAddress) {
      throw new Error(`No contract deployment found for chain ${cleanChainId}`);
    }

    await executeTransaction(async () => {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.WillWe,
        signer as unknown as ethers.ContractRunner
      );

      let transaction;
      if (useMembrane) {
        transaction = await contract.spawnNodeWithMembrane(
          nodeId,
          membershipConditions.map(mc => mc.tokenAddress.toLowerCase()),
          membershipConditions.map(mc => ethers.parseUnits(mc.requiredBalance, 18)),
          cid,
          inflationRate,
          { gasLimit: BigInt(1000000) }
        );
      } else {
        transaction = await contract.spawnBranch(
          nodeId,
          { gasLimit: BigInt(500000) }
        );
      }

      setTransactionHash(transaction.hash);
      onSuccess?.();
      onClose?.();
      return transaction;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useMembrane && (!entityName || characteristics.length === 0)) {
      toast({
        title: 'Error',
        description: 'Entity name and at least one characteristic are required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let cid = '';
      if (useMembrane) {
        // Prepare and upload metadata to IPFS
        const metadata = {
          name: entityName,
          characteristics,
          membershipConditions
        };

        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: metadata }),
        });

        if (!response.ok) throw new Error('Failed to upload metadata');
        const { cid: ipfsCid } = await response.json();
        cid = ipfsCid;
      }

      await submitTransaction(cid);
    } catch (err) {
      console.error('Error spawning node:', err);
      setError(err instanceof Error ? err.message : 'Failed to spawn node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={6} align="stretch">
        {/* Define Switch */}
        <Card variant="outline" bg="white">
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="use-membrane" mb="0" fontWeight="semibold">
                Define Node Properties
              </FormLabel>
              <Switch
                id="use-membrane"
                isChecked={useMembrane}
                onChange={(e) => setUseMembrane(e.target.checked)}
                colorScheme="purple"
                size="lg"
              />
            </FormControl>
          </CardBody>
        </Card>

        {useMembrane && (
          <>
            {/* Name Section */}
            <Card variant="outline" bg="white">
              <CardBody>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">Name</FormLabel>
                  <Input
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="Enter name for the membrane"
                    size="lg"
                    borderColor="gray.200"
                    _hover={{ borderColor: selectedTokenColor }}
                    _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
                  />
                </FormControl>
              </CardBody>
            </Card>

            {/* Characteristics Section */}
            <Card variant="outline" bg="white">
              <CardHeader pb={0}>
                <FormLabel margin="0" fontWeight="semibold">Characteristics</FormLabel>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={3}>
                    <Input
                      placeholder="Label"
                      value={newCharTitle}
                      onChange={(e) => setNewCharTitle(e.target.value)}
                      size="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: selectedTokenColor }}
                      _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
                    />
                    <Input
                      placeholder="URL"
                      value={newCharLink}
                      onChange={(e) => setNewCharLink(e.target.value)}
                      size="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: selectedTokenColor }}
                      _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
                    />
                    <IconButton
                      aria-label="Add characteristic"
                      icon={<Plus size={20} />}
                      onClick={addCharacteristic}
                      isDisabled={!newCharTitle || !newCharLink}
                      size="lg"
                      colorScheme="purple"
                      bg={selectedTokenColor}
                      color="white"
                      _hover={{ bg: `${selectedTokenColor}90` }}
                    />
                  </HStack>

                  {characteristics.length > 0 && (
                    <Box borderRadius="md" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Label</Th>
                            <Th>Value</Th>
                            <Th width="50px"></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {characteristics.map((char, idx) => (
                            <Tr key={idx}>
                              <Td fontWeight="medium">{char.title}</Td>
                              <Td>
                                {char.link.startsWith('http') || char.link.startsWith('www') ? (
                                  <Link href={char.link} isExternal color="purple.500">
                                    {char.link.substring(0, 30)}...
                                    <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                                  </Link>
                                ) : (
                                  <Text>{char.link}</Text>
                                )}
                              </Td>
                              <Td>
                                <IconButton
                                  aria-label="Delete characteristic"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => setCharacteristics(prev => prev.filter((_, i) => i !== idx))}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Membership Conditions Section */}
            <Card variant="outline" bg="white">
              <CardHeader pb={0}>
                <FormLabel margin="0" fontWeight="semibold">Membership Conditions</FormLabel>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={3}>
                    <Input
                      placeholder="Token address"
                      value={newTokenAddress}
                      onChange={(e) => setNewTokenAddress(e.target.value)}
                      size="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: selectedTokenColor }}
                      _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
                    />
                    <Input
                      placeholder="Required balance"
                      value={newTokenBalance}
                      onChange={(e) => setNewTokenBalance(e.target.value)}
                      size="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: selectedTokenColor }}
                      _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
                    />
                    <IconButton
                      aria-label="Add token requirement"
                      icon={<Plus size={20} />}
                      onClick={validateAndAddToken}
                      isLoading={validatingToken}
                      size="lg"
                      colorScheme="purple"
                      bg={selectedTokenColor}
                      color="white"
                      _hover={{ bg: `${selectedTokenColor}90` }}
                    />
                  </HStack>

                  {membershipConditions.length > 0 && (
                    <Box borderRadius="md" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Token</Th>
                            <Th>Required Balance</Th>
                            <Th width="50px"></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {membershipConditions.map((mc, idx) => (
                            <Tr key={idx}>
                              <Td maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                <Tooltip label={mc.tokenAddress}>
                                  <Code p={1} borderRadius="md">{mc.symbol ? `${mc.symbol}` : mc.tokenAddress.substring(0, 10) + '...'}</Code>
                                </Tooltip>
                              </Td>
                              <Td fontWeight="medium">{mc.requiredBalance}</Td>
                              <Td>
                                <IconButton
                                  aria-label="Delete condition"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => setMembershipConditions(prev => prev.filter((_, i) => i !== idx))}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </>
        )}

        {/* Inflation Rate Section */}
        <Card variant="outline" bg="white">
          <CardBody>
            <FormControl>
              <Box p={4} bg="purple.50" borderRadius="lg">
                <Box mb={4}>
                  <HStack>
                    <Activity size={16} />
                    <Text fontSize="lg" fontWeight="semibold">Inflation Rate</Text>
                  </HStack>
                </Box>

                <FormLabel fontWeight="medium">Rate (gwei/sec)</FormLabel>
                <NumberInput
                  value={inflationRate || 1}
                  onChange={(valueString) => {
                    const parsed = parseInt(valueString);
                    setInflationRate(isNaN(parsed) ? 1 : parsed);
                  }}
                  min={1}
                  max={100000000}
                  size="lg"
                >
                  <NumberInputField
                    borderColor="gray.200"
                    _hover={{ borderColor: selectedTokenColor }}
                    _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
                    bg="white"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Daily rate: {Number(ethers.formatEther(BigInt(inflationRate || 1) * BigInt(86400) * BigInt(10 ** 9))).toFixed(4)} {rootTokenSymbol}/day
                </Text>
              </Box>
            </FormControl>
          </CardBody>
        </Card>

        {isLoading && <Progress size="xs" isIndeterminate colorScheme="purple" />}

        {error && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {transactionHash && (
          <Alert status="success">
            <AlertIcon />
            <VStack align="stretch" width="100%" spacing={2}>
              <Text>Node successfully created</Text>
              <Link 
                href={getExplorerLink(transactionHash, chainId, 'tx')}
                isExternal
                color="purple.500"
                fontSize="sm"
                display="flex"
                alignItems="center"
              >
                View transaction <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </Link>
            </VStack>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="purple"
          isLoading={isLoading}
          loadingText="Creating Node..."
          size="lg"
          width="100%"
          bg={selectedTokenColor}
          _hover={{ bg: `${selectedTokenColor}90` }}
          isDisabled={
            (useMembrane && (!entityName || characteristics.length === 0)) ||
            isLoading ||
            inflationRate <= 0
          }
        >
          Create Node
        </Button>
      </VStack>
    </Box>
  );
};

export default SpawnNodeForm;