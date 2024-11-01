import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';

interface ContractOperationConfig {
  contractName: keyof typeof deployments;
  successMessage?: string;
  errorMessage?: string;
}

export function useContractOperation(config: ContractOperationConfig) {
  const { executeTransaction } = useTransaction();
  const { getEthersProvider, sendTransaction } = usePrivy();

  const executeContractOperation = useCallback(async (
    chainId: string,
    methodName: string,
    args: any[],
    overrides?: ethers.Overrides
  ) => {
    const { contractName, successMessage, errorMessage } = config;

    return executeTransaction(
      chainId,
      async () => {
        const cleanChainId = chainId.replace('eip155:', '');
        const contractAddress = deployments[contractName][cleanChainId];
        
        if (!contractAddress) {
          throw new Error(`No ${contractName} contract found for chain ${chainId}`);
        }

        // Get provider and signer from Privy
        const provider = await getEthersProvider();
        if (!provider) {
          throw new Error('Provider not available');
        }

        // Ensure we're connected to the correct network
        const network = await provider.getNetwork();
        if (network.chainId.toString() !== cleanChainId) {
          throw new Error(`Please switch to the correct network. Expected ${cleanChainId}, got ${network.chainId}`);
        }

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          ABIs[contractName],
          signer
        );

        // Prepare transaction
        const tx = await contract[methodName](...args, overrides || {});
        return tx;
      },
      {
        successMessage,
        errorMessage
      }
    );
  }, [config, executeTransaction, getEthersProvider]);

  return executeContractOperation;
}