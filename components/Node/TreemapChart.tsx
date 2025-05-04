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
const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || '';

// Cache for in-memory membrane data
const membraneDataCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

if (!ALCHEMY_API_URL) {
  console.error('Alchemy API URL is not configured');
}

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
const batchTokenMetadataRequests = async (tokenAddresses: string[]): Promise<Record<string, TokenMetadata | null>> => {
  const results: Record<string, TokenMetadata | null> = {};
  const addressesToFetch: string[] = [];
  
  // Check cache first
  const cachedData = localStorage.getItem(CACHE_KEY);
  let cache: Record<string, TokenMetadata> = {};
  
  if (cachedData) {
    try {
      cache = JSON.parse(cachedData);
    } catch (error) {
      console.warn('Error parsing cached token metadata:', error);
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // Filter out cached addresses
  tokenAddresses.forEach(address => {
    const cachedEntry = cache[address];
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      results[address] = cachedEntry;
    } else {
      addressesToFetch.push(address);
    }
  });

  if (addressesToFetch.length === 0) {
    return results;
  }

  // Batch fetch remaining addresses
  try {
    const response = await fetch(ALCHEMY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: [addressesToFetch],
        id: 1,
      }),
    });

    if (!response.ok) {
      // If we get a non-200 response, just return null for all addresses
      addressesToFetch.forEach(address => {
        results[address] = null;
      });
      return results;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      // If response is not JSON, just return null for all addresses
      addressesToFetch.forEach(address => {
        results[address] = null;
      });
      return results;
    }

    const data = await response.json();
    if (data.result) {
      const timestamp = Date.now();
      addressesToFetch.forEach((address, index) => {
        const metadata = data.result[index];
        if (metadata) {
          const entry = {
            ...metadata,
            timestamp
          };
          results[address] = entry;
          cache[address] = entry;
        } else {
          results[address] = null;
        }
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    // Only log errors that aren't related to HTML responses
    if (!(error instanceof SyntaxError) || !error.message.includes('<!DOCTYPE')) {
      console.warn('Error fetching token metadata:', error);
    }
    // Return null for all addresses on error
    addressesToFetch.forEach(address => {
      results[address] = null;
    });
  }

  return results;
};

const getTokenMetadata = async (tokenAddress: string): Promise<TokenMetadata | null> => {
  const results = await batchTokenMetadataRequests([tokenAddress]);
  return results[tokenAddress];
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
    const tokenMetadataResults = await batchTokenMetadataRequests(tokenAddresses);
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