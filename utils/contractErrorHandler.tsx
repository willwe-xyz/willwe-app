import { ethers } from 'ethers';
import { getChainById } from '../config/contracts';

interface ErrorResponse {
  code: number;
  message: string;
  data?: string;
}

export class ContractCallError extends Error {
  public code: string;
  public originalError: any;

  constructor(message: string, code: string, originalError?: any) {
    super(message);
    this.name = 'ContractCallError';
    this.code = code;
    this.originalError = originalError;
  }
}

export const handleContractCall = async <T>(
  callFn: () => Promise<T>,
  errorContext: string
): Promise<T> => {
  try {
    return await callFn();
  } catch (error: any) {
    console.error(`Contract call error in ${errorContext}:`, error);

    // Handle JSON-RPC errors
    if (error.code === 'BAD_DATA' || error.code === -32602) {
      throw new ContractCallError(
        'Invalid contract interaction. Please check your parameters.',
        'CONTRACT_BAD_DATA',
        error
      );
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      throw new ContractCallError(
        'Network connection error. Please check your connection and try again.',
        'CONTRACT_NETWORK_ERROR',
        error
      );
    }

    // Handle provider errors
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new ContractCallError(
        'Transaction would fail. Please check your inputs.',
        'CONTRACT_EXECUTION_ERROR',
        error
      );
    }

    // Handle user rejected errors
    if (error.code === 'ACTION_REJECTED') {
      throw new ContractCallError(
        'Transaction was rejected by user.',
        'USER_REJECTED',
        error
      );
    }

    // Handle revert errors
    if (error.code === 'CALL_EXCEPTION') {
      const revertReason = error.reason || 'Unknown reason';
      throw new ContractCallError(
        `Transaction would fail: ${revertReason}`,
        'CONTRACT_REVERT',
        error
      );
    }

    // Handle any other errors
    throw new ContractCallError(
      error.message || 'An unknown error occurred',
      'UNKNOWN_ERROR',
      error
    );
  }
};

export const createContractInstance = async (
  chainId: string,
  address: string,
  abi: ethers.InterfaceAbi,
  provider: ethers.Provider
): Promise<ethers.Contract> => {
  try {
    // Validate chain ID
    const chain = getChainById(chainId);
    if (!chain) {
      throw new ContractCallError(
        `Unsupported chain ID: ${chainId}`,
        'INVALID_CHAIN'
      );
    }

    // Validate address
    if (!ethers.isAddress(address)) {
      throw new ContractCallError(
        `Invalid contract address: ${address}`,
        'INVALID_ADDRESS'
      );
    }

    // Create contract instance
    const contract = new ethers.Contract(address, abi, provider);

    // Verify contract exists on chain
    const code = await provider.getCode(address);
    if (code === '0x') {
      throw new ContractCallError(
        `No contract deployed at address: ${address}`,
        'NO_CONTRACT'
      );
    }

    return contract;
  } catch (error) {
    if (error instanceof ContractCallError) {
      throw error;
    }
    throw new ContractCallError(
      'Failed to create contract instance',
      'CONTRACT_CREATION_ERROR',
      error
    );
  }
};

// Helper function to parse contract errors
export const parseContractError = (error: any): string => {
  if (error instanceof ContractCallError) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    // Check for JSON-RPC error format
    if (error.error?.message) {
      return error.error.message;
    }

    // Check for ethers error format
    if (error.reason) {
      return error.reason;
    }

    // Check for message property
    if (error.message) {
      return error.message;
    }
  }

  return 'An unknown error occurred';
};

// Utility function to safely call view functions
export const safeContractCall = async <T>(
  contract: ethers.Contract,
  method: string,
  args: any[] = []
): Promise<T> => {
  return handleContractCall(
    async () => {
      // Add retry logic for transient failures
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          return await contract[method](...args);
        } catch (error: any) {
          lastError = error;
          
          // Only retry on network errors
          if (error.code !== 'NETWORK_ERROR') {
            break;
          }
          
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      throw lastError;
    },
    `${method} call`
  );
};

// Example usage with type safety
export const getNodeData = async (
  contract: ethers.Contract,
  nodeId: string
): Promise<any> => {
  return safeContractCall(contract, 'getNodeData', [nodeId]);
};

export const getAllNodesForRoot = async (
  contract: ethers.Contract,
  rootAddress: string,
  userAddress: string
): Promise<any[]> => {
  return safeContractCall(contract, 'getAllNodesForRoot', [rootAddress, userAddress]);
};