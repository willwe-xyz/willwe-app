import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { MovementType, SignatureQueueState, LatentMovement } from '../types/chainData';

interface UseMovementsProps {
  nodeId: string;
  chainId: string;
  userAddress?: string;
}

interface UseMovementsState {
  movements: LatentMovement[];
  signatures: Record<string, { current: number; required: number }>;
  endpointAuthTypes: Record<string, number>;
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

  const { getEthersProvider, ready, authenticated } = usePrivy();
  const { executeTransaction } = useTransaction();

  // Fetch all data in parallel
  const fetchMovementData = useCallback(async () => {
    if (!nodeId || !chainId || !ready || !authenticated) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
      const executionContract = new ethers.Contract(
        deployments.Execution[chainId],
        ABIs.Execution,
        provider
      );

      const rawMovements = await executionContract.getLatentMovements(nodeId);

      // Process only valid movements
      const processedMovements = rawMovements
        .filter((rm: any) => {
          if (!rm || !rm.movement || !rm.signatureQueue) {
            console.warn('Invalid movement structure:', rm);
            return false;
          }
          return true;
        })
        .map((rm: any) => {
          try {
            return processMovementData(rm);
          } catch (error) {
            console.error('Error processing movement:', error, rm);
            return null;
          }
        })
        .filter((m: any) => m !== null && m.signatureQueue.state !== SignatureQueueState.Stale);

      // Calculate signature progress for each movement
      const signatureDetails = await Promise.all(
        processedMovements.map(async (movement: LatentMovement) => {
          try {
            const willWeContract = new ethers.Contract(
              deployments.WillWe[chainId],
              ABIs.WillWe,
              provider
            );

            let currentPower = 0;
            let requiredPower = 0;

            for (const signer of movement.signatureQueue.Signers) {
              // Skip zero addresses and their corresponding empty signatures
              if (signer === ethers.ZeroAddress) continue;

              if (movement.movement.category === MovementType.EnergeticMajority) {
                const balance = await willWeContract.balanceOf(signer, movement.movement.viaNode);
                currentPower += Number(balance);
              } else {
                currentPower += 1;
              }
            }

            if (movement.movement.category === MovementType.EnergeticMajority) {
              const totalSupply = await willWeContract.totalSupply(movement.movement.viaNode);
              requiredPower = Math.floor(Number(totalSupply) / 2) + 1;
            } else {
              const members = await willWeContract.allMembersOf(movement.movement.viaNode);
              requiredPower = Math.floor(members.length / 2) + 1;
            }

            return { 
              key: `${movement.movement.viaNode}-${movement.movement.expiresAt}`,
              signatures: { current: currentPower, required: requiredPower }
            };
          } catch (error) {
            console.error('Error calculating signatures:', error);
            return { 
              key: `${movement.movement.viaNode}-${movement.movement.expiresAt}`,
              signatures: { current: 0, required: 0 }
            };
          }
        })
      );

      const signatureMap: Record<string, { current: number; required: number }> = {};
      signatureDetails.forEach(({ key, signatures }) => {
        signatureMap[key] = signatures;
      });

      setState(prev => ({
        ...prev,
        movements: processedMovements,
        signatures: signatureMap,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching movement data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [nodeId, chainId, ready, authenticated]);

  useEffect(() => {
    let mounted = true;
    
    if (mounted && ready && authenticated) {
      fetchMovementData();
    }

    return () => {
      mounted = false;
    };
  }, [fetchMovementData, ready, authenticated]);

  const createMovement = async (formData: any) => {
    if (!ready || !authenticated) {
      throw new Error('Wallet not connected');
    }

    try {
      // The calldata should already be properly formatted, don't re-encode it
      return await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.Execution[chainId],
            ABIs.Execution,
            signer as unknown as ethers.Signer
          );
          
          return contract.startMovement(
            formData.type,
            nodeId,
            formData.expiryDays,
            formData.endpoint === 'new' ? ethers.ZeroAddress : formData.endpoint,
            formData.description,
            formData.calldata // Use the calldata directly
          );
        },
        {
          successMessage: 'Movement created successfully',
          onSuccess: fetchMovementData,
          errorMessage: 'Failed to create movement',
          handleError: (error: any) => {
            if (error?.code === 4001 || error?.message?.includes('User rejected')) {
              return 'Transaction was cancelled';
            }
            if (error?.data?.message?.includes('EXE_InvalidMovement')) {
              return 'Invalid movement parameters';
            }
            if (error?.data?.message?.includes('EXE_Unauthorized')) {
              return 'Not authorized to create movement';
            }
            return `Failed to create movement: ${error?.message || 'Unknown error'}`;
          }
        }
      );
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  };

  const signMovement = async (movement: LatentMovement) => {
    if (!ready || !authenticated || !userAddress) {
      throw new Error('Not ready to sign');
    }

    try {
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Format the movement
      const formattedMovement = {
        category: Number(movement.movement.category),
        initiatior: movement.movement.initiatior,
        exeAccount: movement.movement.exeAccount,
        viaNode: BigInt(movement.movement.viaNode),
        expiresAt: BigInt(movement.movement.expiresAt),
        description: movement.movement.description,
        executedPayload: movement.movement.executedPayload
      };
      
      // Define EIP-712 domain and types
      const domain = {
        name: 'WillWe.xyz',
        version: '1',
        chainId: Number(chainId),
        verifyingContract: deployments.Execution[chainId]
      };
      
      const types = {
        Movement: [
          { name: 'category', type: 'uint8' },
          { name: 'initiatior', type: 'address' },
          { name: 'exeAccount', type: 'address' },
          { name: 'viaNode', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
          { name: 'description', type: 'string' },
          { name: 'executedPayload', type: 'bytes' }
        ]
      };
      
      // Sign using EIP-712
      const signature = await signer._signTypedData(
        domain,
        { Movement: types.Movement },
        formattedMovement
      );
      
      // Verify locally that the signature is correct
      const recoveredAddress = ethers.verifyTypedData(
        domain,
        { Movement: types.Movement },
        formattedMovement,
        signature
      );
      
      // Always create arrays at least as long as existing ones
      const currentLength = movement.signatureQueue.Signers.length;
      const signers = Array(Math.max(currentLength, 1)).fill(ethers.ZeroAddress);
      const signatures = Array(Math.max(currentLength, 1)).fill('0x' + '0'.repeat(64));

      // Find if this signer already has a signature
      const existingIndex = movement.signatureQueue.Signers.findIndex(
        addr => addr.toLowerCase() === signerAddress.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Update at existing position
        signers[existingIndex] = signerAddress;
        signatures[existingIndex] = signature;
      } else {
        // Add to next available position or at the end
        const nextIndex = movement.signatureQueue.Signers.findIndex(addr => addr === ethers.ZeroAddress);
        const targetIndex = nextIndex >= 0 ? nextIndex : currentLength;
        
        if (targetIndex >= signers.length) {
          signers.push(signerAddress);
          signatures.push(signature);
        } else {
          signers[targetIndex] = signerAddress;
          signatures[targetIndex] = signature;
        }
      }

      return await executeTransaction(
        chainId,
        async () => {
          const executionContract = new ethers.Contract(
            deployments.Execution[chainId],
            ABIs.Execution,
            signer as unknown as ethers.Signer
          );
          
          return executionContract.submitSignatures(
            movement.movementHash,
            signers,
            signatures,
            { gasLimit: 5000000 }
          );
        },
        {
          successMessage: 'Movement signed successfully',
          onSuccess: fetchMovementData,
          errorMessage: 'Failed to sign movement'
        }
      );
    } catch (error: any) {
      // Handle user rejection of signature request
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      console.error('Error signing movement:', error);
      throw error;
    }
  };

  const removeSignature = async (movement: LatentMovement) => {
    if (!ready || !authenticated || !userAddress) {
      throw new Error('Not ready to remove signature');
    }

    try {
      return await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const signerAddress = await signer.getAddress();
          
          // Find the exact index of the signer in the array
          const signerIndex = movement.signatureQueue.Signers.findIndex(
            addr => addr.toLowerCase() === signerAddress.toLowerCase()
          );
          
          if (signerIndex === -1) {
            throw new Error('Your signature was not found');
          }

          const executionContract = new ethers.Contract(
            deployments.Execution[chainId],
            ABIs.Execution,
            signer as unknown as ethers.Signer
          );

          // Call removeSignature with the exact index where the signature is found
          return executionContract.removeSignature(
            movement.movementHash,
            signerIndex,
            signerAddress,
            { 
              gasLimit: 500000 
            }
          );
        },
        {
          successMessage: 'Signature removed successfully',
          onSuccess: fetchMovementData,
          errorMessage: 'Failed to remove signature',
          handleError: (error: any) => {
            if (error?.message?.includes('EXE_OnlySigner')) {
              return 'Only the original signer can remove their signature';
            }
            if (error?.code === 4001 || error?.message?.includes('User rejected')) {
              return 'Transaction was cancelled';
            }
            return 'Failed to remove signature. Please try again.';
          }
        }
      );
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      console.error('Error removing signature:', error);
      throw error;
    }
  };

  const executeMovement = async (movement: LatentMovement) => {
    if (!ready || !authenticated) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.Execution[chainId],
            ABIs.Execution,
            signer as unknown as ethers.Signer
          );

          // Get the current nonce for the transaction
          const nonce = await provider.getTransactionCount(await signer.getAddress());
          
          return contract.executeQueue(
            movement.movementHash,
            { 
              gasLimit: 1000000, // Increase gas limit for complex operations
              nonce // Explicitly set nonce to avoid transaction collisions
            }
          );
        },
        {
          successMessage: 'Movement executed successfully',
          onSuccess: fetchMovementData,
          errorMessage: 'Failed to execute movement',
          handleError: (error: any) => {
            // Add more specific error handling
            if (error?.code === 4001 || error?.message?.includes('User rejected')) {
              return 'Transaction was cancelled';
            }
            if (error?.data?.message?.includes('EXE_SQInvalid')) {
              return 'Queue is not valid for execution';
            }
            if (error?.data?.message?.includes('EXE_ExpiredQueue')) {
              return 'Movement has expired';
            }
            return `Failed to execute movement: ${error?.message || 'Unknown error'}`;
          }
        }
      );
    } catch (error: any) {
      // Handle user rejection
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      console.error('Error executing movement:', error);
      throw error;
    }
  };

  const processMovementData = (rawMovement: any): LatentMovement => {
    // Extract movement data, ensuring all required fields are present
    const movement = {
      category: Number(rawMovement.movement.category || 0),
      initiatior: rawMovement.movement.initiatior?.toString() || ethers.ZeroAddress,
      exeAccount: rawMovement.movement.exeAccount?.toString() || ethers.ZeroAddress,
      viaNode: rawMovement.movement.viaNode?.toString() || '0',
      expiresAt: rawMovement.movement.expiresAt?.toString() || '0',
      description: rawMovement.movement.description || '',
      executedPayload: rawMovement.movement.executedPayload?.toString() || '0x'
    };

    const processed: LatentMovement = {
      movement,
      signatureQueue: {
        state: Number(rawMovement.signatureQueue.state || 0),
        Action: rawMovement.signatureQueue.Action || movement,
        Signers: Array.isArray(rawMovement.signatureQueue.Signers)
          ? rawMovement.signatureQueue.Signers.map((s: any) => s?.toString() || ethers.ZeroAddress)
          : [],
        Sigs: Array.isArray(rawMovement.signatureQueue.Sigs)
          ? rawMovement.signatureQueue.Sigs.map((s: any) => s?.toString() || '0x')
          : []
      },
      movementHash: rawMovement.movementHash
    };

    return processed;
  };

  return {
    movements: state.movements,
    signatures: state.signatures,
    endpointAuthTypes: state.endpointAuthTypes,
    isLoading: state.isLoading,
    createMovement,
    signMovement,
    removeSignature,
    executeMovement,
    refresh: fetchMovementData
  };
};