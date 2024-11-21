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

interface InflationSectionProps {
  inflationRate: string;
  setInflationRate: (rate: string) => void;
  isProcessing: boolean;
}

export const InflationSection: React.FC<InflationSectionProps> = ({
  inflationRate,
  setInflationRate,
  isProcessing
}) => {
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
          max="1000000"
          isDisabled={isProcessing}
          bg="white"
        />
        <FormHelperText>Maximum rate: 1,000,000 gwei/sec</FormHelperText>
      </FormControl>
    </Box>
  );
};

export default InflationSection;