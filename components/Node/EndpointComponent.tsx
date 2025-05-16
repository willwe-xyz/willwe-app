import React from 'react';
import { Box, Text, Link, Button, HStack, Alert, AlertIcon } from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import { useAppKit } from '@/hooks/useAppKit';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import { nodeIdToAddress } from '../../utils/formatters';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { ethers } from 'ethers';

interface EndpointProps {
  parentNodeId: string;
  chainId: string;
  userAddress?: string;
  nodeData: NodeState;
}

export const EndpointComponent = ({ parentNodeId, chainId, nodeData, userAddress }: EndpointProps) => {
  const [isRedistributing, setIsRedistributing] = useState(false);
  const { getEthersProvider } = useAppKit();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  const endpointAddress = nodeIdToAddress(nodeData.basicInfo[0]);

  const handleRedistribute = async () => {
    if (isRedistributing) return;
    setIsRedistributing(true);

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer
          );
          
          return contract.redistributePath(nodeData.basicInfo[0]);
        },
        {
          successMessage: 'Value redistributed successfully',
          onSuccess: () => {
            toast({
              title: 'Redistribution complete',
              description: 'Value has been redistributed from parent node to endpoint',
              status: 'success',
              duration: 5000,
            });
          }
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsRedistributing(false);
    }
  };

  return (
    <Box p={6}>
      <Alert status="info" rounded="md">
        <AlertIcon />
        <Text>
          This is an endpoint corresponding to an action or user of node{' '}
          <Link 
            href={`/nodes/${chainId}/${parentNodeId}`}
            color="blue.500"
            fontWeight="medium"
          >
            {parentNodeId}
          </Link>
        </Text>
      </Alert>

      {userAddress && (
        <HStack spacing={4} justify="center" mt={4}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRedistribute}
            isLoading={isRedistributing}
            loadingText="Redistributing..."
            colorScheme="purple"
            size="md"
          >
            Redistribute
          </Button>
        </HStack>
      )}

      {endpointAddress && (
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
          Endpoint Address: {endpointAddress}
        </Text>
      )}
    </Box>
  );
};

export default EndpointComponent;