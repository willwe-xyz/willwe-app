import React, { useState } from 'react';
import {
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { 
  Search,
  SortAsc,
  SortDesc,
  Layout,
  List,
  GitBranch,
  Grid as GridIcon
} from 'lucide-react';
import { NodeState } from '../../types/chainData';

interface NodeFiltersProps {
  nodes: NodeState[];
  onFilterChange: (filteredNodes: NodeState[]) => void;
  onViewModeChange?: (mode: 'tree' | 'grid' | 'list') => void;
}

export const NodeFilters: React.FC<NodeFiltersProps> = ({
  nodes,
  onFilterChange,
  onViewModeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = nodes.filter(node => 
      node.basicInfo[0]?.toLowerCase().includes(term.toLowerCase()) ||
      (node.metadata?.name || '').toLowerCase().includes(term.toLowerCase())
    );
    onFilterChange(filtered);
  };

  const handleSort = (field: string) => {
    setSortField(field);
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    const sorted = [...nodes].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'value':
          comparison = Number(BigInt(a.basicInfo[4]) - BigInt(b.basicInfo[4]));
          break;
        case 'members':
          comparison = (a.membersOfNode?.length || 0) - (b.membersOfNode?.length || 0);
          break;
        case 'depth':
          comparison = (a.rootPath?.length || 0) - (b.rootPath?.length || 0);
          break;
        case 'signals':
          comparison = (a.signals?.length || 0) - (b.signals?.length || 0);
          break;
      }
      return newDirection === 'asc' ? comparison : -comparison;
    });
    
    onFilterChange(sorted);
  };

  const viewModes = [
    { icon: <GitBranch size={16} />, mode: 'tree', label: 'Tree View' },
    { icon: <GridIcon size={16} />, mode: 'grid', label: 'Grid View' },
    { icon: <List size={16} />, mode: 'list', label: 'List View' }
  ];

  return (
    <Box bg="white" p={4} rounded="lg" shadow="sm">
      <HStack spacing={4}>
        <InputGroup maxW="300px">
          <InputLeftElement>
            <Search size={16} />
          </InputLeftElement>
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={sortField}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="value">Sort by Value</option>
          <option value="members">Sort by Members</option>
          <option value="depth">Sort by Depth</option>
          <option value="signals">Sort by Signals</option>
        </Select>

        <Tooltip label={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}>
          <IconButton
            aria-label="Toggle sort direction"
            icon={sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            onClick={() => handleSort(sortField)}
            variant="ghost"
          />
        </Tooltip>

        {onViewModeChange && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="View options"
              icon={<Layout size={16} />}
              variant="ghost"
            />
            <MenuList>
              {viewModes.map(({ icon, mode, label }) => (
                <MenuItem
                  key={mode}
                  icon={icon}
                  onClick={() => onViewModeChange(mode as 'tree' | 'grid' | 'list')}
                >
                  {label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Box>
  );
};