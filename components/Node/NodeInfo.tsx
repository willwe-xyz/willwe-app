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
import { Copy, ChevronRight, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import TreemapChart from './TreemapChart';
import { nodeIdToAddress } from '../../utils/formatters';
import { resolveMultipleENS } from '../../utils/ensUtils';
import RequirementsTable from '../TokenOperations/RequirementsTable';
import router from 'next/router';
import { NodeOperations } from '../Node/NodeOperations';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface NodeInfoProps {
  node: NodeState;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
  selectedTokenColor: string;
  tokenSymbol: string;
  nodeId: string;
  userAddress: string;
  onSuccess?: () => void;
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
  totalSupply: string;
}

// Add interface for member data
interface MemberData {
  address: string;
  ensName: string | null;
}

// Add interface for membrane characteristics
interface MembraneMetadata {
  name: string;
  characteristics: Array<{
    title: string;
    link: string;
  }>;
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
      userOwnedShares: '0',
      totalSupply: '0'
    };
  }

  // Per-second rates in gwei, multiply by seconds in a day
  const dailyUnlockedValue = node.basicInfo[1] ? 
    BigInt(Number(node.basicInfo[1]) * 86400) : 
    BigInt(0);
  
  // Convert inflow from per-second to per-day
  const inflowPerDay = node.basicInfo[7] ? 
    BigInt(Number(node.basicInfo[7]) * 86400) : 
    BigInt(0);
  
  return {
    dailyUnlock: ethers.formatUnits(dailyUnlockedValue, 'ether'),
    TVL: ethers.formatUnits(node.basicInfo[4] || '0', 'ether'),
    totalValue: ethers.formatUnits(node.basicInfo[4] || '0', 'ether'),
    availableShares: ethers.formatUnits(node.basicInfo[3] || '0', 'ether'),
    inflow: ethers.formatUnits(inflowPerDay, 'ether'), // Now per day
    value: ethers.formatUnits(node.basicInfo[5] || '0', 'ether'),
    memberCount: node.membersOfNode?.length || 0,
    membersList: node.membersOfNode || [],
    userOwnedShares: ethers.formatUnits(node.basicInfo[9] || '0', 'gwei'),
    totalSupply: ethers.formatUnits(node.basicInfo[11] || '0', 'ether')
  };
};

const NodeInfo: React.FC<NodeInfoProps> = ({ 
  node, 
  chainId, 
  onNodeSelect,
  selectedTokenColor,
  tokenSymbol,
  nodeId,
  userAddress,
  onSuccess
}) => {
  const [membraneTitle, setMembraneTitle] = useState<string | null>(null);
  const [membraneCharacteristics, setMembraneCharacteristics] = useState<Array<{title: string; link: string}>>([]);
  const [membraneRequirements, setMembraneRequirements] = useState<Array<{symbol: string; formattedBalance: string}>>([]);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const [isLoadingCharacteristics, setIsLoadingCharacteristics] = useState(true);
  const toast = useToast();
  const [expandedCharIndex, setExpandedCharIndex] = useState<number | null>(null);

  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const statsBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Safely handle null or undefined values
  const provider = useMemo(() => {
    return new ethers.JsonRpcProvider(getRPCUrl(chainId), {
      chainId: Number(chainId),
      name: `${chainId}`,
    });
  }, [chainId]);
  
  // Safely handle null or undefined values
  const tokenAddress = node?.rootPath?.[0] ? nodeIdToAddress(node.rootPath[0]) : ethers.ZeroAddress;

  const tokenContract = useMemo(() => {
    return new ethers.Contract(
      tokenAddress,
      ABIs.IERC20,
      provider
    );
  }, [tokenAddress, provider]);

  const [memberData, setMemberData] = useState<Array<{ address: string; ensName: string | null }>>([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const fetchMembraneMetadata = async () => {
      if (!node?.membraneMeta) {
        setIsLoadingTitle(false);
        setIsLoadingCharacteristics(false);
        return;
      }

      try {
        setIsLoadingTitle(true);
        setIsLoadingCharacteristics(true);
        const response = await fetch(`${IPFS_GATEWAY}${node.membraneMeta}`);
        const data = await response.json();
        setMembraneTitle(data.name || 'Unnamed Membrane');
        setMembraneCharacteristics(data.characteristics || []);
        setMembraneRequirements(data.membershipConditions || []);
      } catch (error) {
        console.error('Error fetching membrane metadata:', error);
        setMembraneTitle('Unknown Membrane');
        setMembraneCharacteristics([]);
        setMembraneRequirements([]);
      } finally {
        setIsLoadingTitle(false);
        setIsLoadingCharacteristics(false);
      }
    };

    fetchMembraneMetadata();
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
        const resolvedNames = await resolveMultipleENS(node.membersOfNode);
        const memberData = node.membersOfNode.map((address, index) => ({
          address,
          ensName: resolvedNames[index]
        }));
        setMemberData(memberData);
      } catch (error) {
        console.error('Error resolving ENS names:', error);
      }
    };

    resolveEnsNames();
  }, [node]);

  const metrics = useMemo(() => calculateMetrics(node), [node]);

  // Helper to check if a string is a link
  const isLink = (link: string | undefined) => link && link.startsWith('http');

  // Ensure membraneRequirements has tokenAddress and formattedBalance for RequirementsTable
  const normalizedMembraneRequirements = membraneRequirements.map(req => {
    const formattedBalance =
      req.formattedBalance ||
      '1'; // fallback to '1' if nothing is present

    // Type guard for tokenAddress
    const tokenAddress = (req as any).tokenAddress || '';

    return {
      tokenAddress,
      symbol: req.symbol,
      formattedBalance: formattedBalance,
    };
  });

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      overflow="hidden"
      h="400px"
      display="flex"
      flexDirection="column"
    >
      <HStack>

          <Box
            width="66%"
            borderRadius="lg"
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="0"
            height="38px"
            p={2}
            m={2}
            boxShadow="none"
          >
            <NodeOperations
              nodeId={nodeId}
              chainId={chainId}
              selectedTokenColor={selectedTokenColor}
              userAddress={userAddress}
              onSuccess={onSuccess}
              showToolbar={true}
            />
          </Box>
        <Box
          width="33%"
          borderRadius="lg"
          display="flex"
          justifyContent="right"
          alignItems="right"
          float="right"
        >
              <Text
        fontSize="2xl"
        fontWeight="extrabold"
        color={selectedTokenColor}
        opacity={0.9}
        float="right"
        letterSpacing="tight"
        textAlign="right"
        px={6}
        py={2}
      >
        {membraneTitle || 'Loading...'}
      </Text>
        </Box>
      </HStack>
      <HStack 
        spacing={4} 
        align="stretch" 
        flex={1}
        minH={0}
        px={4}
        pb={4}
      >
        {/* Left column - Stats, Characteristics, Members */}
        <VStack
          w="67%"
          align="stretch"
          spacing={4}
          overflowY="auto"
          minH={0}
          position="relative"
        >
          {/* Stats grid - Now in a single row */}
          <Grid 
            templateColumns="repeat(4, 1fr)" 
            gap={3}
            flex="none"
          >
            <Box
              p={3}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Daily token creation rate for this node" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Daily Budget</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.dailyUnlock)} {tokenSymbol}/day
                  </Text>
                </VStack>
              </Tooltip>
            </Box>

            <Box
              p={3}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Total supply of tokens in the node's budget" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Total Value</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.totalSupply)} {tokenSymbol}
                  </Text>
                </VStack>
              </Tooltip>
            </Box>

            <Box
              p={3}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Daily inflation rate" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Inflow Rate</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.inflow)} {tokenSymbol}/day
                  </Text>
                </VStack>
              </Tooltip>
            </Box>

            <Box
              p={3}
              bg={statsBg}
              borderRadius="lg"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            >
              <Tooltip label="Current balance available in the node's budget" fontSize="sm">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedColor}>Available Shares</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {formatCurrency(metrics.availableShares)} {tokenSymbol}
                  </Text>
                </VStack>
              </Tooltip>
            </Box>
          </Grid>

          {/* Characteristics, Membrane Requirements, and Members side by side */}
          <HStack align="stretch" spacing={4} w="100%" minH={0}>
            {/* Characteristics section */}
            <Box
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              overflowY="auto"
              minH={0}
              flex={1}
              maxH="220px"
            >
              <VStack align="stretch" spacing={2} p={3} h="100%">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Characteristics</Text>
                  <Badge colorScheme="purple" variant="subtle" borderRadius="full">
                    {membraneCharacteristics.length}
                  </Badge>
                </HStack>
                <Box 
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
                  {membraneCharacteristics.map((char, index) => {
                    const linkIsLink = isLink(char.link);
                    return (
                      <Box key={index}>
                        <HStack
                          py={1.5}
                          px={2}
                          borderRadius="md"
                          _hover={{ bg: hoverBg, cursor: linkIsLink ? 'pointer' : 'pointer' }}
                          transition="all 0.2s"
                          onClick={() => {
                            if (linkIsLink) {
                              window.open(char.link, '_blank');
                            } else {
                              setExpandedCharIndex(expandedCharIndex === index ? null : index);
                            }
                          }}
                        >
                          <Text fontSize="sm" isTruncated flex={1}>
                            {char.title}
                          </Text>
                          {linkIsLink ? (
                            <ExternalLink size={16} color={selectedTokenColor} />
                          ) : (
                            expandedCharIndex === index ? (
                              <ChevronUp size={16} color={selectedTokenColor} />
                            ) : (
                              <ChevronDown size={16} color={selectedTokenColor} />
                            )
                          )}
                        </HStack>
                        {/* Expandable description drawer */}
                        {!linkIsLink && expandedCharIndex === index && (
                          <Box
                            bg={hoverBg}
                            borderRadius="md"
                            mt={1}
                            mb={2}
                            px={3}
                            py={2}
                          >
                            <Text fontSize="sm" color={mutedColor} whiteSpace="pre-line">
                              {char.link || char.title}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </VStack>
            </Box>

            {/* Membrane Requirements section */}
            <Box
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              overflowY="auto"
              minH={0}
              flex={1}
              maxH="220px"
            >
              <VStack align="stretch" spacing={2} p={3} h="100%">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Membrane Requirements</Text>
                  <Badge colorScheme="purple" variant="subtle" borderRadius="full">
                    {normalizedMembraneRequirements.length}
                  </Badge>
                </HStack>
                <RequirementsTable 
                  requirements={normalizedMembraneRequirements}
                  chainId={chainId}
                />
              </VStack>
            </Box>

            {/* Members section */}
            <Box
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              overflowY="auto"
              minH={0}
              flex={1}
              maxH="220px"
            >
              <VStack align="stretch" spacing={2} p={3} h="100%">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">Members ({metrics.memberCount})</Text>
                </HStack>
                <Box 
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
                      py={1.5}
                      px={2}
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
          </HStack>
        </VStack>

        {/* Right column - Chart */}
        <Box 
          w="33%" 
          minH={0}
          overflowY="hidden"
        >
          <TreemapChart
            nodeData={node}
            chainId={chainId}
            selectedTokenColor={selectedTokenColor}
            tokenSymbol={tokenSymbol}
          />
        </Box>
      </HStack>
    </Box>
  );
};

export default NodeInfo;