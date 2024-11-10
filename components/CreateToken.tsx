// File: /components/CreateToken.tsx
import React, { useState, useCallback } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Progress,
  Text,
  Alert,
  AlertIcon,
  useToast,
  Heading,
  IconButton,
  Link,
  Code,
} from '@chakra-ui/react';
import { Trash2, Plus, ExternalLink, Check } from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { useContractOperations } from '../hooks/useContractOperations';
import { ERC20Bytecode, ERC20CreateABI } from '../const/envconst';

interface Recipient {
  address: string;
  balance: string;
}

interface CreateTokenProps {
  chainId: string;
  userAddress?: string;
  onSuccess?: () => void;
}

export const CreateToken: React.FC<CreateTokenProps> = ({
  chainId,
  userAddress,
  onSuccess
}) => {
  // Form state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', balance: '' }
  ]);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deployedAddress, setDeployedAddress] = useState<string>('');

  const toast = useToast();
  const { executeContractCall, isLoading } = useContractOperations(chainId);

  // Recipients management
  const addRecipient = useCallback(() => {
    setRecipients(prev => [...prev, { address: '', balance: '' }]);
  }, []);

  const removeRecipient = useCallback((index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRecipientChange = useCallback((index: number, field: keyof Recipient, value: string) => {
    setRecipients(prev => prev.map((recipient, i) => {
      if (i === index) return { ...recipient, [field]: value };
      return recipient;
    }));
  }, []);

  // Calculate total supply
  const totalSupply = recipients.reduce((total, recipient) => {
    return total + (parseFloat(recipient.balance) || 0);
  }, 0);

  // Deploy token
  const deployToken = async () => {
    try {
      setDeploymentState('deploying');

      // Validate inputs
      if (!tokenName || !tokenSymbol) {
        throw new Error('Token name and symbol are required');
      }

      const validRecipients = recipients.filter(r => r.address && r.balance);
      if (validRecipients.length === 0) {
        throw new Error('At least one valid recipient is required');
      }

      // Execute deployment
      const result = await executeContractCall(
        'factory',
        'deploy',
        [
          tokenName,
          tokenSymbol,
          validRecipients.map(r => r.address),
          validRecipients.map(r => ethers.parseUnits(r.balance, 18))
        ],
        {
          successMessage: 'Token deployed successfully',
          onSuccess: () => {
            setDeploymentState('complete');
            onSuccess?.();
          },
          // Pass bytecode and ABI for contract deployment
          deploymentData: {
            bytecode: ERC20Bytecode,
            abi: ERC20CreateABI
          }
        }
      );

      if (result.data) {
        setDeployedAddress(result.data.address);
      }

    } catch (error: any) {
      toast({
        title: "Deployment Failed",
        description: error.message,
        status: "error",
        duration: 5000,
      });
      setDeploymentState('idle');
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      height="calc(100vh - 200px)"
    >
      {/* Header */}
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Heading size="md" mb={2}>Create Token</Heading>
        <Text color="gray.600">Deploy a new ERC20 token with custom distribution</Text>
      </Box>

      {/* Form Content */}
      <Box 
        overflowY="auto"
        flex="1"
        pb="160px"
        p={6}
      >
        <VStack spacing={6} align="stretch">
          {/* Token Details */}
          <FormControl isRequired>
            <FormLabel>Token Name</FormLabel>
            <Input
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Enter token name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Token Symbol</FormLabel>
            <Input
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="Enter token symbol"
            />
          </FormControl>

          {/* Total Supply Display */}
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="medium">
              Total Supply: {totalSupply.toLocaleString()}
            </Text>
          </Box>

          {/* Recipients */}
          {recipients.map((recipient, index) => (
            <Box 
              key={index}
              p={4}
              bg="gray.50"
              borderRadius="md"
            >
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Address</FormLabel>
                  <Input
                    placeholder="0x..."
                    value={recipient.address}
                    onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Balance</FormLabel>
                  <Input
                    placeholder="Amount"
                    value={recipient.balance}
                    type="number"
                    onChange={(e) => handleRecipientChange(index, 'balance', e.target.value)}
                  />
                </FormControl>

                <IconButton
                  aria-label="Remove recipient"
                  icon={<Trash2 size={16} />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeRecipient(index)}
                  alignSelf="flex-end"
                  mb={1}
                />
              </HStack>
            </Box>
          ))}

          <Button
            leftIcon={<Plus size={16} />}
            onClick={addRecipient}
            variant="ghost"
            size="sm"
          >
            Add Recipient
          </Button>

          {/* Deployment Result */}
          {deploymentState === 'complete' && deployedAddress && (
            <Alert status="success" variant="subtle">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Token deployed successfully!</Text>
                <HStack spacing={2} justify="space-between" width="100%">
                  <Code fontFamily="mono" fontSize="sm">
                    {deployedAddress}
                  </Code>
                  <Link
                    href={`https://explorer.base.org/address/${deployedAddress}`}
                    isExternal
                    color="purple.500"
                  >
                    <HStack>
                      <Text>View on Explorer</Text>
                      <ExternalLink size={14} />
                    </HStack>
                  </Link>
                </HStack>
              </VStack>
            </Alert>
          )}
        </VStack>
      </Box>

      {/* Footer with Deploy Button */}
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
          onClick={deployToken}
          isLoading={isLoading}
          loadingText="Deploying..."
          isDisabled={
            !tokenName || 
            !tokenSymbol || 
            recipients.some(r => !r.address || !r.balance) ||
            deploymentState === 'deploying'
          }
          width="100%"
          size="lg"
          leftIcon={deploymentState === 'complete' ? <Check size={16} /> : undefined}
        >
          Deploy Token
        </Button>
        {isLoading && (
          <Progress size="xs" isIndeterminate colorScheme="purple" mt={2} />
        )}
      </Box>
    </Box>
  );
};

export default CreateToken;