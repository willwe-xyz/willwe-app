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
  Collapse,
  Code,
  ButtonGroup,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { MovementType, SignatureQueueState, LatentMovement, NodeState } from '../../types/chainData';
import { deployments, ABIs } from '../../config/deployments';
import { ethers } from 'ethers';
import { getExplorerLink, getRPCUrl } from '../../config/contracts';
import { usePrivy } from '@privy-io/react-auth';

interface MovementRowProps {
  movement: LatentMovement;
  nodeData: NodeState;
  chainId: string;
  onSign: () => void;
  onExecute: () => void;
  onRemoveSignature: () => void;
}

const getMovementTypeLabel = (type: MovementType): string => {
  switch (type) {
    case MovementType.Revert:
      return 'Revert';
    case MovementType.AgentMajority:
      return 'Member Majority';
    case MovementType.EnergeticMajority:
      return 'Value Majority';
    default:
      return 'Unknown';
  }
};

const MovementRow: React.FC<MovementRowProps> = ({ 
  movement,
  nodeData,
  chainId,
  onSign, 
  onExecute,
  onRemoveSignature,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueValid, setIsQueueValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localExecuted, setLocalExecuted] = useState(false);
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address;

  const isExecuted = localExecuted || movement.signatureQueue.state === SignatureQueueState.Executed;

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
      // For Energetic Majority, we need to check token balances
      // This would ideally come from a contract call or be passed down
      // For now, we'll use the same logic as agent majority
      return Math.floor(totalMembers / 2) + 1;
    }
  };

  const getExplorerUrl = (address: string, chainId: string) => {
    return getExplorerLink(address, chainId);
  };

  const decodeTarget = (executedPayload: string) => {
    try {
      // Decode just the first tuple array to get the target
      const abiCoder = new ethers.AbiCoder();
      const decoded = abiCoder.decode(
        ['tuple(address target, bytes callData, uint256 value)[]'],
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
      // Set local state to executed after successful execution
      setLocalExecuted(true);
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

  const isUserSigner = userAddress && movement.signatureQueue.Signers.some(
    signer => signer.toLowerCase() === userAddress.toLowerCase()
  );

  return (
    <Tr>
      <Td>
        <VStack align="start" spacing={2} width="100%">
          <HStack width="100%" spacing={4}>
            <IconButton
              aria-label="Toggle details"
              icon={isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
            />
            <Box flex="1">
              <Text fontWeight="bold" mb={1}>{movement.movement.description}</Text>
              <HStack spacing={2}>
                <Badge colorScheme="purple">
                  {getMovementTypeLabel(movement.movement.category)}
                </Badge>
                <Badge colorScheme={isExecuted ? 'blue' : 'yellow'}>
                  {isExecuted ? 'Executed' : `${movement.signatureQueue.Signers.filter(signer => signer !== ethers.ZeroAddress).length} / ${calculateRequiredSignatures()} signatures`}
                </Badge>
              </HStack>
            </Box>
          </HStack>

          <Collapse in={isExpanded}>
            <VStack align="start" spacing={3} pl={10} width="100%">
              <Box>
                <Text fontWeight="semibold" fontSize="sm">Movement Hash:</Text>
                <Code fontSize="sm" p={2}>{movement.movementHash}</Code>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" fontSize="sm">Endpoint Address:</Text>
                <Link 
                  href={getExplorerUrl(movement.movement.exeAccount, chainId)} 
                  isExternal
                  color="blue.500"
                >
                  <Code fontSize="sm" p={2}>
                    {movement.movement.exeAccount}
                    <ExternalLinkIcon mx="2px" />
                  </Code>
                </Link>
              </Box>

              <Box>
                <Text fontWeight="semibold" fontSize="sm">Signers:</Text>
                <VStack align="start" spacing={1}>
                  {movement.signatureQueue.Signers.map((signer, index) => (
                    signer !== ethers.ZeroAddress && (
                      <Code key={index} fontSize="sm" p={1}>
                        {signer}
                      </Code>
                    )
                  ))}
                </VStack>
              </Box>

              {movement.movement.executedPayload && (
                <Box>
                  <Text fontWeight="semibold" fontSize="sm">Call Data:</Text>
                  <Code 
                    display="block" 
                    whiteSpace="pre-wrap" 
                    fontSize="sm" 
                    p={2} 
                    maxWidth="600px" 
                    overflowX="auto"
                  >
                    {movement.movement.executedPayload}
                  </Code>
                </Box>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </Td>
      <Td isNumeric>
        <ButtonGroup>
          {!isExecuted && (
            <>
              {!isUserSigner && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleSign}
                  isLoading={isLoading}
                >
                  Sign
                </Button>
              )}
              {isUserSigner && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={handleRemoveSignature}
                  isLoading={isLoading}
                >
                  Remove Signature
                </Button>
              )}
              {isQueueValid && (
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={handleExecute}
                  isLoading={isLoading}
                >
                  Execute
                </Button>
              )}
            </>
          )}
        </ButtonGroup>
      </Td>
    </Tr>
  );
};

export default MovementRow;