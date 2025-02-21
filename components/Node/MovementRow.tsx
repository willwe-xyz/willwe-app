'use client';

import React, { useState, useEffect } from 'react';
import {
  Tr,
  Td,
  Badge,
  HStack,
  Button,
  Text,
  Tooltip,
  Box,
  IconButton,
  VStack,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { MovementType, SignatureQueueState, LatentMovement, NodeState } from '../../types/chainData';
import { MovementDetails } from './MovementDetails';
import { deployments, ABIs } from '../../config/deployments';
import { ethers } from 'ethers';
import { getRPCUrl } from '../../config/contracts';

interface MovementRowProps {
  movement: LatentMovement;
  nodeData: NodeState;
  chainId: string;
  onSign: () => void;
  onExecute: () => void;
  onRemoveSignature: () => void;
  userAddress: string;
}

const MovementRow: React.FC<MovementRowProps> = ({ 
  movement,
  nodeData,
  chainId,
  onSign, 
  onExecute,
  onRemoveSignature,
  userAddress
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueValid, setIsQueueValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkQueueValidity = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
        const executionContract = new ethers.Contract(
          deployments.Execution[chainId],
          ABIs.Execution,
          provider
        );
        
        const valid = await executionContract.isQueueValid(movement.movementHash);
        setIsQueueValid(valid);
      } catch (error) {
        console.error('Error checking queue validity:', error);
        setIsQueueValid(false);
      }
    };

    checkQueueValidity();
  }, [movement.movementHash, chainId]);

  const getStateDisplay = (state: SignatureQueueState) => {
    switch (state) {
      case SignatureQueueState.Valid:
        return { label: 'Valid', color: 'green', icon: <CheckCircle size={14} /> };
      case SignatureQueueState.Initialized:
        return { label: 'Pending Signatures', color: 'yellow', icon: <Clock size={14} /> };
      case SignatureQueueState.Executed:
        return { label: 'Executed', color: 'blue', icon: <CheckCircle size={14} /> };
      case SignatureQueueState.Stale:
        return { label: 'Expired', color: 'red', icon: <XCircle size={14} /> };
      default:
        return { label: 'Unknown', color: 'gray', icon: <AlertTriangle size={14} /> };
    }
  };

  const calculateRequiredSignatures = () => {
    const totalMembers = nodeData.membersOfNode.length;
    
    if (totalMembers === 1) {
      return 1; // If only one member, require just that one signature
    }

    if (movement.movement.category === MovementType.AgentMajority) {
      // Calculate 50% + 1 of total members
      return Math.floor(totalMembers / 2) + 1;
    } else {
      // For Value Majority, we need to check token balances
      // This would ideally come from a contract call or be passed down
      // For now, we'll use the same logic as agent majority
      return Math.floor(totalMembers / 2) + 1;
    }
  };

  const getExplorerUrl = (address: string) => {
    // Base URLs for different networks
    const explorerUrls: Record<string, string> = {
      '84532': 'https://basegoerli.basescan.org',
      '11155420': 'https://sepolia-optimism.etherscan.io',
      '167009': 'https://testnet.taiko.xyz'
    };

    const baseUrl = explorerUrls[chainId.replace('eip155:', '')] || '';
    return `${baseUrl}/address/${address}`;
  };

  const decodeTarget = (executedPayload: string) => {
    try {
      // Decode just the first tuple array to get the target
      const abiCoder = new ethers.AbiCoder();
      const decoded = abiCoder.decode(
        [{
          type: 'tuple[]',
          components: [
            { name: 'target', type: 'address' },
            { name: 'callData', type: 'bytes' },
            { name: 'value', type: 'uint256' }
          ]
        }],
        executedPayload
      );

      return decoded[0][0]?.target || null;
    } catch (error) {
      console.error('Error decoding target:', error);
      return null;
    }
  };

  const handleSign = async () => {
    try {
      setIsLoading(true);
      await onSign();
    } catch (error) {
      // Error handling is done by TransactionContext
      console.error('Error in handleSign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      setIsLoading(true);
      await onExecute();
    } catch (error) {
      // Error handling is done by TransactionContext
      console.error('Error in handleExecute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSignature = async () => {
    try {
      setIsLoading(true);
      await onRemoveSignature();
    } catch (error) {
      // Error handling is done by TransactionContext
      console.error('Error in handleRemoveSignature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const state = getStateDisplay(movement.signatureQueue.state);
  const currentSignatures = movement.signatureQueue.Signers.length;
  const requiredSignatures = calculateRequiredSignatures();

  const isUserSigner = userAddress && movement.signatureQueue.Signers.some(
    signer => signer.toLowerCase() === userAddress.toLowerCase()
  );

  return (
    <>
      <Tr>
        <Td>
          <HStack spacing={2}>
            <IconButton
              aria-label="Toggle movement details"
              icon={isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            />
            <VStack align="start" spacing={1}>
              <Text>{movement.movement.description}</Text>
              <Badge
                colorScheme={getStateDisplay(movement.signatureQueue.state).color}
                display="flex"
                alignItems="center"
                gap={1}
              >
                {getStateDisplay(movement.signatureQueue.state).icon}
                {getStateDisplay(movement.signatureQueue.state).label}
              </Badge>
            </VStack>
          </HStack>
        </Td>
        <Td>
          <HStack spacing={2} justify="flex-end">
            {movement.signatureQueue.state === SignatureQueueState.Valid && (
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleExecute}
                isLoading={isLoading}
              >
                Execute
              </Button>
            )}
            {movement.signatureQueue.state === SignatureQueueState.Initialized && (
              isUserSigner ? (
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleRemoveSignature}
                  isLoading={isLoading}
                >
                  Remove Signature
                </Button>
              ) : (
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={handleSign}
                  isLoading={isLoading}
                >
                  Sign
                </Button>
              )
            )}
          </HStack>
        </Td>
      </Tr>
      {isExpanded && (
        <Tr>
          <Td colSpan={2} pb={4}>
            <Box pl={10} pr={4}>
              <VStack align="start" spacing={4} width="100%">
                <Text whiteSpace="pre-wrap">
                  {movement.movement.description}
                </Text>
                
                <Box borderTop="1px" borderColor="gray.200" pt={4} width="100%">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Movement Details:</Text>
                    
                    <HStack>
                      <Text color="gray.600">Executing Endpoint:</Text>
                      <Link
                        href={getExplorerUrl(movement.movement.exeAccount)}
                        isExternal
                        color="blue.500"
                        textDecoration="underline"
                      >
                        {movement.movement.exeAccount}
                        <ExternalLinkIcon mx="2px" />
                      </Link>
                    </HStack>

                    {decodeTarget(movement.movement.executedPayload) && (
                      <HStack>
                        <Text color="gray.600">Target:</Text>
                        <Link
                          href={getExplorerUrl(decodeTarget(movement.movement.executedPayload)!)}
                          isExternal
                          color="blue.500"
                          textDecoration="underline"
                        >
                          {decodeTarget(movement.movement.executedPayload)}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </HStack>
                    )}

                    <Box pl={4} width="100%">
                      <HStack alignItems="start">
                        <Text color="gray.600">Call Data:</Text>
                        <Text 
                          fontSize="sm" 
                          fontFamily="monospace"
                          wordBreak="break-all"
                        >
                          {movement.movement.executedPayload}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Td>
        </Tr>
      )}
    </>
  );
};

export default MovementRow;