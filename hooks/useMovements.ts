import { useState, useEffect, useCallback } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import type { Abi } from 'viem';
import { useAppKit } from './useAppKit';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';
import { MovementType, SignatureQueueState, LatentMovement } from '../types/chainData';

interface UseMovementsProps {
  nodeId: string;
  chainId: string;
  userAddress?: string;
}

interface UseMovementsState {
  movements: LatentMovement[];
  signatures: Record<string, string>;
  endpointAuthTypes: Record<string, string>;
  isLoading: boolean;
}

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  handleError?: (error: any) => string;
}

export const useMovements = ({ nodeId, chainId, userAddress }: UseMovementsProps) => {
  const [state, setState] = useState<UseMovementsState>({
    movements: [],
    signatures: {},
    endpointAuthTypes: {},
    isLoading: true
  });

  const { user } = useAppKit();
  const { executeTransaction } = useTransaction();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Fetch all data in parallel
  const fetchMovementData = useCallback(async () => {
    if (!nodeId || !chainId || !user.isAuthenticated) return;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      // TODO: Replace with wagmi/viem readContract for fetching movements
      // For now, set empty movements
      setState(prev => ({ ...prev, movements: [], isLoading: false }));
    } catch (error) {
      console.error('Error fetching movement data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [nodeId, chainId, user.isAuthenticated]);

  useEffect(() => {
    fetchMovementData();
  }, [fetchMovementData]);

  const createMovement = async (formData: any) => {
    if (!walletClient || !publicClient || !user.isAuthenticated) {
      throw new Error('Wallet not connected');
    }
    try {
      const { request } = await publicClient.simulateContract({
        address: deployments.Execution[chainId] as `0x${string}`,
        abi: ABIs.Execution as Abi,
        functionName: 'startMovement',
        args: [
          formData.type,
          nodeId,
          formData.expiryDays,
          formData.endpoint === 'new' ? '0x0000000000000000000000000000000000000000' : formData.endpoint,
          formData.description,
          formData.calldata
        ],
        account: walletClient.account,
      });
      const hash = await walletClient.writeContract(request);
      return { hash, wait: async () => await publicClient.waitForTransactionReceipt({ hash }) };
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  };

  const signMovement = async (movement: LatentMovement) => {
    if (!walletClient || !publicClient || !user.isAuthenticated || !userAddress) {
      throw new Error('Not ready to sign');
    }
    try {
      const { request } = await publicClient.simulateContract({
        address: deployments.Execution[chainId] as `0x${string}`,
        abi: ABIs.Execution as Abi,
        functionName: 'submitSignatures',
        args: [
          movement.movementHash,
          movement.signatureQueue.Signers,
          movement.signatureQueue.Sigs
        ],
        account: walletClient.account,
      });
      const hash = await walletClient.writeContract(request);
      return { hash, wait: async () => await publicClient.waitForTransactionReceipt({ hash }) };
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      console.error('Error signing movement:', error);
      throw error;
    }
  };

  const removeSignature = async (movement: LatentMovement) => {
    if (!walletClient || !publicClient || !user.isAuthenticated || !userAddress) {
      throw new Error('Not ready to remove signature');
    }
    try {
      const signerIndex = movement.signatureQueue.Signers.findIndex(
        addr => addr.toLowerCase() === userAddress.toLowerCase()
      );
      const { request } = await publicClient.simulateContract({
        address: deployments.Execution[chainId] as `0x${string}`,
        abi: ABIs.Execution as Abi,
        functionName: 'removeSignature',
        args: [
          movement.movementHash,
          signerIndex,
          userAddress
        ],
        account: walletClient.account,
      });
      const hash = await walletClient.writeContract(request);
      return { hash, wait: async () => await publicClient.waitForTransactionReceipt({ hash }) };
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      console.error('Error removing signature:', error);
      throw error;
    }
  };

  const executeMovement = async (movement: LatentMovement) => {
    if (!walletClient || !publicClient || !user.isAuthenticated) {
      throw new Error('Wallet not connected');
    }
    try {
      const { request } = await publicClient.simulateContract({
        address: deployments.Execution[chainId] as `0x${string}`,
        abi: ABIs.Execution as Abi,
        functionName: 'executeQueue',
        args: [movement.movementHash],
        account: walletClient.account,
      });
      const hash = await walletClient.writeContract(request);
      return { hash, wait: async () => await publicClient.waitForTransactionReceipt({ hash }) };
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      console.error('Error executing movement:', error);
      throw error;
    }
  };

  // Dummy processMovementData for now (should be replaced with viem-compatible logic)
  const processMovementData = (rawMovement: any): LatentMovement => {
    // ... implement as needed for viem
    return rawMovement as LatentMovement;
  };

  return {
    ...state,
    createMovement,
    signMovement,
    removeSignature,
    executeMovement,
    refetch: fetchMovementData
  };
};