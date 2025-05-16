import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Button, 
  Alert,
  AlertIcon,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { useNodeTransactions } from '../../../hooks/useNodeTransactions';
import { useNodeData } from '../../../hooks/useNodeData';
import { fetchIPFSMetadata } from '../../../utils/ipfs';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { ethers } from 'ethers';
import { NodeState } from '../../../types/chainData';
import MembraneSection from './MembraneSection';
import InflationSection from './InflationSection';
import SignalSlider from './SignalSlider';
import ExistingSignalsTab from './ExistingSignalsTab';
import Link from 'next/link';
import { Signal, History } from 'lucide-react';


interface SignalFormProps {
  chainId: string;
  nodeId: string;
  parentNodeData: NodeState | null;
  onSuccess?: () => void;
  tokenSymbol?: string;
}

type ChildData = {
  nodeId: string;
  parentId: string;
  membraneId: string;
  membraneName: string;
  currentSignal: number;
  eligibilityPerSecond: string;
};

interface MembraneMetadata {
  id: string;
  name: string;
}

interface MembraneRequirement {
  tokenAddress: string;
  amount: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

const SignalForm: React.FC<SignalFormProps> = ({ chainId, nodeId, parentNodeData, onSuccess, tokenSymbol = 'PSC' }) => {
  const { user, ready } = usePrivy();
  const { signal } = useNodeTransactions(chainId);

  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [eligibilityImpacts, setEligibilityImpacts] = useState<{ [key: string]: string }>({});
  const [membraneValues, setMembraneValues] = useState<Record<string, string>>({});
  const [inflationRates, setInflationRates] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [membraneRequirements, setMembraneRequirements] = useState<MembraneRequirement[]>([]);

  // Move this function before handleMembraneChange
  const validateAndFetchMembraneData = useCallback(async (membraneId: string) => {
    if (!membraneId) return;
    setIsValidating(prev => ({ ...prev, [nodeId]: true }));
    
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const membraneContract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        provider
      );

      // Fetch membrane data from contract
      const membrane = await membraneContract.getMembraneById(membraneId);
      
      if (!membrane) {
        throw new Error('Invalid membrane ID');
      }

      // Fetch metadata from IPFS if available
      if (membrane.meta) {
        const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
        const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
        if (!response.ok) throw new Error('Failed to fetch membrane metadata');
        const metadata = await response.json();
        setMembraneMetadata({
          id: membraneId,
          name: metadata.name || `Membrane ${membraneId}`
        });
      }

      // Process token requirements
      const requirements = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function symbol() view returns (string)'],
            provider
          );

          const symbol = await tokenContract.symbol();
          const balance = membrane.balances[index];
          
          return {
            tokenAddress,
            symbol,
            amount: balance.toString(),
            requiredBalance: balance.toString(),
            formattedBalance: ethers.formatUnits(balance, 18)
          };
        })
      );

      setMembraneRequirements(requirements);
    } catch (err) {
      console.error('Error validating membrane:', err);
      setMembraneMetadata(null);
      setMembraneRequirements([]);
    } finally {
      setIsValidating(prev => ({ ...prev, [nodeId]: false }));
    }
  }, [chainId, nodeId]);

  const handleMembraneChange = useCallback((nodeId: string, value: string) => {
    setMembraneValues(prev => ({
      ...prev,
      [nodeId]: value
    }));
    validateAndFetchMembraneData(value);
  }, [validateAndFetchMembraneData]);

  const handleInflationChange = useCallback((nodeId: string, value: string) => {
    setInflationRates(prev => ({
      ...prev,
      [nodeId]: value
    }));
  }, []);

  // Utility functions
  const fetchIPFSMetadata = useCallback(async (ipfsHash: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${ipfsHash}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      return null;
    }
  }, []);

  // Add getContract utility function
  const getContract = useCallback(async () => {
    const cleanChainId = chainId.replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    return new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      provider
    );
  }, [chainId]);

  // Calculate eligibility impact function
  const calculateEligibilityImpact = useCallback(async (childId: string, newValue: number) => {
    if (!user?.wallet?.address) {
      console.warn('User wallet not ready');
      return;
    }

    try {
      const contract = await getContract();
      const currentSignal = sliderValues[childId] || 0;
      
      const newEligibility = await contract.calculateUserTargetedPreferenceAmount(
        childId,
        nodeId,
        newValue,
        user.wallet.address
      );
      
      const currentEligibility = await contract.calculateUserTargetedPreferenceAmount(
        childId,
        nodeId,
        currentSignal,
        user.wallet.address
      );

      const impact = newEligibility.sub(currentEligibility);
      const formattedImpact = ethers.formatUnits(impact, 18);
      
      setEligibilityImpacts(prev => ({
        ...prev,
        [childId]: formattedImpact
      }));
    } catch (error) {
      console.error('Error calculating eligibility impact:', error);
    }
  }, [getContract, nodeId, sliderValues, user?.wallet?.address]);

  // Event handlers after all utility functions
  const handleSliderChange = useCallback((childId: string, newValue: number) => {
    setSliderValues(prev => ({
      ...prev,
      [childId]: newValue
    }));

    // Recalculate total with 2 decimal precision
    const newTotal = Object.values({
      ...sliderValues,
      [childId]: newValue
    }).reduce((sum, val) => sum + (val || 0), 0);
    
    setTotalAllocation(Number(newTotal));
  }, [sliderValues]);

  // New input change handler
  const handleInputChange = useCallback(async (childId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const updatedValues = {
        ...sliderValues,
        [childId]: numValue / 100
      };
      setSliderValues(updatedValues);
      
      // Calculate new total allocation
      const newTotal = Object.values(updatedValues).reduce((sum, val) => sum + (val * 100), 0);
      setTotalAllocation(newTotal);
      
      await calculateEligibilityImpact(childId, numValue / 100);
    }
  }, [calculateEligibilityImpact, sliderValues]);

  const handleSubmit = useCallback(async () => {
    // Only require 100% allocation if there are children to redistribute to
    if (childrenData.length > 0 && Math.abs(totalAllocation - 100) > 0.01) {
      setError('Total allocation must equal 100%');
      return;
    }
  
    try {
      setIsSubmitting(true);
      setError(null);
  
      // Convert signals to basis points
      const signalArray = [
        // Convert membrane value to string or default to '0'
        (membraneValues[nodeId] || '0').toString(),
        // Convert inflation value to string or default to '0'
        (inflationRates[nodeId] || '0').toString(),
        // Add the child node signals converted to basis points as strings
        ...childrenData.map(child => {
          // Convert percentage to basis points (multiply by 100)
          // If slider shows 75.66%, this becomes 7566
          const basisPoints = Math.round(sliderValues[child.nodeId] * 100);
          // Convert to string and ensure no scientific notation
          return basisPoints.toLocaleString('fullwide', { useGrouping: false });
        })
      ];
  
      // Only verify child signals sum if there are children
      if (childrenData.length > 0) {
        const childSignalsSum = signalArray.slice(2).reduce((sum, val) => sum + Number(val), 0);
        if (childSignalsSum !== 10000) {
          throw new Error(`Invalid signal sum: ${childSignalsSum}. Expected 10000 basis points.`);
        }
      }

      console.log("Submitting signals:", signalArray);
      console.log("Signal array as strings:", signalArray.map(String));
      await signal(nodeId, signalArray.map(String));
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error submitting signals:', error);
      setError(error.message || 'Failed to submit signals');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    childrenData, 
    sliderValues, 
    signal, 
    nodeId, 
    totalAllocation, 
    onSuccess, 
    membraneValues, 
    inflationRates
  ]);

  // Fetch children data
  const fetchChildrenData = useCallback(async () => {
    // Add more detailed validation
    if (!ready) {
      console.log('Privy not ready');
      setLoadingChildren(false);
      return;
    }
    
    if (!chainId) {
      console.log('No chainId provided');
      setLoadingChildren(false);
      return;
    }
    
    if (!parentNodeData) {
      console.log('No parent node data');
      setLoadingChildren(false);
      return;
    }
    
    if (!user?.wallet?.address) {
      console.log('No wallet address');
      setLoadingChildren(false);
      return;
    }

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      
      // Validate contract address
      if (!deployments.WillWe[cleanChainId]) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
      
      const contract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        provider
      );

      // Validate children nodes exist
      if (!parentNodeData.childrenNodes || parentNodeData.childrenNodes.length === 0) {
        setChildrenData([]);
        setLoadingChildren(false);
        return;
      }

      // Use getAllNodesForRoot instead of getNodes, which was removed
      // First, get the root address from the parent node data
      const rootId = parentNodeData.rootPath && parentNodeData.rootPath.length > 0 ? 
        parentNodeData.rootPath[0] : nodeId;
      
      console.log('Getting nodes for root ID:', rootId);
      
      let childNodes: any[] = [];
      
      try {
        // getAllNodesForRoot takes an address as the first parameter, not an ID
        // Convert rootId to an address
        const rootAddress = ethers.getAddress(ethers.toBeHex(rootId, 20));
        
        // Get the user address
        const userAddress = user?.wallet?.address ? 
          ethers.getAddress(user.wallet.address) : ethers.ZeroAddress;
        
        console.log('Root ID converted to address:', rootAddress);
        console.log('User address:', userAddress);
        
        // Call getAllNodesForRoot with address parameters
        const allNodesForRoot = await contract.getAllNodesForRoot(rootAddress, userAddress);
        console.log('All nodes for root:', allNodesForRoot);
        
        // Filter nodes to only include the children nodes we need
        const childNodeIds = parentNodeData.childrenNodes.map(id => id.toString());
        childNodes = allNodesForRoot.filter((node: any) => 
          node && node.basicInfo && childNodeIds.includes(node.basicInfo[0].toString())
        );
      } catch (error) {
        console.error('Error using getAllNodesForRoot:', error);
        console.log('Falling back to individual node queries');
        
        // Fallback: Get nodes individually
        const nodePromises = parentNodeData.childrenNodes.map(childId => 
          contract.getNodeData(childId, user?.wallet?.address)
            .catch(err => {
              console.error(`Error getting data for node ${childId}:`, err);
              return null;
            })
        );
        
        childNodes = await Promise.all(nodePromises);
        childNodes = childNodes.filter(Boolean);
      }
      
      console.log('Filtered child nodes:', childNodes);

      // Add validation for childNodes
      if (!childNodes || childNodes.length === 0) {
        throw new Error('No child nodes returned from contract');
      }

      // Get signals for the parent node
      let parentSignals: string[] = [];
      try {
        const signals = await contract.getUserNodeSignals(
          user?.wallet?.address,
          nodeId
        );
        parentSignals = signals.map((signal: any) => signal.toString());
        console.log('Parent node signals:', parentSignals);
      } catch (error) {
        console.error('Error fetching parent signals:', error);
        parentSignals = [];
      }

      const childrenWithMetadata = await Promise.all(
        childNodes.map(async (node: any, index: number) => {
          // Validate node data
          if (!node?.basicInfo?.[0]) {
            console.error('Invalid node data:', node);
            return null;
          }

          // Rest of your mapping logic...
          let membraneName = node.basicInfo[0].slice(-6);
          
          try {
            if (node.membraneMeta && typeof node.membraneMeta === 'string' && node.membraneMeta.trim() !== '') {
              const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
              const metadataUrl = `${IPFS_GATEWAY}${node.membraneMeta.trim()}`;
              
              
              const response = await fetch(metadataUrl);
              if (response.ok) {
                const metadata = await response.json();
                membraneName = metadata.title || metadata.name || membraneName;
              } else {
                console.error('Failed to fetch metadata:', response.status, response.statusText);
              }
            }
          } catch (error) {
            console.error('Error fetching membrane metadata:', error);
          }

          // Get the signal value for this child from the parent's signals array
          // The first two elements are membrane and inflation, then child signals follow
          let currentSignalBasisPoints = 0;
          const childIndex = index + 2; // +2 to skip membrane and inflation values
          if (parentSignals.length > childIndex) {
            currentSignalBasisPoints = Number(parentSignals[childIndex]);
          }

          return {
            nodeId: node.basicInfo[0],
            parentId: nodeId,
            membraneId: node.basicInfo[5],
            membraneName,
            currentSignal: currentSignalBasisPoints,
            eligibilityPerSecond: '0'
          };
        })
      );

      // Filter out any null values from failed mappings
      const validChildren = childrenWithMetadata.filter(child => child !== null);
      
      if (validChildren.length === 0) {
        throw new Error('No valid children data could be processed');
      }

      // Initialize sliders with values from parent signals
      const initialValues = childrenWithMetadata
        .filter((child): child is ChildData => child !== null)
        .reduce((acc, child, index) => {
          const childIndex = index + 2; // +2 to skip membrane and inflation values
          // Convert basis points to percentage (10000 = 100%)
          const signalValue = parentSignals[childIndex] ? Number(parentSignals[childIndex]) / 100 : 0;
          acc[child.nodeId] = signalValue;
          return acc;
        }, {} as Record<string, number>);
      
      setSliderValues(initialValues);
      
      // Calculate initial total
      const initialTotal = Object.values(initialValues).reduce((sum, val) => sum + val, 0);
      setTotalAllocation(initialTotal);

      setChildrenData(childrenWithMetadata.filter((child): child is ChildData => child !== null));

    } catch (error) {
      console.error('Error in fetchChildrenData:', error);
      setError(error instanceof Error ? error.message : 'Failed to load children nodes');
    } finally {
      setLoadingChildren(false);
    }
  }, [chainId, parentNodeData, user?.wallet?.address, ready, nodeId]);

  useEffect(() => {
    fetchChildrenData();
  }, [fetchChildrenData]);

  // Handle selecting a membrane from existing signals
  const handleSelectMembrane = useCallback((membraneId: string) => {
    handleMembraneChange(nodeId, membraneId);
  }, [handleMembraneChange, nodeId]);

  // Handle selecting an inflation rate from existing signals
  const handleSelectInflation = useCallback((inflationRate: string) => {
    handleInflationChange(nodeId, inflationRate);
  }, [handleInflationChange, nodeId]);

  // Render loading state
  if (!ready || loadingChildren) {
    return (
      <VStack spacing={4} align="stretch" width="100%">
        <Progress size="xs" isIndeterminate colorScheme="purple" />
        <Text textAlign="center">Loading signals...</Text>
      </VStack>
    );
  }

  // Render wallet connection state
  if (!user?.wallet?.address) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Please connect your wallet to view signals
      </Alert>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // Render main component with tabs
  return (
    <VStack spacing={6} width="100%">
      <Tabs variant="enclosed" colorScheme="purple" width="100%">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <Signal size={16} />
              <Text>Submit Signals</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <History size={16} />
              <Text>Current Signals</Text>
            </HStack>
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Submit Signals Tab */}
          <TabPanel p={0}>
            <VStack spacing={6} width="100%">
              {/* Membrane Section - Full width */}
              <Box width="100%">
                <MembraneSection
                  membraneId={membraneValues[nodeId] || ''}
                  setMembraneId={(value) => handleMembraneChange(nodeId, value)}
                  membraneMetadata={membraneMetadata}
                  membraneRequirements={membraneRequirements}
                  isLoadingMembrane={false}
                  isValidating={isValidating[nodeId] || false}
                  isProcessing={isSubmitting}
                />
              </Box>

              {/* Inflation Section - Full width */}
              <Box width="100%">
                <InflationSection
                  inflationRate={inflationRates[nodeId] || ''}
                  setInflationRate={(value) => handleInflationChange(nodeId, value)}
                  isProcessing={isSubmitting}
                  tokenSymbol={tokenSymbol}
                />
              </Box>

              {/* Signal Sliders Section */}
              <VStack spacing={4} width="100%">
                {childrenData.map((child) => (
                  <Box key={child.nodeId} width="100%" p={4} borderWidth="1px" borderRadius="md">
                    <VStack spacing={4} align="stretch">
                      <Link href={`/nodes/${chainId}/${child.nodeId}`} passHref>
                        <Text 
                          cursor="pointer" 
                          color="purple.500" 
                          _hover={{ 
                            textDecoration: 'underline',
                            color: 'purple.600'
                          }}
                          fontWeight="medium"
                        >
                          {child.membraneName || child.nodeId.slice(-6)}
                        </Text>
                      </Link>
                      
                      <SignalSlider
                        nodeId={nodeId}
                        parentId={child.nodeId}
                        value={sliderValues[child.nodeId]}
                        lastSignal={(child.currentSignal).toString()}
                        balance={child.eligibilityPerSecond}
                        eligibilityPerSecond={child.eligibilityPerSecond}
                        totalInflationPerSecond="0"
                        onChange={(v) => handleSliderChange(child.nodeId, v)}
                        onChangeEnd={(v) => handleSliderChange(child.nodeId, v)}
                        isDisabled={isSubmitting}
                        selectedTokenColor="purple.500"
                        chainId={chainId}
                        totalAllocation={totalAllocation}
                      />
                    </VStack>
                  </Box>
                ))}

                {/* Total Allocation */}
                <Box width="100%" p={4} borderWidth="1px" borderRadius="md">
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium">Total Allocation</Text>
                    <Progress
                      value={totalAllocation}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="full"
                    />
                    <Text fontSize="sm" color="gray.500">
                      {totalAllocation.toFixed(1)}% allocated
                    </Text>
                  </VStack>
                </Box>

                {/* Submit Button */}
                <Button
                  colorScheme="purple"
                  width="100%"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Submitting Signals..."
                  isDisabled={
                    isSubmitting || 
                    (childrenData.length > 0 && Math.abs(totalAllocation - 100) > 0.01) ||
                    !user?.wallet?.address ||
                    !parentNodeData?.membersOfNode?.includes(user?.wallet?.address || '')
                  }
                >
                  Submit Signals
                </Button>
              </VStack>
            </VStack>
          </TabPanel>
          
          {/* Current Signals Tab */}
          <TabPanel p={0}>
            <ExistingSignalsTab
              nodeId={nodeId}
              chainId={chainId}
              tokenSymbol={tokenSymbol}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default SignalForm;