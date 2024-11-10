import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { formatUnits } from 'ethers';

interface Signal {
  MembraneInflation: string[][];
  lastRedistSignal: string[];
}

interface SignalHistoryProps {
  signals: Signal[];
  selectedTokenColor: string;
}

export const SignalHistory: React.FC<SignalHistoryProps> = ({
  signals,
  selectedTokenColor
}) => {
  if (!signals.length) {
    return (
      <Box>
        <Heading size="md" mb={4}>Signal History</Heading>
        <Text color="gray.500">No signals recorded</Text>
      </Box>
    );
  }

  const formatSignalValue = (value: string) => {
    try {
      return formatUnits(value, 9);
    } catch {
      return '0';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(Number(timestamp) * 1000).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Signal History</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Value</Th>
            <Th>Timestamp</Th>
          </Tr>
        </Thead>
        <Tbody>
          {signals.map((signal, index) => (
            <React.Fragment key={index}>
              {/* Membrane Inflation Signals */}
              {signal.MembraneInflation.map((inflation, subIndex) => (
                <Tr key={`inflation-${index}-${subIndex}`}>
                  <Td>
                    <Badge colorScheme="blue">Membrane Inflation</Badge>
                  </Td>
                  <Td>
                    <Tooltip label="Inflation Rate">
                      <Text>{formatSignalValue(inflation[0])}%</Text>
                    </Tooltip>
                  </Td>
                  <Td>{formatTimestamp(inflation[1])}</Td>
                </Tr>
              ))}
              
              {/* Redistribution Signals */}
              {signal.lastRedistSignal.map((redistSignal, subIndex) => (
                <Tr key={`redist-${index}-${subIndex}`}>
                  <Td>
                    <Badge colorScheme="green">Redistribution</Badge>
                  </Td>
                  <Td>
                    <Tooltip label="Redistribution Amount">
                      <Text>{formatSignalValue(redistSignal)} ETH</Text>
                    </Tooltip>
                  </Td>
                  <Td>{formatTimestamp(redistSignal)}</Td>
                </Tr>
              ))}
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};