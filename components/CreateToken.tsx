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
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { Trash2, Plus, ExternalLink } from 'lucide-react';
import { ERC20Bytecode, ERC20CreateABI } from '../const/envconst';
import { useTransaction } from '../contexts/TransactionContext';

interface Recipient {
  address: string;
  balance: string;
}

interface CreateTokenProps {
  chainId: string;
  userAddress?: string;
  onSuccess?: () => void;
}

const CreateToken: React.FC<CreateTokenProps> = ({ chainId, userAddress, onSuccess }) => {
  const { executeTransaction } = useTransaction();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', balance: '' }]);
  const [errors, setErrors] = useState<string[]>([]);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deployedAddress, setDeployedAddress] = useState<string>('');

  const { getEthersProvider } = usePrivy();
  const toast = useToast();

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

  const totalSupply = recipients.reduce((total, recipient) => {
    return total + (parseFloat(recipient.balance) || 0);
  }, 0);

  const deployToken = async () => {
    try {
      setDeploymentState('deploying');
      setErrors([]);

      const provider = await getEthersProvider();
      if (!provider) throw new Error('No provider available');

      const signer = provider.getSigner();
      
      // Validate inputs
      if (!tokenName || !tokenSymbol) {
        throw new Error('Token name and symbol are required');
      }

      const validRecipients = recipients.filter(r => r.address && r.balance);
      if (validRecipients.length === 0) {
        throw new Error('At least one valid recipient is required');
      }

      // Validate addresses
      const invalidAddresses = validRecipients.filter(r => !ethers.isAddress(r.address));
      if (invalidAddresses.length > 0) {
        throw new Error('Invalid recipient address(es)');
      }

      const factory = new ethers.ContractFactory(
        ERC20CreateABI,
        ERC20Bytecode,
        signer
      );

      // Execute the transaction using the context
      const result = await executeTransaction(
        chainId,
        async () => {
          // For contract deployment, use factory.deploy directly
          const contract = await factory.deploy(
            tokenName,
            tokenSymbol,
            validRecipients.map(r => r.address),
            validRecipients.map(r => ethers.parseUnits(r.balance, 18))
          );
          
          // Set the address immediately after transaction is sent
          setDeployedAddress(contract.target as string);
          
          return contract.deploymentTransaction();
        },
        {
          successMessage: 'Token deployed successfully',
          errorMessage: 'Failed to deploy token',
          onSuccess: () => {
            setDeploymentState('complete');
            onSuccess?.();
          }
        }
      );

      if (!result) {
        setDeploymentState('idle');
        setDeployedAddress('');
      }

    } catch (error: any) {
      setErrors([error.message]);
      setDeploymentState('idle');
      setDeployedAddress('');
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

      {/* Scrollable Content */}
      <Box 
        overflowY="auto"
        flex="1"
        pb="160px"
      >
        <Box p={6}>
          <VStack spacing={6} align="stretch">
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

            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Supply: {totalSupply.toLocaleString()}</Text>
            </Box>

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
              mb={16}
            >
              Add Recipient
            </Button>

            {errors.length > 0 && errors.map((error, index) => (
              <Alert key={index} status="error">
                <AlertIcon />
                {error}
              </Alert>
            ))}

            {deploymentState === 'complete' && deployedAddress && (
              <Alert status="success" variant="subtle">
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Token deployed successfully!</Text>
                  <HStack spacing={2} justify="space-between" width="100%">
                    <Text fontFamily="mono" fontSize="sm">
                      {deployedAddress}
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      rightIcon={<ExternalLink size={16} />}
                      onClick={() => window.open(`https://etherscan.io/address/${deployedAddress}`)}
                    >
                      View
                    </Button>
                  </HStack>
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Fixed Footer */}
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
          isLoading={deploymentState === 'deploying'}
          loadingText="Deploying..."
          isDisabled={
            !tokenName || 
            !tokenSymbol || 
            recipients.some(r => !r.address || !r.balance) ||
            deploymentState === 'deploying'
          }
          width="100%"
          size="lg"
        >
          Deploy Token
        </Button>
        {deploymentState === 'deploying' && (
          <Progress size="xs" isIndeterminate colorScheme="purple" mt={2} />
        )}
      </Box>
    </Box>
  );
};

export default CreateToken;