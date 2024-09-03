
import React from 'react';
import { Box, Text, HStack, Tooltip, Button } from "@chakra-ui/react";
import { Users, Info, UserPlus, GitBranch, Droplet } from 'lucide-react';
import { NodeState } from '../types/chainData';

interface NodePillProps {
  node: NodeState;
  totalValue: number;
  color: string;
  onNodeClick: (nodeId: string) => void;
  onMintMembership: (nodeId: string) => void;
  onSpawnNode: (nodeId: string) => void;
  onTrickle: (nodeId: string) => void;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export const NodePill: React.FC<NodePillProps> = ({
  node,
  totalValue,
  color,
  onNodeClick,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  backgroundColor,
  textColor,
  borderColor
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const valuePercentage = (parseInt(node.basicInfo[4]) / totalValue * 100).toFixed(2);

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        bg="white"
        px={2}
        py={1}
        borderRadius="md"
        boxShadow="sm"
        cursor="pointer"
        onClick={() => onNodeClick(node.basicInfo[0])}
        _hover={{ boxShadow: "md" }}
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={2}>
          <Text fontWeight="bold" fontSize="xs" color={textColor}>
            {node.basicInfo[0].slice(-6)}
          </Text>
          <Tooltip label={`${node.membersOfNode.length} members`}>
            <HStack spacing={1}>
              <Users size={12} color={color} />
              <Text fontSize="xs" color={color}>{node.membersOfNode.length}</Text>
            </HStack>
          </Tooltip>
          <Tooltip label={`${valuePercentage}% of total value`}>
            <HStack spacing={1}>
              <Droplet size={12} color={color} />
              <Text fontSize="xs" color={color}>{valuePercentage}%</Text>
            </HStack>
          </Tooltip>
        </HStack>
      </Box>
      {isHovered && (
        <HStack 
          position="absolute" 
          bottom="-20px" 
          left="0" 
          spacing={1}
          bg={backgroundColor}
          borderRadius="full"
          border="1px solid"
          borderColor={borderColor}
          p={1}
        >
          <Tooltip label="Node Info">
            <Button size="xs" borderRadius="full" onClick={() => {}} bg="white" color={color}>
              <Info size={12} />
            </Button>
          </Tooltip>
          <Tooltip label="Mint Membership">
            <Button size="xs" borderRadius="full" onClick={() => onMintMembership(node.basicInfo[0])} bg="white" color={color}>
              <UserPlus size={12} />
            </Button>
          </Tooltip>
          <Tooltip label="Spawn Node">
            <Button size="xs" borderRadius="full" onClick={() => onSpawnNode(node.basicInfo[0])} bg="white" color={color}>
              <GitBranch size={12} />
            </Button>
          </Tooltip>
          <Tooltip label="Trickle/Redistribute">
            <Button size="xs" borderRadius="full" onClick={() => onTrickle(node.basicInfo[0])} bg="white" color={color}>
              <Droplet size={12} />
            </Button>
          </Tooltip>
        </HStack>
      )}
    </Box>
  );
};