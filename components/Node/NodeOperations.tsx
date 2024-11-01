import React from 'react';
import {
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  useDisclosure,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import {
  Plus,
  Minus,
  GitBranch,
  Signal,
  Activity,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { TokenOperationModal } from '../TokenOperations/TokenOperationModal';
import { useNodeOperations } from '../../hooks/useNodeOperations';
import { usePrivy } from '@privy-io/react-auth';
import { NodeState } from '../../types/chainData';

interface NodeOperationsProps {
  nodeId: string;
  chainId: string;
  node: NodeState;
  onNodeSelect?: (nodeId: string) => void;
  selectedTokenColor: string;
}

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  node,
  onNodeSelect,
  selectedTokenColor
}) => {
  const { user } = usePrivy();
  const { permissions, transactions, isProcessing } = useNodeOperations(
    chainId,
    node,
    user?.wallet?.address
  );

  const modalProps = useDisclosure();
  const [currentOperation, setCurrentOperation] = React.useState<string>('');
  const toast = useToast();

  // Validate required parameters
  const validateParams = () => {
    if (!chainId?.trim()) {
      throw new Error('Chain ID is required');
    }
    if (!nodeId?.trim()) {
      throw new Error('Node ID is required');
    }
    if (!node) {
      throw new Error('Node data is required');
    }
    console.log('Params validated:', { chainId, nodeId, node });
  };

  // Handle operation selection
  const handleOperationSelect = (operation: string) => {
    try {
      validateParams();
      console.log('Operation selected:', operation, { chainId, nodeId, node });
      setCurrentOperation(operation);
      modalProps.onOpen();
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid parameters',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Handle modal submission
  const handleSubmit = async (params: any) => {
    try {
      validateParams();
      
      switch (currentOperation) {
        case 'mint':
          await transactions.mint(params.amount);
          break;
        case 'burn':
          await transactions.burn(params.amount);
          break;
        case 'mintPath':
          await transactions.mintPath(params.targetNodeId, params.amount);
          break;
        case 'burnPath':
          await transactions.burnPath(params.targetNodeId, params.amount);
          break;
        case 'spawn':
          await transactions.spawn();
          break;
        case 'spawnWithMembrane':
          await transactions.spawnBranchWithMembrane(params.membraneId);
          break;
        case 'mintMembership':
          console.log('Minting membership with:', { chainId, node });
          await transactions.mintMembership();
          break;
        default:
          throw new Error('Unknown operation');
      }
      
      modalProps.onClose();
      
      toast({
        title: 'Success',
        description: 'Operation completed successfully',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.error('Operation error:', error);
      toast({
        title: 'Operation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <>
      <ButtonGroup size="sm" spacing={2}>
        {/* Value Operations */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
            isDisabled={!permissions.canMint && !permissions.canBurn || isProcessing}
          >
            Value
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<Plus size={16} />}
              onClick={() => handleOperationSelect('mint')}
              isDisabled={!permissions.canMint || isProcessing}
            >
              Mint Tokens
            </MenuItem>
            <MenuItem
              icon={<Plus size={16} />}
              onClick={() => handleOperationSelect('mintPath')}
              isDisabled={!permissions.canMint || isProcessing}
            >
              Mint Along Path
            </MenuItem>
            
            <Divider />
            
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => handleOperationSelect('burn')}
              isDisabled={!permissions.canBurn || isProcessing}
            >
              Burn Tokens
            </MenuItem>
            <MenuItem
              icon={<Minus size={16} />}
              onClick={() => handleOperationSelect('burnPath')}
              isDisabled={!permissions.canBurn || isProcessing}
            >
              Burn Along Path
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Spawn Operations */}
        <Menu>
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
              onClick={() => handleOperationSelect('spawn')}
            >
              Spawn Sub-Node
            </MenuItem>
            <MenuItem
              icon={<GitBranch size={16} />}
              onClick={() => handleOperationSelect('spawnWithMembrane')}
            >
              Spawn With Membrane
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Direct Actions */}
        <Button
          leftIcon={<UserPlus size={16} />}
          onClick={() => handleOperationSelect('mintMembership')}
          colorScheme="purple"
          variant="outline"
          isDisabled={permissions.isMember || isProcessing}
        >
          Membership
        </Button>

        <Button
          leftIcon={<Activity size={16} />}
          onClick={() => {
            validateParams();
            transactions.redistribute();
          }}
          colorScheme="purple"
          variant="outline"
          isDisabled={!permissions.canRedistribute || isProcessing}
        >
          Redistribute
        </Button>

        <Button
          leftIcon={<Signal size={16} />}
          onClick={() => {
            validateParams();
            transactions.signal([]);
          }}
          colorScheme="purple"
          variant="outline"
          isDisabled={!permissions.canSignal || isProcessing}
        >
          Signal
        </Button>
      </ButtonGroup>

      <TokenOperationModal
        isOpen={modalProps.isOpen}
        onClose={modalProps.onClose}
        onSubmit={handleSubmit}
        operation={currentOperation}
        isLoading={isProcessing}
        nodeId={nodeId}
        chainId={chainId}
      />
    </>
  );
};

export default NodeOperations;