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

  const { balances, isBalancesLoading, balancesError } = userAddress ? useCovalentBalances(userAddress, chainId as string) : { balances: [] };
  const { nodeData, nodeError, isNodeLoading } = useNodeData(chainId, nodeId);


  if ( isNodeLoading ) {
    return <Spinner size="xl" />;
  } else {
    return (
      <NodeViewLayout 
        chainId={chainId}
        nodeId={nodeId}
        balances={balances}
        isBalancesLoading={isBalancesLoading}
        balancesError={balancesError}
        isNodeLoading={isNodeLoading}
        nodeError={nodeError}
        nodeData={nodeData}
        />
  );
}
};

export default NodePageContent;