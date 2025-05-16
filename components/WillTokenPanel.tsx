import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import type { Abi } from 'viem';
import { useAppKit } from '../hooks/useAppKit';
import { deployments, ABIs } from '../config/deployments';
import { useAlchemyBalances } from '../hooks/useAlchemyBalances';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Select,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface WillTokenPanelProps {
  chainId: string;
  userAddress?: string;
  onClose: () => void;
}

interface TokenOption {
  value: string;
  label: string;
}

const WillTokenPanel: React.FC<WillTokenPanelProps> = ({ chainId, userAddress, onClose }) => {
  const { user: { isAuthenticated } } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
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

  // Get token balances using Alchemy
  const { balances: tokenBalances, isLoading: isLoadingBalances } = useAlchemyBalances(
    userAddress,
    chainId
  );

  // Fetch current price and balances
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !publicClient || !address) return;

      try {
        const price = await publicClient.readContract({
          address: deployments.Will[chainId] as `0x${string}`,
          abi: ABIs.Will as Abi,
          functionName: 'currentPrice'
        }) as bigint;
        setCurrentPrice(formatEther(price));

        const balance = await publicClient.readContract({
          address: deployments.Will[chainId] as `0x${string}`,
          abi: ABIs.Will as Abi,
          functionName: 'balanceOf',
          args: [address]
        }) as bigint;
        setWillBalance(formatEther(balance));

        const ethBalance = await publicClient.getBalance({ address });
        setEthBalance(formatEther(ethBalance));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, chainId, address, publicClient]);

  // Handle mint from ETH
  const handleMintFromETH = async () => {
    if (!isAuthenticated || !walletClient || !address || !publicClient) return;

    try {
      setIsLoading(true);
      
      // Get current price first
      const price = await publicClient.readContract({
        address: deployments.Will[chainId] as `0x${string}`,
        abi: ABIs.Will as Abi,
        functionName: 'currentPrice'
      }) as bigint;
      
      // Convert mint amount to wei (1e18 units)
      const amountToMint = parseEther(mintAmount);
      
      // Calculate required ETH: amount * price / 1e18
      const requiredEth = (amountToMint * price) / parseEther("1");
      
      console.log('Minting details:', {
        amountToMint: amountToMint.toString(),
        price: price.toString(),
        requiredEth: requiredEth.toString()
      });

      // Call mint function with the correct parameters
      const { request } = await publicClient.simulateContract({
        address: deployments.Will[chainId] as `0x${string}`,
        abi: ABIs.Will as Abi,
        functionName: 'mint',
        args: [amountToMint],
        value: requiredEth,
        account: address
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      
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
      if (!mintAmount || !isAuthenticated || !publicClient) {
        setMintCost('0');
        return;
      }
      try {
        // Get current price first
        const price = await publicClient.readContract({
          address: deployments.Will[chainId] as `0x${string}`,
          abi: ABIs.Will as Abi,
          functionName: 'currentPrice'
        }) as bigint;
        
        // Convert mint amount to wei (1e18 units)
        const amountToMint = parseEther(mintAmount);
        
        // Calculate required ETH: amount * price / 1e18
        const cost = (amountToMint * price) / parseEther("1");
        
        setMintCost(formatEther(cost));
      } catch (error) {
        console.error('Error calculating mint cost:', error);
        setMintCost('0');
      }
    };

    calculateMintCost();
  }, [mintAmount, isAuthenticated, publicClient, chainId]);

  // Handle burn
  const handleBurn = async () => {
    if (!isAuthenticated || !walletClient || !address || !publicClient) return;

    try {
      setIsLoading(true);
      const { request } = await publicClient.simulateContract({
        address: deployments.Will[chainId] as `0x${string}`,
        abi: ABIs.Will as Abi,
        functionName: 'burn',
        args: [parseEther(burnAmount)],
        account: address
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });

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

  // Handle token selection
  const handleTokenSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedTokens(prev => {
      if (prev.includes(selectedValue)) {
        return prev.filter(token => token !== selectedValue);
      }
      return [...prev, selectedValue];
    });
  };

  if (!isAuthenticated) {
    return (
      <Box p={4}>
        <Text>Please connect your wallet to continue.</Text>
      </Box>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>Will Token Operations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Mint</Tab>
              <Tab>Burn</Tab>
              <Tab>Redeem</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Amount to Mint</FormLabel>
                    <Input
                      type="number"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </FormControl>
                  <Text>Current Price: {currentPrice} ETH</Text>
                  <Text>Required ETH: {mintCost} ETH</Text>
                  <Text>Your ETH Balance: {ethBalance} ETH</Text>
                  <Button
                    colorScheme="blue"
                    onClick={handleMintFromETH}
                    isLoading={isLoading}
                    isDisabled={!mintAmount || isLoading}
                  >
                    Mint Tokens
                  </Button>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Amount to Burn</FormLabel>
                    <Input
                      type="number"
                      value={burnAmount}
                      onChange={(e) => setBurnAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </FormControl>
                  <Text>Your Will Balance: {willBalance} WILL</Text>
                  <Button
                    colorScheme="red"
                    onClick={handleBurn}
                    isLoading={isLoading}
                    isDisabled={!burnAmount || isLoading}
                  >
                    Burn Tokens
                  </Button>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Select Tokens to Redeem</FormLabel>
                    <Select
                      placeholder="Select tokens to redeem"
                      value={selectedTokens}
                      onChange={handleTokenSelect}
                      multiple
                    >
                      {tokenBalances?.map((token) => (
                        <option key={token.contractAddress} value={token.contractAddress}>
                          {token.symbol}: {token.formattedBalance}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    colorScheme="green"
                    onClick={() => {/* TODO: Implement redeem logic */}}
                    isLoading={isLoading}
                    isDisabled={selectedTokens.length === 0 || isLoading}
                  >
                    Redeem Tokens
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WillTokenPanel; 