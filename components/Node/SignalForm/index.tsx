import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Button,
  Alert,
  AlertIcon,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../../../contexts/TransactionContext';
import { useContractOperations } from '../../../hooks/useContractOperations';
import { useNodeData } from '../../../hooks/useNodeData';
import { fetchIPFSMetadata } from '../../../utils/ipfs';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { ethers } from 'ethers';
import { NodeState } from '../../../types/chainData';


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
  const { sendSignal } = useContractOperations(chainId);

  // State declarations
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [userSignals, setUserSignals] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAllocation, setTotalAllocation] = useState(0);

  // Handle slider changes
  const handleSliderChange = useCallback((nodeId: string, value: number) => {
    setSliderValues(prev => {
      const newValues = { ...prev, [nodeId]: value };
      const total = Object.values(newValues).reduce((sum, val) => sum + val, 0);
      setTotalAllocation(total);
      return newValues;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (Math.abs(totalAllocation - 100) > 0.01) {
      setError('Total allocation must equal 100%');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const signalArray = childrenData.map(child => 
        Math.round(sliderValues[child.nodeId] * 100)
      );

      await sendSignal(nodeId, signalArray);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error submitting signals:', error);
      setError(error.message || 'Failed to submit signals');
    } finally {
      setIsSubmitting(false);
    }
  }, [childrenData, sliderValues, sendSignal, nodeId, totalAllocation, onSuccess]);

  // Fetch children data
  const fetchChildrenData = useCallback(async () => {
    if (!ready || !chainId || !parentNodeData || !user?.wallet?.address) {
      setLoadingChildren(false);
      return;
    }

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        provider
      );

      const childNodes = await contract.getNodes(parentNodeData.childrenNodes);
      const existingSignals = await contract.getUserNodeSignals(
        user.wallet.address,
        nodeId
      );

      const childrenWithMetadata = await Promise.all(
        childNodes.map(async (node: any, index: number) => {
          // Default to last 6 chars of nodeId
          let membraneName = node.basicInfo[0].slice(-6);
          
          try {
            // Check if membraneMeta exists and is a valid CID
            if (node.membraneMeta && typeof node.membraneMeta === 'string' && node.membraneMeta.trim() !== '') {
              const metadataUrl = `${'https://underlying-tomato-locust.myfilebase.com/ipfs/'}${node.membraneMeta.replace('ipfs://', '')}`;
              console.log('Fetching metadata from:', metadataUrl);
              
              const response = await fetch(metadataUrl);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const metadata = await response.json();
              membraneName = metadata.title || metadata.name || membraneName;
            }
          } catch (error) {
            console.error('Error fetching membrane metadata:', error);
            // Keep the default membraneName (last 6 chars of nodeId)
          }

          const eligibilityPerSecond = await contract.calculateUserTargetedPreferenceAmount(
            node.basicInfo[0],
            nodeId,
            existingSignals[index]?.[0] || 0,
            user.wallet.address
          );

          return {
            nodeId: node.basicInfo[0],
            parentId: nodeId,
            membraneId: node.basicInfo[5],
            membraneName,
            currentSignal: Number(existingSignals[index]?.[0] || 0) / 100,
            eligibilityPerSecond: eligibilityPerSecond.toString()
          };
        })
      );

      setChildrenData(childrenWithMetadata);
      
      // Initialize with existing signals
      const initialValues = Object.fromEntries(
        childrenWithMetadata.map(child => [
          child.nodeId,
          child.currentSignal
        ])
      );
      
      setSliderValues(initialValues);
      setUserSignals(initialValues);
      
    } catch (error) {
      console.error('Error fetching children data:', error);
      setError(error.message || 'Failed to load children nodes');
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
      {childrenData.map(child => (
        <Box key={child.nodeId} width="100%" p={4} borderWidth={1} borderRadius="md">
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text fontWeight="medium">{child.membraneName}</Text>
              <Text color="gray.600" fontSize="sm">
                {sliderValues[child.nodeId]?.toFixed(1)}%
              </Text>
            </HStack>

            <Tooltip
              label={`Current allocation: ${sliderValues[child.nodeId]?.toFixed(1)}%`}
              placement="top"
            >
              <Slider
                value={sliderValues[child.nodeId] || 0}
                onChange={(v) => handleSliderChange(child.nodeId, v)}
                min={0}
                max={100}
                step={0.1}
                isDisabled={isSubmitting}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Tooltip>

            <Text fontSize="xs" color="gray.500">
              Previous: {userSignals[child.nodeId]?.toFixed(1)}%
            </Text>
          </VStack>
        </Box>
      ))}

      <Box width="100%" p={4} bg="gray.50" borderRadius="md">
        <HStack justify="space-between">
          <Text>Total Allocation:</Text>
          <Text 
            fontWeight="bold"
            color={Math.abs(totalAllocation - 100) < 0.01 ? 'green.500' : 'red.500'}
          >
            {totalAllocation.toFixed(1)}%
          </Text>
        </HStack>
      </Box>

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
  );
};

export default SignalForm;