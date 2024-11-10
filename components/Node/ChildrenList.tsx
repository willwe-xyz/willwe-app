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
  Button,
  Link,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { formatAddress } from '../../utils/formatting';

interface ChildrenListProps {
  children: string[];
  selectedTokenColor: string;
  onNodeSelect?: (nodeId: string) => void;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({
  children,
  selectedTokenColor,
  onNodeSelect
}) => {
  if (!children.length) {
    return (
      <Box>
        <Heading size="md" mb={4}>Child Nodes</Heading>
        <Text color="gray.500">No child nodes found</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Child Nodes ({children.length})</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Node ID</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {children.map((nodeId, index) => (
            <Tr key={`${nodeId}-${index}`}>
              <Td>
                <Text>
                  {formatAddress(nodeId)}
                </Text>
              </Td>
              <Td>
                <Button
                  rightIcon={<ChevronRightIcon />}
                  colorScheme="gray"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNodeSelect?.(nodeId)}
                >
                  View Node
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};