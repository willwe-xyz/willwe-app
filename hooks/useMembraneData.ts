import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface MembraneMetadata {
  name: string;
  description?: string;
  characteristics?: Array<{title: string; link?: string}>;
}

interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export function useMembraneData(chainId: string) {
  const [membraneId, setMembraneId] = useState('');
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [membraneRequirements, setMembraneRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingMembrane, setIsLoadingMembrane] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const fetchMembraneMetadata = useCallback(async (cid: string) => {
    try {
      const response = await fetch(`${IPFS_GATEWAY}${cid}`);
      if (!response.ok) throw new Error('Failed to fetch membrane metadata');
      const metadata = await response.json();
      setMembraneMetadata(metadata);
    } catch (err) {
      console.error('Error fetching membrane metadata:', err);
      setMembraneMetadata(null);
    }
  }, []);

  useEffect(() => {
    if (!membraneId) return;

    const validateMembrane = async () => {
      setIsValidating(true);
      setIsLoadingMembrane(true);

      try {
        const cleanChainId = chainId.replace('eip155:', '');
        const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
        const membraneContract = new ethers.Contract(
          deployments.Membrane[cleanChainId],
          ABIs.Membrane,
          provider
        );

        const membrane = await membraneContract.getMembraneById(membraneId);
        
        if (!membrane) throw new Error('Invalid membrane ID');

        if (membrane.meta) {
          await fetchMembraneMetadata(membrane.meta);
        }

        const requirements = await Promise.all(
          membrane.tokens.map(async (tokenAddress: string, index: number) => {
            const tokenContract = new ethers.Contract(
              tokenAddress,
              ['function symbol() view returns (string)'],
              provider
            );

            const symbol = await tokenContract.symbol();
            
            return {
              tokenAddress,
              symbol,
              requiredBalance: membrane.balances[index].toString(),
              formattedBalance: ethers.formatUnits(membrane.balances[index], 18)
            };
          })
        );

        setMembraneRequirements(requirements);
      } catch (err) {
        console.error('Membrane validation error:', err);
        setMembraneRequirements([]);
        setMembraneMetadata(null);
      } finally {
        setIsValidating(false);
        setIsLoadingMembrane(false);
      }
    };

    validateMembrane();
  }, [membraneId, chainId, fetchMembraneMetadata]);

  return {
    membraneId,
    setMembraneId,
    membraneMetadata,
    membraneRequirements,
    isLoadingMembrane,
    isValidating
  };
}