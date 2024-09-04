import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import { useNodeData } from '../../../hooks/useNodeData';
import { useCovalentBalances } from '../../../hooks/useCovalentBalances';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import NodeViewLayout from '../../../components/NodeViewLayout';
import NodeDetails from '../../../components/NodeDetails';
import { NodeState } from '../../../types/chainData';

const NodePageContent: React.FC<{ userAddress: string }> = ({
  userAddress,
}) => {
  const router = useRouter();
  const { chainId, nodeId } = router.query;

  // Always call hooks, even if userAddress is not available
  // const { balances, isBalancesLoading, balancesError } = useCovalentBalances(userAddress || '', chainId as string);
  // const { nodeData, nodeError, isNodeLoading } = useNodeData(chainId as string | undefined, nodeId as string | undefined);

  // if (isNodeLoading) {
  //   return <Spinner size="xl" />;
  // }

  return (
    <NodeViewLayout 
      chainId={chainId as string}
      nodeId={nodeId as string}

    />
  );
};

export default NodePageContent;