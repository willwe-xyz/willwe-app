import React, { useState } from 'react';
import {
  Tr,
  Td,
  Badge,
  HStack,
  Button,
  Text,
  Tooltip,
  Collapse,
  Box,
  IconButton
} from '@chakra-ui/react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { MovementType, SignatureQueueState, LatentMovement } from '../../types/chainData';
import { MovementDetails } from './MovementDetails';

interface MovementRowProps {
  movement: LatentMovement;
  description: string;
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
      <Tr 
        cursor="pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: 'gray.50' }}
      >
        <Td>
          <HStack>
            <IconButton
              aria-label="Toggle details"
              icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
            <Badge>
              {movement.movement.category === MovementType.AgentMajority 
                ? 'Agent Majority' 
                : 'Value Majority'}
            </Badge>
          </HStack>
        </Td>
        <Td>
          <Tooltip label={movement.movement.descriptionHash}>
            <Text isTruncated maxW="200px">
              {description || 'Loading description...'}
            </Text>
          </Tooltip>
        </Td>
        <Td>
          <HStack>
            <Clock size={14} />
            <Text>
              {new Date(Number(movement.movement.expiresAt) * 1000).toLocaleDateString()}
            </Text>
          </HStack>
        </Td>
        <Td>
          <HStack>
            {state.icon}
            <Badge colorScheme={state.color}>
              {state.label}
            </Badge>
          </HStack>
        </Td>
        <Td>
          <Tooltip label={`${signatures.current} / ${signatures.required} ${movement.movement.category === MovementType.AgentMajority ? 'signatures' : 'voting power'}`}>
            <Text>
              {signatures.current} / {signatures.required}
            </Text>
          </Tooltip>
        </Td>
        <Td>
          <HStack>
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
      <Tr>
        <Td colSpan={6} p={0}>
          <Collapse in={isExpanded}>
            <Box p={4}>
              <MovementDetails
                movement={movement}
                signatures={signatures}
                description={description}
              />
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  );
};

export default MovementRow;