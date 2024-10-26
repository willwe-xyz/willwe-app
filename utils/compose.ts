import { ethers, ContractTransactionResponse, BrowserProvider } from 'ethers';
import { UseToastOptions } from '@chakra-ui/react';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';

// Contract Instance Management
export const getWillWeContract = async (
  chainId: string,
  provider: BrowserProvider
): Promise<ethers.Contract> => {
  const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
  const signer = await provider.getSigner();
  
  return new ethers.Contract(
    deployments["WillWe"][cleanChainId],
    ABIs.WillWe,
    signer
  );
};

// Transaction Handler with fixed receipt handling
const handleTransaction = async (
  txPromise: Promise<ContractTransactionResponse>,
  config: {
    setIsTransacting: (isTransacting: boolean) => void;
    toast: (options: UseToastOptions) => void;
    onSuccess?: () => void;
  },
  successMessage: string
) => {
  const { setIsTransacting, toast, onSuccess } = config;
  
  try {
    setIsTransacting(true);
    
    // Get initial transaction response
    const response = await txPromise;
    const hash = response.hash;
    
    // Get the transaction and then wait for confirmation
    const tx = await response.getTransaction();
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status === 0) {
      throw new Error('Transaction failed');
    }
    
    toast({
      title: 'Success',
      description: successMessage,
      status: 'success',
      duration: 5000,
    });
    
    if (onSuccess) {
      onSuccess();
    }
    
  } catch (error: any) {
    console.error('Transaction failed:', error);
    
    let errorMessage = 'Transaction failed';
    
    switch (error.code) {
      case 'ACTION_REJECTED':
        errorMessage = 'Transaction rejected by user';
        break;
      case 'INSUFFICIENT_FUNDS':
        errorMessage = 'Insufficient funds to complete transaction';
        break;
      case 'UNPREDICTABLE_GAS_LIMIT':
        errorMessage = 'Transaction would fail - please check your inputs';
        break;
      case 'NETWORK_ERROR':
        errorMessage = 'Network error - please check your connection';
        break;
      default:
        errorMessage = error.message || 'Transaction failed';
    }
    
    toast({
      title: 'Error',
      description: errorMessage,
      status: 'error',
      duration: 5000,
    });
    
    throw error;
  } finally {
    setIsTransacting(false);
  }
};

// Write Operations with fixed transaction handling
export const spawnBranch = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  const contract = await getWillWeContract(chainId, provider);
  await handleTransaction(
    contract.spawnBranch(tokenId),
    { setIsTransacting, toast, onSuccess },
    'Branch spawned successfully'
  );
};

export const mintMembership = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  const contract = await getWillWeContract(chainId, provider);
  await handleTransaction(
    contract.mintMembership(tokenId),
    { setIsTransacting, toast, onSuccess },
    'Membership minted successfully'
  );
};

export const redistributePath = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  const contract = await getWillWeContract(chainId, provider);
  await handleTransaction(
    contract.redistributePath(tokenId),
    { setIsTransacting, toast, onSuccess },
    'Redistribution completed successfully'
  );
};

// Read Operations (these don't need transaction handling)
export const getNodeData = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<NodeState> => {
  const contract = await getWillWeContract(chainId, provider);
  return contract.getNodeData(tokenId);
};

export const getAllNodesForRoot = async (
  chainId: string,
  provider: BrowserProvider,
  rootToken: string,
  userAddress: string
): Promise<NodeState[]> => {
  const contract = await getWillWeContract(chainId, provider);
  return contract.getAllNodesForRoot(rootToken, userAddress);
};

export const getUserNodeSignals = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  user: string
): Promise<[bigint, bigint][]> => {
  const contract = await getWillWeContract(chainId, provider);
  return contract.getUserNodeSignals(tokenId, user);
};

export const getInUseMembraneOf = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<bigint> => {
  const contract = await getWillWeContract(chainId, provider);
  return contract.getInUseMembraneOf(tokenId);
};

export const getParentOf = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<string> => {
  const contract = await getWillWeContract(chainId, provider);
  return contract.getParentOf(tokenId);
};

export const isRoot = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<boolean> => {
  const parentId = await getParentOf(chainId, provider, tokenId);
  return parentId === '0';
};

export const getNodeHierarchy = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<string[]> => {
  const contract = await getWillWeContract(chainId, provider);
  const path = await contract.getFidPath(tokenId);
  return path.reverse();
};

export default {
  getWillWeContract,
  spawnBranch,
  mintMembership,
  redistributePath,
  getNodeData,
  getAllNodesForRoot,
  getUserNodeSignals,
  getInUseMembraneOf,
  getParentOf,
  isRoot,
  getNodeHierarchy,
};