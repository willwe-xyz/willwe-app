// components/RootNodeDetails.tsx
import React from 'react';
import { Box, VStack, Heading, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

export type NodeState = {
  basicInfo: string[]; // [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, currentUserBalance]
  membersOfNode: string[];
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[]; // Assuming UserSignal is defined elsewhere
}

interface RootNodeDetailsProps {
  rootToken: string;
  nodes: NodeState[];
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ rootToken, nodes }) => {
  const rootNodes = nodes.filter(node => node.rootPath[0] === rootToken);
  const childNodes = nodes.filter(node => node.rootPath[0] === rootToken && node.rootPath.length > 1);

  return (
    <Box>
      <Heading size="lg" mb={4}>Root Token: {rootToken}</Heading>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="md" mb={2}>Root Node Details</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Node ID</Th>
                <Th>Inflation</Th>
                <Th>Balance Anchor</Th>
                <Th>Balance Budget</Th>
                <Th>Value</Th>
                <Th>Membrane ID</Th>
                <Th>Members</Th>
                <Th>Children</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rootNodes.map((node) => (
                <Tr key={node.basicInfo[0]}>
                  <Td>{node.basicInfo[0]}</Td>
                  <Td>{node.basicInfo[1]}</Td>
                  <Td>{node.basicInfo[2]}</Td>
                  <Td>{node.basicInfo[3]}</Td>
                  <Td>{node.basicInfo[4]}</Td>
                  <Td>{node.basicInfo[5]}</Td>
                  <Td>{node.membersOfNode.length}</Td>
                  <Td>{node.childrenNodes.length}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Child Nodes</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Node ID</Th>
                <Th>Inflation</Th>
                <Th>Balance Anchor</Th>
                <Th>Balance Budget</Th>
                <Th>Value</Th>
                <Th>Membrane ID</Th>
                <Th>Members</Th>
                <Th>Children</Th>
                <Th>Depth</Th>
              </Tr>
            </Thead>
            <Tbody>
              {childNodes.map((node) => (
                <Tr key={node.basicInfo[0]}>
                  <Td>{node.basicInfo[0]}</Td>
                  <Td>{node.basicInfo[1]}</Td>
                  <Td>{node.basicInfo[2]}</Td>
                  <Td>{node.basicInfo[3]}</Td>
                  <Td>{node.basicInfo[4]}</Td>
                  <Td>{node.basicInfo[5]}</Td>
                  <Td>{node.membersOfNode.length}</Td>
                  <Td>{node.childrenNodes.length}</Td>
                  <Td>{node.rootPath.length - 1}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};