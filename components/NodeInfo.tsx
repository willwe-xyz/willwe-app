import React from 'react';
import { Box, HStack, Text, VStack, Tag, TagLabel } from '@chakra-ui/react';
import { NodeState } from '../lib/chainData';
import { formatBalance, calculateDailyGrowth } from '../utils/formatters';
import { cols } from '../const/colors';

interface NodeInfoProps {
  node: NodeState;
  userAddress: string;
  chainID: string;
  setStackFx: (nId: string) => void;
}

export const NodeInfo: React.FC<NodeInfoProps> = ({ node, userAddress, chainID, setStackFx }) => {
  const dailyGrowth = calculateDailyGrowth(node.inflation);
  const underNodeIds: string[] = node.rootPath;

  return (
    <VStack align="stretch" spacing={2}>
      <Text>User Address: {userAddress}</Text>
      <Text>Chain ID: {chainID}</Text>
      <Text>Balance Anchor: {formatBalance(node.balanceAnchor)}</Text>
      <Text>Balance Budget: {formatBalance(node.balanceBudget)}</Text>
      <Text>Value in Root Token: {formatBalance(node.value)}</Text>
      <Text>Daily Growth: {dailyGrowth} per day</Text>
      <Text>Membrane ID: {node.membraneId}</Text>
      <Text>Members: {node.membersOfNode?.join(", ")}</Text>
      <HStack spacing={2}>
        {underNodeIds.map((nId: string) => (
          <Tag 
            size="md" 
            variant='outline' 
            colorScheme={cols.lightBlue} 
            onClick={() => setStackFx(nId)} 
            key={nId}
            cursor="pointer"
          >
            <TagLabel>{nId}</TagLabel>         
          </Tag>
        ))}
      </HStack>
    </VStack>
  );
};