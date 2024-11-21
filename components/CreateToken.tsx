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
import { ERC20Bytecode, ERC20CreateABI } from '../const/envconst';
import { ContractRunner, ethers, Provider } from 'ethers';
import { useTransactionHandler } from '../hooks/useTransactionHandler';
import { getExplorerLink } from '../config/contracts';

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
    { address: userAddress || '', balance: '' }
  ]);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deployedAddress, setDeployedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useToast();
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransactionHandler();

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
      if (!authenticated || !ready) {
        throw new Error('Please connect your wallet first');
      }

      setIsLoading(true);
      setDeploymentState('deploying');

      // Validate inputs
      if (!tokenName || !tokenSymbol) {
        throw new Error('Token name and symbol are required');
      }

      const validRecipients = recipients.filter(r => r.address && r.balance);
      if (validRecipients.length === 0) {
        throw new Error('At least one valid recipient is required');
      }
      const provider = await getEthersProvider();
      const signer = provider.getSigner();
      const runner: ContractRunner = {
        call: signer.call.bind(signer),
        sendTransaction: signer.sendTransaction.bind(signer),
        estimateGas: signer.estimateGas.bind(signer),
        provider: provider as unknown as Provider
          };
      
      const factory = new ethers.ContractFactory(
        ERC20CreateABI,
        ERC20Bytecode,
        runner
      );

      // Create deployment transaction
      const deploymentTx = factory.deploy(
        tokenName,
        tokenSymbol,
        validRecipients.map(r => r.address),
        validRecipients.map(r => ethers.parseUnits(r.balance, 18))
      );
      // Execute transaction with proper lifecycle handling
      const transactionResult = await executeTransaction(deploymentTx, chainId);

      if (transactionResult.contractAddress) {
        const deployedAddress = transactionResult.contractAddress;
        setDeployedAddress(deployedAddress);
        setDeploymentState('complete');
        
        toast({
          title: 'Success',
          description: (
            <>
              Token deployed successfully. View on explorer:{' '}
              <Link href={getExplorerLink(transactionResult.txHash, chainId, 'tx')} isExternal>
                {transactionResult.txHash.substring(0, 8)}...{transactionResult.txHash.substring(58)}
                <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              </Link>
            </>
          ),
          status: 'success',
          duration: 5000,
        });

        onSuccess?.();
      }

    } catch (error: any) {
      console.error('Token deployment error:', error);
      setDeploymentState('idle');
      
      toast({
        title: 'Failed to Deploy Token',
        description: error.message || 'Transaction failed',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
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

      {/* Scrollable Content Area */}
      <Box 
        overflowY="auto"
        flex="1"
        pb="200px"
      >
        <Box p={8}>
          <VStack spacing={8} align="stretch">
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
                <AlertIcon />
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