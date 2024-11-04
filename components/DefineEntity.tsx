import React, { useState, useCallback, useEffect } from 'react';
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
  Badge,
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
  Info,
} from 'lucide-react';
import { ethers } from 'ethers';
import { useMembraneOperations } from '../hooks/useMembraneOperations';
import { validateToken } from '../utils/tokenValidation';
import { getExplorerLink } from '../config/contracts';

interface DefineEntityProps {
  chainId: string;
  onSubmit?: () => void;
}

interface CreationResult {
  membraneId?: string;
  tokenAddress?: string;
  txHash: string;
  timestamp: number;
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
  const [predictedMembraneId, setPredictedMembraneId] = useState<string | null>(null);

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<CreationResult | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  // Hooks
  const { authenticated, ready } = usePrivy();
  const toast = useToast();
  const { createMembrane } = useMembraneOperations(chainId);

  // Calculate membrane ID based on current conditions
  const calculateMembraneId = useCallback(async () => {
    try {
      if (!entityName || membershipConditions.length === 0) {
        setPredictedMembraneId(null);
        return null;
      }

      // Prepare metadata
      const metadata: EntityMetadata = {
        name: entityName,
        characteristics,
        membershipConditions
      };

      // Prepare exact input format matching contract
      const struct = {
        tokens: membershipConditions.map(mc => mc.tokenAddress.toLowerCase()),
        balances: membershipConditions.map(mc => ethers.parseUnits(mc.requiredBalance, 18).toString()),
        meta: JSON.stringify(metadata)
      };

      // Important: Match exact contract encoding structure
      const abiCoder = new ethers.AbiCoder();
      const encodedData = abiCoder.encode(
        ['tuple(address[] tokens, uint256[] balances, string meta)'],
        [struct]
      );

      // Get keccak256 hash and convert to decimal string
      const hash = ethers.keccak256(encodedData);
      const membraneId = ethers.toBigInt(hash).toString();

      setPredictedMembraneId(membraneId);
      return membraneId;

    } catch (error) {
      console.error('Error calculating membrane ID:', error);
      setPredictedMembraneId(null);
      return null;
    }
  }, [entityName, characteristics, membershipConditions]);

  // Update predicted membrane ID when conditions change
  useEffect(() => {
    calculateMembraneId();
  }, [calculateMembraneId]);

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
    try {
      const tokenInfo = await validateToken(newTokenAddress, chainId);
      if (!tokenInfo) throw new Error('Invalid token address');

      // Check for duplicate token
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

    if (!entityName || membershipConditions.length === 0) {
      toast({
        title: 'Error',
        description: 'Entity name and at least one membership condition are required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare metadata
      const metadata: EntityMetadata = {
        name: entityName,
        characteristics,
        membershipConditions
      };

      // Upload to IPFS
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadata }),
      });

      if (!response.ok) throw new Error('Failed to upload metadata');
      const { cid } = await response.json();

      // Prepare transaction parameters
      const tokens = membershipConditions.map(mc => mc.tokenAddress.toLowerCase());
      const balances = membershipConditions.map(mc => 
        ethers.parseUnits(mc.requiredBalance, 18).toString()
      );

      // Create membrane
      const tx = await createMembrane(tokens, balances, cid);
      const receipt = await tx.wait();

      // Extract membrane ID from event
      const membraneCreatedEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id("MembraneCreated(uint256,string)")
      );

      if (!membraneCreatedEvent) {
        throw new Error('Failed to get membrane ID from transaction');
      }

      const [actualMembraneId] = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256', 'string'],
        membraneCreatedEvent.data
      );

      setCreationResult({
        membraneId: actualMembraneId.toString(),
        txHash: tx.hash,
        timestamp: Date.now()
      });

      toast({
        title: 'Success',
        description: 'Entity created successfully',
        status: 'success',
        duration: 5000,
        icon: <Check size={16} />
      });

      if (onSubmit) {
        onSubmit();
      }

    } catch (error: any) {
      console.error('Entity creation error:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        icon: <AlertTriangle size={16} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 200px)">
      <Box overflowY="auto" flex="1" pb="200px">
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
                  placeholder="Title"
                  value={newCharTitle}
                  onChange={(e) => setNewCharTitle(e.target.value)}
                />
                <Input
                  placeholder="Link"
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
                            aria-label="Remove"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setCharacteristics(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {/* Membership Conditions Section */}
            <Box>
              <FormLabel>
                <HStack>
                  <Text>Membership Conditions</Text>
                  <Tooltip label="Add token requirements for membership">
                    <span>
                      <Info size={14} />
                    </span>
                  </Tooltip>
                </HStack>
              </FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="Token Address"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                />
                <Input
                  placeholder="Required Balance"
                  value={newTokenBalance}
                  type="number"
                  onChange={(e) => setNewTokenBalance(e.target.value)}
                />
                <IconButton
                  aria-label="Add condition"
                  icon={<Plus size={20} />}
                  onClick={validateAndAddToken}
                  isLoading={validatingToken}
                  isDisabled={!newTokenAddress || !newTokenBalance || validatingToken}
                />
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
                    {membershipConditions.map((condition, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <HStack>
                            <Badge colorScheme="purple">{condition.symbol || 'Token'}</Badge>
                            <Text fontSize="sm">
                              {condition.tokenAddress.slice(0, 6)}...{condition.tokenAddress.slice(-4)}
                            </Text>
                            <IconButton
                              aria-label="Copy address"
                              icon={<Copy size={12} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(condition.tokenAddress);
                                toast({
                                  title: 'Copied',
                                  status: 'success',
                                  duration: 2000
                                });
                              }}
                            />
                          </HStack>
                        </Td>
                        <Td>{condition.requiredBalance}</Td>
                        <Td>
                          <IconButton
                            aria-label="Remove"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setMembershipConditions(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {/* Predicted Membrane ID */}
            {predictedMembraneId && (
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Predicted Membrane ID:</Text>
                  <Code fontSize="sm">{predictedMembraneId}</Code>
                </VStack>
              </Alert>
            )}

            {/* Error Display */}
{/* Error Display */}
{error && (
              <Alert status="error" variant="left-accent">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Error creating entity:</Text>
                  <Text fontSize="sm">{error}</Text>
                </VStack>
              </Alert>
            )}

            {/* Creation Result */}
            {creationResult && creationResult.membraneId && (
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                bg="gray.50"
                position="relative"
                overflow="hidden"
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="green.600">
                      <Check size={16} style={{ display: 'inline', marginRight: '8px' }} />
                      Entity Created Successfully
                    </Text>
                    <Badge 
                      colorScheme="purple"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      ID: {creationResult.membraneId}
                    </Badge>
                  </HStack>
                  
                  <Divider />
                  
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Name:</Text>
                      <Text>{entityName}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontWeight="medium">Conditions:</Text>
                      <Text>{membershipConditions.length} token requirement(s)</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontWeight="medium">Transaction:</Text>
                      <Link 
                        href={getExplorerLink(chainId, creationResult.txHash)} 
                        isExternal
                        color="purple.500"
                        display="flex"
                        alignItems="center"
                      >
                        View on Explorer
                        <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                      </Link>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Membrane ID:</Text>
                      <HStack>
                        <Code>{creationResult.membraneId}</Code>
                        <IconButton
                          aria-label="Copy membrane ID"
                          icon={<Copy size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(creationResult.membraneId!);
                            toast({
                              title: 'Copied',
                              description: 'Membrane ID copied to clipboard',
                              status: 'success',
                              duration: 2000,
                            });
                          }}
                        />
                      </HStack>
                    </HStack>
                  </VStack>

                  <Text fontSize="sm" color="gray.500" textAlign="right">
                    Created {new Date(creationResult.timestamp).toLocaleString()}
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Fixed Footer with Submit Button */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        p={6}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="white"
        zIndex={2}
      >
        <Button
          colorScheme="purple"
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="Creating Entity..."
          isDisabled={
            !entityName || 
            membershipConditions.length === 0 || 
            isLoading ||
            !authenticated ||
            !ready
          }
          width="100%"
          size="lg"
        >
          {!authenticated || !ready 
            ? 'Connect Wallet to Continue'
            : isLoading 
              ? 'Creating Entity...'
              : 'Create Entity'
          }
        </Button>
        {isLoading && (
          <Box mt={2}>
            <Progress 
              size="xs" 
              isIndeterminate 
              colorScheme="purple" 
              borderRadius="full"
            />
            <Text
              fontSize="sm"
              color="gray.600"
              textAlign="center"
              mt={1}
            >
              Please confirm the transaction in your wallet
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DefineEntity;