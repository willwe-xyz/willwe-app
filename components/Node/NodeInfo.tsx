import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Text,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Badge,
  Skeleton,
  useToast,
  useColorModeValue,
  Grid
} from '@chakra-ui/react';
import { Copy, ChevronRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import SunburstChart from './SunburstChart';
import { nodeIdToAddress } from '../../utils/formatters';
import router from 'next/router';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface NodeInfoProps {
  node: NodeState;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
}

interface NodeMetrics {
  dailyUnlock: string;
  TVL: string;
  totalValue: string;
  availableShares: string;
  inflow: string;
  value: string;
  memberCount: number;
  membersList: string[];
  userOwnedShares: string;
}

// Add interface for member data
interface MemberData {
  address: string;
  ensName: string | null;
}

const calculateMetrics = (node: NodeState): NodeMetrics => {
  // Safely handle null or undefined values
  if (!node || !node.basicInfo) {
    return {
      dailyUnlock: '0',
      TVL: '0',
      totalValue: '0',
      availableShares: '0',
      inflow: '0',
      value: '0',
      memberCount: 0,
      membersList: [],
      userOwnedShares: '0'
    };
  }

  // Per-second rates in gwei, multiply by seconds in a day
  const dailyUnlockedValue = node.basicInfo.inflation ? 
    BigInt(Number(node.basicInfo.inflation) * 86400) : 
    BigInt(0);
  
  console.log('childParentEligibilityinRoot:', node);
  return {
    dailyUnlock: ethers.formatUnits(dailyUnlockedValue, 'ether'),
    TVL: ethers.formatUnits(node.basicInfo.rootValuationBudget || '0', 'ether'),
    totalValue: ethers.formatUnits(node.basicInfo.rootValuationBudget || '0', 'ether'),
    availableShares: ethers.formatUnits(node.basicInfo.balanceBudget || '0', 'ether'),
    inflow: ethers.formatUnits(node.basicInfo.eligibilityPerSec || '0', 'ether'), // Keep this as per-second rate
    value: ethers.formatUnits(node.basicInfo.rootValuationReserve || '0', 'ether'),
    memberCount: node.membersOfNode?.length || 0,
    membersList: node.membersOfNode || [],
    userOwnedShares: ethers.formatUnits(node.basicInfo.balanceOfUser || '0', 'gwei')
  };
};

const NodeInfo: React.FC<NodeInfoProps> = ({ node, chainId, onNodeSelect }) => {
  const [membraneTitle, setMembraneTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const toast = useToast();

  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const statsBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Safely handle null or undefined values
  const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId), {
    chainId: Number(chainId),
    name: `${chainId}`,
  });
  
  // Safely handle null or undefined values
  const tokenAddress = node?.rootPath?.[0] ? nodeIdToAddress(node.rootPath[0]) : ethers.ZeroAddress;

  const tokenContract = new ethers.Contract(
    tokenAddress,
    ABIs.IERC20,
    provider
  );

  const [memberData, setMemberData] = useState<Array<{ address: string; ensName: string | null }>>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTokenSymbol = async () => {
      if (!node?.rootPath?.[0] || !chainId) return;

      try {
        const code = await provider.getCode(tokenAddress);
        if (code === '0x') {
          setTokenSymbol('NOT A TOKEN');
          return;
        }

        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching token symbol:', error);
        setTokenSymbol('UNKNOWN');
      }
    };

    fetchTokenSymbol();
  }, [node, chainId, provider, tokenContract, tokenAddress]);

  useEffect(() => {
    const fetchMembraneTitle = async () => {
      if (!node?.membraneMeta) {
        setIsLoadingTitle(false);
        return;
      }

      try {
        setIsLoadingTitle(true);
        const response = await fetch(`${IPFS_GATEWAY}${node.membraneMeta}`);
        const data = await response.json();
        setMembraneTitle(data.name || 'Unnamed Membrane');
      } catch (error) {
        console.error('Error fetching membrane title:', error);
        setMembraneTitle('Unknown Membrane');
      } finally {
        setIsLoadingTitle(false);
      }
    };

    fetchMembraneTitle();
  }, [node]);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const resolveEnsNames = async () => {
      if (!node?.membersOfNode || node.membersOfNode.length === 0) return;

      try {
        // Use Ethereum mainnet for ENS resolution
        const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));

        const ensNames = await Promise.all(
          node.membersOfNode.map(async (address) => {
            try {
              const ensName = await mainnetProvider.lookupAddress(address);
              return { address, ensName };
            } catch (error) {
              console.error(`Error resolving ENS for ${address}:`, error);
              return { address, ensName: null };
            }
          })
        );
        setMemberData(ensNames);
      } catch (error) {
        console.error('Error resolving ENS names:', error);
      }
    };

    resolveEnsNames();
  }, [node]);

  const metrics = useMemo(() => calculateMetrics(node), [node]);

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      overflow="hidden"
    >
      <HStack spacing={6} align="start" w="full">
        {/* Left column - Stats */}
        <VStack
          flex="1"
          align="stretch"
          spacing={4}
        >
          {/* Stats grid */}
          <Grid 
            templateColumns="repeat(2, 1fr)" 
            gap={4}
          >
            <Box
              p={4}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Daily token creation rate for this node" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Daily Unlock</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.dailyUnlock)} PSC/day
                  </Text>
                </VStack>
              </Tooltip>
            </Box>

            <Box
              p={4}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Amount of tokens held in node's own account" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Total Node Value</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.TVL)} PSC
                  </Text>
                </VStack>
              </Tooltip>
            </Box>

            <Box
              p={4}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Current per-second inflation rate" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Inflow Rate</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.inflow)} PSC/sec
                  </Text>
                </VStack>
              </Tooltip>
            </Box>

            <Box
              p={4}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Current balance available in the node's budget" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Active Shares</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.availableShares)} PSC
                  </Text>
                </VStack>
              </Tooltip>
            </Box>
          </Grid>

          {/* Members section */}
          {node.membersOfNode && node.membersOfNode.length > 0 && (
            <Box
              mt={4}
              p={4}
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Members ({metrics.memberCount})</Text>
                  <Badge colorScheme="purple" variant="subtle" borderRadius="full">
                    Active
                  </Badge>
                </HStack>
                
                <Box 
                  maxH="150px" 
                  overflowY="auto"
                  sx={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      width: '6px',
                      bg: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bg: 'gray.300',
                      borderRadius: '24px',
                    },
                  }}
                >
                  {memberData.map(({ address, ensName }, index) => (
                    <HStack
                      key={index}
                      py={2}
                      px={3}
                      borderRadius="md"
                      _hover={{ bg: hoverBg }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="sm" isTruncated>
                        {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                      </Text>
                      <IconButton
                        aria-label="Copy address"
                        icon={<Copy size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={() => handleCopy(address)}
                      />
                    </HStack>
                  ))}
                </Box>
              </VStack>
            </Box>
          )}
        </VStack>

        {/* Right column - Chart */}
        <Box flex="1">
          <SunburstChart
            nodeData={node}
            chainId={chainId}
          />
        </Box>
      </HStack>
    </Box>
  );
};

export default NodeInfo;