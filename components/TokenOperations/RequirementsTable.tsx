import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  Text,
  Link,
  Box,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { Copy, ExternalLink, Info } from 'lucide-react';
import { MembraneRequirement, MembraneMetadata } from '../../types/chainData';
import { getExplorerLink } from '../../config/contracts';

interface RequirementsTableProps {
  requirements: MembraneRequirement[];
  membraneMetadata: MembraneMetadata | null;
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
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (!requirements.length && !membraneMetadata?.characteristics?.length) {
    return (
      <Box 
        p={4} 
        bg="gray.50" 
        borderRadius="md" 
        textAlign="center"
      >
        <Text color="gray.500">No requirements defined</Text>
      </Box>
    );
  }

  return (
    <Box w="100%" borderRadius="md" borderWidth="1px" overflow="hidden">
      {/* Characteristics Section */}
      {membraneMetadata?.characteristics && membraneMetadata.characteristics.length > 0 && (
        <Box p={4} borderBottomWidth={requirements.length > 0 ? "1px" : "0"}>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Info size={16} />
              <Text fontWeight="semibold">Characteristics</Text>
            </HStack>
            
            {membraneMetadata.characteristics.map((char, idx) => (
              <HStack 
                key={idx} 
                justify="space-between"
                p={2}
                bg="gray.50"
                borderRadius="md"
              >
                <Text fontSize="sm">{char.title}</Text>
                {char.link && (
                  <Link
                    href={char.link}
                    isExternal
                    color="purple.500"
                    fontSize="sm"
                    display="flex"
                    alignItems="center"
                  >
                    View <ExternalLink size={14} style={{ marginLeft: 4 }} />
                  </Link>
                )}
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Token Requirements Section */}
      {requirements.length > 0 && (
        <Box p={4}>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Info size={16} />
              <Text fontWeight="semibold">Token Requirements</Text>
            </HStack>

            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Token</Th>
                  <Th isNumeric>Required Balance</Th>
                  <Th width="40%">Address</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requirements.map((req, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Badge colorScheme="purple">
                        {req.symbol || 'Unknown'}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Text fontFamily="mono">
                        {req.formattedBalance}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Text 
                          isTruncated 
                          maxW="160px" 
                          fontSize="sm"
                          fontFamily="mono"
                        >
                          {req.tokenAddress}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(req.tokenAddress)}
                        >
                          <Copy size={14} />
                        </Button>
                        <Link
                          href={getExplorerLink(req.tokenAddress)}
                          isExternal
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default RequirementsTable;