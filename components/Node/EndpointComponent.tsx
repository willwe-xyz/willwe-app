import React, { useState, useEffect } from 'react';
import { Box, Text, Link, Button, HStack, useToast, Alert, AlertIcon, VStack, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { RefreshCw, Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import { addressToNodeId, nodeIdToAddress, formatBalance } from '../../utils/formatters';

interface EndpointProps {
  parentNodeId: string;
  chainId: string;
  userAddress?: string;
  nodeData: NodeState;
}

export const EndpointComponent = ({ parentNodeId, chainId, nodeData, userAddress }: EndpointProps) => {
  const [isRedistributing, setIsRedistributing] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [rootTokenBalance, setRootTokenBalance] = useState<string>('0');
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  const endpointAddress = nodeIdToAddress(nodeData.basicInfo[0]);
  const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
  const endpointBalance = Number(ethers.formatEther(nodeData.basicInfo[5])).toFixed(4);
  const readProvider = new ethers.JsonRpcProvider(getRPCUrl(chainId));

  console.log('Endpoint data:', nodeData);
  useEffect(() => {
    const fetchRootTokenBalance = async () => {
      if (!endpointAddress || !rootTokenAddress) return;
      
      try {
        const tokenContract = new ethers.Contract(
          rootTokenAddress,
          ABIs.IERC20,
          readProvider
        );
        
        const balance = await tokenContract.balanceOf(endpointAddress);
        setRootTokenBalance(balance);
      } catch (error) {
        console.error('Error fetching root token balance:', error);
      }
    };

    fetchRootTokenBalance();
  }, [endpointAddress, rootTokenAddress, getEthersProvider]);

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

  const handleBurnPath = async () => {
    if (isBurning || !rootTokenBalance) return;
    setIsBurning(true);
    const provider = await getEthersProvider();
    const signer = await provider.getSigner();

    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const proxyContract = new ethers.Contract(
        endpointAddress,
        ABIs.PowerProxy,
        // @ts-ignore
        signer
      );

      const willWeContract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        readProvider
      );

      const burnCalldata = willWeContract.interface.encodeFunctionData('burnPath', [
        parentNodeId,
        nodeData.basicInfo[5],
      ]);

      const calls = [{
        target: deployments.WillWe[cleanChainId],
        callData: burnCalldata,
        value: 0
      }];

      await executeTransaction(
        chainId,
        async () => {
          return proxyContract.tryAggregate(true, calls);
        },
        {
          successMessage: 'Successfully burned tokens through path',
          onSuccess: () => {
            setRootTokenBalance('0');
          }
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsBurning(false);
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

        <HStack spacing={8} justify="center">
          <Stat>
            <StatLabel>Endpoint Balance</StatLabel>
            <StatNumber>{endpointBalance} tokens</StatNumber>
          </Stat>
          
          <Stat>
            <StatLabel>Withddrawn Balance</StatLabel>
            <StatNumber>{Number(formatBalance(rootTokenBalance)).toFixed(4)} tokens</StatNumber>
          </Stat>
        </HStack>

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

            <Button
              leftIcon={<Wallet size={16} />}
              onClick={handleBurnPath}
              isLoading={isBurning}
              loadingText="Burning..."
              colorScheme="red"
              size="md"
              isDisabled={!parseFloat(endpointBalance)}
            >
              Burn All Tokens
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

export default EndpointComponent;