import React from 'react';
import {
  Box,
  Text,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';
import { Activity } from 'lucide-react';
import { ethers } from 'ethers';

interface InflationSectionProps {
  inflationRate: string;
  setInflationRate: (rate: string) => void;
  isProcessing: boolean;
  tokenSymbol?: string;
}

export const InflationSection: React.FC<InflationSectionProps> = ({
  inflationRate,
  setInflationRate,
  isProcessing,
  tokenSymbol = 'PSC' // Default to PSC if not provided
}) => {
  // Calculate daily rate in tokens
  const calculateDailyRate = (gweiPerSec: string) => {
    try {
      // Convert gwei/sec to tokens/day
      // 1. Convert gwei to wei (multiply by 10^9)
      // 2. Convert wei to tokens (divide by 10^18)
      // 3. Multiply by seconds in a day
      const gweiPerSecBN = BigInt(gweiPerSec || '0');
      const SECONDS_PER_DAY = BigInt(86400);
      const WEI_PER_GWEI = BigInt(10 ** 9);
      
      // First multiply by seconds per day and wei per gwei
      const weiPerDay = gweiPerSecBN * SECONDS_PER_DAY * WEI_PER_GWEI;
      
      // Then convert to tokens (divide by 10^18)
      return ethers.formatEther(weiPerDay);
    } catch (error) {
      return '0';
    }
  };

  const dailyRate = calculateDailyRate(inflationRate || '0');

  return (
    <Box p={4} bg="purple.50" borderRadius="lg">
      <Box mb={4}>
        <HStack>
          <Activity size={16} />
          <Text fontSize="lg" fontWeight="semibold">Inflation Rate</Text>
        </HStack>
      </Box>

      <FormControl>
        <FormLabel>Rate (gwei/sec)</FormLabel>
        <Input
          value={inflationRate}
          onChange={(e) => setInflationRate(e.target.value)}
          placeholder="Enter inflation rate"
          type="number"
          min="0"
          isDisabled={isProcessing}
          bg="white"
        />
        <Text fontSize="sm" color="gray.600" mt={1}>
          Daily rate: {Number(dailyRate).toFixed(4)} {tokenSymbol}/day
        </Text>
      </FormControl>
    </Box>
  );
};

export default InflationSection;