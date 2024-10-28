import React from 'react';
import {
  Box,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  CloseButton
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, Loader, XCircle } from 'lucide-react';
import { TransactionStatus } from '../types/chain';

interface NotificationToastProps {
  status: TransactionStatus;
  title: string;
  description?: string;
  hash?: string;
  onClose: () => void;
  id?: string; // Add id prop for unique identification
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  status,
  title,
  description,
  hash,
  onClose,
  id
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'green.500',
          text: 'Success'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'red.500',
          text: 'Error'
        };
      case 'pending':
      case 'confirming':
        return {
          icon: Loader,
          color: 'blue.500',
          text: 'Processing',
          animation: 'spin 1s linear infinite'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray.500',
          text: 'Info'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleViewTransaction = () => {
    if (hash) {
      window.open(`https://etherscan.io/tx/${hash}`, '_blank');
    }
  };

  // Handle close with id
  const handleClose = () => {
    onClose();
  };

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      boxShadow="lg"
      maxW="sm"
      position="relative"
      data-toast-id={id} // Add data attribute for identification
    >
      <CloseButton
        size="sm"
        position="absolute"
        right={2}
        top={2}
        onClick={handleClose}
        aria-label="Close notification"
      />
      
      <HStack spacing={3} align="start">
        <Box
          animation={statusConfig.animation}
          sx={{
            '@keyframes spin': {
              'from': { transform: 'rotate(0deg)' },
              'to': { transform: 'rotate(360deg)' }
            }
          }}
        >
          <Icon
            as={statusConfig.icon}
            color={statusConfig.color}
            boxSize={5}
          />
        </Box>
        
        <Box flex={1}>
          <HStack justify="space-between" mb={1}>
            <Text fontWeight="medium">{title}</Text>
            <Text fontSize="sm" color={statusConfig.color}>
              {statusConfig.text}
            </Text>
          </HStack>
          
          {description && (
            <Text fontSize="sm" color="gray.600" mb={2}>
              {description}
            </Text>
          )}
          
          {hash && (status === 'success' || status === 'pending') && (
            <Text
              fontSize="sm"
              color="blue.500"
              cursor="pointer"
              onClick={handleViewTransaction}
              _hover={{ textDecoration: 'underline' }}
            >
              View Transaction
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

export default NotificationToast;