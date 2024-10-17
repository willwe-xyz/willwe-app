import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Box, 
  VStack, 
  HStack, 
  Input, 
  Textarea, 
  Button, 
  Text, 
  FormControl, 
  FormLabel, 
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { deployments, getChainById } from '../config/deployments';
import { Chain } from 'viem';
import { usePrivy } from '@privy-io/react-auth';

const IERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const IERC721_ABI = [
  "function symbol() view returns (string)",
];

const MEMBRANE_ABI = [
  "function createMembrane(address[] memory tokens_, uint256[] memory balances_, string memory meta_) external returns (uint256)"
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
  const [characteristics, setCharacteristics] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [requiredBalance, setRequiredBalance] = useState<string>('');
  const [membershipConditions, setMembershipConditions] = useState<MembershipCondition[]>([]);
  const [warning, setWarning] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');

  const { getEthersProvider } = usePrivy();

  const chain: Chain = getChainById(chainId);
  const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);

  const handleCharacteristicsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharacteristics(e.target.value);
  };

  const addMembershipCondition = async () => {
    if (!ethers.isAddress(tokenAddress)) {
      setWarning('Invalid token address');
      return;
    }

    try {
      const contract = new ethers.Contract(tokenAddress, [...IERC20_ABI, ...IERC721_ABI], provider);
      
      let symbol: string;
      try {
        symbol = await contract.symbol();
      } catch (error) {
        setWarning('Invalid token contract');
        return;
      }

      setMembershipConditions([...membershipConditions, { tokenAddress, requiredBalance, symbol }]);
      setTokenAddress('');
      setRequiredBalance('');
      setTokenSymbol('');
      setWarning('');
    } catch (error) {
      setWarning('Error validating token');
    }
  };

  const handleSubmit = async () => {
    const parsedCharacteristics: Characteristic[] = characteristics.split('\n').map(line => {
      const [title, link] = line.split(',').map(item => item.trim());
      return { title, link };
    });

    const meta = JSON.stringify({
      entityName,
      characteristics: parsedCharacteristics,
    });

    const tokens = membershipConditions.map(condition => condition.tokenAddress);
    const balances = membershipConditions.map(condition => ethers.parseUnits(condition.requiredBalance, 18)); // Assuming 18 decimals, adjust if needed

    try {
      console.log('chain id define entity --- ', chainId);
      console.log('connected to chain --- ', chain.name);

      const ethersProvider = await getEthersProvider();
      const signer = await ethersProvider.getSigner();
      
      const membraneAddress = deployments.Membrane[chainId];
      const membraneContract = new ethers.Contract(membraneAddress, MEMBRANE_ABI, signer);

      const tx = await membraneContract.createMembrane(tokens, balances, meta);
      await tx.wait();

      const membraneId = tx.events[0].args.id.toString(); // Assuming the event emits the membrane ID
      onSubmit({ entityName, characteristics: parsedCharacteristics, membershipConditions, membraneId });
    } catch (error) {
      console.error('Error creating membrane:', error);
      setWarning('Error creating membrane. Please try again.');
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      if (ethers.isAddress(tokenAddress)) {
        try {
          const contract = new ethers.Contract(tokenAddress, [...IERC20_ABI, ...IERC721_ABI], provider);
          console.log('connected to chain --- ', chain.name);
          
          const symbol = await contract.symbol();
          setTokenSymbol(symbol);
          setWarning('');
        } catch (error) {
          setTokenSymbol('');
          setWarning('Invalid token contract');
        }
      } else {
        setTokenSymbol('');
        setWarning(tokenAddress ? 'Invalid token address' : '');
      }
    };

    validateToken();
  }, [tokenAddress, chain.name, provider]);

  const isSubmitDisabled = !entityName || membershipConditions.length === 0;

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Entity Name</FormLabel>
        <Input value={entityName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntityName(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>Characteristics (CSV format: title, link)</FormLabel>
        <Textarea value={characteristics} onChange={handleCharacteristicsChange} placeholder="Characteristic 1, https://link1.com&#10;Characteristic 2, https://link2.com" />
      </FormControl>

      <FormControl>
        <FormLabel>Membership Conditions</FormLabel>
        <HStack>
          <Input 
            placeholder="Token Address" 
            value={tokenAddress} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenAddress(e.target.value)}
          />
          <Input 
            placeholder="Required Balance" 
            value={requiredBalance} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequiredBalance(e.target.value)}
          />
          <Button onClick={addMembershipCondition} isDisabled={!tokenSymbol}>Add</Button>
        </HStack>
        {tokenSymbol && <Text mt={2}>Token Symbol: {tokenSymbol}</Text>}
        {warning && (
          <Alert status="warning" mt={2}>
            <AlertIcon />
            {warning}
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

      <Button onClick={handleSubmit} colorScheme="blue" isDisabled={isSubmitDisabled}>
        Define Entity
      </Button>
    </VStack>
  );
};

export default DefineEntity;