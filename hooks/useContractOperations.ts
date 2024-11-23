// File: hooks/useContractOperations.ts

import { useState } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";

interface ContractCallOptions {
  successMessage?: string;
  onSuccess?: () => void;
  deploymentData?: {
    bytecode: string;
    abi: any[];
  };
}

export const useContractOperations = (chainId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getEthersProvider } = usePrivy();

  const executeContractCall = async (
    contractType: string,
    method: string,
    args: any[],
    options: ContractCallOptions = {}
  ) => {
    setIsLoading(true);
    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();

      if (contractType === 'factory' && method === 'deploy') {
        const factory = new ethers.ContractFactory(
          options.deploymentData!.abi,
          options.deploymentData!.bytecode,
          //@ts-ignore
          signer
        );

        const contract = await factory.deploy(...args);
        await contract.waitForDeployment();

        if (options.onSuccess) {
          options.onSuccess();
        }

        return {
          success: true,
          data: {
            address: await contract.getAddress(),
            contract
          }
        };
      }

      throw new Error('Unsupported contract operation');

    } catch (error: any) {
      console.error('Contract operation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeContractCall,
    isLoading
  };
};

export default useContractOperations;