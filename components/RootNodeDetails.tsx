import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  useColorModeValue, 
  Text, 
  VStack,
  HStack,
  Button,
  InputGroup,
  Input,
  InputRightElement,
  Tooltip,
} from '@chakra-ui/react';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown,
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import debounce from 'lodash/debounce';
import NodeList from './Node/NodeList';
import { useRootNodes } from '../hooks/useRootNodes';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { useNodeHierarchy } from '../hooks/useNodeHierarchy';
import NotificationToast from './NotificationToast';
import { formatBalance } from '../hooks/useBalances';
import { createPortal } from 'react-dom';

const CONSTANTS = {
  SCROLL_BAR_WIDTH: '4px',
  NODE_INDENT: 6,
  CONNECTOR_WIDTH: '24px',
  PORTAL_Z_INDEX: 1000,
  MIN_SEARCH_LENGTH: 2,
  DEFAULT_TOAST_DURATION: 5000,
  SEARCH_DEBOUNCE_MS: 300,
  LOADING_SKELETONS: 3,
} as const;

type SortTypes = 'value' | 'members' | 'depth';
const SORT_OPTIONS: SortTypes[] = ['value', 'members', 'depth'];

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
  userAddress: string;
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
}

const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({
  chainId,
  rootToken,
  userAddress,
  selectedTokenColor,
  onNodeSelect
}) => {
  // State management
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<SortTypes>('value');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [localErrors, setLocalErrors] = useState<{[key: string]: Error}>({});

  // Hooks
  const { user } = usePrivy();
  const { rootNodeStates, isLoading, error, refetch } = useRootNodes(chainId, rootToken, userAddress);

  // Process all nodes
  const allNodes = React.useMemo(() => {
    return rootNodeStates?.flatMap(state => state?.nodes || [])
      .filter(node => node?.basicInfo?.[0]) || [];
  }, [rootNodeStates]);

  // Use node hierarchy
  const { rootNodes, nodeValues, totalValue } = useNodeHierarchy(allNodes);

  // Node operations
  const { transactions, isProcessing, error: txError } = useNodeOperations(
    chainId,
    rootNodes && rootNodes.length > 0 ? rootNodes[0] : null,
    user?.wallet?.address
  );

  // Styles
  const bgColor = useColorModeValue('white', 'gray.800');
  const searchBorderColor = useColorModeValue('gray.200', 'gray.600');
  const searchHoverBorderColor = useColorModeValue('gray.300', 'gray.500');
  const buttonHoverBg = useColorModeValue(`${selectedTokenColor}15`, `${selectedTokenColor}30`);

  // Search debouncing
  const debouncedSearch = useCallback(
    debounce((value: string) => setSearchTerm(value), CONSTANTS.SEARCH_DEBOUNCE_MS),
    []
  );

  // Effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      setContainerHeight(window.innerHeight - 250);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Error handling for transaction context errors
  useEffect(() => {
    if (txError) {
      const errorId = Date.now().toString();
      setLocalErrors(prev => ({
        ...prev,
        [errorId]: txError
      }));
    }
  }, [txError]);

  // Filter and sort nodes
  const filteredNodes = React.useMemo(() => {
    if (!allNodes.length) return [];
    
    let filtered = [...allNodes];

    if (searchTerm && searchTerm.length >= CONSTANTS.MIN_SEARCH_LENGTH) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(node => {
        if (!node?.basicInfo?.[0] || !node?.membersOfNode) return false;
        
        return (
          node.basicInfo[0].toLowerCase().includes(searchLower) ||
          node.membersOfNode.some(member => 
            member?.toLowerCase?.()?.includes?.(searchLower)
          )
        );
      });
    }

    return filtered.sort((a, b) => {
      if (!a?.basicInfo || !b?.basicInfo) return 0;
      
      let comparison = 0;
      switch (sortBy) {
        case 'value':
          try {
            comparison = Number(
              BigInt(b.basicInfo[4] || '0') - BigInt(a.basicInfo[4] || '0')
            );
          } catch {
            comparison = 0;
          }
          break;
        case 'members':
          comparison = (b.membersOfNode?.length || 0) - (a.membersOfNode?.length || 0);
          break;
        case 'depth':
          comparison = (b.rootPath?.length || 0) - (a.rootPath?.length || 0);
          break;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });
  }, [allNodes, searchTerm, sortBy, sortDirection]);

  // Action handlers
  const handleSpawnNode = useCallback(async () => {
    try {
      await transactions.spawn();
      await refetch();
    } catch (error) {
      const errorId = Date.now().toString();
      setLocalErrors(prev => ({
        ...prev,
        [errorId]: error as Error
      }));
    }
  }, [transactions, refetch]);

  const handleMintMembership = useCallback(async (nodeId: string) => {
    try {
      await transactions.mintMembership();
      await refetch();
    } catch (error) {
      const errorId = Date.now().toString();
      setLocalErrors(prev => ({
        ...prev,
        [errorId]: error as Error
      }));
    }
  }, [transactions, refetch]);

  const handleTrickle = useCallback(async (nodeId: string) => {
    try {
      await transactions.redistribute();
      await refetch();
    } catch (error) {
      const errorId = Date.now().toString();
      setLocalErrors(prev => ({
        ...prev,
        [errorId]: error as Error
      }));
    }
  }, [transactions, refetch]);

  const handleRemoveError = useCallback((errorId: string) => {
    setLocalErrors(prev => {
      const next = { ...prev };
      delete next[errorId];
      return next;
    });
  }, []);

  if (isLoading || !rootToken) {
    return null;
  }

  return (
    <Box p={4} bg={bgColor} borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <HStack spacing={4} wrap="wrap">
          <Button
            leftIcon={<Plus size={14} />}
            onClick={handleSpawnNode}
            size="sm"
            colorScheme="gray"
            variant="outline"
            isDisabled={!user?.wallet?.address || isProcessing}
            isLoading={isProcessing}
            _hover={{ bg: buttonHoverBg }}
          >
            New Root Node
          </Button>

          <InputGroup size="sm" maxW="300px">
            <Input
              aria-label="Search nodes"
              placeholder="Search nodes..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                debouncedSearch(e.target.value);
              }}
              borderColor={searchBorderColor}
              _hover={{ borderColor: searchHoverBorderColor }}
              _focus={{
                borderColor: selectedTokenColor,
                boxShadow: `0 0 0 1px ${selectedTokenColor}`
              }}
            />
            <InputRightElement>
              <Search size={14} color={selectedTokenColor} aria-hidden="true" />
            </InputRightElement>
          </InputGroup>

          <HStack>
            <Tooltip label="Sort by">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSortBy(current => {
                  const currentIndex = SORT_OPTIONS.indexOf(current);
                  return SORT_OPTIONS[(currentIndex + 1) % SORT_OPTIONS.length];
                })}
                leftIcon={<Filter size={14} />}
              >
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </Button>
            </Tooltip>

            <Tooltip label="Toggle sort direction">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                leftIcon={<ArrowUpDown size={14} />}
              >
                {sortDirection.toUpperCase()}
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        <Box p={4} borderRadius="md" bg={`${selectedTokenColor}10`}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Total Value Locked
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {formatBalance(totalValue.toString())}
          </Text>
        </Box>

        <Box 
          overflowX="auto"
          overflowY="auto"
          maxHeight={`${containerHeight}px`}
          css={{
            '&::-webkit-scrollbar': {
              width: CONSTANTS.SCROLL_BAR_WIDTH,
              height: CONSTANTS.SCROLL_BAR_WIDTH,
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: selectedTokenColor,
              borderRadius: '24px',
            },
          }}
        >
          {filteredNodes.length === 0 ? (
            <Box 
              p={8} 
              textAlign="center" 
              border="1px dashed"
              borderColor={selectedTokenColor}
              borderRadius="md"
            >
              <Text color="gray.500">
                {user?.wallet?.address 
                  ? searchTerm 
                    ? `No nodes found matching "${searchTerm}"`
                    : 'No nodes found. Create a new root node to get started.'
                  : 'Please connect your wallet to view or create nodes.'}
              </Text>
            </Box>
          ) : (
            <NodeList
              nodes={filteredNodes}
              totalValue={totalValue}
              selectedTokenColor={selectedTokenColor}
              onNodeSelect={onNodeSelect}
              onMintMembership={handleMintMembership}
              onSpawnNode={handleSpawnNode}
              onTrickle={handleTrickle}
              nodeValues={nodeValues}
              isProcessing={isProcessing}
            />
          )}
        </Box>
      </VStack>

      {portalContainer && createPortal(
        <Box
          position="fixed"
          bottom={4}
          right={4}
          zIndex={CONSTANTS.PORTAL_Z_INDEX}
        >
          {isProcessing && (
            <NotificationToast
              status="pending"
              title="Transaction Pending"
              description="Your transaction is being processed"
              onClose={() => {}}
            />
          )}
          {Object.entries(localErrors).map(([id, error]) => (
            <NotificationToast
              key={id}
              id={id}
              status="error"
              title="Transaction Failed"
              description={error.message}
              onClose={() => handleRemoveError(id)}
            />
          ))}
        </Box>,
        portalContainer
      )}
    </Box>
  );
};

export default RootNodeDetails;