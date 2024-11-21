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
      provider.getSigner()
    );
  }, [chainId, getEthersProvider]);

  const signal = useCallback(async (nodeId: string, signals: number[], onSuccess?: () => void) => {
    const contract = await getContract();
    
    return executeTransaction(
      chainId,
      async () => {
        const gasEstimate = await contract.sendSignal.estimateGas(nodeId, signals);
        // const gasEstimate = 800_000;
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
        const feeData = await provider.getFeeData();
        console.log('nodeid - signals', nodeId, signals);

        return contract.sendSignal(nodeId, signals, {
          gasLimit: Math.ceil(Number(gasEstimate) * 1.4), // Add 20% buffer to gas estimate
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