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
  Link,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { Trash2, Plus, ExternalLink, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { 
  createPublicClient, 
  http,
  parseAbi,
  isAddress,
} from 'viem';
import { Contract } from 'ethers';
import { deployments, getChainById, ABIs } from '../config/deployments';

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
  chainId: string;
  onSubmit?: (data: EntityData) => void;
}

export const DefineEntity: React.FC<DefineEntityProps> = ({ chainId }) => {
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

  const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
  const chain = getChainById(cleanChainId);
  const membraneAbi = ABIs["Membrane"];
  
  const publicClient = createPublicClient({
    chain,
    transport: http()
  });


  const waitForTransaction = async (provider: any, txHash: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          const receipt = await provider.getTransactionReceipt(txHash);
          if (receipt) {
            resolve(receipt);
          } else {
            setTimeout(checkReceipt, 2000); 
          }
        } catch (error) {
          reject(error);
        }
      };
      checkReceipt();
    });
  };

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

  const validateTokenAddress = useCallback(async (address: string) => {
    if (!isAddress(address)) return null;

    try {
      const tokenAbi = parseAbi([
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)'
      ]);

      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: 'symbol'
        }),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: 'decimals'
        })
      ]);

      return { address, symbol, decimals };
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }, [publicClient]);

  const handleTokenAddressChange = useCallback(async (address: string) => {
    setTokenAddress(address);
    if (!isAddress(address)) return;

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
      symbol: tokenMetadata.symbol as string || undefined
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

      if (!response.ok) throw new Error('Failed to upload to IPFS');
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
  
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
  
      const tokens = membershipConditions.map(c => c.tokenAddress);
      const balances = membershipConditions.map(c => 
        BigInt(c.requiredBalance) * BigInt(10 ** 18)
      );
  
      console.log('Sending transaction with args:', { tokens, balances, cid });
  
      const contract = new Contract(
        deployments.Membrane[cleanChainId],
        membraneAbi,
        signer
      );
  
      setSubmissionState('confirming');
      
      const tx = await contract.createMembrane(tokens, balances, cid);
      console.log('Transaction sent:', tx.hash);
  
      const receipt = await waitForTransaction(provider, tx.hash);
      console.log('Transaction receipt:', receipt);
  
      if (receipt && (receipt.status === 1 || receipt.status === true)) {
        const membraneAddress = deployments.Membrane[cleanChainId];
        const relevantLogs = receipt.logs.filter(log => 
          log.address.toLowerCase() === membraneAddress.toLowerCase()
        );
  
        console.log('Relevant logs:', relevantLogs);
  
        if (relevantLogs.length > 0) {
          for (const log of relevantLogs) {
            try {
              const parsedLog = contract.interface.parseLog(log);
              console.log('Parsed log:', parsedLog);
  
              if (parsedLog && parsedLog.name === 'MembraneCreated') {
                const membraneId = parsedLog.args[0].toString();
                console.log('Found membrane ID:', membraneId);
  
                setMembraneId(membraneId);
                setSubmissionState('complete');

                
                toast({
                  title: "Entity Created",
                  description: "Your entity has been successfully created",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                });
                return;
              }
            } catch (parseError) {
              console.warn('Error parsing log:', parseError);
              continue;
            }
          }
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
          <FormLabel>Membership Conditions (Optional)</FormLabel>
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
          isLoading={submissionState === 'transaction' }
          loadingText={
            submissionState === 'ipfs' ? 'Uploading to IPFS...' :
            submissionState === 'transaction' ? 'Creating Membrane...' :
            submissionState === 'confirming' ? 'Confirming Transaction...' :
            submissionState === 'complete' ? 'Create Another Entity' : 'Create Entity'
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
              
              {membraneId && (
                <Box bg="gray.50" p={4} borderRadius="md" w="100%">
                  <FormControl>
                    <FormLabel>Membrane ID</FormLabel>
                    <InputGroup>
                      <Input
                        value={membraneId}
                        isReadOnly
                        pr="4.5rem"
                        fontFamily="mono"
                        bg="white"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => copyToClipboard(membraneId)}
                          leftIcon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                        >
                          {hasCopied ? 'Copied!' : 'Copy'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </Box>
              )}

              <Box bg="gray.50" p={4} borderRadius="md" w="100%">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Entity Summary:
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">• Name: {entityName}</Text>
                  <Text fontSize="sm">• Characteristics: {characteristics.length}</Text>
                  <Text fontSize="sm">• Membership Conditions: {membershipConditions.length}</Text>
                </VStack>

                <Box mt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Usage Instructions:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">• Use this Membrane ID with spawnBranchWithMembrane</Text>
                    <Text fontSize="sm">• Or set as membrane via signal</Text>
                  </VStack>
                </Box>

                {ipfsCid && (
                  <Button
                    size="sm"
                    variant="link"
                    colorScheme="blue"
                    onClick={() => window.open(`https://underlying-tomato-locust.myfilebase.com/ipfs/${ipfsCid}`)}
                    leftIcon={<ExternalLink size={14} />}
                    mt={4}
                  >
                    View on IPFS
                  </Button>
                )}
              </Box>
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default DefineEntity;