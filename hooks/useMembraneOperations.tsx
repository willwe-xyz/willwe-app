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

          // Find MembraneCreated event
          const membraneCreatedLog = receipt.logs.find((log: any) => {
            try {
              return log.topics[0] === ethers.id("MembraneCreated(uint256,string)");
            } catch {
              return false;
            }
          });
          
          if (!membraneCreatedLog) {
            throw new Error('Failed to find MembraneCreated event in logs');
          }

          const membraneId = ethers.toBigInt(membraneCreatedLog.topics[1]).toString();

          return {
            tx,
            receipt,
            membraneId
          };
        },
        {
          successMessage: 'Membrane created successfully',
          errorMessage: 'Failed to create membrane'
        }
      );
      
      if (!result) {
        throw new Error('Transaction failed');
      }

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