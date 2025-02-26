import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
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
  IconButton,
  Code,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";

import {
  Trash2,
  Plus,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { validateToken } from '../utils/tokenValidation';
import { getExplorerLink } from '../config/contracts';

interface DefineEntityProps {
  chainId: string;
  onSubmit?: () => void;
}

interface Characteristic {
  title: string;
  link: string;
}

interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol?: string;
}

interface EntityMetadata {
  name: string;
  characteristics: Characteristic[];
  membershipConditions: MembershipCondition[];
}

export const DefineEntity: React.FC<DefineEntityProps> = ({ chainId, onSubmit }) => {
  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<{ 
    membraneId?: string;
    txHash: string;
    timestamp: number;
  } | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  // Hooks
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const toast = useToast();

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

      console.log('Token validated and added:', tokenInfo);

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

  // Form submission
  const handleSubmit = async () => {
    if (!authenticated || !ready) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!entityName || characteristics.length === 0) {
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
      console.log('Starting membrane creation...', {
        entityName,
        membershipConditions,
        characteristics
      });

      // Prepare metadata
      const metadata: EntityMetadata = {
        name: entityName,
        characteristics,
        membershipConditions
      };

      // Upload to IPFS
      console.log('Uploading metadata to IPFS...');
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadata }),
      });

      if (!response.ok) throw new Error('Failed to upload metadata');
      const { cid } = await response.json();
      console.log('Metadata uploaded to IPFS:', { cid });

      // Get contract instance
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      const membraneAddress = deployments.Membrane[cleanChainId];

      if (!membraneAddress) {
        throw new Error(`No Membrane contract found for chain ${chainId}`);
      }

      
      const contract = new ethers.Contract(
        membraneAddress,
        ABIs.Membrane,
        signer as unknown as ethers.Signer
      );

      // Prepare transaction parameters
      const tokens = membershipConditions.map(mc => mc.tokenAddress.toLowerCase());
      const balances = membershipConditions.map(mc => 
        ethers.parseUnits(mc.requiredBalance, 18)
      );

      console.log('Creating membrane with parameters:', {
        tokens,
        balances,
        cid
      });

      // Send transaction
      const tx = await contract.createMembrane(tokens, balances, cid);
      console.log('Transaction sent:', tx.hash);

      // Show pending toast
      const pendingToastId = toast({
        title: 'Transaction Pending',
        description: 'Creating membrane...',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      try {
        // Wait for confirmation differently
        const receipt = await provider.waitForTransaction(tx.hash);
        console.log('Transaction confirmed:', receipt);

        // Close pending toast
        toast.close(pendingToastId);

        // Find MembraneCreated event
        console.log('Transaction receipt logs:', JSON.stringify(receipt.logs, null, 2));
        
        // The event signature for MembraneCreated(address,uint256,string)
        const membraneCreatedSignature = ethers.id("MembraneCreated(address,uint256,string)");
        
        const membraneCreatedEvent = receipt.logs.find((log: any) => {
          try {
            console.log('Checking log topic:', log.topics[0]);
            console.log('Expected topic:', membraneCreatedSignature);
            return log.topics[0] === membraneCreatedSignature;
          } catch (e) {
            console.error('Error checking log topic:', e);
            return false;
          }
        });

        if (!membraneCreatedEvent) {
          console.log('All log topics:', receipt.logs.map((log: any) => log.topics[0]));
          throw new Error('Could not find membrane ID in transaction logs');
        }

        console.log('Found membrane event:', membraneCreatedEvent);
        
        // Extract membraneId from the data field since parameters are not indexed
        let membraneId;
        try {
          // According to the ABI, the parameters are not indexed, so they're in the data field
          // We need to decode the data field which contains all parameters
          const abiCoder = ethers.AbiCoder.defaultAbiCoder();
          
          // The data contains [address creator, uint256 membraneId, string CID]
          const decodedData = abiCoder.decode(
            ['address', 'uint256', 'string'], 
            membraneCreatedEvent.data
          );
          
          console.log('Decoded event data:', decodedData);
          
          // The membraneId is the second parameter (index 1)
          membraneId = decodedData[1].toString();
          
          if (!membraneId) {
            throw new Error('Could not extract membrane ID from event data');
          }
        } catch (error) {
          console.error('Error extracting membrane ID:', error);
          throw new Error('Failed to parse membrane ID from transaction logs');
        }
        
        console.log('Membrane created with ID:', membraneId);

        setCreationResult({
          membraneId,
          txHash: receipt.transactionHash,
          timestamp: Date.now()
        });

        toast({
          title: 'Success',
          description: 'Entity created successfully',
          status: 'success',
          duration: 5000,
          icon: <Check size={16} />,
        });

        if (onSubmit) {
          onSubmit();
        }

      } catch (waitError) {
        console.error('Transaction confirmation error:', waitError);
        toast.close(pendingToastId);
        throw new Error('Transaction failed during confirmation');
      }

    } catch (error: any) {
      console.error('Entity creation error:', error);
      setError(error.message);
      toast({
        title: 'Failed to Create Entity',
        description: error.message || 'Transaction failed',
        status: 'error',
        duration: 5000,
        icon: <AlertTriangle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 200px)">
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Text fontSize="2xl" fontWeight="bold">Define Entity</Text>
        <Text color="gray.600">Configure membrane requirements</Text>
      </Box>

      <Box overflowY="auto" flex="1" pb="160px">
        <Box p={6}>
          <VStack spacing={6} align="stretch">
            {/* Entity Name */}
            <FormControl isRequired>
              <FormLabel>Entity Name</FormLabel>
              <Input
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Enter entity name"
              />
            </FormControl>

            {/* Characteristics Section */}
            <Box>
              <FormLabel>Characteristics</FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="label"
                  value={newCharTitle}
                  onChange={(e) => setNewCharTitle(e.target.value)}
                />
                <Input
                  placeholder="url"
                  value={newCharLink}
                  onChange={(e) => setNewCharLink(e.target.value)}
                />
                <IconButton
                  aria-label="Add characteristic"
                  icon={<Plus size={20} />}
                  onClick={addCharacteristic}
                  isDisabled={!newCharTitle || !newCharLink}
                />
              </HStack>

              {characteristics.length > 0 && (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Link</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {characteristics.map((char, idx) => (
                      <Tr key={idx}>
                        <Td>{char.title}</Td>
                        <Td>
                          <Link href={char.link} isExternal color="purple.500">
                            {char.link.substring(0, 30)}...
                            <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                          </Link>
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Delete characteristic"
                            icon={<Trash2 size={18} />}
                            onClick={() => setCharacteristics(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            <Divider />

            {/* Membership Conditions Section */}
            <Box>
              <FormLabel>Membership Conditions</FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="Token address"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                />
                <Input
                  placeholder="Required balance"
                  value={newTokenBalance}
                  onChange={(e) => setNewTokenBalance(e.target.value)}
                />
                <Button
                  colorScheme="purple"
                  onClick={validateAndAddToken}
                  isLoading={validatingToken}
                  isDisabled={!newTokenAddress || !newTokenBalance}
                >
                  Add
                </Button>
              </HStack>

              {membershipConditions.length > 0 && (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Token</Th>
                      <Th>Required Balance</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {membershipConditions.map((mc, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <Code>{mc.symbol ? `${mc.symbol} (${mc.tokenAddress})` : mc.tokenAddress}</Code>
                        </Td>
                        <Td>{mc.requiredBalance}</Td>
                        <Td>
                          <IconButton
                            aria-label="Delete condition"
                            icon={<Trash2 size={18} />}
                            onClick={() => setMembershipConditions(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            <Divider />

            {/* Form submission */}
            <Button
              colorScheme="purple"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Creating Entity"
              isDisabled={!entityName || characteristics.length === 0 || isLoading}
            >
              Submit
            </Button>

            {isLoading && <Progress size="xs" isIndeterminate colorScheme="purple" />}

            {/* Display result or error */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {creationResult && (
              <Alert status="success">
                <AlertIcon />
                <VStack align="stretch" width="100%" spacing={2}>
                  <Text>Entity successfully created</Text>
                  <HStack>
                    <Text fontWeight="bold">Membrane ID:</Text>
                    <Code maxW="300px" isTruncated>
                      {creationResult.membraneId}
                    </Code>
                    <Tooltip label="Copy to clipboard">
                      <IconButton
                        aria-label="Copy membrane ID"
                        icon={<Copy size={14} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(creationResult.membraneId!);
                          toast({
                            title: "Copied",
                            status: "success",
                            duration: 2000,
                          });
                        }}
                      />
                    </Tooltip>
                  </HStack>
                  {creationResult.txHash && (
                    <Link 
                      href={getExplorerLink(creationResult.txHash, chainId, 'tx')}
                      isExternal
                      color="purple.500"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                    >
                      View transaction <ExternalLink size={14} style={{ marginLeft: 4 }} />
                    </Link>
                  )}
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default DefineEntity;