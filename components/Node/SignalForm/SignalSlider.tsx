import React, { memo, useState } from 'react';
import { useCallback, useEffect } from 'react';
import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  HStack,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { formatBalance } from '../../../utils/formatters';
import { formatUnits } from './utils';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getContract } from 'viem';
import { useWillWeContract } from '../../../hooks/useWillWeContract';

interface SignalSliderProps {
  nodeId: string;
  parentId: string;
  childId: string;
  value: number;
  lastSignal: string;
  balance: string;
  eligibilityPerSecond: string;
  totalInflationPerSecond: string;
  onChange: (value: number) => void;
  onChangeEnd: (value: number) => void;
  isDisabled?: boolean;
  selectedTokenColor: string;
  chainId: string;
  nodeName?: string;
  totalAllocation: number;
}

// Separate impact display component
const EligibilityImpact = memo(({ impact }: { impact: string | null }) => {
  if (!impact) return null;
  return (
    <Text fontSize="xs" color={parseFloat(impact) >= 0 ? "green.500" : "red.500"}>
      Impact: {parseFloat(impact) >= 0 ? "+" : ""}
      {formatUnits(impact, 10)} tokens/day
    </Text>
  );
});

// Add this line to fix the display-name error
EligibilityImpact.displayName = 'EligibilityImpact';

export const SignalSlider: React.FC<SignalSliderProps> = ({
  nodeId,        // This is the parent/NodeDetails node id
  parentId,      // This is the child/slider node id
  value: externalValue,
  lastSignal,
  balance,
  onChange,
  onChangeEnd,
  isDisabled,
  selectedTokenColor,
  chainId,
  nodeName,
  totalAllocation,
}) => {
  const { user } = usePrivy();
  const contract = useWillWeContract(chainId);
  const [localValue, setLocalValue] = useState(externalValue);
  const [eligibilityImpact, setEligibilityImpact] = useState<string | null>(null);
  const [initialThumbValue, setInitialThumbValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tempTotalAllocation, setTempTotalAllocation] = useState<number>(totalAllocation);

  // Convert basis points to percentage for display only - this should never change while sliding
  const lastPreferencePercentage = (parseInt(lastSignal) / 100).toFixed(2);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const calculateEligibilityImpact = useCallback(async (newValue: number) => {
    if (!user?.wallet?.address || !contract) return;
    try {
      // Convert percentage to basis points for contract interaction
      const newValueBasis = Math.round(newValue * 100);
      
      let newEligibility, currentEligibility;
      
      try {
        // Calculate current eligibility first (with last signal)
        currentEligibility = await contract.calculateUserTargetedPreferenceAmount(
          parentId,    // childId (slider node)
          nodeId,      // parentId (NodeDetails node)
          parseInt(lastSignal),
          user.wallet.address
        );

        // Calculate new eligibility with the proposed signal value
        newEligibility = await contract.calculateUserTargetedPreferenceAmount(
          parentId,    // childId (slider node)
          nodeId,      // parentId (NodeDetails node)
          newValueBasis,
          user.wallet.address
        );

        // Calculate the difference
        const impact = newEligibility - currentEligibility;
        const formattedImpact = ethers.formatUnits(impact, 18);
        // Calculate daily impact (multiply by seconds in a day)
        const dailyImpact = parseFloat(formattedImpact) * (24 * 60 * 60);
        setEligibilityImpact(dailyImpact.toString());
      } catch (error) {
        console.error('Error calculating eligibility:', error);
        setEligibilityImpact("0");
      }
    } catch (error) {
      console.error('Error in eligibility impact calculation:', error);
      setEligibilityImpact("0");
    }
  }, [nodeId, parentId, lastSignal, user?.wallet?.address, contract]);

  // Handle local changes without propagating to parent immediately
  const handleChange = useCallback((v: number) => {
    setLocalValue(v);
    const diff = v - initialThumbValue;
    const newTempTotal = totalAllocation + diff;
    setTempTotalAllocation(newTempTotal);
    onChange(v);
  }, [onChange, initialThumbValue, totalAllocation]);

  // Only notify parent when sliding ends
  const handleChangeEnd = useCallback((v: number) => {
    setLocalValue(v);
    onChange(v);
    onChangeEnd(v);
    calculateEligibilityImpact(v);
  }, [onChange, onChangeEnd, calculateEligibilityImpact]);

  const handleDragStart = () => {
    setInitialThumbValue(localValue);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const calculateRemainingAllocation = () => {
    if (!isDragging) {
      // When not dragging, show remaining space from total allocation
      return (100 - totalAllocation).toFixed(1);
    }
    
    // During drag, calculate how much more can be assigned or needs to be reduced
    const currentDiff = localValue - initialThumbValue;
    const projectedTotal = totalAllocation + currentDiff;
    const remaining = 100 - projectedTotal;
    
    return remaining.toFixed(1);
  };

  return (
    <VStack align="stretch" spacing={2} width="100%" mb={4}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Last Preference: {lastPreferencePercentage}%
        </Text>
      </HStack>

      <Slider
        value={localValue}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        min={0}
        max={100}
        step={0.1}
        isDisabled={isDisabled}
      >
        <SliderTrack 
          bg={`${selectedTokenColor}20`} 
          h="4px"
        >
          <SliderFilledTrack bg={selectedTokenColor} />
        </SliderTrack>
        <Tooltip
          label={
            <VStack spacing={0} align="center">
              <Text>{localValue.toFixed(1)}%</Text>
              <Text
                fontSize="xs"
                color={calculateRemainingAllocation() < 0 ? "red.500" : "white"}
              >
                {calculateRemainingAllocation()}%
              </Text>
            </VStack>
          }
          placement="top"
          bg={selectedTokenColor}
        >
          <SliderThumb 
            boxSize={6} 
            bg="white" 
            borderWidth="2px"
            borderColor={selectedTokenColor}
            _focus={{
              boxShadow: `0 0 0 3px ${selectedTokenColor}40`
            }}
          />
        </Tooltip>
      </Slider>

      <EligibilityImpact impact={eligibilityImpact} />
    </VStack>
  );
};

SignalSlider.displayName = 'SignalSlider';

export default SignalSlider;