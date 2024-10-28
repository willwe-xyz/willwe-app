// File: ./components/Node/NodePill.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, 
  Text, 
  HStack, 
  VStack,
  Tooltip, 
  Button,
  Progress,
  useColorModeValue,
  SlideFade,
} from "@chakra-ui/react";
import { 
  Users, 
  Info, 
  UserPlus, 
  GitBranch, 
  Droplet,
  Activity,
  RefreshCw
} from 'lucide-react';
import { NodeState } from '../../types/chainData';
import { formatBalance } from '../../hooks/useBalances';
import { createPortal } from 'react-dom';

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
  percentage: number;
  isProcessing?: boolean;
}

const NodePill: React.FC<NodePillProps> = ({
  node,
  totalValue,
  color,
  onNodeClick,
  onMintMembership,
  onSpawnNode,
  onTrickle,
  backgroundColor,
  textColor,
  borderColor,
  percentage = 0,
  isProcessing = false
}) => {
  // Refs and state
  const pillRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Theme
  const bgColor = useColorModeValue('white', 'gray.800');
  const menuBgColor = useColorModeValue(backgroundColor, `${backgroundColor}30`);

  // Node data
  const hasSignals = node?.signals?.length > 0 || false;
  const memberCount = node?.membersOfNode?.length || 0;
  const nodeValue = node?.basicInfo?.[4] ? formatBalance(node.basicInfo[4]) : '0';
  const nodeId = node?.basicInfo?.[0]?.slice(-6) || 'Unknown';

  // Set up portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Action buttons configuration
  const actionButtons = [
    {
      label: 'Info',
      icon: <Info size={14} />,
      onClick: onNodeClick,
      tooltip: 'View node details'
    },
    {
      label: 'Membership',
      icon: <UserPlus size={14} />,
      onClick: onMintMembership,
      tooltip: 'Mint membership'
    },
    {
      label: 'Spawn',
      icon: <GitBranch size={14} />,
      onClick: onSpawnNode,
      tooltip: 'Create child node'
    },
    {
      label: 'Redistribute',
      icon: <RefreshCw size={14} />,
      onClick: onTrickle,
      tooltip: 'Redistribute value'
    }
  ];

  // Update menu position when pill is hovered
  const updateMenuPosition = useCallback(() => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX + (rect.width / 2)
      });
    }
  }, []);

  // Handle hover states
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    updateMenuPosition();
    const timer = setTimeout(() => setShowMenu(true), 100);
    return () => clearTimeout(timer);
  }, [updateMenuPosition]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const timer = setTimeout(() => setShowMenu(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Update menu position on scroll
  useEffect(() => {
    if (isHovered) {
      const handleScroll = () => {
        updateMenuPosition();
      };
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isHovered, updateMenuPosition]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current && 
        !actionMenuRef.current.contains(event.target as Node) &&
        pillRef.current &&
        !pillRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
        setIsHovered(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Handle action click
  const handleAction = useCallback((
    action: (nodeId: string) => void,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!isProcessing && node?.basicInfo?.[0]) {
      action(node.basicInfo[0]);
      setShowMenu(false);
    }
  }, [node?.basicInfo, isProcessing]);

  // If no valid node data, return nothing
  if (!node || !node.basicInfo) {
    return null;
  }

  return (
    <>
      <Box
        ref={pillRef}
        bg={bgColor}
        px={3}
        py={2}
        borderRadius="md"
        boxShadow={isHovered ? 'md' : 'sm'}
        cursor="pointer"
        onClick={() => node.basicInfo[0] && onNodeClick(node.basicInfo[0])}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
        transition="all 0.2s ease"
        opacity={isProcessing ? 0.7 : 1}
        role="group"
        _hover={{
          transform: 'translateY(-1px)',
          boxShadow: 'md'
        }}
      >
        <VStack spacing={2} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              {nodeId}
            </Text>
            {hasSignals && (
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

          {/* Stats */}
          <HStack spacing={4} justify="space-between">
            <Tooltip label={`${memberCount} members`}>
              <HStack spacing={1}>
                <Users size={14} color={color} />
                <Text fontSize="xs" color={color}>{memberCount}</Text>
              </HStack>
            </Tooltip>
            <Tooltip label={`Value: ${nodeValue}`}>
              <HStack spacing={1}>
                <Droplet size={14} color={color} />
                <Text fontSize="xs" color={color}>
                  {typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}%
                </Text>
              </HStack>
            </Tooltip>
          </HStack>

          {/* Progress */}
          <Box w="100%">
            <Progress
              value={percentage}
              size="xs"
              colorScheme="purple"
              borderRadius="full"
              bg={`${color}20`}
            />
          </Box>
        </VStack>
      </Box>

      {/* Action Menu Portal */}
      {showMenu && portalContainer && createPortal(
        <Box
          ref={actionMenuRef}
          position="absolute"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
          zIndex={1000}
        >
          <SlideFade in={true} offsetY={-10}>
            <HStack
              spacing={1}
              bg={menuBgColor}
              borderRadius="full"
              p={1}
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
              onClick={(e) => e.stopPropagation()}
            >
              {actionButtons.map((button, index) => (
                <Tooltip key={index} label={button.tooltip}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => handleAction(button.onClick, e)}
                    isDisabled={isProcessing}
                    _hover={{ bg: `${color}20` }}
                    p={2}
                  >
                    {button.icon}
                  </Button>
                </Tooltip>
              ))}
            </HStack>
          </SlideFade>
        </Box>,
        portalContainer
      )}
    </>
  );
};

export default React.memo(NodePill, (prevProps, nextProps) => {
  return (
    prevProps.node?.basicInfo?.[0] === nextProps.node?.basicInfo?.[0] &&
    prevProps.totalValue === nextProps.totalValue &&
    prevProps.color === nextProps.color &&
    prevProps.percentage === nextProps.percentage &&
    prevProps.isProcessing === nextProps.isProcessing
  );
});