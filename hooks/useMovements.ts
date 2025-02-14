import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { MovementType, SignatureQueueState, LatentMovement } from '../types/chainData';

interface UseMovementsProps {
  nodeId: string;
  chainId: string;
}

interface UseMovementsState {
  movements: LatentMovement[];
  descriptions: Record<string, string>;
  signatures: Record<string, { current: number; required: number }>;
  endpointAuthTypes: Record<string, number>;
  isLoading: boolean;
}

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];

const MOVEMENT_TYPE = [
  { name: 'category', type: 'uint8' },
  { name: 'initiatior', type: 'address' },
  { name: 'exeAccount', type: 'address' },
  { name: 'viaNode', type: 'uint256' },
  { name: 'expiresAt', type: 'uint256' },
  { name: 'descriptionHash', type: 'bytes32' },
  { name: 'executedPayload', type: 'bytes' }
];

// Add utility function to convert CID to bytes32
const cidToBytes32 = (cid: string): string => {
  // Convert CID to bytes32 format
  const bytes = ethers.toUtf8Bytes(cid);
  const hash = ethers.keccak256(bytes);
  return hash;
};

export const useMovements = ({ nodeId, chainId }: UseMovementsProps) => {
  const [state, setState] = useState<UseMovementsState>({
    movements: [],
    descriptions: {},
    signatures: {},
    endpointAuthTypes: {},
    isLoading: true
  });

  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const cleanChainId = chainId.replace('eip155:', '');

  // Fetch all data in parallel
  const fetchMovementData = useCallback(async () => {
    if (!nodeId || !chainId) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
      const executionContract = new ethers.Contract(
        deployments.Execution[cleanChainId],
        ABIs.Execution,
        provider
      );

      // Fetch movements
      const rawMovements = await executionContract.getLatentMovements(nodeId);
      const processedMovements = rawMovements
        .map(processMovementData)
        .filter(m => m.signatureQueue.state !== SignatureQueueState.Stale);

      // Fetch descriptions and signatures in parallel
      const [descriptions, signatureDetails] = await Promise.all([
        // Get descriptions
        Promise.all(processedMovements.map(async (movement) => {
          try {
            const description = await fetchMovementDescription(movement.movement.descriptionHash);
            return { hash: movement.movement.descriptionHash, description };
          } catch (error) {
            console.error('Error fetching description:', error);
            return { hash: movement.movement.descriptionHash, description: 'Failed to load description' };
          }
        })),
        // Get signature counts
        Promise.all(processedMovements.map(async (movement) => {
          try {
            const willWeContract = new ethers.Contract(
              deployments.WillWe[cleanChainId],
              ABIs.WillWe,
              provider
            );

            let currentPower = 0;
            let requiredPower = 0;

            // Calculate current power based on movement type
            for (const signer of movement.signatureQueue.Signers) {
              if (signer === ethers.ZeroAddress) continue;

              if (movement.movement.category === MovementType.EnergeticMajority) {
                const balance = await willWeContract.balanceOf(signer, movement.movement.viaNode);
                currentPower += Number(balance);
              } else {
                currentPower += 1;
              }
            }

            // Calculate required power
            if (movement.movement.category === MovementType.EnergeticMajority) {
              const totalSupply = await willWeContract.totalSupply(movement.movement.viaNode);
              requiredPower = Math.floor(Number(totalSupply) / 2) + 1;
            } else {
              const members = await willWeContract.allMembersOf(movement.movement.viaNode);
              requiredPower = Math.floor(members.length / 2) + 1;
            }

            return { 
              hash: movement.movementHash,
              signatures: { current: currentPower, required: requiredPower }
            };
          } catch (error) {
            console.error('Error calculating signatures:', error);
            return { 
              hash: movement.movementHash,
              signatures: { current: 0, required: 0 }
            };
          }
        }))
      ]);

      // Build state updates
      const descriptionMap: Record<string, string> = {};
      descriptions.forEach(({ hash, description }) => {
        descriptionMap[hash] = description;
      });

      const signatureMap: Record<string, { current: number; required: number }> = {};
      signatureDetails.forEach(({ hash, signatures }) => {
        signatureMap[hash] = signatures;
      });

      setState(prev => ({
        ...prev,
        movements: processedMovements,
        descriptions: descriptionMap,
        signatures: signatureMap,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching movement data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [nodeId, chainId, cleanChainId]);

  // Effect for initial fetch and cleanup
  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      fetchMovementData();
    }

    return () => {
      mounted = false;
    };
  }, [fetchMovementData]);

  // Create movement with proper EIP-712 typing
  const createMovement = async (formData: any) => {
    try {
      // Upload description to IPFS via Filebase
      const descriptionMetadata = {
        description: formData.description,
        timestamp: Date.now()
      };

      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: descriptionMetadata }),
      });

      if (!response.ok) throw new Error('Failed to upload metadata');
      const { cid } = await response.json();

      console.log("uploadDescription, descriptionHash:", { cid });

      // Convert CID to bytes32
      const descriptionHash = cidToBytes32(cid);

      // Create the Call struct array for executedPayload
      const calls = [{
        target: formData.target,
        callData: formData.calldata,
        value: ethers.parseEther(formData.value || '0')
      }];

      // Encode the calls array according to the contract's Call struct
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
            // @ts-ignore
            signer
          );
          
          return contract.startMovement(
            formData.type,
            nodeId,
            formData.expiryDays,
            formData.endpoint === 'new' ? ethers.ZeroAddress : formData.endpoint,
            descriptionHash, // Now using bytes32 hash
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

  // Sign movement with EIP-712
  const signMovement = async (movement: LatentMovement) => {
    const provider = await getEthersProvider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // EIP-712 domain
    const domain = {
      name: 'WillWe',
      version: '1',
      chainId: Number(cleanChainId),
      verifyingContract: deployments.Execution[cleanChainId]
    };

    // Prepare the data to be signed
    const message = {
      category: movement.movement.category,
      initiatior: movement.movement.initiatior,
      exeAccount: movement.movement.exeAccount,
      viaNode: movement.movement.viaNode,
      expiresAt: movement.movement.expiresAt,
      descriptionHash: movement.movement.descriptionHash,
      executedPayload: movement.movement.executedPayload
    };

    // Sign using EIP-712
    const signature = await signer.signTypedData(domain, { Movement: MOVEMENT_TYPE }, message);

    return await executeTransaction(
      chainId,
      async () => {
        const contract = new ethers.Contract(
          deployments.WillWe[cleanChainId],
          ABIs.WillWe,
          signer
        );

        return contract.submitSignatures(
          movement.movementHash,
          [address],
          [signature]
        );
      },
      {
        successMessage: 'Movement signed successfully',
        onSuccess: fetchMovementData
      }
    );
  };

  const executeMovement = async (movement: LatentMovement) => {
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

        return contract.executeQueue(movement.movementHash);
      },
      {
        successMessage: 'Movement executed successfully',
        onSuccess: fetchMovementData
      }
    );
  };

  // Process movement data with proper EIP-712 hashing
  const processMovementData = (rawMovement: any): LatentMovement => {
    const movement = {
      category: Number(rawMovement.movement.category),
      initiatior: rawMovement.movement.initiatior.toString(),
      exeAccount: rawMovement.movement.exeAccount.toString(),
      viaNode: rawMovement.movement.viaNode.toString(),
      expiresAt: rawMovement.movement.expiresAt.toString(),
      descriptionHash: rawMovement.movement.descriptionHash.toString(),
      executedPayload: rawMovement.movement.executedPayload.toString()
    };

    const domain = {
      name: 'WillWe',
      version: '1',
      chainId: Number(cleanChainId),
      verifyingContract: deployments.Execution[cleanChainId]
    };

    // Calculate EIP-712 hash using ethers v6 syntax
    const movementHash = ethers.TypedDataEncoder.hash(
      domain,
      { Movement: MOVEMENT_TYPE },
      movement
    );

    return {
      movement,
      movementHash,
      signatureQueue: {
        state: Number(rawMovement.signatureQueue.state),
        Action: rawMovement.signatureQueue.Action,
        Signers: Array.isArray(rawMovement.signatureQueue.Signers) 
          ? rawMovement.signatureQueue.Signers.map((s: any) => s.toString())
          : [],
        Sigs: Array.isArray(rawMovement.signatureQueue.Sigs)
          ? rawMovement.signatureQueue.Sigs.map((s: any) => s.toString())
          : []
      }
    };
  };

  // Also update the fetchMovementDescription function (if it exists) to handle bytes32
  const fetchMovementDescription = async (descriptionHash: string): Promise<string> => {
    try {
      // Implement your logic to fetch the description from IPFS using the hash
      const response = await fetch(`/api/get-ipfs-data?hash=${descriptionHash}`);
      if (!response.ok) throw new Error('Failed to fetch description');
      const data = await response.json();
      return data.description;
    } catch (error) {
      console.error('Error fetching description:', error);
      return 'Failed to load description';
    }
  };

  return {
    ...state,
    createMovement,
    signMovement,
    executeMovement,
    refreshMovements: fetchMovementData
  };
};