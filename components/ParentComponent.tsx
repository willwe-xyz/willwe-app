import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { TokenOperationModal } from './TokenOperationModal';
import { OperationParams } from './types';

const ParentComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSubmit = async (params: OperationParams) => {
    // Handle the operation
    console.log('Operation params:', params);
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </Button>

      <TokenOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        operation="spawnWithMembrane"
        isLoading={false}
        nodeId="your-node-id"
        chainId="your-chain-id"
      />
    </>
  );
}; 