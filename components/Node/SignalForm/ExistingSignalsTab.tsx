import React from 'react';
import {
  Box,
  Text,
  VStack,
  Spinner,
  Center,
  Icon,
} from '@chakra-ui/react';
import { AlertCircle } from 'lucide-react';
// Import with correct syntax
import ExistingSignalsTabRefactored from './ExistingSignalsTab/index';

interface ExistingSignalsTabProps {
  nodeId: string;
  chainId: string;
  tokenSymbol?: string;
  onSelectMembrane?: (membraneId: string) => void;
  onSelectInflation?: (inflationRate: string) => void;
}

const ExistingSignalsTab: React.FC<ExistingSignalsTabProps> = ({
  nodeId,
  chainId,
  tokenSymbol,
  onSelectMembrane,
  onSelectInflation,
}) => {
  // Pass through to the refactored component
  return (
    <ExistingSignalsTabRefactored 
      nodeId={nodeId}
      chainId={chainId}
      tokenSymbol={tokenSymbol}
      onSelectMembrane={onSelectMembrane}
      onSelectInflation={onSelectInflation}
    />
  );
};

export default ExistingSignalsTab;