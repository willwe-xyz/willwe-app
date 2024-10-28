import React, { useEffect, useState } from 'react';
import { 
  Box,
  Flex,
  Text,
  IconButton,
  useColorModeValue,
  CloseButton
} from '@chakra-ui/react';
import { AlertCircle, XCircle, Loader, CheckCircle } from 'lucide-react';

const ANIMATION_DURATION = 200;

export default function NotificationToast({ 
  status, 
  title, 
  description,
  onClose,
  id,
  duration = 5000,
  isCloseable = true
}) {
  const [isExiting, setIsExiting] = useState(false);

  // Auto close after duration if specified
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, ANIMATION_DURATION);
  };

  const statusConfig = {
    success: { icon: CheckCircle, color: 'green.500' },
    error: { icon: XCircle, color: 'red.500' },
    pending: { icon: Loader, color: 'blue.500' },
    warning: { icon: AlertCircle, color: 'orange.500' }
  };

  const config = statusConfig[status] || statusConfig.info;
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      position="relative"
      opacity={isExiting ? 0 : 1}
      transform={isExiting ? 'translateX(100%)' : 'translateX(0)'}
      transition={`all ${ANIMATION_DURATION}ms ease-in-out`}
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      boxShadow="lg"
      maxW="sm"
      mb={4}
      role="alert"
    >
      <Flex align="start">
        <Box flexShrink={0} mr={3}>
          <config.icon 
            size={20} 
            color={config.color} 
            style={status === 'pending' ? {
              animation: 'spin 1s linear infinite'
            } : undefined} 
          />
        </Box>

        <Box flex="1" mr={isCloseable ? 8 : 0}>
          <Text fontWeight="medium" mb={description ? 1 : 0}>
            {title}
          </Text>
          {description && (
            <Text fontSize="sm" color="gray.600">
              {description}
            </Text>
          )}
        </Box>

        {isCloseable && (
          <CloseButton
            position="absolute"
            right={2}
            top={2}
            onClick={handleClose}
            size="sm"
            color="gray.500"
            _hover={{ color: 'gray.700' }}
          />
        )}
      </Flex>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}