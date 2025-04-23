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
  tokenSymbol?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ 
  nodeData, 
  chainId,
  selectedTokenColor = '#319795', // Default to teal if no color provided
  tokenSymbol = 'TOKEN' // Default to TOKEN if not provided
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

    const MIN_DISPLAY_VALUE = 0.0001; // Ensure minimum value for visibility
    const colorShades = generateColorShades(selectedTokenColor, nodeData.rootPath.length);

    const rawValues: number[] = [];
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) continue;

      try {
        const data = await contract.getNodeData(ethers.toBigInt(nodeId), ethers.ZeroAddress);
        const balanceAnchor = data[0]?.[2]?.toString() || '0';
        const formattedValue = Number(ethers.formatUnits(balanceAnchor, 'ether')) || MIN_DISPLAY_VALUE;
        rawValues.push(formattedValue);
      } catch (error) {
        console.error(`Error fetching data for node ${nodeId}:`, error);
        rawValues.push(MIN_DISPLAY_VALUE);
      }
    }

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
      text.push(`${rawValue.toLocaleString()} ${tokenSymbol}`);
      colors.push(colorShades[index]);
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
      if (data) {
        setChartData(data);
      }
    });
  }, [nodeData, chainId, selectedTokenColor, tokenSymbol, transformDataForTreemap]);

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