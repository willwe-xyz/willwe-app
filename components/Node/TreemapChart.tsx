import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NodeState } from '../../types/chainData';
import { Box, useColorModeValue } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import { getMembraneData } from '../../hooks/useMembraneData';
import Color from 'color';

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
  selectedTokenColor
}) => {
  const router = useRouter();
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

  const generateColorShades = (baseColor: string, count: number): string[] => {
    try {
      const color = Color(baseColor);
      const shades: string[] = [];
      
      // Generate more subtle variations for hierarchy
      for (let i = 0; i < count; i++) {
        const adjustedColor = color
          .alpha(0.9 - (i * 0.15))  // More subtle alpha changes
          .lighten(i * 0.1);        // Slight lightness variation
        shades.push(adjustedColor.toString());
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

    if (!nodeData?.rootPath?.length) {
      console.warn('No root path data available');
      return { labels, parents, ids, values, text, colors };
    }

    const nodeIds = nodeData.rootPath.slice(1);
    const membranes = await getMembraneData(chainId, nodeIds);
    const membraneMetadata = membranes.membraneMetadata;

    // Calculate minimum value to ensure visibility
    const MIN_VALUE = 1;
    const MAX_VALUE = 1000;

    // Generate color shades for the hierarchy
    const colorShades = generateColorShades(selectedTokenColor, nodeData.rootPath.length);

    // Process all nodes in the path
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) return;

      try {
        const formattedId = nodeId.toLowerCase();
        
        // Get display name - use membrane name if available, otherwise use formatted address
        let displayName: string;
        if (index === 0) {
          const hexAddress = ethers.toBigInt(formattedId).toString(16).padStart(40, '0');
          displayName = `0x${hexAddress.slice(0, 6)}...${hexAddress.slice(-4)}`;
        } else {
          displayName = membraneMetadata[index - 1]?.name || `Node ${nodeId.slice(-6)}`;
        }
        
        labels.push(displayName);
        ids.push(formattedId);
        
        // Format budget value for the treemap size with minimum visibility
        const budget = nodeData.basicInfo[4];
        let formattedBudget = budget ? Number(ethers.formatUnits(budget, 'gwei')) : MIN_VALUE;
        
        if (formattedBudget < MIN_VALUE) {
          formattedBudget = MIN_VALUE;
        }
        if (formattedBudget > MAX_VALUE) {
          formattedBudget = MAX_VALUE;
        }
        
        values.push(formattedBudget);
        
        // Add hover text with additional information
        const actualBudget = budget ? Number(ethers.formatUnits(budget, 'gwei')) : 0;
        text.push(`${actualBudget.toLocaleString()} PSC`);

        // Add color from shades (reverse index to make children darker)
        colors.push(colorShades[nodeData.rootPath.length - 1 - index]);

        if (index === 0) {
          parents.push('');
        } else {
          parents.push(nodeData.rootPath[index - 1].toLowerCase());
        }
      } catch (error) {
        console.error(`Error processing node ID ${nodeId}:`, error);
      }
    }
    
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
      if (data) setChartData(data);
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
              width: 1.5,
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