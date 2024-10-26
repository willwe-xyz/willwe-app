import { ethers, JsonRpcProvider, ContractTransactionResponse } from 'ethers';
import { getRPCUrl } from '../config/contracts';
import { deployments, ABIs, getChainById } from '../config/deployments';
import { NodeData, UserNodeSignals, SigQueue } from '../types';
import { UseToastOptions } from '@chakra-ui/react';

// Contract Instance Management
export const getWillWeContract = async (
  provider: JsonRpcProvider,
  chainId: string
): Promise<ethers.Contract> => {
  const signer = await provider.getSigner();
  const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
  
  return new ethers.Contract(
    deployments["WillWe"][cleanChainId],
    ABIs.WillWe,
    signer
  );
};


// Transaction Management
export const handleTransaction = async (
  txPromise: Promise<ContractTransactionResponse>,
  successMessage: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
): Promise<void> => {
  setIsTransacting(true);
  try {
    const tx = await txPromise;
    await tx.wait();
    toast({
      title: 'Success',
      description: successMessage,
      status: 'success',
      duration: 5000,
    });
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('Transaction failed:', error);
    toast({
      title: 'Transaction Failed',
      description: error.message,
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsTransacting(false);
  }
};

// Node Data Read Operations
export const getInUseMembraneOf = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getInUseMembraneOf(tokenId);
  } catch (error) {
    throw new Error(`Failed to get in-use membrane: ${error.message}`);
  }
};

  
  export const getMembraneContract = async (
    provider: JsonRpcProvider,
    chainId: string
  ): Promise<ethers.Contract> => {
    const signer = await provider.getSigner();
    const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
    
    return new ethers.Contract(
      deployments["Membrane"][cleanChainId],
      ABIs.WillWe,
      signer
    );
  };
  
  



export const allMembersOf = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string
): Promise<string[]> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.allMembersOf(tokenId);
  } catch (error) {
    throw new Error(`Failed to get members: ${error.message}`);
  }
};

export const asRootValuation = async (
  chainId: string,
  provider: JsonRpcProvider,
  amount: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.asRootValuation(amount);
  } catch (error) {
    throw new Error(`Failed to get root valuation: ${error.message}`);
  }
};

export const balanceOf = async (
  chainId: string,
  provider: JsonRpcProvider,
  account: string,
  id: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.balanceOf(account, id);
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

export const balanceOfBatch = async (
  chainId: string,
  provider: JsonRpcProvider,
  accounts: string[],
  ids: string[]
): Promise<bigint[]> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.balanceOfBatch(accounts, ids);
  } catch (error) {
    throw new Error(`Failed to get batch balance: ${error.message}`);
  }
};

export const getUserNodeSignals = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string,
  user: string
): Promise<[bigint, bigint][]> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getUserNodeSignals(tokenId, user);
  } catch (error) {
    throw new Error(`Failed to get user signals: ${error.message}`);
  }
};

export const getNodeData = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string
): Promise<NodeData> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getNodeData(tokenId);
  } catch (error) {
    throw new Error(`Failed to get node data: ${error.message}`);
  }
};

export const getNodeDataWithUserSignals = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string,
  user: string
): Promise<NodeData> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getNodeDataWithUserSignals(tokenId, user);
  } catch (error) {
    throw new Error(`Failed to get node data with signals: ${error.message}`);
  }
};

export const getAllNodesForRoot = async (
  chainId: string,
  provider: JsonRpcProvider,
  rootToken: string,
  userAddress: string
): Promise<NodeData[]> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getAllNodesForRoot(rootToken, userAddress);
  } catch (error) {
    throw new Error(`Failed to get all nodes: ${error.message}`);
  }
};

export const getChildParentEligibilityPerSec = async (
  chainId: string,
  provider: JsonRpcProvider,
  parentId: string,
  childId: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getChildParentEligibilityPerSec(parentId, childId);
  } catch (error) {
    throw new Error(`Failed to get eligibility per second: ${error.message}`);
  }
};

export const getParentOf = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string
): Promise<string> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    return await contract.getParentOf(tokenId);
  } catch (error) {
    throw new Error(`Failed to get parent: ${error.message}`);
  }
};

// Write Operations
export const spawnBranch = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  const contract = await getWillWeContract(provider, chainId);
  await handleTransaction(
    contract.spawnBranch(tokenId),
    'Branch spawned successfully',
    setIsTransacting,
    toast,
    onSuccess
  );
};

export const mintMembership = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  const contract = await getWillWeContract(provider, chainId);
  await handleTransaction(
    contract.mintMembership(tokenId),
    'Membership minted successfully',
    setIsTransacting,
    toast,
    onSuccess
  );
};

export const redistributePath = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  const contract = await getWillWeContract(provider, chainId);
  await handleTransaction(
    contract.redistributePath(tokenId),
    'Redistribution completed successfully',
    setIsTransacting,
    toast,
    onSuccess
  );
};

// Helper functions
export const isRoot = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string
): Promise<boolean> => {
  try {
    const parentId = await getParentOf(chainId, provider, tokenId);
    return parentId === '0';
  } catch (error) {
    throw new Error(`Failed to check if root: ${error.message}`);
  }
};

export const getNodeHierarchy = async (
  chainId: string,
  provider: JsonRpcProvider,
  tokenId: string
): Promise<string[]> => {
  try {
    const contract = await getWillWeContract(provider, chainId);
    const path = await contract.getFidPath(tokenId);
    return path.reverse(); // Return from root to leaf
  } catch (error) {
    throw new Error(`Failed to get node hierarchy: ${error.message}`);
  }
};