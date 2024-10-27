import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Text, 
  HStack, 
  Tooltip, 
  Button,
  Portal,
  SlideFade, 
  useColorModeValue
} from "@chakra-ui/react";
import { 
  Users, 
  Info, 
  UserPlus, 
  GitBranch, 
  Droplet,
  Activity
} from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const menuBgColor = useColorModeValue(backgroundColor, `${backgroundColor}30`);

  const valuePercentage = ((Number(node.basicInfo[4]) / totalValue) * 100).toFixed(2);
  const hasActivity = node.signals.length > 0;

  const handleAction = useCallback((
    action: (nodeId: string) => void,
    nodeId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    action(nodeId);
    setIsMenuOpen(false);
  }, []);

  const menuButtons = [
    {
      label: "Node Info",
      icon: <Info size={14} />,
      action: onNodeClick
    },
    {
      label: "Mint Membership",
      icon: <UserPlus size={14} />,
      action: onMintMembership
    },
    {
      label: "Spawn Node",
      icon: <GitBranch size={14} />,
      action: onSpawnNode
    },
    {
      label: "Redistribute",
      icon: <Activity size={14} />,
      action: onTrickle
    }
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
      style={{ position: 'relative' }}
    >
      <Box
        bg={bgColor}
        px={3}
        py={2}
        borderRadius="md"
        boxShadow="sm"
        cursor="pointer"
        onClick={() => onNodeClick(node.basicInfo[0])}
        _hover={{ boxShadow: "md" }}
        border="1px"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
      >
        <HStack spacing={3} justify="space-between">
          <HStack spacing={2}>
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              {node.basicInfo[0].slice(-6)}
            </Text>
            <Tooltip label={`${node.membersOfNode.length} members`}>
              <HStack spacing={1}>
                <Users size={14} color={color} />
                <Text fontSize="xs" color={color}>{node.membersOfNode.length}</Text>
              </HStack>
            </Tooltip>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label={`${valuePercentage}% of total value`}>
              <HStack spacing={1}>
                <Droplet size={14} color={color} />
                <Text fontSize="xs" color={color}>{valuePercentage}%</Text>
              </HStack>
            </Tooltip>
            {hasActivity && (
              <Box
                width="6px"
                height="6px"
                borderRadius="full"
                bg={color}
                sx={{
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                    '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                  },
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </HStack>
        </HStack>

        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          height="2px"
          bg={`${color}20`}
        >
          <Box
            width={`${valuePercentage}%`}
            height="100%"
            bg={color}
            transition="width 0.3s ease"
          />
        </Box>
      </Box>

      {isHovered && (
        <Portal>
          <Box
            position="absolute"
            top="100%"
            left="50%"
            transform="translateX(-50%)"
            mt={2}
            bg={menuBgColor}
            borderRadius="full"
            border="1px"
            borderColor={borderColor}
            p={1}
            zIndex={1000}
            boxShadow="lg"
          >
            <HStack spacing={1}>
              {menuButtons.map((button) => (
                <Tooltip key={button.label} label={button.label}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => handleAction(button.action, node.basicInfo[0], e)}
                    p={2}
                  >
                    {button.icon}
                  </Button>
                </Tooltip>
              ))}
            </HStack>
          </Box>
        </Portal>
      )}
    </div>
  );
};

export default NodePill;