import React from 'react';
import { useRouter } from 'next/router';
import { NodeState } from '../../types/chainData';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const PlotlyChart = dynamic(
  () => import('./PlotlyChart'),
  { ssr: false }
);

interface DualTreemapProps {
  nodeData: NodeState | NodeState[];
  chainId: string;
}

const DualTreemap: React.FC<DualTreemapProps> = ({ nodeData, chainId }) => {
  const router = useRouter();

  const handleNodeClick = (nodeId: string) => {
    router.push(`/node/${chainId}/${nodeId}`);
  };

  return (
    <Box height="400px" width="100%">
      <PlotlyChart 
        data={nodeData} 
        onNodeClick={handleNodeClick}
      />
    </Box>
  );
};

export default DualTreemap;