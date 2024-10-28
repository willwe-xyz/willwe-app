import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast, Box, CloseButton, Flex, Text } from '@chakra-ui/react';
import { AlertCircle, XCircle, Loader, CheckCircle } from 'lucide-react';

// Internal Toast Component
const NotificationToast = ({ 
  status, 
  title, 
  description,
  onClose
}) => {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'green.500' },
    error: { icon: XCircle, color: 'red.500' },
    pending: { icon: Loader, color: 'blue.500' },
    warning: { icon: AlertCircle, color: 'orange.500' }
  };

  const config = statusConfig[status] || statusConfig.warning;
  const Icon = config.icon;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="lg"
      position="relative"
      maxW="sm"
    >
      <CloseButton
        position="absolute"
        right={2}
        top={2}
        onClick={onClose}
      />
      <Flex>
        <Box mr={3} mt={1}>
          <Icon 
            size={20} 
            color={config.color} 
            style={status === 'pending' ? {
              animation: 'spin 1s linear infinite'
            } : undefined}
          />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold" mb={description ? 1 : 0}>
            {title}
          </Text>
          {description && (
            <Text fontSize="sm" color="gray.600">
              {description}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

interface TransactionContextType {
  executeTransaction: (chainId: string, transactionFn: any, options?: any) => Promise<any>;
  isTransacting: boolean;
  error: Error | null;
  clearError: () => void;
}

const TransactionContext = createContext<TransactionContextType>({
  executeTransaction: async () => {},
  isTransacting: false,
  error: null,
  clearError: () => {}
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeTransaction = useCallback(async (
    chainId: string,
    transactionFn: any,
    options: { successMessage?: string } = {}
  ) => {
    setIsTransacting(true);
    setError(null);

    try {
      const result = await transactionFn();
      
      if (options.successMessage) {
        toast({
          render: ({ onClose }) => (
            <NotificationToast
              status="success"
              title={options.successMessage}
              onClose={onClose}
            />
          ),
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      toast({
        render: ({ onClose }) => (
          <NotificationToast
            status="error"
            title="Transaction Failed"
            description={error.message}
            onClose={onClose}
          />
        ),
        position: "top-right",
        duration: null,
        isClosable: true,
      });
      
      throw error;
    } finally {
      setIsTransacting(false);
    }
  }, [toast]);

  return (
    <TransactionContext.Provider value={{ 
      executeTransaction, 
      isTransacting, 
      error,
      clearError 
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => useContext(TransactionContext);