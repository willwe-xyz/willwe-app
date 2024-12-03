import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { NodeState } from '../../types/chainData';
import { Box, Text, VStack } from '@chakra-ui/react';

interface TreemapNode {
  name: string;
  size: number;
  fullId: string;
  value: number;
  children?: TreemapNode[];
}

interface DualTreemapProps {
  nodeData: NodeState | NodeState[];
  chainId: string;
}

const DualTreemap: React.FC<DualTreemapProps> = ({ nodeData, chainId }) => {
  const router = useRouter();
  const [treemapData, setTreemapData] = useState<{
    rootNodes: TreemapNode[];
    childNodes: TreemapNode[];
  }>({ rootNodes: [], childNodes: [] });

  useEffect(() => {
    const processNodes = async () => {
      const nodes = Array.isArray(nodeData) ? nodeData : [nodeData];
      if (!nodes?.length) return;

      const rootNodes: TreemapNode[] = [];
      const childNodes: TreemapNode[] = [];
      
      // Process only if we have valid node data
      if (nodes[0]?.basicInfo?.[4]) {
        const value = BigInt(nodes[0].basicInfo[4]);
        const treeNode: TreemapNode = {
          name: nodes[0].basicInfo[0].slice(-6),
          fullId: nodes[0].basicInfo[0],
          size: Number(value),
          value: 100 // Single node takes 100% of space
        };

        if (nodes[0].rootPath?.length === 1) {
          rootNodes.push(treeNode);
        } else {
          childNodes.push(treeNode);
        }
      }

      setTreemapData({ rootNodes, childNodes });
    };

    processNodes();
  }, [nodeData]);

  const handleClick = (node: any) => {
    if (node?.fullId) {
      const cleanChainId = chainId.replace('eip155:', '');
      router.push(`/nodes/${cleanChainId}/${node.fullId}`);
    }
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload?.[0]?.payload) return null;
    const data = payload[0].payload;
    
    return (
      <Box p={3} bg="white" borderRadius="md" boxShadow="lg" border="1px solid" borderColor="gray.200">
        <Text fontWeight="medium">ID: {data.fullId}</Text>
        <Text fontSize="sm" color="gray.600">
          Value: {data.value?.toFixed(2) ?? '0.00'}%
        </Text>
      </Box>
    );
  };

  const renderContent = (nodeData: TreemapNode) => {
    if (!nodeData?.value) return null;
    
    return (
      <g>
        <rect
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill="rgb(0, 0, 255)"
          stroke="white"
          strokeWidth={1}
          cursor="pointer"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="white"
          fontSize="12px"
        >
          {nodeData.name} (100%)
        </text>
      </g>
    );
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <VStack spacing={4} align="stretch">
        {treemapData.rootNodes.length > 0 && (
          <Box h="300px">
            <Text mb={2} fontWeight="semibold">Root Path Nodes</Text>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData.rootNodes}
                dataKey="size"
                ratio={4/3}
                stroke="white"
                onClick={handleClick}
                content={renderContent}
              >
                <Tooltip content={CustomTooltip} />
              </Treemap>
            </ResponsiveContainer>
          </Box>
        )}

        {treemapData.childNodes.length > 0 && (
          <Box h="300px">
            <Text mb={2} fontWeight="semibold">Children Nodes</Text>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData.childNodes}
                dataKey="size"
                ratio={4/3}
                stroke="white"
                onClick={handleClick}
                content={renderContent}
              >
                <Tooltip content={CustomTooltip} />
              </Treemap>
            </ResponsiveContainer>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default DualTreemap;