import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { NodeState } from '../../types/chainData';
import { Box, useColorModeValue, Spinner } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import { getMembraneData } from '../../hooks/useMembraneData';
import Color from 'color';
import { useContract } from '../../hooks/useContract';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box>Loading...</Box>
});

// Cache configuration
const CACHE_KEY = 'tokenMetadataCache';
const MEMBRANE_CACHE_KEY = 'membraneDataCache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests to be more conservative
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

// Cache for in-memory membrane data
const membraneDataCache = new Map<string, {
  data: any;
  timestamp: number;
}>();


interface TokenMetadata {
  decimals: number;
  logo: string | null;
  name: string;
  symbol: string;
  timestamp: number;
}

interface MembraneData {
  membraneMetadata: any[];
  [key: string]: any;
}

// Batch token metadata requests
const batchTokenMetadataRequests = async (tokenAddresses: string[], chainId: string): Promise<Record<string, TokenMetadata | null>> => {
  const results: Record<string, TokenMetadata | null> = {};
  
  try {
    // Process addresses in batches of 10 to avoid overwhelming the API
    for (let i = 0; i < tokenAddresses.length; i += 10) {
      const batch = tokenAddresses.slice(i, i + 10);
      const promises = batch.map(async (address) => {
        try {
          const response = await fetch(`/api/tokens/metadata?address=${address}&chainId=${chainId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch token metadata');
          }
          const data = await response.json();
          if (data.metadata) {
            results[address] = {
              decimals: data.metadata.decimals || 18,
              logo: data.metadata.logo || null,
              name: data.metadata.name || 'Unknown Token',
              symbol: data.metadata.symbol || '???',
              timestamp: Date.now()
            };
          } else {
            results[address] = null;
          }
        } catch (error) {
          console.error(`Error fetching metadata for ${address}:`, error);
          results[address] = null;
        }
      });
      
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Error in batch token metadata requests:', error);
  }
  
  return results;
};

const getTokenMetadata = async (tokenAddress: string, chainId: string): Promise<TokenMetadata | null> => {
  try {
    const response = await fetch(`/api/tokens/metadata?address=${tokenAddress}&chainId=${chainId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch token metadata');
    }
    const data = await response.json();
    return data.metadata;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
};

const fetchMembraneData = async (chainId: string, nodeIds: string[]): Promise<MembraneData | null> => {
  const cacheKey = `${chainId}:${nodeIds.join(',')}`;
  const cachedData = membraneDataCache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  try {
    const data = await getMembraneData(chainId, nodeIds);
    if (data) {
      membraneDataCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
    return data;
  } catch (error) {
    console.error('Error fetching membrane data:', error);
    return null;
  }
};

interface TreemapChartProps {
  nodeData: NodeState;
  chainId: string;
  selectedTokenColor: string;
  tokenSymbol?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ 
  nodeData, 
  chainId,
  selectedTokenColor = '#319795',
  tokenSymbol = 'TOKEN'
}) => {
  const router = useRouter();
  const { contract } = useContract(chainId);
  const [chartData, setChartData] = useState<{
    labels: string[];
    parents: string[];
    ids: string[];
    values: number[];
    text: string[];
    colors: string[];
  }>({ labels: [], parents: [], ids: [], values: [], text: [], colors: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Theme colors
  const textColor = useColorModeValue('#1A202C', '#FFFFFF');
  const borderColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)');

  // Ensure we have a valid color
  const chartColor = selectedTokenColor || '#319795';

  const generateColorShades = (baseColor: string, count: number): string[] => {
    try {
      const shades = [];
      for (let i = 0; i < count; i++) {
        const shade = Color(baseColor)
          .lighten(0.1 * i)
          .hex();
        shades.push(shade);
      }
      return shades;
    } catch (error) {
      console.error('Error generating color shades:', error);
      return Array(count).fill(baseColor);
    }
  };

  const transformDataForTreemap = useCallback(async () => {
    if (!nodeData?.rootPath?.length || !contract) {
      console.warn('No root path data available or contract not initialized');
      return { labels: [], parents: [], ids: [], values: [], text: [], colors: [] };
    }

    const labels: string[] = [];
    const parents: string[] = [];
    const ids: string[] = [];
    const values: number[] = [];
    const text: string[] = [];
    const colors: string[] = [];

    const nodeIds = nodeData.rootPath;
    const membranes = await fetchMembraneData(chainId, nodeIds.slice(1));
    const membraneMetadata = membranes?.membraneMetadata || [];

    const MIN_DISPLAY_VALUE = 0.0001;
    const colorShades = generateColorShades(selectedTokenColor, nodeData.rootPath.length);

    const rawValues: number[] = [];
    const tokenAddresses: string[] = [];

    // Collect all token addresses first
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) continue;

      if (index === 0) {
        const hexAddress = ethers.toBigInt(nodeId)
          .toString(16)
          .padStart(40, '0');
        tokenAddresses.push(`0x${hexAddress.toLowerCase()}`);
      }

      try {
        const data = await contract.getNodeData(ethers.toBigInt(nodeId), ethers.ZeroAddress).catch(error => {
          console.warn(`Failed to fetch node data for ${nodeId}:`, error);
          return [null, null, [null, null, '0']];
        });
        
        const balanceAnchor = data[0]?.[2]?.toString() || '0';
        const formattedValue = Number(ethers.formatUnits(balanceAnchor, 'ether')) || MIN_DISPLAY_VALUE;
        rawValues.push(formattedValue);
      } catch (error) {
        console.error(`Error processing node ${nodeId}:`, error);
        rawValues.push(MIN_DISPLAY_VALUE);
      }
    }

    // Batch fetch all token metadata
    const tokenMetadataResults = await batchTokenMetadataRequests(tokenAddresses, chainId);
    const tokenMetadata = tokenAddresses[0] ? tokenMetadataResults[tokenAddresses[0]] : null;

    const maxRawValue = Math.max(...rawValues, MIN_DISPLAY_VALUE);
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) continue;

      const displayName = membraneMetadata[index - 1]?.name || `Node ${nodeId.slice(-6)}`;
      labels.push(displayName);
      ids.push(nodeId.toLowerCase());
      parents.push('');
      const rawValue = rawValues[index];
      const displayValue = rawValue > 0 ? rawValue : maxRawValue * MIN_DISPLAY_VALUE;
      values.push(displayValue);
      
      const symbol = index === 0 && tokenMetadata ? tokenMetadata.symbol : tokenSymbol;
      text.push(`${rawValue.toLocaleString()} ${symbol}`);
      colors.push(colorShades[index]);
    }

    return { labels, parents, ids, values, text, colors };
  }, [nodeData, chainId, contract, selectedTokenColor, tokenSymbol]);

  // Fetch data once on component mount and when dependencies change
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await transformDataForTreemap();
        if (isMounted) {
          setChartData(data);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [transformDataForTreemap]);

  const handleClick = (event: any) => {
    if (event.points?.[0]) {
      const nodeId = event.points[0].id;
      const nodeIndex = nodeData.rootPath.findIndex(id => 
        id.toLowerCase() === nodeId.toLowerCase()
      );

      if (nodeIndex === 0) {
        const hexAddress = ethers.toBigInt(nodeId)
          .toString(16)
          .padStart(40, '0');
        router.push(`/dashboard?token=0x${hexAddress.toLowerCase()}`);
      } else {
        router.push(`/nodes/${chainId}/${nodeId}`);
      }
    }
  };

  if (isLoading) {
    return (
      <Box height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={chartColor} />
      </Box>
    );
  }

  return (
    <Box height="100%" width="100%">
      <Plot
        data={[{
          type: 'treemap',
          labels: chartData.labels,
          parents: chartData.parents,
          ids: chartData.ids,
          values: chartData.values,
          text: chartData.text,
          hovertemplate: '<b>%{label}</b><br>%{text}<extra></extra>',
          marker: {
            colors: chartData.colors,
            showscale: false,
            line: {
              width: 1,
              color: borderColor
            }
          },
          textfont: {
            color: textColor,
            size: 13
          },
          textposition: 'middle center'
        }]}
        layout={{
          margin: { l: 2, r: 2, b: 2, t: 2 },
          autosize: true,
          showlegend: false,
          width: undefined,
          height: undefined,
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent'
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onClick={handleClick}
      />
    </Box>
  );
};

export default TreemapChart;