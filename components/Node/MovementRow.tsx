'use client';

import React, { useState } from 'react';
import {
  Tr,
  Td,
  Badge,
  HStack,
  Button,
  Text,
  Tooltip,
  Box,
  IconButton
} from '@chakra-ui/react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { MovementType, SignatureQueueState, LatentMovement } from '../../types/chainData';
import { MovementDetails } from './MovementDetails';

interface MovementRowProps {
  movement: LatentMovement;
  signatures: { current: number; required: number };
  onSign: () => void;
  onExecute: () => void;
}

const MovementRow: React.FC<MovementRowProps> = ({ 
  movement, 
  description, 
  signatures, 
  onSign, 
  onExecute 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const state = getStateDisplay(movement.signatureQueue.state);
  return (
    <>
      <Tr>
        <Td width="15%">
          <HStack>
            <IconButton
              aria-label="Toggle details"
              icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            />
            <Badge>
              {movement.movement.category === MovementType.AgentMajority 
                ? 'Agent Majority' 
                : 'Value Majority'}
            </Badge>
          </HStack>
        </Td>
        <Td width="30%">
          <Text 
            noOfLines={isExpanded ? undefined : 1}
            cursor="pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {movement.movement.description || 'Loading description...'}
          </Text>
        </Td>
        <Td width="15%">
          <HStack>
            <Clock size={14} />
            <Text>
              {new Date(Number(movement.movement.expiresAt) * 1000).toLocaleDateString()}
            </Text>
          </HStack>
        </Td>
        <Td width="15%">
          <HStack>
            {state.icon}
            <Badge colorScheme={state.color}>
              {state.label}
            </Badge>
          </HStack>
        </Td>
        <Td width="10%">
          <Tooltip label={`${signatures.current} / ${signatures.required} ${movement.movement.category === MovementType.AgentMajority ? 'signatures' : 'voting power'}`}>
            <Text>
              {signatures.current} / {signatures.required}
            </Text>
          </Tooltip>
        </Td>
        <Td width="15%">
          <HStack spacing={2}>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSign();
              }}
              isDisabled={movement.signatureQueue.state !== SignatureQueueState.Initialized}
            >
              Sign
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              onClick={(e) => {
                e.stopPropagation();
                onExecute();
              }}
              isDisabled={movement.signatureQueue.state !== SignatureQueueState.Valid}
            >
              Execute
            </Button>
          </HStack>
        </Td>
      </Tr>
      {isExpanded && (
        <Tr>
          <Td colSpan={6} pb={4}>
            <Box pl={10} pr={4}>
              <Text whiteSpace="pre-wrap">
                {movement.movement.description}
              </Text>
            </Box>
          </Td>
        </Tr>
      )}
    </>
  );
};

export default MovementRow;