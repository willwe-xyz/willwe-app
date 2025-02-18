import React, { memo, useState, useCallback, useEffect } from 'react';
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
  IconButton,
  ButtonGroup,
} from '@chakra-ui/react';
import { Plus, Minus } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useWillWeContract } from '../../../hooks/useWillWeContract';

const STEP_SIZE = 0.1;

const EligibilityImpact = memo(({ 
  impact, 
  inflationRate,
  parentBalance 
}: { 
  impact: string | null;
  inflationRate: string;
  parentBalance: string;
}) => {
  if (!impact) return null;

  const calculateScaledImpact = () => {
    try {
      // Convert all inputs to BigInt for precise calculation
      const impactBN = BigInt(impact);
      const inflationBN = BigInt(inflationRate);
      const SECONDS_PER_DAY = BigInt(86400);
      
      // Calculate daily impact
      // First multiply by seconds per day to get daily rate
      let dailyImpact = impactBN * SECONDS_PER_DAY;
      
      // Convert to display format (18 decimals)
      const displayValue = ethers.formatUnits(dailyImpact, 18);
      return displayValue;
    } catch (error) {
      console.error('Error calculating scaled impact:', error);
      return "0";
    }
  };

  const scaledImpact = calculateScaledImpact();
  const displayValue = parseFloat(scaledImpact).toFixed(4);

  return (
    <Text fontSize="xs" color={parseFloat(displayValue) >= 0 ? "green.500" : "red.500"}>
      Impact: {parseFloat(displayValue) >= 0 ? "+" : ""}
      {displayValue} tokens/day
    </Text>
  );
});

EligibilityImpact.displayName = 'EligibilityImpact';

const SignalSlider = ({
  nodeId,
  parentId,
  value: externalValue,
  lastSignal,
  balance,
  eligibilityPerSecond,
  totalInflationPerSecond,
  onChange,
  onChangeEnd,
  isDisabled,
  selectedTokenColor,
  chainId,
  nodeName,
  totalAllocation
}) => {
  const { user } = usePrivy();
  const contract = useWillWeContract(chainId);
  const [localValue, setLocalValue] = useState(externalValue);
  const [eligibilityImpact, setEligibilityImpact] = useState<string | null>(null);
  const [initialThumbValue, setInitialThumbValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tempTotalAllocation, setTempTotalAllocation] = useState(totalAllocation);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(100, localValue + STEP_SIZE);
    const newTotal = (totalAllocation - localValue + newValue);
    if (newTotal <= 100) {
      setLocalValue(newValue);
      setTempTotalAllocation(newTotal);
      onChange(newValue);
      onChangeEnd(newValue);
    }
  }, [localValue, totalAllocation, onChange, onChangeEnd]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(0, localValue - STEP_SIZE);
    setLocalValue(newValue);
    setTempTotalAllocation(totalAllocation - localValue + newValue);
    onChange(newValue);
    onChangeEnd(newValue);
  }, [localValue, totalAllocation, onChange, onChangeEnd]);

  const calculateEligibilityImpact = useCallback(async (newValue: number) => {
    if (!user?.wallet?.address || !contract) return;
    
    try {
      const newValueBasis = Math.round(newValue * 100);
      const lastSignalBasis = parseInt(lastSignal);

      const [currentEligibility, newEligibility] = await Promise.all([
        contract.calculateUserTargetedPreferenceAmount(
          parentId,
          nodeId,
          lastSignalBasis,
          user.wallet.address
        ),
        contract.calculateUserTargetedPreferenceAmount(
          parentId,
          nodeId,
          newValueBasis,
          user.wallet.address
        )
      ]);

      const impact = newEligibility - currentEligibility;
      setEligibilityImpact(impact.toString());
    } catch (error) {
      console.error('Error calculating eligibility:', error);
      setEligibilityImpact("0");
    }
  }, [nodeId, parentId, lastSignal, user?.wallet?.address, contract]);

  const handleChange = useCallback((v: number) => {
    setLocalValue(v);
    const diff = v - initialThumbValue;
    const newTempTotal = totalAllocation + diff;
    setTempTotalAllocation(newTempTotal);
    onChange(v);
  }, [onChange, initialThumbValue, totalAllocation]);

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
      return (100 - totalAllocation).toFixed(1);
    }
    const currentDiff = localValue - initialThumbValue;
    const projectedTotal = totalAllocation + currentDiff;
    return (100 - projectedTotal).toFixed(1);
  };

  return (
    <VStack align="stretch" spacing={2} width="100%" mb={4}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Last Preference: {(parseInt(lastSignal) / 100).toFixed(2)}%
        </Text>
        <ButtonGroup size="sm" spacing={1}>
          <IconButton
            aria-label="Decrease allocation"
            icon={<Minus size={14} />}
            onClick={handleDecrement}
            isDisabled={isDisabled || localValue <= 0}
            colorScheme="gray"
            variant="ghost"
          />
          <IconButton
            aria-label="Increase allocation"
            icon={<Plus size={14} />}
            onClick={handleIncrement}
            isDisabled={isDisabled || tempTotalAllocation >= 100}
            colorScheme="gray"
            variant="ghost"
          />
        </ButtonGroup>
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
        step={STEP_SIZE}
        isDisabled={isDisabled}
      >
        <SliderTrack bg={`${selectedTokenColor}20`} h="4px">
          <SliderFilledTrack bg={selectedTokenColor} />
        </SliderTrack>
        <Tooltip
          label={
            <VStack spacing={0} align="center">
              <Text>{localValue.toFixed(1)}%</Text>
              <Text
                fontSize="xs"
                color={calculateRemainingAllocation() < "0" ? "red.500" : "white"}
              >
                Remaining: {calculateRemainingAllocation()}%
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

      <EligibilityImpact 
        impact={eligibilityImpact}
        inflationRate={totalInflationPerSecond}
        parentBalance={balance}
      />
    </VStack>
  );
};

SignalSlider.displayName = 'SignalSlider';

export default memo(SignalSlider);