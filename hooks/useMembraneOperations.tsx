// File: ./hooks/useMembraneOperations.ts

import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';

export function useMembraneOperations(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { getEthersProvider } = usePrivy();

  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    try {
      const result = await executeTransaction(
        chainId,
        async () => {
          const cleanChainId = chainId.replace('eip155:', '');
          const contractAddress = deployments.Membrane[cleanChainId];
          
          if (!contractAddress) {
            throw new Error(`No contract found for chain ${chainId}`);
          }

          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.Membrane,
            // @ts-ignore
            signer
          );

          // Parse balances to proper format
          const parsedBalances = balances.map(b => ethers.parseUnits(b, 18));
          
          // Create membrane
          const tx = await contract.createMembrane(
            tokens, 
            parsedBalances, 
            metadataCid,
            { gasLimit: 500000 }
          );

          const receipt = await tx.wait();

          // The event signature for MembraneCreated(address,uint256,string)
          const membraneCreatedSignature = ethers.id("MembraneCreated(address,uint256,string)");
          
          const membraneCreatedLog = receipt.logs.find((log: any) => {
            try {
              return log.topics[0] === membraneCreatedSignature;
            } catch (e) {
              console.error('Error checking log topic:', e);
              return false;
            }
          });
          
          if (!membraneCreatedLog) {
            throw new Error('Failed to find MembraneCreated event in logs');
          }

          // Extract membraneId from the data field since parameters are not indexed
          let membraneId;
          try {
            // According to the ABI, the parameters are not indexed, so they're in the data field
            // We need to decode the data field which contains all parameters
            const abiCoder = ethers.AbiCoder.defaultAbiCoder();
            
            // The data contains [address creator, uint256 membraneId, string CID]
            const decodedData = abiCoder.decode(
              ['address', 'uint256', 'string'], 
              membraneCreatedLog.data
            );
            
            // The membraneId is the second parameter (index 1)
            membraneId = decodedData[1].toString();
            
            if (!membraneId) {
              throw new Error('Could not extract membrane ID from event data');
            }
          } catch (error) {
            console.error('Error extracting membrane ID:', error);
            throw new Error('Failed to parse membrane ID from transaction logs');
          }
          
          return tx;
        },
        {
          successMessage: 'Membrane created successfully',
          errorMessage: 'Failed to create membrane'
        }
      );
      
      return result;

    } catch (error) {
      console.error('Create membrane error:', error);
      throw error;
    }
  }, [chainId, executeTransaction, getEthersProvider]);

  const checkMembrane = useCallback(async (
    address: string,
    membraneId: string
  ) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.Membrane[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No Membrane contract found for chain ${chainId}`);
      }

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.Membrane,
        // @ts-ignore
        provider
      );

      return await contract.gCheck(address, membraneId);
    } catch (error) {
      console.error('Error checking membrane:', error);
      throw error;
    }
  }, [chainId, getEthersProvider]);

  const getMembraneById = useCallback(async (membraneId: string) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.Membrane[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No Membrane contract found for chain ${chainId}`);
      }

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.Membrane,
        // @ts-ignore
        provider
      );

      return await contract.getMembraneById(membraneId);
    } catch (error) {
      console.error('Error fetching membrane:', error);
      throw error;
    }
  }, [chainId, getEthersProvider]);

  return {
    createMembrane,
    checkMembrane,
    getMembraneById
  };
}

export default useMembraneOperations;