import React, { useState, useCallback, useEffect } from 'react';
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
  useToast,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Badge,
  Code,
  Divider,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { 
  Trash2, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Link as LinkIcon,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { isAddress } from 'viem';
import { ethers } from 'ethers';
import { useTransaction } from '../contexts/TransactionContext';
import { useContractOperation } from '../hooks/useContractOperation';
import { deployments } from '../config/contracts';
import { validateToken } from '../utils/tokenValidation';

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
}

interface DefineEntityProps {
  chainId: string;
  onSubmit?: (data: EntityData) => void;
}

export const DefineEntity: React.FC<DefineEntityProps> = ({ chainId }) => {
  // State
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
  const [submissionState, setSubmissionState] = useState<'idle' | 'ipfs' | 'transaction' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string>('');
  const [membraneId, setMembraneId] = useState<string>('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // Hooks
  const { user, authenticated, ready } = usePrivy();
  const { isTransacting } = useTransaction();
  const executeOperation = useContractOperation({
    contractName: 'Membrane',
    successMessage: 'Entity created successfully'
  });
  const toast = useToast();

  // Clean chainId
  const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;

  // Handle token validation
  const handleTokenAddressChange = useCallback(async (address: string) => {
    setTokenAddress(address);
    if (!isAddress(address)) return;

    setIsValidatingToken(true);
    try {
      const tokenInfo = await validateToken(address, cleanChainId);
      if (!tokenInfo) {
        toast({
          title: "Invalid Token",
          description: "Please enter a valid ERC20 token address",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Token validation error:', error);
    } finally {
      setIsValidatingToken(false);
    }
  }, [cleanChainId, toast]);

  // Handle characteristics
  const addCharacteristic = useCallback(() => {
    if (characteristicTitle && characteristicLink) {
      setCharacteristics(prev => [...prev, { 
        title: characteristicTitle, 
        link: characteristicLink 
      }]);
      setCharacteristicTitle('');
      setCharacteristicLink('');
    }
  }, [characteristicTitle, characteristicLink]);

  const removeCharacteristic = useCallback((index: number) => {
    setCharacteristics(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle membership conditions
  const addMembershipCondition = useCallback(async () => {
    if (!tokenAddress || !requiredBalance) return;

    try {
      const tokenInfo = await validateToken(tokenAddress, cleanChainId);
      if (!tokenInfo) {
        throw new Error("Invalid token address");
      }

      setMembershipConditions(prev => [...prev, {
        tokenAddress,
        requiredBalance,
        symbol: tokenInfo.symbol
      }]);

      setTokenAddress('');
      setRequiredBalance('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate token",
        status: "error",
        duration: 3000,
      });
    }
  }, [tokenAddress, requiredBalance, cleanChainId, toast]);

  const removeMembershipCondition = useCallback((index: number) => {
    setMembershipConditions(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle submission
  const handleSubmit = async () => {
    if (!authenticated || !ready) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setSubmissionState('ipfs');
      
      // Prepare and upload metadata
      const metadata = {
        name: entityName,
        characteristics,
        membershipConditions: membershipConditions.map(({ tokenAddress, requiredBalance }) => ({
          tokenAddress,
          requiredBalance
        }))
      };

      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadata }),
      });

      if (!response.ok) throw new Error('Failed to upload to IPFS');
      const { cid } = await response.json();
      setIpfsCid(cid);
      
      setSubmissionState('transaction');

      // Execute contract operation
      const tokens = membershipConditions.map(c => c.tokenAddress);
      const balances = membershipConditions.map(c => c.requiredBalance);

      const tx = await executeOperation(
        cleanChainId,
        'createMembrane',
        [tokens, balances, cid],
        { gasLimit: 500000 }
      );

      setTransactionHash(tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        const membraneAddress = deployments.Membrane[cleanChainId];
        const membraneEvent = receipt.logs.find(log => 
          log.topics[0] === ethers.id('MembraneCreated(uint256,string)')
        );

        if (membraneEvent) {
          const createdMembraneId = ethers.decodeEventLog(
            ['uint256', 'string'],
            membraneEvent.data,
            membraneEvent.topics
          )[0].toString();

          setMembraneId(createdMembraneId);
          setSubmissionState('complete');

          toast({
            title: "Success",
            description: "Entity created successfully",
            status: "success",
            duration: 5000,
          });
        }
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
      });
    }
  };

  // Reset form on completion
  useEffect(() => {
    if (submissionState === 'complete') {
      const timer = setTimeout(() => {
        setEntityName('');
        setCharacteristics([]);
        setMembershipConditions([]);
        setError(null);
        setSubmissionState('idle');
        setIpfsCid('');
        setMembraneId('');
        setTransactionHash('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [submissionState]);

  // Copy to clipboard
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

  // Compute states
  const isLoading = submissionState !== 'idle' && submissionState !== 'complete' || isTransacting;
  const isSubmitDisabled = !entityName || 
    characteristics.length === 0 || 
    membershipConditions.length === 0 || 
    isLoading || 
    !authenticated || 
    !ready;

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        {/* Entity Name */}
        <FormControl isRequired>
          <FormLabel>Entity Name</FormLabel>
          <Input
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="Enter entity name"
            isDisabled={isLoading}
          />
        </FormControl>

        {/* Characteristics */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <FormLabel>Characteristics</FormLabel>
          <VStack spacing={4}>
            <HStack width="full">
              <Input
                placeholder="Title"
                value={characteristicTitle}
                onChange={(e) => setCharacteristicTitle(e.target.value)}
                isDisabled={isLoading}
              />
              <Input
                placeholder="Link"
                value={characteristicLink}
                onChange={(e) => setCharacteristicLink(e.target.value)}
                isDisabled={isLoading}
              />
              <IconButton
                aria-label="Add characteristic"
                icon={<Plus size={16} />}
                onClick={addCharacteristic}
                isDisabled={!characteristicTitle || !characteristicLink || isLoading}
                colorScheme="purple"
              />
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
                          {char.link.length > 30 ? 
                            `${char.link.substring(0, 30)}...` : 
                            char.link}
                          <ExternalLink size={14} className="ml-1" />
                        </Link>
                      </Td>
                      <Td>
                        <IconButton
                          aria-label="Remove characteristic"
                          icon={<Trash2 size={14} />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeCharacteristic(index)}
                          isDisabled={isLoading}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </VStack>
        </Box>

        {/* Membership Conditions */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <FormLabel>Membership Conditions</FormLabel>
          <VStack spacing={4}>
            <HStack width="full">
              <InputGroup>
                <Input
                  placeholder="Token Address"
                  value={tokenAddress}
                  onChange={(e) => handleTokenAddressChange(e.target.value)}
                  isDisabled={isLoading || isValidatingToken}
                />
                {isValidatingToken && (
                  <InputRightElement>
                    <RefreshCw size={16} className="animate-spin" />
                  </InputRightElement>
                )}
              </InputGroup>
              <Input
                placeholder="Required Balance"
                value={requiredBalance}
                type="number"
                onChange={(e) => setRequiredBalance(e.target.value)}
                isDisabled={isLoading || isValidatingToken}
              />
              <IconButton
                aria-label="Add condition"
                icon={<Plus size={16} />}
                onClick={addMembershipCondition}
                isDisabled={!tokenAddress || !requiredBalance || isLoading || isValidatingToken}
                colorScheme="purple"
              />
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
                          <Badge colorScheme="purple">
                            {condition.symbol || 'Token'}
                          </Badge>
                          <Text fontSize="sm" color="gray.500">
                            {condition.tokenAddress.slice(0, 6)}...
                            {condition.tokenAddress.slice(-4)}
                          </Text>
                          <IconButton
                            aria-label="Copy address"
                            icon={<Copy size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(condition.tokenAddress)}
                          />
                        </HStack>
                      </Td>
                      <Td isNumeric>{condition.requiredBalance}</Td>
                      <Td>
                        <IconButton
                          aria-label="Remove condition"
                          icon={<Trash2 size={14} />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeMembershipCondition(index)}
                          isDisabled={isLoading}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </Box>
  
          {/* Error Display */}
          {error && (
            <Alert status="error" variant="left-accent">
              <AlertIcon as={AlertTriangle} />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Error creating entity</Text>
                <Text fontSize="sm">{error}</Text>
              </VStack>
            </Alert>
          )}
  
          {/* Progress Indicator */}
          {submissionState !== 'idle' && submissionState !== 'complete' && (
            <Box>
              <Progress 
                size="xs" 
                isIndeterminate={submissionState === 'transaction'}
                value={submissionState === 'ipfs' ? 33 : 66}
                colorScheme="purple"
              />
              <Text mt={2} fontSize="sm" textAlign="center" color="gray.600">
                {submissionState === 'ipfs' ? 'Uploading to IPFS...' :
                 submissionState === 'transaction' ? 'Creating membrane...' : ''}
              </Text>
            </Box>
          )}
  
          {/* Success State */}
          {submissionState === 'complete' && (
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="flex-start"
              p={4}
              borderRadius="md"
            >
              <VStack align="start" spacing={4} w="100%">
                <HStack>
                  <AlertIcon />
                  <Text fontWeight="bold">Entity created successfully!</Text>
                </HStack>
                
                {/* Membrane ID */}
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
                            leftIcon={hasCopied ? <Check size={12} /> : <Copy size={12} />}
                          >
                            {hasCopied ? 'Copied!' : 'Copy'}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </Box>
                )}
  
                {/* Transaction Details */}
                {transactionHash && (
                  <Box bg="gray.50" p={4} borderRadius="md" w="100%">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Transaction Details:
                    </Text>
                    <Text fontSize="sm" mb={2}>
                      Hash: <Code>{transactionHash}</Code>
                    </Text>
                    <Link
                      href={`https://explorer.testnet.mantle.xyz/tx/${transactionHash}`}
                      isExternal
                      color="purple.500"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                    >
                      View on Explorer <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </Box>
                )}
  
                {/* IPFS Link */}
                {ipfsCid && (
                  <Box bg="gray.50" p={4} borderRadius="md" w="100%">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      IPFS Details:
                    </Text>
                    <Link
                      href={`https://underlying-tomato-locust.myfilebase.com/ipfs/${ipfsCid}`}
                      isExternal
                      color="purple.500"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                    >
                      View Metadata <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </Box>
                )}
  
                <Divider />
  
                {/* Usage Instructions */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Next Steps:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">• Use this Membrane ID when spawning nodes</Text>
                    <Text fontSize="sm">• Set as membrane via signal</Text>
                    <Text fontSize="sm">• Share with other members</Text>
                  </VStack>
                </Box>
              </VStack>
            </Alert>
          )}
  
          {/* Submit Button */}
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={
              submissionState === 'ipfs' ? 'Uploading to IPFS...' :
              submissionState === 'transaction' ? 'Creating Membrane...' :
              'Creating Entity'
            }
            isDisabled={isSubmitDisabled}
            size="lg"
          >
            Create Entity
          </Button>
        </VStack>
      </Box>
    );
  };
  
  export default DefineEntity;