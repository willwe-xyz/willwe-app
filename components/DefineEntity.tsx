import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  VStack,
  HStack,
  Input,
  Button,
  Text,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  useToast,
  Progress,
  Box,
} from '@chakra-ui/react';
import { deployments, ABIs } from '../config/deployments';
import { usePrivy } from '@privy-io/react-auth';
import { getRPCUrl } from '../config/contracts';

const IERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const IERC721_ABI = [
  "function symbol() view returns (string)",
];

interface Characteristic {
  title: string;
  link: string;
}

interface MembershipCondition {
  tokenAddress: string;
  requiredBalance: string;
  symbol: string;
}

interface EntityData {
  entityName: string;
  characteristics: Characteristic[];
  membershipConditions: MembershipCondition[];
  membraneId: string;
}

interface DefineEntityProps {
  onSubmit: (data: EntityData) => void;
  chainId: string;
}

const DefineEntity: React.FC<DefineEntityProps> = ({ onSubmit, chainId }) => {
  const [entityName, setEntityName] = useState<string>('');
  const [characteristicTitle, setCharacteristicTitle] = useState<string>('');
  const [characteristicLink, setCharacteristicLink] = useState<string>('');
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [requiredBalance, setRequiredBalance] = useState<string>('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenWarning, setTokenWarning] = useState<string>('');
  const [submissionState, setSubmissionState] = useState<'idle' | 'ipfs' | 'transaction' | 'confirming' | 'complete'>('idle');
  const [ipfsCid, setIpfsCid] = useState<string>('');
  const [membraneId, setMembraneId] = useState<string>('');

  const { user, getEthersProvider } = usePrivy();
  const toast = useToast();

  const validateToken = useCallback(async (address: string) => {
    if (ethers.isAddress(address)) {
      try {
        const rpcUrl = getRPCUrl(chainId);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(address, [...IERC20_ABI, ...IERC721_ABI], provider);
        const symbol: string = await contract.symbol();
        setTokenSymbol(symbol);
        setTokenWarning('');
      } catch (error) {
        console.error('Error validating token:', error);
        setTokenSymbol('');
        setTokenWarning('Invalid token contract');
      }
    } else {
      setTokenSymbol('');
      setTokenWarning(address ? 'Invalid token address' : '');
    }
  }, [chainId]);

  const addCharacteristic = () => {
    if (characteristicTitle && characteristicLink) {
      setCharacteristics(prev => [...prev, { title: characteristicTitle, link: characteristicLink }]);
      setCharacteristicTitle('');
      setCharacteristicLink('');
    }
  };

  const addMembershipCondition = () => {
    if (tokenSymbol && requiredBalance) {
      setMembershipConditions(prev => [...prev, { tokenAddress, requiredBalance, symbol: tokenSymbol }]);
      setTokenAddress('');
      setRequiredBalance('');
      setTokenSymbol('');
      setTokenWarning('');
    }
  };

  const submitToIPFS = async (data: any) => {
    try {
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('IPFS upload error:', errorData);
        throw new Error(`Failed to upload to IPFS: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      setIpfsCid(result.cid);
      return result.cid;
    } catch (error) {
      console.error('Error in submitToIPFS:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!user?.wallet?.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to perform this action.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setSubmissionState('ipfs');
    try {
      const ipfsCid = await submitToIPFS({ entityName, characteristics });

      setSubmissionState('transaction');
      const membraneAddress = deployments.Membrane[chainId];
      if (!membraneAddress) {
        throw new Error(`No Membrane contract address found for chainId ${chainId}`);
      }

      const tokens = membershipConditions.map(condition => condition.tokenAddress);
      const balances = membershipConditions.map(condition => 
        ethers.parseUnits(condition.requiredBalance, 18)
      );

      // Calculate expected membrane ID
      const M = {
        tokens: tokens,
        balances: balances,
        meta: ipfsCid
      };
      const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['tuple(address[] tokens, uint256[] balances, string meta)'],
        [M]
      );
      const expectedMembraneId = ethers.keccak256(packedData);
      console.log('Expected Membrane ID:', expectedMembraneId);

      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const membraneContract = new ethers.Contract(membraneAddress, ABIs["Membrane"], signer);

      const tx = await membraneContract.createMembrane(tokens, balances, ipfsCid);
      setSubmissionState('confirming');

      const receipt = await provider.waitForTransaction(tx.hash, 1, 150000);

      if (receipt && receipt.status === 1) {
        const actualMembraneId = expectedMembraneId;
        console.log('Membrane ID:', actualMembraneId);

        setMembraneId(actualMembraneId);
        localStorage.setItem('lastMembraneCreated', actualMembraneId);

        onSubmit({ 
          entityName, 
          characteristics, 
          membershipConditions, 
          membraneId: actualMembraneId 
        });
    
        setSubmissionState('complete');
        toast({
          title: "Entity Created",
          description: `Entity created successfully with membrane ID: ${actualMembraneId}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      console.error('Error creating membrane:', error);
      let errorMessage = "Failed to create the entity. Please try again.";
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      setSubmissionState('idle');
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Entity Name</FormLabel>
        <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>Characteristics</FormLabel>
        <HStack>
          <Input
            placeholder="Title"
            value={characteristicTitle}
            onChange={(e) => setCharacteristicTitle(e.target.value)}
          />
          <Input
            placeholder="Link"
            value={characteristicLink}
            onChange={(e) => setCharacteristicLink(e.target.value)}
          />
          <Button onClick={addCharacteristic}>+</Button>
        </HStack>
      </FormControl>

      {characteristics.length > 0 && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Link</Th>
            </Tr>
          </Thead>
          <Tbody>
            {characteristics.map((char, index) => (
              <Tr key={index}>
                <Td>{char.title}</Td>
                <Td>{char.link}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <FormControl>
        <FormLabel>Membership Conditions</FormLabel>
        <HStack>
          <Input
            placeholder="Token Address"
            value={tokenAddress}
            onChange={(e) => {
              setTokenAddress(e.target.value);
              validateToken(e.target.value);
            }}
          />
          <Input
            placeholder="Required Balance"
            value={requiredBalance}
            onChange={(e) => setRequiredBalance(e.target.value)}
          />
          <Button
            onClick={addMembershipCondition}
            isDisabled={!tokenSymbol || !requiredBalance}
          >
            Add
          </Button>
        </HStack>
        {tokenSymbol && <Text mt={2}>Token Symbol: {tokenSymbol}</Text>}
        {tokenWarning && (
          <Alert status="warning" mt={2}>
            <AlertIcon />
            {tokenWarning}
          </Alert>
        )}
      </FormControl>

      {membershipConditions.length > 0 && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Th>Required Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {membershipConditions.map((condition, index) => (
              <Tr key={index}>
                <Td>{condition.symbol} ({condition.tokenAddress.slice(0, 6)}...{condition.tokenAddress.slice(-4)})</Td>
                <Td>{condition.requiredBalance}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Button
        onClick={handleSubmit}
        colorScheme="blue"
        isDisabled={submissionState !== 'idle' || !user?.wallet?.address}
      >
        {submissionState === 'idle' ? 'Define Entity' : 'Processing...'}
      </Button>

      {submissionState !== 'idle' && (
        <Box>
          <Progress
            value={
              submissionState === 'ipfs' ? 25 :
              submissionState === 'transaction' ? 50 :
              submissionState === 'confirming' ? 75 :
              submissionState === 'complete' ? 100 : 0
            }
            size="sm"
            colorScheme="blue"
          />
          <Text mt={2} textAlign="center">
            {submissionState === 'ipfs' ? 'Uploading to IPFS...' :
             submissionState === 'transaction' ? 'Initiating on-chain transaction...' :
             submissionState === 'confirming' ? 'Confirming transaction...' :
             submissionState === 'complete' ? 'Entity created successfully!' : ''}
          </Text>
        </Box>
      )}

      {submissionState === 'complete' && (
        <VStack spacing={2} align="stretch">
          <Alert status="success">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text>Entity created successfully!</Text>
              <Text fontSize="sm">IPFS CID: {ipfsCid}</Text>
              <Text fontSize="sm">Membrane ID: {membraneId}</Text>
            </VStack>
          </Alert>
        </VStack>
      )}
    </VStack>
  );
};

export default DefineEntity;