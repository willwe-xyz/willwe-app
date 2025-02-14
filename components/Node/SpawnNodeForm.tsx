import { useState, useCallback } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Switch,
  HStack,
  IconButton,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Link,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { Plus, Trash2, ExternalLink, Copy } from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs, getExplorerLink } from '../../config/contracts';
import { validateToken } from '../../utils/tokenValidation';
import { useTransaction } from '../../contexts/TransactionContext';

interface Characteristic {
  title: string;
  link: string;
}

interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol?: string;
}

interface SpawnNodeFormProps {
  nodeId: string;
  chainId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const SpawnNodeForm = ({
  nodeId,
  chainId,
  onSuccess,
  onClose
}: SpawnNodeFormProps) => {
  // Form state
  const [entityName, setEntityName] = useState('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [newCharTitle, setNewCharTitle] = useState('');
  const [newCharLink, setNewCharLink] = useState('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenBalance, setNewTokenBalance] = useState('');
  const [inflationRate, setInflationRate] = useState(1);
  const [useMembrane, setUseMembrane] = useState(false);

  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Hooks
  const { getEthersProvider } = usePrivy();
  const toast = useToast();
  const { executeTransaction } = useTransaction();

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

  const submitTransaction = async (cid: string = '') => {
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.WillWe[cleanChainId];
    
    if (!contractAddress) {
      throw new Error(`No contract deployment found for chain ${cleanChainId}`);
    }

    const tx = await executeTransaction(
      chainId,
      async () => {
        const provider = await getEthersProvider();
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          ABIs.WillWe,
          signer
        );

        let transaction;
        if (useMembrane) {
          transaction = await contract.spawnBranchWithMembrane(
            nodeId,
            membershipConditions.map(mc => mc.tokenAddress.toLowerCase()),
            membershipConditions.map(mc => ethers.parseUnits(mc.requiredBalance, 18)),
            cid,
            inflationRate,
            { gasLimit: BigInt(1000000) }
          );
        } else {
          transaction = await contract.spawnBranch(
            nodeId,
            { gasLimit: BigInt(500000) }
          );
        }

        setTransactionHash(transaction.hash);
        return transaction;
      },
      {
        successMessage: "Node created successfully",
        errorMessage: "Failed to create node",
        onSuccess: () => {
          onSuccess?.();
          onClose?.();
        }
      }
    );

    return tx;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useMembrane && (!entityName || characteristics.length === 0)) {
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
      let cid = '';
      if (useMembrane) {
        // Prepare and upload metadata to IPFS
        const metadata = {
          name: entityName,
          characteristics,
          membershipConditions
        };

        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: metadata }),
        });

        if (!response.ok) throw new Error('Failed to upload metadata');
        const { cid: ipfsCid } = await response.json();
        cid = ipfsCid;
      }

      await submitTransaction(cid);
    } catch (err) {
      console.error('Error spawning node:', err);
      setError(err instanceof Error ? err.message : 'Failed to spawn node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={6} align="stretch">
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="use-membrane" mb="0">
            Define Node
          </FormLabel>
          <Switch
            id="use-membrane"
            isChecked={useMembrane}
            onChange={(e) => setUseMembrane(e.target.checked)}
            colorScheme="purple"
          />
        </FormControl>

        {useMembrane && (
          <>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Enter name for the membrane"
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
          </>
        )}

        <FormControl>
          <FormLabel>Inflation Rate (gwei/sec)</FormLabel>
          <NumberInput
            value={inflationRate}
            onChange={(valueString) => setInflationRate(parseInt(valueString))}
            min={1}
            max={100000000}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Rate at which new node shares are generated
          </FormHelperText>
        </FormControl>

        {isLoading && <Progress size="xs" isIndeterminate colorScheme="purple" />}

        {error && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {transactionHash && (
          <Alert status="success">
            <AlertIcon />
            <VStack align="stretch" width="100%" spacing={2}>
              <Text>Node successfully created</Text>
              <Link 
                href={getExplorerLink(chainId, transactionHash)}
                isExternal
                color="purple.500"
                fontSize="sm"
                display="flex"
                alignItems="center"
              >
                View transaction <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </Link>
            </VStack>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="purple"
          isLoading={isLoading}
          loadingText="Creating Node..."
          size="lg"
          width="100%"
          isDisabled={
            (useMembrane && (!entityName || characteristics.length === 0)) ||
            isLoading ||
            inflationRate <= 0
          }
        >
          Create Node
        </Button>
      </VStack>
    </Box>
  );
};

export default SpawnNodeForm;