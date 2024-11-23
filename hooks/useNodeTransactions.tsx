import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { useTransaction } from '../contexts/TransactionContext';

export function useNodeTransactions(chainId: string) {
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();

  const getContract = useCallback(async () => {
    const provider = await getEthersProvider();
    const cleanChainId = chainId.replace('eip155:', '');
    return new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      // @ts-ignore
      provider.getSigner()
    );
  }, [chainId, getEthersProvider]);

  const signal = useCallback(async (nodeId: string, signals: string[], onSuccess?: () => void) => {
    const contract = await getContract();
    

    return executeTransaction(
      chainId,
      async () => {
        const gasEstimate = await contract.sendSignal.estimateGas(nodeId, signals);
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
        const feeData = await provider.getFeeData();
        
        return contract.sendSignal(nodeId, signals, {
          gasLimit: Math.ceil(Number(gasEstimate) * 1.4),
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });
      },
      {
        successMessage: 'Signals submitted successfully',
        errorMessage: 'Failed to submit signals',
        onSuccess
      }
    );
  }, [chainId, executeTransaction, getContract]);

  return {
    signal
  };
}