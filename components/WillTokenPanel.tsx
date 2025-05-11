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
  const { ready, authenticated, login } = usePrivy();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [willBalance, setWillBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [mintCost, setMintCost] = useState<string>('0');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Get token balances using Alchemy
  const { balances: tokenBalances, isLoading: isLoadingBalances } = useAlchemyBalances(
    userAddress,
    chainId
  );

  // Check wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsWalletConnected(accounts.length > 0);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setIsWalletConnected(false);
        }
      } else {
        setIsWalletConnected(false);
      }
    };

    checkWalletConnection();
  }, []);

  // Get Will contract instance
  const getWillContract = async () => {
    if (!ready || !authenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to continue",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return null;
    }

    if (!isWalletConnected) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast({
          title: "Connection Failed",
          description: "Please connect your wallet to continue",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return null;
      }
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const willAddress = deployments.Will[chainId];
      return new ethers.Contract(willAddress, ABIs.Will, signer);
    } catch (error) {
      console.error('Error getting contract:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the contract. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  };

  // Fetch current price and balances
  useEffect(() => {
    const fetchData = async () => {
      if (!ready || !authenticated) return;
      const contract = await getWillContract();
      if (!contract) return;

      try {
        const price = await contract.currentPrice();
        setCurrentPrice(ethers.formatEther(price));

        const balance = await contract.balanceOf(userAddress);
        setWillBalance(ethers.formatEther(balance));

        const provider = new ethers.BrowserProvider(window.ethereum);
        const ethBalance = await provider.getBalance(userAddress);
        setEthBalance(ethers.formatEther(ethBalance));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [ready, authenticated, chainId, userAddress]);

  // Handle mint from ETH
  const handleMintFromETH = async () => {
    if (!ready || !authenticated) return;
    const contract = await getWillContract();
    if (!contract) return;

    try {
      setIsLoading(true);
      
      // Get current price first
      const price = await contract.currentPrice();
      
      // Convert mint amount to wei (1e18 units)
      const amountToMint = ethers.parseEther(mintAmount);
      
      // Calculate required ETH: amount * price / 1e18
      const requiredEth = (amountToMint * price) / ethers.parseEther("1");
      
      console.log('Minting details:', {
        amountToMint: amountToMint.toString(),
        price: price.toString(),
        requiredEth: requiredEth.toString()
      });

      // Call mint function with the correct parameters
      const tx = await contract.mint(amountToMint, { value: requiredEth });
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Tokens minted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setMintAmount('');
    } catch (error: any) {
      console.error('Error minting:', error);
      let errorMessage = "Failed to mint tokens. ";
      
      // Handle specific error cases
      if (error.message?.includes("InsufficientValue")) {
        errorMessage += "Insufficient ETH provided for the requested amount.";
      } else if (error.message?.includes("ValueMismatch")) {
        errorMessage += "The provided ETH value does not match the required amount.";
      } else {
        errorMessage += "Please ensure you have enough ETH and the amount meets the minimum requirement.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate mint cost
  useEffect(() => {
    const calculateMintCost = async () => {
      if (!mintAmount || !ready || !authenticated) {
        setMintCost('0');
        return;
      }
      try {
        const contract = await getWillContract();
        if (!contract) return;
        
        // Get current price first
        const price = await contract.currentPrice();
        
        // Convert mint amount to wei (1e18 units)
        const amountToMint = ethers.parseEther(mintAmount);
        
        // Calculate required ETH: amount * price / 1e18
        const cost = (amountToMint * price) / ethers.parseEther("1");
        
        setMintCost(ethers.formatEther(cost));
      } catch (error) {
        console.error('Error calculating mint cost:', error);
        setMintCost('0');
      }
    };

    calculateMintCost();
  }, [mintAmount, ready, authenticated]);

  // Handle burn
  const handleBurn = async () => {
    if (!ready || !authenticated) return;
    const contract = await getWillContract();
    if (!contract) return;

    try {
      setIsLoading(true);
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
        description: "Failed to burn tokens",
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
    if (!ready || !authenticated) return;
    const contract = await getWillContract();
    if (!contract) return;

    try {
      setIsLoading(true);
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
        description: "Failed to deconstruct tokens",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={6}>
      {!isWalletConnected && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Please connect your wallet to interact with Will tokens
        </Alert>
      )}
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
                placeholder="Amount of WILL tokens to mint"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                type="number"
                min="0"
                step="0.0001"
                isDisabled={!isWalletConnected}
              />
              {mintAmount && parseFloat(mintAmount) > 0 && (
                <Text color="blue.500">
                  Cost: {mintCost} ETH
                </Text>
              )}
              <Button
                onClick={handleMintFromETH}
                isLoading={isLoading}
                isDisabled={!mintAmount || parseFloat(mintAmount) <= 0 || !isWalletConnected}
              >
                {!isWalletConnected ? 'Connect Wallet' : 'Mint WILL Tokens'}
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
                {tokenBalances?.map((token) => (
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