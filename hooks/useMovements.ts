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

export const useMovements = ({ nodeId, chainId, userAddress }: UseMovementsProps) => {
  const [state, setState] = useState<UseMovementsState>({
    movements: [],
    signatures: {},
    endpointAuthTypes: {},
    isLoading: true
  });

  const { getEthersProvider, ready, authenticated } = usePrivy();
  const { executeTransaction } = useTransaction();
  const cleanChainId = chainId.replace('eip155:', '');

  // Fetch all data in parallel
  const fetchMovementData = useCallback(async () => {
    if (!nodeId || !chainId || !ready || !authenticated) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const executionContract = new ethers.Contract(
        deployments.Execution[cleanChainId],
        ABIs.Execution,
        provider
      );

      console.log('Fetching movements for node:', nodeId);
      const rawMovements = await executionContract.getLatentMovements(nodeId);
      console.log('Raw movements:', rawMovements);

      // Process only valid movements
      const processedMovements = rawMovements
        .filter(rm => {
          if (!rm || !rm.movement || !rm.signatureQueue) {
            console.warn('Invalid movement structure:', rm);
            return false;
          }
          return true;
        })
        .map(rm => {
          try {
            return processMovementData(rm);
          } catch (error) {
            console.error('Error processing movement:', error, rm);
            return null;
          }
        })
        .filter(m => m !== null && m.signatureQueue.state !== SignatureQueueState.Stale);

      console.log('Processed movements:', processedMovements);

      // Calculate signature progress for each movement
      const signatureDetails = await Promise.all(
        processedMovements.map(async (movement) => {
          try {
            const willWeContract = new ethers.Contract(
              deployments.WillWe[cleanChainId],
              ABIs.WillWe,
              provider
            );

            let currentPower = 0;
            let requiredPower = 0;

            for (const signer of movement.signatureQueue.Signers) {
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
  }, [nodeId, chainId, cleanChainId, ready, authenticated]);

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
      const calls = [{
        target: formData.target,
        callData: formData.calldata,
        value: ethers.parseEther(formData.value || '0')
      }];
  
      const executedPayload = ethers.AbiCoder.defaultAbiCoder().encode(
        [{
          type: 'tuple[]',
          components: [
            { name: 'target', type: 'address' },
            { name: 'callData', type: 'bytes' },
            { name: 'value', type: 'uint256' }
          ]
        }],
        [calls]
      );
  
      return await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer
          );
          
          return contract.startMovement(
            formData.type,
            nodeId,
            formData.expiryDays,
            formData.endpoint === 'new' ? ethers.ZeroAddress : formData.endpoint,
            formData.description,
            executedPayload
          );
        },
        {
          successMessage: 'Movement created successfully',
          onSuccess: fetchMovementData
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
      
      // Get the execution contract instance
      const executionContract = new ethers.Contract(
        deployments.Execution[cleanChainId],
        ABIs.Execution,
        provider
      );
      
      // Get the domain separator from the contract
      const domainSeparator = await executionContract.DOMAIN_SEPARATOR();
      
      // Define the EIP-712 domain and types
      const domain = {
        name: 'WillWe.xyz',
        version: '1',
        chainId: Number(cleanChainId),
        verifyingContract: deployments.Execution[cleanChainId]
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

      // The message to sign (matching the contract's Movement struct)
      const messageValue = {
        category: movement.movement.category,
        initiatior: movement.movement.initiatior,
        exeAccount: movement.movement.exeAccount,
        viaNode: movement.movement.viaNode,
        expiresAt: movement.movement.expiresAt,
        description: movement.movement.description,
        executedPayload: movement.movement.executedPayload
      };

      // Double check that our hash matches the one from the contract
      const contractMovementHash = await executionContract.hashMessage(messageValue);
      
      console.log("Movement to sign:", messageValue);
      console.log("Contract movement hash:", contractMovementHash);
      console.log("Stored movement hash:", movement.movementHash);
      
      if (contractMovementHash !== movement.movementHash) {
        console.warn("Hash mismatch - using contract hash instead");
      }

      // Sign the typed data to get a proper EIP-712 signature
      const signature = await signer._signTypedData(domain, types, messageValue);
      
      console.log("Generated signature:", signature);
      console.log("Signing parameters:", {
        domain,
        types,
        messageValue,
        signerAddress
      });

      // Submit signature to contract using the verified hash
      return await executeTransaction(
        chainId,
        async () => {
          const contractWithSigner = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer
          );

          return contractWithSigner.submitSignatures(
            contractMovementHash, // Use the hash from the contract for consistency
            [signerAddress],
            [signature]
          );
        },
        {
          successMessage: 'Movement signed successfully',
          onSuccess: fetchMovementData
        }
      );
    } catch (error) {
      console.error('Error signing movement:', error);
      throw error;
    }
  };

  const executeMovement = async (movement: LatentMovement) => {
    if (!ready || !authenticated) {
      throw new Error('Wallet not connected');
    }

    try {
      // First, verify the movement hash from the contract to ensure consistency
      const provider = await getEthersProvider();
      const executionContract = new ethers.Contract(
        deployments.Execution[cleanChainId],
        ABIs.Execution,
        provider
      );
      
      const contractMovementHash = await executionContract.hashMessage(movement.movement);
      
      if (contractMovementHash !== movement.movementHash) {
        console.warn(`Hash mismatch for execution. Using contract hash: ${contractMovementHash} instead of ${movement.movementHash}`);
      }
      
      return await executeTransaction(
        chainId,
        async () => {
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer
          );

          // Use the verified contract hash
          return contract.executeQueue(contractMovementHash);
        },
        {
          successMessage: 'Movement executed successfully',
          onSuccess: fetchMovementData
        }
      );
    } catch (error) {
      console.error('Error executing movement:', error);
      throw error;
    }
  };

  const processMovementData = (rawMovement: any): LatentMovement => {
    console.log('Processing movement:', rawMovement);

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
          ? rawMovement.signatureQueue.Signers.map(s => s?.toString() || ethers.ZeroAddress)
          : [],
        Sigs: Array.isArray(rawMovement.signatureQueue.Sigs)
          ? rawMovement.signatureQueue.Sigs.map(s => s?.toString() || '0x')
          : []
      }
    };

    console.log('Processed movement result:', processed);
    return processed;
  };

  return {
    ...state,
    createMovement,
    signMovement,
    executeMovement,
    refreshMovements: fetchMovementData,
    isReady: ready && authenticated
  };
};