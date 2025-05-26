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
import { isEndpoint, getEndpointDisplayName } from '../../../utils/formatters';


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
  membersOfNode: string[];
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
  const [endpointNames, setEndpointNames] = useState<Map<string, string>>(new Map());

  // Add fetchNodeData function
  const fetchNodeData = useCallback(async (childId: string) => {
    if (!ready || !chainId || !user?.wallet?.address) return null;

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      
      if (!deployments.WillWe[cleanChainId]) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
      
      const contract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        provider
      );

      const node = await contract.getNodeData(childId, user.wallet.address);
      if (!node?.basicInfo?.[0]) return null;

      let membraneName = node.basicInfo[0].slice(-6);
      let membersOfNode = node.membersOfNode || [];
      
      try {
        if (node.membraneMeta && typeof node.membraneMeta === 'string' && node.membraneMeta.trim() !== '') {
          // Check if it's an IPFS hash (starts with Qm)
          if (node.membraneMeta.trim().startsWith('Qm')) {
            // Use our new IPFS metadata endpoint
            const response = await fetch(`/api/ipfs/metadata?cid=${node.membraneMeta.trim()}`);
            if (response.ok) {
              const data = await response.json();
              if (data.metadata?.name) {
                membraneName = data.metadata.name;
              }
            }
          } else {
            // Use token metadata endpoint for addresses
            const response = await fetch(`/api/tokens/metadata?address=${node.membraneMeta.trim()}&chainId=${cleanChainId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.metadata?.name) {
                membraneName = data.metadata.name;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching membrane metadata:', error);
      }

      // Get the signal value for this child
      let currentSignalBasisPoints = 0;
      try {
        const signals = await contract.getUserNodeSignals(user.wallet.address, nodeId);
        const childIndex = parentNodeData?.childrenNodes?.indexOf(childId);
        if (childIndex !== undefined && childIndex >= 0 && signals.length > childIndex + 2) {
          currentSignalBasisPoints = Number(signals[childIndex + 2]);
        }
      } catch (error) {
        console.error('Error fetching signals:', error);
      }

      return {
        nodeId: node.basicInfo[0],
        parentId: nodeId,
        membraneId: node.basicInfo[5],
        membraneName,
        currentSignal: currentSignalBasisPoints,
        eligibilityPerSecond: '0',
        membersOfNode,
      };
    } catch (error) {
      console.error('Error fetching node data:', error);
      return null;
    }
  }, [chainId, nodeId, parentNodeData?.childrenNodes, ready, user?.wallet?.address]);

  // Add endpoint name resolution
  useEffect(() => {
    const fetchEndpointNames = async () => {
      if (!parentNodeData?.childrenNodes) return;

      const endpointLabels = new Map<string, string>();
      try {
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId.toString()));
        const executionAddress = deployments.Execution[chainId.toString()];

        await Promise.all(parentNodeData.childrenNodes.map(async (childId) => {
          // Check if this is an endpoint by checking its rootPath
          if (parentNodeData.rootPath && parentNodeData.rootPath.length > 0) {
            const parentNodeId = parentNodeData.rootPath[parentNodeData.rootPath.length - 1];
            if (isEndpoint(childId, parentNodeId)) {
              const endpointName = await getEndpointDisplayName(
                childId,
                parentNodeId,
                provider,
                chainId.toString()
              );
              if (endpointName) {
                endpointLabels.set(childId, endpointName);
              }
            }
          }
        }));

        setEndpointNames(endpointLabels);
      } catch (error) {
        console.error('Error fetching endpoint names:', error);
      }
    };

    fetchEndpointNames();
  }, [parentNodeData?.childrenNodes, parentNodeData?.rootPath, nodeId, chainId]);

  // Update the children data mapping to include endpoint names
  useEffect(() => {
    const loadChildrenData = async () => {
      if (!parentNodeData?.childrenNodes) {
        setLoadingChildren(false);
        return;
      }

      try {
        const children = await Promise.all(
          parentNodeData.childrenNodes.map(async (childId: string) => {
            const childData = await fetchNodeData(childId);
            if (!childData) return null;

            let displayName = childData.membraneName || childId.slice(-6);
            // Use isEndpoint logic as in SankeyChart
            if (isEndpoint(childId, nodeId)) {
              // Use getEndpointDisplayName for endpoint label
              const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId.toString()));
              const executionAddress = deployments.Execution[chainId.toString()];
              let endpointDisplay = await getEndpointDisplayName(
                childId,
                nodeId,
                provider,
                chainId.toString()
              );
              // Only append 0x... if not a user endpoint (door emoji)
              if (endpointDisplay && !endpointDisplay.startsWith('🚪') && endpointDisplay.length === 2 && !/\w/.test(endpointDisplay)) {
                endpointDisplay += ` 0x${childId.slice(0, 6)}`;
              }
              displayName = endpointDisplay;
            }

            // Convert basis points to percentage for slider value
            const sliderValue = childData.currentSignal ? childData.currentSignal / 100 : 0;

            // Initialize slider value for this child
            setSliderValues(prev => ({
              ...prev,
              [childId]: sliderValue
            }));

            return {
              nodeId: childId,
              parentId: nodeId,
              membraneId: childData.membraneId || '',
              membraneName: displayName,
              currentSignal: childData.currentSignal || 0,
              eligibilityPerSecond: childData.eligibilityPerSecond || '0',
            };
          })
        );

        const validChildren = children.filter(Boolean) as ChildData[];
        setChildrenData(validChildren);

        // Calculate initial total allocation from the actual signal values
        const initialTotal = validChildren.reduce((sum: number, child: ChildData) => {
          const childValue = sliderValues[child.nodeId] || 0;
          return sum + (childValue * 100); // Convert back to percentage for total
        }, 0);
        setTotalAllocation(initialTotal);
      } catch (error) {
        console.error('Error fetching children data:', error);
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildrenData();
  }, [parentNodeData?.childrenNodes, nodeId, endpointNames, fetchNodeData]);

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
                        value={sliderValues[child.nodeId] ?? 0}
                        lastSignal={(child.currentSignal || 0).toString()}
                        balance={child.eligibilityPerSecond || '0'}
                        eligibilityPerSecond={child.eligibilityPerSecond || '0'}
                        totalInflationPerSecond="0"
                        onChange={(v) => handleSliderChange(child.nodeId, v)}
                        onChangeEnd={(v) => handleSliderChange(child.nodeId, v)}
                        isDisabled={isSubmitting}
                        selectedTokenColor="purple.500"
                        chainId={chainId}
                        totalAllocation={totalAllocation || 0}
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