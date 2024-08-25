import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { NodeState, getNodeData } from '../../../lib/chainData';
import NodeDetails from '../../../components/NodeDetails';

const NodeDetailsPage: React.FC = () => {
  const router = useRouter();
  const { chainId, nodeid } = router.query;
  const [node, setNode] = useState<NodeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodeData = async () => {
      if (typeof chainId !== 'string' || typeof nodeid !== 'string') return;
      
      try {
        setIsLoading(true);
        const nodeData = await getNodeData(chainId, nodeid);
        setNode(nodeData);
      } catch (err) {
        console.error('Error fetching node data:', err);
        setError('Failed to fetch node data');
      } finally {
        setIsLoading(false);
      }
    };

    if (chainId && nodeid) {
      fetchNodeData();
    }
  }, [chainId, nodeid]);

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={4}>
      <NodeDetails node={node} chainId={chainId as string} />
    </Box>
  );
};

export default NodeDetailsPage;