import React, { useState } from 'react';
import { Box, Text, Link, Button, HStack, useToast, Alert, AlertIcon, VStack } from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import { addressToNodeId } from '../../utils/formatters';

interface EndpointProps {
  parentNodeId: string;
  chainId: string;
  endpointAddress?: string;
  userAddress?: string;
  nodeData: NodeState;
}

export const EndpointComponent = ({ parentNodeId, chainId, endpointAddress, nodeData, userAddress }: EndpointProps) => {
  const [isRedistributing, setIsRedistributing] = useState(false);
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

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
            // @ts-ignore
            signer
          );

          return contract.redistributePath(nodeData.basicInfo[0], { gasLimit: 500000 });
        },
        {
          successMessage: 'Value redistributed successfully to endpoint',
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
        description: error instanceof Error ? error.message : 'Failed to redistribute value',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsRedistributing(false);
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={4} align="stretch">
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
          <HStack spacing={4} justify="center">
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={handleRedistribute}
              isLoading={isRedistributing}
              loadingText="Redistributing..."
              colorScheme="purple"
              size="md"
            >
              Redistribute from Parent
            </Button>
          </HStack>
        )}

        {endpointAddress && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Endpoint Address: {endpointAddress}
          </Text>
        )}
      </VStack>
    </Box>
  );
};
