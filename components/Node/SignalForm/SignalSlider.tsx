import React from 'react';
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
}

export const SignalSlider: React.FC<SignalSliderProps> = ({
  nodeId,
  value,
  lastSignal,
  balance,
  eligibilityPerSecond,
  totalInflationPerSecond,
  onChange,
  onChangeEnd,
  isDisabled,
  selectedTokenColor,
}) => {
  // Calculate percentages
  const eligibilityPercentage = totalInflationPerSecond !== '0' 
    ? (Number(eligibilityPerSecond) / Number(totalInflationPerSecond)) * 100 
    : 0;

  return (
    <VStack align="stretch" spacing={2} width="100%" mb={4}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Balance: {formatBalance(balance)}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Last Signal: {lastSignal}%
        </Text>
      </HStack>

      <Box position="relative" py={4}>
        <Tooltip
          label={`Current Eligibility: ${eligibilityPercentage.toFixed(2)}%`}
          placement="top"
        >
          <Box
            position="absolute"
            left={`${eligibilityPercentage}%`}
            top="0"
            height="100%"
            width="2px"
            bg={`${selectedTokenColor}40`}
            zIndex={1}
          />
        </Tooltip>

        <Slider
          aria-label="signal-strength"
          value={value}
          min={0}
          max={100}
          step={0.1}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
          isDisabled={isDisabled}
        >
          <SliderTrack bg={`${selectedTokenColor}20`}>
            <SliderFilledTrack bg={selectedTokenColor} />
          </SliderTrack>
          <SliderThumb boxSize={6} bg={selectedTokenColor}>
            <Box color="white" fontSize="xs">
              {value.toFixed(1)}
            </Box>
          </SliderThumb>
        </Slider>
      </Box>

      <Text fontSize="xs" color="gray.500" textAlign="right">
        Current Eligibility: {formatBalance(eligibilityPerSecond)}/sec ({eligibilityPercentage.toFixed(2)}%)
      </Text>
    </VStack>
  );
};

export default SignalSlider;