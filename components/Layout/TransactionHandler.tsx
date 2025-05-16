import React from 'react';
import { Box, Text, Link, useToast, ToastId } from '@chakra-ui/react';
import { ContractTransactionResponse } from 'ethers';
import { ExternalLink } from 'lucide-react';
import { getChainById } from '../../config/contracts';
import { useTransaction } from '../../contexts/TransactionContext';
import { useAppKit } from '../../hooks/useAppKit';


interface TransactionHandlerProps {
  children: React.ReactNode;
  chainId: string;
}

export const TransactionHandler: React.FC<TransactionHandlerProps> = ({ children, chainId }) => {
  const { isTransacting, currentHash, error } = useTransaction();
  const toast = useToast();
  const { user } = useAppKit();

  // Show transaction status when needed
  React.useEffect(() => {
    let toastId: ToastId;

    if (isTransacting && currentHash) {
      toastId = toast({
        title: 'Transaction Pending',
        description: (
          <Box>
            <Text mb={2}>Transaction submitted. Waiting for confirmation...</Text>
            <Link 
              href={`${getChainById(String(chainId)).blockExplorers?.default.url}/tx/${currentHash}`}
              isExternal
              display="flex"
              alignItems="center"
              color="blue.500"
            >
              View on Explorer <ExternalLink size={14} style={{ marginLeft: 4 }} />
            </Link>
          </Box>
        ),
        status: 'info',
        duration: null,
        isClosable: false,
      });
    }

    return () => {
      if (toastId) {
        toast.close(toastId);
      }
    };
  }, [isTransacting, currentHash, toast, chainId]);

  // Show error toast if needed
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Transaction Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  return <>{children}</>;
};