import React from 'react';
import {
  HStack,
  Button,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import {
  Plus,
  GitBranchPlus,
  RefreshCw,
  MoreVertical,
  Download,
  Share2,
  Settings
} from 'lucide-react';

interface NodeActionsProps {
  onSpawnNode: () => void;
  isProcessing: boolean;
  selectedToken: string;
  userAddress: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
}

export const NodeActions: React.FC<NodeActionsProps> = ({
  onSpawnNode,
  isProcessing,
  selectedToken,
  userAddress,
  onRefresh,
  onExport,
  onShare,
  onSettings
}) => {
  return (
    <HStack spacing={2}>
      {/* Create Node Button */}
      <Tooltip
        label={!selectedToken ? "Select a token first" : !userAddress ? "Connect wallet to create" : "Create new root node"}
      >
        <Button
          leftIcon={<GitBranchPlus size={16} />}
          onClick={onSpawnNode}
          colorScheme="purple"
          isLoading={isProcessing}
          isDisabled={!selectedToken || isProcessing || !userAddress}
        >
          Create Node
        </Button>
      </Tooltip>

      {/* Refresh Button */}
      {onRefresh && (
        <Tooltip label="Refresh node data">
          <IconButton
            aria-label="Refresh"
            icon={<RefreshCw size={16} />}
            onClick={onRefresh}
            variant="ghost"
            isDisabled={isProcessing}
          />
        </Tooltip>
      )}

      {/* Additional Actions Menu */}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="More actions"
          icon={<MoreVertical size={16} />}
          variant="ghost"
        />
        <MenuList>
          {onExport && (
            <MenuItem icon={<Download size={16} />} onClick={onExport}>
              Export Data
            </MenuItem>
          )}
          {onShare && (
            <MenuItem icon={<Share2 size={16} />} onClick={onShare}>
              Share View
            </MenuItem>
          )}
          {onSettings && (
            <MenuItem icon={<Settings size={16} />} onClick={onSettings}>
              Settings
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </HStack>
  );
};