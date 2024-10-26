import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/deployments';
import { NodeData } from '../types';
import { UseToastOptions } from '@chakra-ui/react';
import { BrowserProvider } from 'ethers';

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

// Transaction Management
export const handleTransaction = async (
  txPromise: Promise<ethers.ContractTransactionResponse>,
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
  } catch (error: any) {
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
  provider: BrowserProvider,
  tokenId: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.getInUseMembraneOf(tokenId);
  } catch (error) {
    throw new Error(`Failed to get in-use membrane: ${error.message}`);
  }
};

export const getMembraneContract = async (
  chainId: string,
  provider: BrowserProvider
): Promise<ethers.Contract> => {
  const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
  const signer = await provider.getSigner();
  
  return new ethers.Contract(
    deployments["Membrane"][cleanChainId],
    ABIs.Membrane,
    signer
  );
};

export const allMembersOf = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<string[]> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.allMembersOf(tokenId);
  } catch (error) {
    throw new Error(`Failed to get members: ${error.message}`);
  }
};

export const asRootValuation = async (
  chainId: string,
  provider: BrowserProvider,
  amount: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.asRootValuation(amount);
  } catch (error) {
    throw new Error(`Failed to get root valuation: ${error.message}`);
  }
};

export const balanceOf = async (
  chainId: string,
  provider: BrowserProvider,
  account: string,
  id: string
): Promise<bigint> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.balanceOf(account, id);
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

export const balanceOfBatch = async (
  chainId: string,
  provider: BrowserProvider,
  accounts: string[],
  ids: string[]
): Promise<bigint[]> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.balanceOfBatch(accounts, ids);
  } catch (error) {
    throw new Error(`Failed to get batch balance: ${error.message}`);
  }
};

export const getUserNodeSignals = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  user: string
): Promise<[bigint, bigint][]> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.getUserNodeSignals(tokenId, user);
  } catch (error) {
    throw new Error(`Failed to get user signals: ${error.message}`);
  }
};

export const getNodeData = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<NodeData> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.getNodeData(tokenId);
  } catch (error) {
    throw new Error(`Failed to get node data: ${error.message}`);
  }
};

export const getNodeDataWithUserSignals = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  user: string
): Promise<NodeData> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.getNodeDataWithUserSignals(tokenId, user);
  } catch (error) {
    throw new Error(`Failed to get node data with signals: ${error.message}`);
  }
};

export const getAllNodesForRoot = async (
  chainId: string,
  provider: BrowserProvider,
  rootToken: string,
  userAddress: string
): Promise<NodeData[]> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.getAllNodesForRoot(rootToken, userAddress);
  } catch (error) {
    throw new Error(`Failed to get all nodes: ${error.message}`);
  }
};

// Write Operations
export const spawnBranch = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  try {
    setIsTransacting(true);
    const contract = await getWillWeContract(chainId, provider);
    const tx = await contract.spawnBranch(tokenId);
    await tx.wait();
    
    toast({
      title: 'Success',
      description: 'Branch spawned successfully',
      status: 'success',
      duration: 5000,
    });
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Failed to spawn branch:', error);
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsTransacting(false);
  }
};

export const mintMembership = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  try {
    setIsTransacting(true);
    const contract = await getWillWeContract(chainId, provider);
    const tx = await contract.mintMembership(tokenId);
    await tx.wait();
    
    toast({
      title: 'Success',
      description: 'Membership minted successfully',
      status: 'success',
      duration: 5000,
    });
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Failed to mint membership:', error);
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsTransacting(false);
  }
};

export const redistributePath = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string,
  setIsTransacting: (isTransacting: boolean) => void,
  toast: (options: UseToastOptions) => void,
  onSuccess?: () => void
) => {
  try {
    setIsTransacting(true);
    const contract = await getWillWeContract(chainId, provider);
    const tx = await contract.redistributePath(tokenId);
    await tx.wait();
    
    toast({
      title: 'Success',
      description: 'Redistribution completed successfully',
      status: 'success',
      duration: 5000,
    });
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Failed to redistribute:', error);
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
      duration: 5000,
    });
  } finally {
    setIsTransacting(false);
  }
};

export const isRoot = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<boolean> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    const parentId = await contract.getParentOf(tokenId);
    return parentId === '0';
  } catch (error) {
    throw new Error(`Failed to check if root: ${error.message}`);
  }
};

export const getNodeHierarchy = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<string[]> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    const path = await contract.getFidPath(tokenId);
    return path.reverse(); // Return from root to leaf
  } catch (error) {
    throw new Error(`Failed to get node hierarchy: ${error.message}`);
  }
};

export const getParentOf = async (
  chainId: string,
  provider: BrowserProvider,
  tokenId: string
): Promise<string> => {
  try {
    const contract = await getWillWeContract(chainId, provider);
    return await contract.getParentOf(tokenId);
  } catch (error) {
    throw new Error(`Failed to get parent: ${error.message}`);
  }
};

export default {
  getWillWeContract,
  spawnBranch,
  mintMembership,
  redistributePath,
  getNodeData,
  getAllNodesForRoot,
  getUserNodeSignals
};