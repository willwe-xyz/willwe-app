// File: ./components/TokenOperations/RequirementsTable.tsx

import React from 'react';
import {
  Table,
  Tbody,
  Tr,
  Td,
  Link,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';
import { getChainById } from '../../config/deployments';

interface RequirementsTableProps {
  requirements: Array<{
    tokenAddress: string;
    symbol: string;
    formattedBalance: string;
  }>;
  chainId: string;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  chainId,
}) => {
  const chain = getChainById(chainId.replace('eip155:', ''));
  
  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
      <Table size="sm" variant="simple">
        <Tbody>
          {requirements.map((req, idx) => (
            <Tr key={idx}>
              <Td>
                <HStack spacing={2}>
                  <Text>{req.symbol}</Text>
                  <Link
                    href={`${chain?.blockExplorers?.default.url}/address/${req.tokenAddress}`}
                    isExternal
                    color="purple.500"
                    fontSize="sm"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </HStack>
              </Td>
              <Td isNumeric>{req.formattedBalance}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default RequirementsTable;