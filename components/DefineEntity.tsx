// File: ./components/DefineEntity.tsx

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
  Badge,
  useToast,
  Link,
  IconButton,
  Code,
  Tooltip,
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
import { useTransaction } from '../contexts/TransactionContext'; // Updated import
import { validateToken } from '../utils/tokenValidation';
import { getExplorerLink, deployments, ABIs } from '../config/contracts';

interface DefineEntityProps {
  chainId: string;
  onSuccess?: () => void;
}

export const DefineEntity: React.FC<DefineEntityProps> = ({ 
  chainId,
  onSuccess 
}) => {
  // Initialize hooks
  const toast = useToast();
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();

  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Array<{title: string; link: string}>>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<Array<{
    tokenAddress: string;
    requiredBalance: string;
    symbol?: string;
  }>>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  // Handle token validation and addition
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

  // Handle form submission
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
      const metadata = {
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

      // Create membrane using transaction context
      const result = await executeTransaction(
        chainId,
        async () => {
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
            signer
          );

          const tokens = membershipConditions.map(mc => mc.tokenAddress);
          const balances = membershipConditions.map(mc => 
            ethers.parseUnits(mc.requiredBalance, 18).toString()
          );

          return contract.createMembrane(tokens, balances, cid);
        },
        {
          successMessage: 'Entity created successfully',
          errorMessage: 'Failed to create entity',
          onSuccess
        }
      );

      if (result) {
        // Clear form
        setEntityName('');
        setCharacteristics([]);
        setMembershipConditions([]);
      }

    } catch (error: any) {
      console.error('Entity creation error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 200px)">
      <Box overflowY="auto" flex="1" pb="200px">
        <Box p={6}>
          <VStack spacing={6} align="stretch">
            {/* Entity Name Input */}
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
                <Button
                  colorScheme="purple"
                  onClick={() => {
                    if (newCharTitle && newCharLink) {
                      setCharacteristics([...characteristics, { title: newCharTitle, link: newCharLink }]);
                      setNewCharTitle('');
                      setNewCharLink('');
                    }
                  }}
                >
                  Add
                </Button>
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
                            aria-label="Remove characteristic"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setCharacteristics(chars => chars.filter((_, i) => i !== idx))}
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
                    {membershipConditions.map((condition, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <HStack>
                            <Badge colorScheme="purple">{condition.symbol || 'Unknown'}</Badge>
                            <Code>{condition.tokenAddress.slice(0, 6)}...{condition.tokenAddress.slice(-4)}</Code>
                          </HStack>
                        </Td>
                        <Td>{condition.requiredBalance}</Td>
                        <Td>
                          <IconButton
                            aria-label="Remove condition"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setMembershipConditions(conditions => 
                              conditions.filter((_, i) => i !== idx)
                            )}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              colorScheme="purple"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Creating Entity..."
              isDisabled={!entityName || membershipConditions.length === 0}
            >
              Create Entity
            </Button>

            {isLoading && (
              <Progress size="xs" isIndeterminate colorScheme="purple" />
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default DefineEntity;