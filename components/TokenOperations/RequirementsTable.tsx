import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  Text,
  Link,
  Box,
  useToast,
} from '@chakra-ui/react';
import { Copy, ExternalLink } from 'lucide-react';
import { MembraneRequirement, MembraneMetadata } from '../types';

interface RequirementsTableProps {
  requirements: MembraneRequirement[];
  membraneMetadata?: MembraneMetadata | null;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  membraneMetadata
}) => {
  const toast = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        status: "error",
        duration: 2000,
      });
    }
  };

  return (
    <Box w="100%" borderRadius="md" borderWidth="1px" p={4}>
      {membraneMetadata?.name && (
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          {membraneMetadata.name}
        </Text>
      )}

      {membraneMetadata?.characteristics && membraneMetadata.characteristics.length > 0 && (
        <Box mb={4}>
          <Text fontWeight="semibold" mb={2}>Characteristics:</Text>
          <VStack align="stretch" spacing={2}>
            {membraneMetadata.characteristics.map((char, idx) => (
              <HStack key={idx} justify="space-between">
                <Text>{char.title}</Text>
                <Link
                  href={char.link}
                  isExternal
                  color="blue.500"
                  display="flex"
                  alignItems="center"
                >
                  View <ExternalLink size={14} className="ml-1" />
                </Link>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      <Text fontWeight="semibold" mb={4}>Membership Requirements</Text>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Token</Th>
            <Th isNumeric>Required Amount</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {requirements.map((req, idx) => (
            <Tr key={idx}>
              <Td>
                <HStack spacing={2}>
                  <Text>{req.symbol}</Text>
                  <Badge colorScheme="gray" fontSize="xs">
                    {`${req.tokenAddress.slice(0, 6)}...${req.tokenAddress.slice(-4)}`}
                  </Badge>
                </HStack>
              </Td>
              <Td isNumeric>{req.formattedBalance}</Td>
              <Td>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => copyToClipboard(req.tokenAddress)}
                >
                  <Copy size={14} />
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};