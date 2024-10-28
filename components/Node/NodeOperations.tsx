import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  ButtonGroup,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import {
  Activity,
  Signal,
  Plus,
  Minus,
  GitBranch,
  ChevronDown
} from 'lucide-react';

interface NodeOperationsProps {
  permissions: {
    canMint: boolean;
    canBurn: boolean;
    canSignal: boolean;
    canRedistribute: boolean;
    canSpawn: boolean;
    isMember: boolean;
  };
  isProcessing: boolean;
  onOperation: (type: string) => void;
  onRedistribute: () => void;
  onSignal: () => void;
  onMintMembership: () => void;
  selectedTokenColor: string;
}

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  permissions,
  isProcessing,
  onOperation,
  onRedistribute,
  onSignal,
  onMintMembership,
  selectedTokenColor
}) => {
  const valueMenuProps = useDisclosure();
  const spawnMenuProps = useDisclosure();

  return (
    <ButtonGroup size="sm" spacing={2}>
      {/* Value Operations */}
      <Menu {...valueMenuProps}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDown size={16} />}
          colorScheme="purple"
          variant="outline"
          isDisabled={!permissions.canMint || isProcessing}
        >
          Value
        </MenuButton>
        <MenuList>
          {/* Mint Operations */}
          <MenuItem 
            icon={<Plus size={16} />}
            onClick={() => onOperation('mint')}
            color="green.500"
          >
            Mint Tokens
          </MenuItem>
          <MenuItem 
            icon={<Plus size={16} />}
            onClick={() => onOperation('mintPath')}
            color="green.500"
          >
            Mint Along Path
          </MenuItem>
          
          <Divider my={2} />
          
          {/* Burn Operations */}
          <MenuItem 
            icon={<Minus size={16} />}
            onClick={() => onOperation('burn')}
            color="red.500"
          >
            Burn Tokens
          </MenuItem>
          <MenuItem 
            icon={<Minus size={16} />}
            onClick={() => onOperation('burnPath')}
            color="red.500"
          >
            Burn Along Path
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Spawn Operations */}
      <Menu {...spawnMenuProps}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDown size={16} />}
          colorScheme="purple"
          variant="outline"
          isDisabled={!permissions.canSpawn || isProcessing}
        >
          Spawn
        </MenuButton>
        <MenuList>
          <MenuItem 
            icon={<GitBranch size={16} />}
            onClick={() => onOperation('spawn')}
          >
            Spawn Sub-Node
          </MenuItem>
          <MenuItem 
            icon={<GitBranch size={16} />}
            onClick={() => onOperation('spawnWithMembrane')}
          >
            Spawn With Membrane
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Direct Actions */}
      <ButtonGroup size="sm" spacing={2}>
        <Button
          onClick={onMintMembership}
          colorScheme="purple"
          variant="outline"
          isDisabled={isProcessing}
        >
          Mint Membership
        </Button>
        
        <Button
          leftIcon={<Activity size={16} />}
          onClick={onRedistribute}
          colorScheme="purple"
          variant="outline"
          isDisabled={!permissions.canRedistribute || isProcessing}
          isLoading={isProcessing}
        >
          Redistribute
        </Button>
        
        <Button
          leftIcon={<Signal size={16} />}
          onClick={onSignal}
          colorScheme="purple"
          variant="outline"
          isDisabled={!permissions.canSignal || isProcessing}
          isLoading={isProcessing}
        >
          Signal
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
};