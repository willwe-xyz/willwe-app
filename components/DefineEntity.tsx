import React, { useState, useCallback } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Progress,
  Text,
  Heading,
  useToast,
  Link
} from '@chakra-ui/react';
import { ethers, Contract } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { Trash2, Plus, ExternalLink, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { deployments, ABIs } from '../config/contracts';

interface EntityData {
  entityName: string;
  characteristics: {
    title: string;
    link: string;
  }[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
    symbol?: string;
  }[];
  membraneId?: string;
}

interface DefineEntityProps {
  onSubmit: (data: EntityData) => void;
  chainId: string;
}

interface TokenMetadata {
  address: string;
  symbol: string | null;
  decimals: number;
}

export const DefineEntity: React.FC<DefineEntityProps> = ({ onSubmit, chainId }) => {
  const [entityName, setEntityName] = useState('');
  const [characteristicTitle, setCharacteristicTitle] = useState('');
  const [characteristicLink, setCharacteristicLink] = useState('');
  const [characteristics, setCharacteristics] = useState<{title: string; link: string}[]>([]);
  const [tokenAddress, setTokenAddress] = useState('');
  const [requiredBalance, setRequiredBalance] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<{
    tokenAddress: string;
    requiredBalance: string;
    symbol?: string;
  }[]>([]);
  const [submissionState, setSubmissionState] = useState<'idle' | 'ipfs' | 'transaction' | 'confirming' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string>('');
  const [membraneId, setMembraneId] = useState<string>('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const { user, getEthersProvider } = usePrivy();
  const toast = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        status: "error",
        duration: 2000,
      });
    }
  };

  const validateTokenAddress = useCallback(async (address: string): Promise<TokenMetadata | null> => {
    if (!ethers.isAddress(address)) return null;

    try {
      const provider = await getEthersProvider();
      const tokenContract = new Contract(
        address,
        [
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)'
        ],
        provider
      );

      const [symbol, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals()
      ]);

      return {
        address,
        symbol,
        decimals
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }, [getEthersProvider]);

  const handleTokenAddressChange = useCallback(async (address: string) => {
    setTokenAddress(address);
    if (!ethers.isAddress(address)) return;

    setIsValidatingToken(true);
    try {
      const tokenMetadata = await validateTokenAddress(address);
      if (!tokenMetadata) {
        toast({
          title: "Invalid Token",
          description: "Please enter a valid ERC20 token address",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsValidatingToken(false);
    }
  }, [validateTokenAddress, toast]);

  const addCharacteristic = useCallback(() => {
    if (characteristicTitle && characteristicLink) {
      setCharacteristics(prev => [...prev, { title: characteristicTitle, link: characteristicLink }]);
      setCharacteristicTitle('');
      setCharacteristicLink('');
    }
  }, [characteristicTitle, characteristicLink]);

  const removeCharacteristic = useCallback((index: number) => {
    setCharacteristics(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addMembershipCondition = useCallback(async () => {
    if (!tokenAddress || !requiredBalance) return;

    const tokenMetadata = await validateTokenAddress(tokenAddress);
    if (!tokenMetadata) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid ERC20 token address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setMembershipConditions(prev => [...prev, {
      tokenAddress,
      requiredBalance,
      symbol: tokenMetadata.symbol || undefined
    }]);
    setTokenAddress('');
    setRequiredBalance('');
  }, [tokenAddress, requiredBalance, validateTokenAddress, toast]);

  const removeMembershipCondition = useCallback((index: number) => {
    setMembershipConditions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const submitToIPFS = async (data: any) => {
    try {
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const result = await response.json();
      return result.cid;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!user?.wallet?.address) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmissionState('ipfs');
      const entityData = {
        name: entityName,
        characteristics,
        membershipConditions: membershipConditions.map(({ tokenAddress, requiredBalance }) => ({
          tokenAddress,
          requiredBalance
        }))
      };

      const cid = await submitToIPFS(entityData);
      setIpfsCid(cid);

      setSubmissionState('transaction');
      const membraneAddress = deployments.Membrane[chainId];
      if (!membraneAddress) {
        throw new Error(`No Membrane contract address found for chainId ${chainId}`);
      }

      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      const membraneContract = new Contract(
        membraneAddress,
        ABIs.Membrane,
        signer
      );

      const tokens = membershipConditions.map(c => c.tokenAddress);
      const balances = membershipConditions.map(c => 
        ethers.parseUnits(c.requiredBalance, 18)
      );

      const tx = await membraneContract.createMembrane(tokens, balances, cid);
      setSubmissionState('confirming');

      const receipt = await provider.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        const logs = receipt.logs;
        const contractInterface = new ethers.Interface(ABIs.Membrane);
        const event = logs.find(log => {
          try {
            const parsedLog = contractInterface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            return parsedLog?.name === 'MembraneCreated';
          } catch {
            return false;
          }
        });

        if (event) {
          const parsedEvent = contractInterface.parseLog({
            topics: event.topics as string[],
            data: event.data
          });

          const newMembraneId = parsedEvent?.args?.membraneId?.toString();
          if (newMembraneId) {
            setMembraneId(newMembraneId);
            setSubmissionState('complete');

            // Store in localStorage
            try {
              localStorage.setItem('lastMembraneId', newMembraneId);
            } catch (err) {
              console.error('Failed to store membrane ID:', err);
            }

            toast({
              title: "Entity Created",
              description: "Your entity has been successfully created",
              status: "success",
              duration: 5000,
              isClosable: true,
            });

            onSubmit({
              entityName,
              characteristics,
              membershipConditions,
              membraneId: newMembraneId
            });
          } else {
            throw new Error('Could not parse membrane ID from event');
          }
        } else {
          throw new Error('Membrane creation event not found in transaction receipt');
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error creating entity:', error);
      setError(error.message || 'Transaction failed');
      setSubmissionState('idle');

      toast({
        title: "Error",
        description: error.message || "Failed to create entity",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>Define Entity</Heading>
          <Text color="gray.600">Create a new entity with membership conditions</Text>
        </Box>

        <FormControl isRequired>
          <FormLabel>Entity Name</FormLabel>
          <Input
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="Enter entity name"
          />
        </FormControl>

        <Box p={4} bg="gray.50" borderRadius="md">
          <FormLabel>Characteristics</FormLabel>
          <VStack spacing={4}>
            <HStack width="full">
              <Input
                placeholder="Title"
                value={characteristicTitle}
                onChange={(e) => setCharacteristicTitle(e.target.value)}
              />
              <Input
                placeholder="Link"
                value={characteristicLink}
                onChange={(e) => setCharacteristicLink(e.target.value)}
              />
              <Button
                onClick={addCharacteristic}
                colorScheme="purple"
                variant="ghost"
                isDisabled={!characteristicTitle || !characteristicLink}
              >
                <Plus size={16} />
              </Button>
            </HStack>

            {characteristics.length > 0 && (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Link</Th>
                    <Th width="50px"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {characteristics.map((char, index) => (
                    <Tr key={index}>
                      <Td>{char.title}</Td>
                      <Td>
                        <Link
                          href={char.link}
                          isExternal
                          color="blue.500"
                          display="flex"
                          alignItems="center"
                        >
                          {char.link.length > 30 ? `${char.link.substring(0, 30)}...` : char.link}
                          <LinkIcon size={14} className="ml-1" />
                        </Link>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeCharacteristic(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </VStack>
        </Box>

        <Box p={4} bg="gray.50" borderRadius="md">
          <FormLabel>Membership Conditions</FormLabel>
          <VStack spacing={4}>
            <HStack width="full">
              <Input
                placeholder="Token Address"
                value={tokenAddress}
                onChange={(e) => handleTokenAddressChange(e.target.value)}
                isDisabled={isValidatingToken}
              />
              <Input
                placeholder="Required Balance"
                value={requiredBalance}
                type="number"
                onChange={(e) => setRequiredBalance(e.target.value)}
                isDisabled={isValidatingToken}
              />
              <Button
                onClick={addMembershipCondition}
                colorScheme="purple"
                variant="ghost"
                isDisabled={!tokenAddress || !requiredBalance || isValidatingToken}
                isLoading={isValidatingToken}
              >
                <Plus size={16} />
              </Button>
            </HStack>

            {membershipConditions.length > 0 && (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Token</Th>
                    <Th>Required Balance</Th>
                    <Th width="50px"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {membershipConditions.map((condition, index) => (
                    <Tr key={index}>
                      <Td>
                        <HStack spacing={2}>
                          <Text>{condition.symbol || 'Token'}</Text>
                          <Text color="gray.500" fontSize="sm">
                            ({condition.tokenAddress.slice(0, 6)}...{condition.tokenAddress.slice(-4)})
                          </Text>
                        </HStack>
                      </Td>
                      <Td>{condition.requiredBalance}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeMembershipCondition(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </VStack>
        </Box>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Button
          colorScheme="purple"
          onClick={handleSubmit}
          isLoading={submissionState !== 'idle'}
          loadingText={
            submissionState === 'ipfs' ? 'Uploading to IPFS...' :
            submissionState === 'transaction' ? 'Creating Membrane...' :
            submissionState === 'confirming' ? 'Confirming Transaction...' :
            'Processing...'
          }
          isDisabled={
            !entityName ||
            characteristics.length === 0 ||
            submissionState !== 'idle'
          }
        >
          Create Entity
        </Button>

        {submissionState !== 'idle' && submissionState !== 'complete' && (
          <Box>
            <Progress
              value={
                submissionState === 'ipfs' ? 25 :
                submissionState === 'transaction' ? 50 :
                submissionState === 'confirming' ? 75 : 0
              }
              size="xs"
              colorScheme="purple"
              borderRadius="full"
              hasStripe
              isAnimated
            />
            <Text mt={2} fontSize="sm" textAlign="center" color="gray.600">
              {submissionState === 'ipfs' ? 'Uploading to IPFS...' :
               submissionState === 'transaction' ? 'Creating membrane...' :
               submissionState === 'confirming' ? 'Confirming transaction...' : ''}
            </Text>
          </Box>
        )}

        {submissionState === 'complete' && (
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="flex-start"
            borderRadius="md"
            p={4}
          >
            <VStack align="start" spacing={4} w="100%">
              <HStack>
                <AlertIcon />
                <Text fontWeight="bold">Entity created successfully!</Text>
              </HStack>
              
              <Box bg="gray.50" p={4} borderRadius="md" w="100%">
                <FormControl>
                  <FormLabel>Membrane ID</FormLabel>
                  <HStack>
                    <Input
                      value={membraneId}
                      isReadOnly
                      bg="white"
                      fontFamily="mono"
                    />
                    <Button
                      onClick={() => copyToClipboard(membraneId)}
                      variant="ghost"
                      colorScheme="purple"
                      size="md"
                      leftIcon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                    >
                      {hasCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </HStack>
                </FormControl>

                <Box mt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Entity Summary:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">• Name: {entityName}</Text>
                    <Text fontSize="sm">• Characteristics: {characteristics.length}</Text>
                    <Text fontSize="sm">• Membership Conditions: {membershipConditions.length}</Text>
                  </VStack>
                </Box>

                <Button
                  size="sm"
                  variant="link"
                  colorScheme="blue"
                  onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsCid}`)}
                  leftIcon={<ExternalLink size={14} />}
                  mt={4}
                >
                  View on IPFS
                </Button>
              </Box>
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default DefineEntity;