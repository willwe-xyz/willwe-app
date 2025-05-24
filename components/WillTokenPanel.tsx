import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Checkbox,
  Select,
  Spinner,
  Divider,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs } from '../config/deployments';
import { useAlchemyBalances } from '../hooks/useAlchemyBalances';

interface WillTokenPanelProps {
  chainId: string;
  userAddress: string;
  onClose: () => void;
}

const WillTokenPanel: React.FC<WillTokenPanelProps> = ({ chainId, userAddress, onClose }) => {
  const { ready, authenticated, login, user, getEthersProvider } = usePrivy();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [willBalance, setWillBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');

  // Use Privy wallet connection
  const walletConnected = !!user?.wallet?.address;

  // Get token balances using Alchemy for user
  const { balances: tokenBalances, isLoading: isLoadingBalances } = useAlchemyBalances(
    userAddress,
    chainId
  );

  // Get token balances using Alchemy for Will contract
  const { balances: willTokenBalances, isLoading: isLoadingWillTokenBalances } = useAlchemyBalances(
    deployments.Will[chainId],
    chainId
  );

  // Deduplicate Will contract token balances by contract address
  const uniqueWillTokenBalances = willTokenBalances
    ? Object.values(
        willTokenBalances.reduce((acc, token) => {
          acc[token.contractAddress] = token;
          return acc;
        }, {} as Record<string, typeof willTokenBalances[0]>)
      )
    : [];

  // Get Will contract instance using Privy provider
  const getWillContract = async () => {
    if (!ready || !authenticated || !walletConnected) {
      throw new Error('Wallet not connected');
    }
    const provider = await getEthersProvider();
    const signer = await provider.getSigner();
    const willAddress = deployments.Will[chainId];
    return new ethers.Contract(willAddress, ABIs.Will, signer as unknown as ethers.ContractRunner);
  };

  // Fetch current price and balances
  useEffect(() => {
    const fetchData = async () => {
      if (!ready || !authenticated || !walletConnected) return;
      try {
        const contract = await getWillContract();
        if (!contract) return;
        const price = await contract.currentPrice();
        setCurrentPrice(ethers.formatEther(price));
        const balance = await contract.balanceOf(userAddress);
        setWillBalance(ethers.formatEther(balance));
        const provider = await getEthersProvider();
        const ethBalance = await provider.getBalance(userAddress);
        setEthBalance(ethers.formatEther(ethBalance.toString()));
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error && error.message.includes('Wallet not connected')) {
          toast({
            title: "Wallet Connection Required",
            description: "Please connect your wallet to continue",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [ready, authenticated, chainId, userAddress, walletConnected, getEthersProvider]);

  // Handle mint from ETH
  const handleMintFromETH = async () => {
    if (!ready || !authenticated || !walletConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to continue",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getWillContract();
      if (!contract) return;

      const price = await contract.currentPrice();
      const requiredEth = ethers.parseEther(mintAmount) * price / ethers.parseEther("1");
      const tx = await contract.mintFromETH({ value: requiredEth });
      await tx.wait();
      toast({
        title: "Success",
        description: "Tokens minted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setMintAmount('');
    } catch (error) {
      console.error('Error minting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint tokens",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle burn
  const handleBurn = async () => {
    if (!ready || !authenticated || !walletConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to continue",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getWillContract();
      if (!contract) return;

      const tx = await contract.burn(ethers.parseEther(burnAmount));
      await tx.wait();
      toast({
        title: "Success",
        description: "Tokens burned successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setBurnAmount('');
    } catch (error) {
      console.error('Error burning:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to burn tokens",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deconstruct burn
  const handleDeconstructBurn = async () => {
    if (!ready || !authenticated || !walletConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to continue",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getWillContract();
      if (!contract) return;

      const tx = await contract.deconstructBurn(
        ethers.parseEther(burnAmount),
        selectedTokens
      );
      await tx.wait();
      toast({
        title: "Success",
        description: "Tokens deconstructed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setBurnAmount('');
      setSelectedTokens([]);
    } catch (error) {
      console.error('Error deconstructing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deconstruct tokens",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <Box p={6}>
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Please log in to interact with the Will token
        </Alert>
        <Button onClick={login} colorScheme="blue">
          Log In
        </Button>
      </Box>
    );
  }

  if (authenticated && !walletConnected) {
    return (
      <Box p={6}>
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Please connect your wallet to interact with the Will token
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Tabs onChange={setActiveTab} isFitted>
        <TabList mb={4}>
          <Tab>Mint</Tab>
          <Tab>Burn</Tab>
          <Tab>Deconstruct</Tab>
          <Tab>Price</Tab>
        </TabList>

        <TabPanels>
          {/* Mint Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text>Current Price: {currentPrice} ETH</Text>
              <Text>Your Will Balance: {willBalance} WILL</Text>
              <Text>Your ETH Balance: {ethBalance} ETH</Text>
              <Input
                placeholder="Amount to mint"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                type="number"
                min="0"
                step="0.0001"
              />
              <Button
                onClick={handleMintFromETH}
                isLoading={isLoading}
                isDisabled={!mintAmount || parseFloat(mintAmount) <= 0}
              >
                Mint from ETH
              </Button>
            </VStack>
          </TabPanel>

          {/* Burn Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text>Your Will Balance: {willBalance} WILL</Text>
              <Input
                placeholder="Amount to burn"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                type="number"
                min="0"
                step="0.0001"
              />
              <Button
                onClick={handleBurn}
                isLoading={isLoading}
                isDisabled={!burnAmount || parseFloat(burnAmount) <= 0}
              >
                Burn
              </Button>
            </VStack>
          </TabPanel>

          {/* Deconstruct Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text>Your Will Balance: {willBalance} WILL</Text>
              <Input
                placeholder="Amount to deconstruct"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                type="number"
                min="0"
                step="0.0001"
              />
              <Select
                placeholder="Select tokens to redeem"
                value={selectedTokens}
                onChange={(e) => setSelectedTokens(Array.from(e.target.selectedOptions, option => option.value))}
                multiple
              >
                {uniqueWillTokenBalances.map((token) => (
                  <option key={token.contractAddress} value={token.contractAddress}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </Select>
              <Button
                onClick={handleDeconstructBurn}
                isLoading={isLoading}
                isDisabled={!burnAmount || parseFloat(burnAmount) <= 0 || selectedTokens.length === 0}
              >
                Deconstruct
              </Button>
            </VStack>
          </TabPanel>

          {/* Price Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text fontSize="2xl" fontWeight="bold">
                Current Price: {currentPrice} ETH
              </Text>
              <Text>Your Will Balance: {willBalance} WILL</Text>
              <Text>Your ETH Balance: {ethBalance} ETH</Text>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default WillTokenPanel; 