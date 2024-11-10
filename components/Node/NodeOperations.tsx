import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ButtonGroup,
  Button, 
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  Plus,
  GitBranch,
  Signal,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { useContractOperations } from '../../hooks/useContractOperations';
import { TokenOperationModal } from '../TokenOperations/TokenOperationModal';
import { useTransaction } from '../../contexts/TransactionContext';

interface NodeOperationsProps {
  nodeId: string;
  chainId: string;
  selectedTokenColor: string;
  onSuccess?: () => void;
}

export const NodeOperations: React.FC<NodeOperationsProps> = ({
  nodeId,
  chainId,
  selectedTokenColor,
  onSuccess
}) => {
  const router = useRouter();
  const { user } = usePrivy();
  const { isTransacting } = useTransaction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

  const {
    spawnBranch,
    spawnBranchWithMembrane,
    mintMembership,
    redistribute,
    signal
  } = useContractOperations(chainId);

  // Handle spawn node
  const handleSpawnNode = useCallback(async () => {
    const result = await spawnBranch(nodeId);
    if (result) {
      const { receipt } = result;
      // Extract new node ID from events
      const event = receipt.logs.find(
        log => log.topics[0] === ethers.id("BranchSpawned(uint256,uint256,address)")
      );
      if (event) {
        const newNodeId = ethers.toBigInt(event.topics[2]).toString();
        router.push(`/nodes/${chainId}/${newNodeId}`);
      }
      if (onSuccess) onSuccess();
    }
  }, [chainId, nodeId, spawnBranch, router, onSuccess]);

  // Handle membrane spawn
  const handleMembraneSpawn = useCallback(async (membraneId: string) => {
    const result = await spawnBranchWithMembrane(nodeId, membraneId);
    if (result && onSuccess) {
      onSuccess();
    }
    setIsModalOpen(false);
  }, [chainId, nodeId, spawnBranchWithMembrane, onSuccess]);

  // Handle mint membership
  const handleMintMembership = useCallback(async () => {
    const result = await mintMembership(nodeId);
    if (result && onSuccess) {
      onSuccess();
    }
  }, [chainId, nodeId, mintMembership, onSuccess]);

  // Handle redistribute
  const handleRedistribute = useCallback(async () => {
    const result = await redistribute(nodeId);
    if (result && onSuccess) {
      onSuccess(); 
    }
  }, [chainId, nodeId, redistribute, onSuccess]);

  // Handle signal
  const handleSignal = useCallback(async () => {
    const result = await signal(nodeId, []);
    if (result && onSuccess) {
      onSuccess();
    }
  }, [chainId, nodeId, signal, onSuccess]);

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <ButtonGroup size="sm" spacing={2} flexWrap="wrap">
        {/* Node Operations Menu */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            colorScheme="purple"
            variant="outline"
            isDisabled={isTransacting} 
          >
            Node
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<GitBranch size={16} />}
              onClick={handleSpawnNode}
            >
              Spawn Sub-Node
            </MenuItem>
            <MenuItem
              icon={<Shield size={16} />}
              onClick={() => {
                setCurrentOperation('spawnWithMembrane');
                setIsModalOpen(true);
              }}
            >
              Spawn with Membrane
            </MenuItem>
          </MenuList>
        </Menu>

        {/* Direct Action Buttons */}
        <Tooltip label="Mint membership">
          <Button
            leftIcon={<UserPlus size={16} />}
            onClick={handleMintMembership}
            colorScheme="purple"
            variant="outline"
            isDisabled={isTransacting}
          >
            Membership
          </Button>
        </Tooltip>

        <Tooltip label="Redistribute value">
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRedistribute}
            colorScheme="purple"
            variant="outline"
            isDisabled={isTransacting}
          >
            Redistribute
          </Button>
        </Tooltip>

        <Tooltip label="Send signal">
          <Button
            leftIcon={<Signal size={16} />}
            onClick={handleSignal}
            colorScheme="purple"
            variant="outline"
            isDisabled={isTransacting}
          >
            Signal
          </Button>
        </Tooltip>
      </ButtonGroup>

      {/* Token Operation Modal */}
      <TokenOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operation={currentOperation}
        onSubmit={async (params: { membraneId: string }) => {
          if (currentOperation === 'spawnWithMembrane') {
            await handleMembraneSpawn(params.membraneId);
          }
        }}
        nodeId={nodeId}
        chainId={chainId}
      />
    </VStack>
  );
};

export default NodeOperations;