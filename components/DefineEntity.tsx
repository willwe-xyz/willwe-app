// File: /components/DefineEntity.tsx
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
  Link,
  IconButton,
  Code,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  Trash2,
  Plus,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { useContractOperations } from '../hooks/useContractOperations';
import { validateTokenWithCache } from '../utils/tokenValidation';

interface DefineEntityProps {
  chainId: string;
  onSuccess?: () => void;
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

export const DefineEntity: React.FC<DefineEntityProps> = ({
  chainId,
  onSuccess
}) => {
  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');
  const [createdMembraneId, setCreatedMembraneId] = useState<string>('');

  const { executeContractCall, isLoading } = useContractOperations(chainId);
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

    try {
      const tokenInfo = await validateTokenWithCache(newTokenAddress, chainId);
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

  // Create membrane
  const handleCreateMembrane = async () => {
    if (!entityName || membershipConditions.length === 0) {
      toast({
        title: 'Error',
        description: 'Entity name and at least one membership condition are required',
        status: 'error',
        duration: 3000
      });
      return;
    }

    try {
      // Prepare metadata
      const metadata = {
        name: entityName,
        characteristics,
        membershipConditions
      };

      // Upload to IPFS
      const ipfsResult = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadata }),
      });

      if (!ipfsResult.ok) throw new Error('Failed to upload metadata');
      const { cid } = await ipfsResult.json();

      // Create membrane
      const result = await executeContractCall(
        'Membrane',
        'createMembrane',
        [
          membershipConditions.map(mc => mc.tokenAddress),
          membershipConditions.map(mc => 
            ethers.parseUnits(mc.requiredBalance, 18)
          ),
          cid
        ],
        {
          successMessage: 'Entity created successfully',
          onSuccess: () => {
            onSuccess?.();
            if (result.data?.membraneId) {
              setCreatedMembraneId(result.data.membraneId);
            }
          }
        }
      );

    } catch (error: any) {
      console.error('Entity creation error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 200px)">
      <Box overflowY="auto" flex={1} pb="200px">
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
                            aria-label="Delete characteristic"
                            icon={<Trash2 size={18} />}
                            onClick={() => setCharacteristics(prev => 
                              prev.filter((_, i) => i !== idx)
                            )}
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
                            onClick={() => setMembershipConditions(prev => 
                              prev.filter((_, i) => i !== idx)
                            )}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {/* Creation Result */}
            {createdMembraneId && (
              <Alert status="success">
                <AlertIcon />
                <VStack align="stretch" width="100%" spacing={2}>
                  <Text>Entity successfully created</Text>
                  <HStack>
                    <Text fontWeight="bold">Membrane ID:</Text>
                    <Code maxW="300px" isTruncated>
                      {createdMembraneId}
                    </Code>
                    <Tooltip label="Copy to clipboard">
                      <IconButton
                        aria-label="Copy membrane ID"
                        icon={<Copy size={14} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(createdMembraneId);
                          toast({
                            title: "Copied",
                            status: "success",
                            duration: 2000,
                          });
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Footer with Create Button */}
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
          onClick={handleCreateMembrane}
          isLoading={isLoading}
          loadingText="Creating Entity"
          isDisabled={!entityName || membershipConditions.length === 0}
          width="100%"
          size="lg"
        >
          Create Entity
        </Button>
        {isLoading && (
          <Progress size="xs" isIndeterminate colorScheme="purple" mt={2} />
        )}
      </Box>
    </Box>
  );
};

export default DefineEntity;