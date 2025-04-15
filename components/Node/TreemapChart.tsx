import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NodeState } from '../../types/chainData';
import { Box, useColorModeValue } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import { getMembraneData } from '../../hooks/useMembraneData';
import Color from 'color';
import { useContract } from '../../hooks/useContract';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box>Loading...</Box>
});

interface TreemapChartProps {
  nodeData: NodeState;
  chainId: string;
  selectedTokenColor: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ 
  nodeData, 
  chainId,
  selectedTokenColor = '#319795' // Default to teal if no color provided
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

  const transformDataForTreemap = async () => {
    const labels: string[] = [];
    const parents: string[] = [];
    const ids: string[] = [];
    const values: number[] = [];
    const text: string[] = [];
    const colors: string[] = [];

    if (!nodeData?.rootPath?.length || !contract) {
      console.warn('No root path data available or contract not initialized');
      return { labels, parents, ids, values, text, colors };
    }

    const nodeIds = nodeData.rootPath;
    const membranes = await getMembraneData(chainId, nodeIds.slice(1));
    const membraneMetadata = membranes.membraneMetadata;

    // Calculate minimum value to ensure visibility
    const MIN_DISPLAY_VALUE = 0.0001; // Smaller minimum for better proportions

    // Generate color shades for the nodes
    const colorShades = generateColorShades(selectedTokenColor, nodeData.rootPath.length);

    // First pass to collect all values and node data
    const rawValues: number[] = [];
    const nodeDataArray: NodeState[] = [];

    // Fetch data for all nodes in the path
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) continue;

      try {
        // Fetch data for this node
        const data = await contract.getNodeData(ethers.toBigInt(nodeId), ethers.ZeroAddress);
        
        // Access the basicInfo array directly from the raw data
        const basicInfo = data[0].map((item: any) => item?.toString() || '0');
        console.log(`Node ${nodeId} basicInfo:`, basicInfo);
        
        const nodeInfo: NodeState = {
          basicInfo,
          membraneMeta: data[1]?.toString() || '',
          membersOfNode: Array.isArray(data[2]) ? data[2].map((item: any) => item?.toString() || '') : [],
          childrenNodes: Array.isArray(data[3]) ? data[3].map((item: any) => item?.toString() || '') : [],
          movementEndpoints: Array.isArray(data[4]) ? data[4].map((item: any) => item?.toString() || '') : [],
          rootPath: Array.isArray(data[5]) ? data[5].map((item: any) => item?.toString() || '') : [],
          nodeSignals: {
            signalers: [],
            inflationSignals: [],
            membraneSignals: [],
            redistributionSignals: []
          }
        };
        nodeDataArray.push(nodeInfo);

        // Get Balance Anchor (basicInfo[2])
        const balanceAnchor = basicInfo[2];
        console.log(`Node ${nodeId} Balance Anchor (raw):`, balanceAnchor);
        
        const formattedValue = balanceAnchor ? Number(ethers.formatUnits(balanceAnchor, 'ether')) : 0;
        console.log(`Node ${nodeId} Balance Anchor (formatted):`, formattedValue);
        
        rawValues.push(formattedValue);
      } catch (error) {
        console.error(`Error fetching data for node ${nodeId}:`, error);
        rawValues.push(0);
        nodeDataArray.push(nodeData);
      }
    }

    // Find the maximum raw value
    const maxRawValue = Math.max(...rawValues, MIN_DISPLAY_VALUE);
    console.log('Raw values array:', rawValues);
    console.log('Max raw value:', maxRawValue);
    
    // Process all nodes in a flat structure
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) continue;

      try {
        const formattedId = nodeId.toLowerCase();
        
        // Get display name
        let displayName: string;
        if (index === 0) {
          const hexAddress = ethers.toBigInt(formattedId).toString(16).padStart(40, '0');
          displayName = `0x${hexAddress.slice(0, 6)}...${hexAddress.slice(-4)}`;
        } else {
          displayName = membraneMetadata[index - 1]?.name || `Node ${nodeId.slice(-6)}`;
        }
        
        labels.push(displayName);
        ids.push(formattedId);
        parents.push(''); // All nodes are at root level

        // Calculate display value with proper proportions
        const rawValue = rawValues[index];
        let displayValue;
        
        if (rawValue > 0) {
          // If node has value, use actual value
          displayValue = rawValue;
        } else {
          // If node has no value, use minimum display value
          displayValue = maxRawValue * MIN_DISPLAY_VALUE;
        }
        
        values.push(displayValue);
        console.log(`Node ${nodeId} final display value:`, displayValue);
        
        // Add hover text with actual value
        text.push(`${rawValue.toLocaleString()} PSC`);
        colors.push(colorShades[index]);
      } catch (error) {
        console.error(`Error processing node ID ${nodeId}:`, error);
      }
    }
    
    console.log('Final values array:', values);
    return { labels, parents, ids, values, text, colors };
  };

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

  useEffect(() => {
    transformDataForTreemap().then((data) => {
      if (data) {
        setChartData(data);
      }
    });
  }, [nodeData, chainId, selectedTokenColor]);

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
          textposition: 'middle center',
          tiling: {
            packing: 'binary'
          }
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