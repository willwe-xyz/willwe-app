import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getRPCUrl } from '../config/contracts';
import { MovementType } from '../types/chainData';

interface EndpointData {
  address: string;
  authType: MovementType;
  balance: string;
  isActive: boolean;
}

interface UseEndpointsState {
  endpoints: Record<string, EndpointData>;
  isLoading: boolean;
  error: string | null;
}

export const useEndpoints = (nodeData: any, chainId: string) => {
  const [state, setState] = useState<UseEndpointsState>({
    endpoints: {},
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchEndpointData = async () => {
      if (!nodeData?.movementEndpoints?.length) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
        const endpointData: Record<string, EndpointData> = {};

        await Promise.all(
          nodeData.movementEndpoints.map(async (endpoint: string) => {
            const code = await provider.getCode(endpoint);
            const balance = await provider.getBalance(endpoint);
            
            endpointData[endpoint] = {
              address: endpoint,
              authType: nodeData.childrenNodes.includes(endpoint) ? 
                MovementType.AgentMajority : 
                MovementType.EnergeticMajority,
              balance: balance.toString(),
              isActive: code !== '0x'
            };
          })
        );

        setState({
          endpoints: endpointData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load endpoint data'
        }));
      }
    };

    fetchEndpointData();
  }, [nodeData?.movementEndpoints, nodeData?.childrenNodes, chainId]);

  return state;
};