import React from 'react';
import { useRouter } from 'next/router';
import { NodeState } from '../../types/chainData';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import {getMembraneData} from '../../hooks/useMembraneData';


const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box>Loading...</Box>
});

interface SunburstChartProps {
  nodeData: NodeState;
  chainId: string;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ nodeData, chainId }) => {
  const router = useRouter();

  const transformDataForSunburst = async () => {
    const labels: string[] = [];
    const parents: string[] = [];
    const ids: string[] = [];
    const values: number[] = [];

    if (!nodeData?.rootPath?.length) {
      console.warn('No root path data available');
      return { labels, parents, ids, values };
    }

    const nodeIds = nodeData.rootPath.slice(1);
    const membanes = await getMembraneData(chainId, nodeIds);
    const membraneDatas = membanes.membraneMetadata;

    
    // Process all nodes in the path
    for (let index = 0; index < nodeData.rootPath.length; index++) {
      const nodeId = nodeData.rootPath[index];
      if (!nodeId) return;

      try {
        const formattedId = nodeId.toLowerCase();
        
        // Get display name - use membrane name if available, otherwise use formatted address
        let displayName : string;
        if (index === 0) {
          const hexAddress = ethers.toBigInt(formattedId).toString(16).padStart(40, '0');
          displayName = `0x${hexAddress.slice(0, 6)}...${hexAddress.slice(-4)}`;
        } else {

          displayName = membraneDatas[index -1]?.name || `Node ${nodeId.slice(-6)}`;
        }
        
        labels.push(displayName);
        ids.push(formattedId);
        values.push(1);

        if (index === 0) {
          parents.push('');
        } else {
          parents.push(nodeData.rootPath[index - 1].toLowerCase());
        }
      } catch (error) {
        console.error(`Error processing node ID ${nodeId}:`, error);
      }
    }
    
    return { labels, parents, ids, values };
  };

  const handleClick = (event: any) => {
    if (event.points?.[0]) {
      const nodeId = event.points[0].id;
      const nodeIndex = nodeData.rootPath.findIndex(id => 
        id.toLowerCase() === nodeId.toLowerCase()
      );

      if (nodeIndex === 0) {
        // Root token - go to dashboard
        const hexAddress = ethers.toBigInt(nodeId)
          .toString(16)
          .padStart(40, '0');
        router.push(`/dashboard?token=0x${hexAddress.toLowerCase()}`);
      } else {
        // Non-root nodes - go to nodes page
        router.push(`/nodes/${chainId}/${nodeId}`);
      }
    }
  };

  const [sunburstData, setSunburstData] = React.useState<{
    labels: string[];
    parents: string[];
    ids: string[];
    values: number[];
  }>({ labels: [], parents: [], ids: [], values: [] });

  React.useEffect(() => {
    transformDataForSunburst().then((data) => {
      if (data) setSunburstData(data);
    });
  }, [nodeData, chainId]);

  return (
    <Box height="400px" width="100%">
      <Plot
        data={[{
          type: 'sunburst',
          labels: sunburstData.labels,
          parents: sunburstData.parents,
          ids: sunburstData.ids,
          values: sunburstData.values,
          branchvalues: 'total',
          hovertemplate: '<b>%{label}</b><br>go to<extra></extra>',
          textposition: 'inside'
        }]}
        layout={{
          margin: { l: 0, r: 0, b: 0, t: 0 },
          width: 400,
          height: 400,
          showlegend: false
        }}
        onClick={handleClick}
      />
    </Box>
  );
};

export default SunburstChart;