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
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { useNodeTransactions } from '../../../hooks/useNodeTransactions';
import { useNodeData } from '../../../hooks/useNodeData';
import { fetchIPFSMetadata } from '../../../utils/ipfs';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { ethers, formatUnits } from 'ethers';
import { NodeState } from '../../../types/chainData';
import MembraneSection from './MembraneSection';
import InflationSection from './InflationSection';
import SignalSlider from './SignalSlider';
import Link from 'next/link';


interface SignalFormProps {
  chainId: string;
  nodeId: string;
  parentNodeData: NodeState | null;
  onSuccess?: () => void;
}

type ChildData = {
  nodeId: string;
  parentId: string;
  membraneId: string;
  membraneName: string;
  currentSignal: number;
  eligibilityPerSecond: string;
};

const SignalForm: React.FC<SignalFormProps> = ({ chainId, nodeId, parentNodeData, onSuccess }) => {
  const { user, ready } = usePrivy();
  const { signal } = useNodeTransactions(chainId);

  // State declarations
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
  const [membraneMetadata, setMembraneMetadata] = useState<Record<string, any>>({});
  const [membraneRequirements, setMembraneRequirements] = useState<Record<string, any>>({});

  // Handlers
  const handleMembraneChange = useCallback((nodeId: string, value: string) => {
    setMembraneValues(prev => ({
      ...prev,
      [nodeId]: value
    }));
  }, []);

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
    if (Math.abs(totalAllocation - 100) > 0.01) {
      setError('Total allocation must equal 100%');
      return;
    }
  
    try {
      setIsSubmitting(true);
      setError(null);
  
      // Convert signals to basis points
      const signalArray = [
        // Convert membrane value to number or default to 0
        parseInt(membraneValues[nodeId] || '0'),
        // Convert inflation value to number or default to 0
        parseInt(inflationRates[nodeId] || '0'),
        // Add the child node signals converted to basis points
        ...childrenData.map(child => {
          // Convert percentage directly to basis points
          // If slider shows 75.66%, this should become 7566 basis points
          return Math.round(sliderValues[child.nodeId] * 100)
        })
      ];
  
      // Verify the sum of child signals equals 10000 (100.00%)
      const childSignalsSum = signalArray.slice(2).reduce((sum, val) => sum + val, 0);
      if (childSignalsSum !== 10000) {
        throw new Error(`Invalid signal sum: ${childSignalsSum}. Expected 10000 basis points.`);
      }
      console.log("Submitting signals:", signalArray);
      await signal(nodeId, signalArray);
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

      const childNodes = await contract.getNodes(parentNodeData.childrenNodes);
      const existingSignals = await contract.getUserNodeSignals(
        user.wallet.address,
        nodeId
      );

      // Add validation for childNodes
      if (!childNodes || childNodes.length === 0) {
        throw new Error('No child nodes returned from contract');
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
              // Hardcode the IPFS gateway URL and use CID directly
              const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
              const metadataUrl = `${IPFS_GATEWAY}${node.membraneMeta.trim()}`;
              
              console.log('Fetching metadata from:', metadataUrl); // Debug log
              
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
            // Continue with default membraneName
          }

          const currentSignalBasisPoints = Number(existingSignals[index]?.[0] || 0);

          return {
            nodeId: node.basicInfo[0],
            parentId: nodeId,
            membraneId: node.basicInfo[5],
            membraneName,
            currentSignal: currentSignalBasisPoints,
            eligibilityPerSecond: '0' // Default to 0 if calculation fails
          };
        })
      );

      // Filter out any null values from failed mappings
      const validChildren = childrenWithMetadata.filter(child => child !== null);
      
      if (validChildren.length === 0) {
        throw new Error('No valid children data could be processed');
      }

      setChildrenData(validChildren);
      
      // Initialize sliders
      const initialValues = Object.fromEntries(
        validChildren.map(child => [
          child.nodeId,
          child.currentSignal / 100
        ])
      );
      
      setSliderValues(initialValues);
      
      // Calculate initial total with explicit typing
      const initialTotal = Object.values(initialValues).reduce((sum: number, val: unknown) => sum + (Number(val) || 0), 0);
      setTotalAllocation(Number(initialTotal));

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

  // Render main component
  return (
    <VStack spacing={6} width="100%">
      {/* Membrane Section - Full width */}
      <Box width="100%">
        <MembraneSection
          membraneId={membraneValues[nodeId] || ''}
          setMembraneId={(value) => handleMembraneChange(nodeId, value)}
          membraneMetadata={membraneMetadata[nodeId]}
          membraneRequirements={membraneRequirements[nodeId] || []}
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
                childId={child.nodeId}
                value={sliderValues[child.nodeId] }
                lastSignal={(child.currentSignal).toString()}
                balance={child.eligibilityPerSecond}
                eligibilityPerSecond={child.eligibilityPerSecond}
                totalInflationPerSecond="0" // Add this from parent node data if available
                onChange={(v) => handleSliderChange(child.nodeId, v)}
                onChangeEnd={(v) => handleSliderChange(child.nodeId, v)}
                isDisabled={isSubmitting}
                selectedTokenColor="purple.500"
                chainId={chainId}
              />
            </VStack>
          </Box>
        ))}

        {/* Total Allocation */}
        <Box width="100%" p={4} bg="gray.50" borderRadius="md">
          <HStack justify="space-between">
            <Text>Total Allocation:</Text>
            <Text 
              fontWeight="bold"
              color={Math.abs(totalAllocation - 100) < 0.01 ? 'green.500' : 'red.500'}
            >
              {Number(totalAllocation).toFixed(2)}%
            </Text>
          </HStack>
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
            Math.abs(totalAllocation - 100) > 0.01 ||
            !user?.wallet?.address
          }
        >
          Submit Signals
        </Button>
      </VStack>
    </VStack>
  );
};

export default SignalForm;