import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import { useNodeData } from '../../../hooks/useNodeData';
import { useCovalentBalances } from '../../../hooks/useCovalentBalances';
import LoadingSkeleton from '../../../components/LoadingSkeleton';

const NodeViewLayout = dynamic(() => import('../../../components/NodeViewLayout'), {
  loading: () => <LoadingSkeleton />
});

const NodePage: React.FC = () => {
  const router = useRouter();
  const { user, ready, authenticated } = usePrivy();
  const { chainId, nodeid } = router.query;

  if (!router.isReady || !chainId || !nodeid) {
    return <LoadingSkeleton />;
  }

  return (
    <SWRConfig
      value={{
        suspense: true,
        revalidateOnFocus: false,
      }}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <NodePageContent
          chainId={chainId as string}
          nodeid={nodeid as string}
          userAddress={authenticated ? user?.wallet?.address : ''}
        />
      </Suspense>
    </SWRConfig>
  );
};

const NodePageContent: React.FC<{ chainId: string; nodeid: string; userAddress: string }> = ({
  chainId,
  nodeid,
  userAddress,
}) => {
  const router = useRouter();
  const { nodeData } = useNodeData(chainId, nodeid);
  const { balances } = useCovalentBalances(userAddress, chainId);

  const handleNodeSelect = (selectedNodeId: string) => {
    router.push(`/nodes/${chainId}/${selectedNodeId}`);
  };

  return (
    <NodeViewLayout
      chainId={chainId}
      nodeId={nodeid}
      balances={balances}
      isBalancesLoading={false}
      balancesError={null}
      nodeData={nodeData}
      isNodeLoading={false}
      nodeError={null}
      onNodeSelect={handleNodeSelect}
    />
  );
};

export default NodePage;