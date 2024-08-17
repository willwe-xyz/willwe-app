// components/NodeDetails.tsx
import React from 'react';
import { Box, VStack, Heading, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { NodeState } from '../lib/chainData';

interface NodeDetailsProps {
  node: NodeState;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node }) => {
  return (
    <Box>
      <Heading size="lg" mb={4}>Node Details</Heading>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading size="md" mb={2}>Basic Info</Heading>
          <Table variant="simple">
            <Tbody>
              <Tr>
                <Th>Node ID</Th>
                <Td>{node.basicInfo[0]}</Td>
              </Tr>
              <Tr>
                <Th>Inflation</Th>
                <Td>{node.basicInfo[1]}</Td>
              </Tr>
              <Tr>
                <Th>Balance Anchor</Th>
                <Td>{node.basicInfo[2]}</Td>
              </Tr>
              <Tr>
                <Th>Balance Budget</Th>
                <Td>{node.basicInfo[3]}</Td>
              </Tr>
              <Tr>
                <Th>Value</Th>
                <Td>{node.basicInfo[4]}</Td>
              </Tr>
              <Tr>
                <Th>Membrane ID</Th>
                <Td>{node.basicInfo[5]}</Td>
              </Tr>
              <Tr>
                <Th>Current User Balance</Th>
                <Td>{node.basicInfo[6]}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Members</Heading>
          <Text>{node.membersOfNode.length} members</Text>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Children Nodes</Heading>
          <Text>{node.childrenNodes.length} children</Text>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Root Path</Heading>
          <Text>{node.rootPath.join(' > ')}</Text>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Signals</Heading>
          <Text>{node.signals.length} signals</Text>
        </Box>
      </VStack>
    </Box>
  );
};