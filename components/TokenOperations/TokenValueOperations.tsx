// File path: components/TokenOperations/TokenValueOperations.tsx
import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Progress,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { deployments, ABIs } from '../../config/contracts';
import { Check, AlertTriangle } from 'lucide-react';

interface TokenValueOperationsProps {
  nodeId: string;
  chainId: string;
  operation: 'mint' | 'burn' | 'mintPath' | 'burnPath';
  onSubmit: (params: { amount: string }) => Promise<void>;
  onClose: () => void;
}

const TokenValueOperations: React.FC<TokenValueOperationsProps> = ({
  nodeId,
  chainId,
  operation,
  onSubmit,
  onClose,
}) => {
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getEthersProvider } = usePrivy();
  const toast = useToast();

  const checkAllowance = useCallback(async () => {
    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Get root token from path
      const willWeContract = new ethers.Contract(
        deployments.WillWe[chainId.replace('eip155:', '')],
        ABIs.WillWe,
        //@ts-ignore
        provider
      );
      const path = await willWeContract.getFidPath(nodeId);
      const rootToken = path[0];

      // Check ERC20 allowance
      const tokenContract = new ethers.Contract(
        ethers.getAddress(rootToken),
        ABIs.IERC20,
        //@ts-ignore
        provider
      );

      const allowance = await tokenContract.allowance(
        userAddress,
        willWeContract.target
      );

      const parsedAmount = ethers.parseUnits(amount || '0', 18);
      setNeedsApproval(allowance < parsedAmount);

    } catch (err) {
      console.error('Error checking allowance:', err);
      setError('Failed to check token approval status');
    }
  }, [amount, chainId, getEthersProvider, nodeId]);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    
    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      
      const willWeContract = new ethers.Contract(
        deployments.WillWe[chainId.replace('eip155:', '')],
        ABIs.WillWe,
        //@ts-ignore
        provider
      );
      
      const path = await willWeContract.getFidPath(nodeId);
      const rootToken = path[0];
      
      const tokenContract = new ethers.Contract(
        ethers.getAddress(rootToken),
        ABIs.IERC20,
        //@ts-ignore
        signer
      );

      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await tokenContract.approve(willWeContract.target, parsedAmount);
      await tx.wait();

      setNeedsApproval(false);
      toast({
        title: 'Approved',
        description: 'Token spending approved successfully',
        status: 'success',
        duration: 5000,
      });
      
    } catch (err) {
      console.error('Approval error:', err);
      setError('Failed to approve token spending');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ amount });
      onClose();
    } catch (err) {
      console.error('Transaction error:', err);
      setError('Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (amount && (operation === 'mint' || operation === 'mintPath')) {
      checkAllowance();
    }
  }, [amount, operation, checkAllowance]);

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.000000000000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            isDisabled={isApproving || isSubmitting}
          />
        </FormControl>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {(isApproving || isSubmitting) && (
          <Progress size="xs" isIndeterminate colorScheme="purple" />
        )}

        <HStack spacing={4} justify="flex-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          {needsApproval && (operation === 'mint' || operation === 'mintPath') ? (
            <Button
              colorScheme="purple"
              onClick={handleApprove}
              isLoading={isApproving}
              loadingText="Approving..."
            >
              Approve
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={`${operation}ing...`}
              isDisabled={(operation === 'mint' || operation === 'mintPath') && needsApproval}
            >
              {operation.charAt(0).toUpperCase() + operation.slice(1)}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default TokenValueOperations;