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
  Heading
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { Trash2, Plus, ExternalLink } from 'lucide-react';
import { ERC20Bytecode, ERC20CreateABI } from '../const/envconst';

interface CreateTokenProps {
  chainId: string;
  userAddress?: string;
}

interface Recipient {
  address: string;
  balance: string;
}

const CreateToken: React.FC<CreateTokenProps> = ({ chainId }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', balance: '' }]);
  const [errors, setErrors] = useState<string[]>([]);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deployedAddress, setDeployedAddress] = useState<string>('');

  const { user, getEthersProvider } = usePrivy();
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

  const validateRecipients = useCallback(() => {
    const newErrors: string[] = [];
    recipients.forEach((recipient, index) => {
      if (recipient.address && !ethers.isAddress(recipient.address)) {
        newErrors.push(`Invalid address for recipient ${index + 1}`);
      }
      if (recipient.balance && isNaN(Number(recipient.balance))) {
        newErrors.push(`Invalid balance for recipient ${index + 1}`);
      }
    });
    return newErrors;
  }, [recipients]);

  const totalSupply = recipients.reduce((total, recipient) => {
    return total + (parseFloat(recipient.balance) || 0);
  }, 0);

  const deployToken = async () => {
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

    const validationErrors = validateRecipients();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setDeploymentState('deploying');
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(
        ERC20CreateABI,
        ERC20Bytecode,
        signer
      );

      const validRecipients = recipients.filter(r => r.address && r.balance);
      const recipientAddresses = validRecipients.map(r => r.address);
      const recipientBalances = validRecipients.map(r => 
        ethers.parseUnits(r.balance, 18)
      );

      const contract = await factory.deploy(
        tokenName,
        tokenSymbol,
        recipientAddresses,
        recipientBalances
      );

      const deployedAddr = await contract.getAddress();
      setDeployedAddress(deployedAddr);
      setDeploymentState('complete');

      toast({
        title: "Token Deployed",
        description: `Token successfully deployed at ${deployedAddr}`,
        status: "success",
        duration: 10000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Deployment error:', error);
      setErrors([error.message || 'Failed to deploy token']);
      setDeploymentState('idle');

      toast({
        title: "Deployment Failed",
        description: error.message || 'Failed to deploy token',
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>Create Token</Heading>
          <Text color="gray.600">Deploy a new ERC20 token with custom distribution</Text>
        </Box>

        <FormControl isRequired>
          <FormLabel>Token Name</FormLabel>
          <Input
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Enter token name"
            size="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Token Symbol</FormLabel>
          <Input
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder="Enter token symbol"
            size="md"
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
            <HStack spacing={4} align="flex-start">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Recipient Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={recipient.address}
                  onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Balance</FormLabel>
                <Input
                  placeholder="Amount"
                  value={recipient.balance}
                  type="number"
                  onChange={(e) => handleRecipientChange(index, 'balance', e.target.value)}
                  size="md"
                />
              </FormControl>

              <Button
                colorScheme="red"
                variant="ghost"
                onClick={() => removeRecipient(index)}
                mt={8}
                size="sm"
              >
                <Trash2 size={16} />
              </Button>
            </HStack>
          </Box>
        ))}

        <Button
          leftIcon={<Plus size={16} />}
          onClick={addRecipient}
          variant="ghost"
          colorScheme="blue"
          w="100%"
        >
          Add Recipient
        </Button>

        {errors.length > 0 && errors.map((error, index) => (
          <Alert key={index} status="error">
            <AlertIcon />
            {error}
          </Alert>
        ))}

        <Button
          colorScheme="blue"
          onClick={deployToken}
          isLoading={deploymentState === 'deploying'}
          loadingText="Deploying..."
          isDisabled={
            !tokenName || 
            !tokenSymbol || 
            recipients.some(r => !r.address || !r.balance) ||
            deploymentState === 'deploying'
          }
        >
          Deploy Token
        </Button>

        {deploymentState === 'deploying' && (
          <Box>
            <Progress size="xs" isIndeterminate colorScheme="blue" />
            <Text mt={2} textAlign="center" fontSize="sm">
              Deploying your token...
            </Text>
          </Box>
        )}

        {deploymentState === 'complete' && deployedAddress && (
          <Alert status="success" variant="subtle">
            <VStack align="start" spacing={2} w="100%">
              <Text fontWeight="bold">Token deployed successfully!</Text>
              <HStack spacing={2} w="100%" justify="space-between">
                <Text fontFamily="mono" fontSize="sm">
                  {deployedAddress}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://etherscan.io/address/${deployedAddress}`)}
                  rightIcon={<ExternalLink size={16} />}
                >
                  View on Etherscan
                </Button>
              </HStack>
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default CreateToken;