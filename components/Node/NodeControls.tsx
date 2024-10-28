import React from 'react';
import { HStack, Button, InputGroup, Input, InputRightElement } from '@chakra-ui/react';
import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react';

interface NodeControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewRootNode: () => void;
  onSortChange: () => void;
  onSortDirectionChange: () => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  selectedTokenColor: string;
  isProcessing: boolean;
  buttonHoverBg: string;
  searchBorderColor: string;
  searchHoverBorderColor: string;
  userAddress?: string;
}

const NodeControls: React.FC<NodeControlsProps> = ({
  searchValue,
  onSearchChange,
  onNewRootNode,
  onSortChange,
  onSortDirectionChange,
  sortBy,
  sortDirection,
  selectedTokenColor,
  isProcessing,
  buttonHoverBg,
  searchBorderColor,
  searchHoverBorderColor,
  userAddress
}) => {
  return (
    <HStack spacing={4} wrap="wrap">
      <Button
        leftIcon={<Plus size={14} />}
        onClick={onNewRootNode}
        size="sm"
        colorScheme="gray"
        variant="outline"
        isDisabled={!userAddress || isProcessing}
        isLoading={isProcessing}
        _hover={{ bg: buttonHoverBg }}
      >
        New Root Node
      </Button>

      <InputGroup size="sm" maxW="300px">
        <Input
          aria-label="Search nodes"
          placeholder="Search nodes..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          borderColor={searchBorderColor}
          _hover={{ borderColor: searchHoverBorderColor }}
          _focus={{
            borderColor: selectedTokenColor,
            boxShadow: `0 0 0 1px ${selectedTokenColor}`
          }}
        />
        <InputRightElement>
          <Search size={14} color={selectedTokenColor} aria-hidden="true" />
        </InputRightElement>
      </InputGroup>

      <HStack>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSortChange}
          leftIcon={<Filter size={14} />}
        >
          {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onSortDirectionChange}
          leftIcon={<ArrowUpDown size={14} />}
        >
          {sortDirection.toUpperCase()}
        </Button>
      </HStack>
    </HStack>
  );
};

export default NodeControls;