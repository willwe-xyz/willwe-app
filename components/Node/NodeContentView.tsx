
// import React from 'react';
// import { useRouter } from 'next/router';
// import { usePrivy } from '@privy-io/react-auth';
// import { Box, useToast } from '@chakra-ui/react';
// import { useNode } from '../../contexts/NodeContext';
// import { useCovalentBalances } from '../../hooks/useCovalentBalances';
// import { useNodeData } from '../../hooks/useNodeData';
// import { MainLayout } from '../Layout/MainLayout'; // Update import to match export
// import ContentLayout from '../Layout/ContentLayout';
// import NodeDetails from '../NodeDetails';

// interface NodeContentViewProps {
//   nodeId: string;
//   chainId: string;
//   colorState: {
//     contrastingColor: string;
//     reverseColor: string;
//     hoverColor: string;
//   };
//   cycleColors: () => void;
// }


// export const NodeContentView: React.FC<NodeContentViewProps> = ({
//   nodeId,
//   chainId,
//   colorState,
//   cycleColors
// }) => {
//   const router = useRouter();
//   const { user, ready, authenticated, logout, login } = usePrivy();
//   const { selectToken } = useNode();
//   const toast = useToast();
  
//   const userAddress = user?.wallet?.address || '';

//   // Fetch balances for sidebar
//   const { 
//     balances, 
//     protocolBalances, 
//     isLoading: balancesLoading 
//   } = useCovalentBalances(userAddress, chainId);

//   // Fetch node data
//   const { 
//     data: nodeData, 
//     isLoading: nodeLoading 
//   } = useNodeData(chainId, nodeId);

//   const handleTokenSelect = (tokenAddress: string) => {
//     selectToken(tokenAddress);
//     router.push('/dashboard');
//   };

//   const handleNodeSelect = (selectedNodeId: string) => {
//     router.push(`/nodes/${chainId}/${selectedNodeId}`);
//   };

//   // Prepare header props
//   const headerProps = {
//     userAddress: userAddress,
//     chainId: chainId,
//     logout,
//     login,
//     selectedNodeId: nodeId,
//     onNodeSelect: handleNodeSelect,
//     isTransacting: false,
//     contrastingColor: colorState.contrastingColor,
//     reverseColor: colorState.reverseColor,
//     cycleColors
//   };

//   // Prepare content layout props
//   const contentLayoutProps = {
//     sidebarProps: {
//       selectedToken: router.query.token as string,
//       handleTokenSelect,
//       ...colorState,
//       userAddress,
//       chainId,
//       isLoading: balancesLoading,
//       balances,
//       protocolBalances
//     }
//   };

//   return (
//       <ContentLayout {...contentLayoutProps}>
//         <Box flex={1} overflow="auto" bg="gray.50" p={6}>
//           <NodeDetails
//             chainId={chainId}
//             nodeId={nodeId}
//             onNodeSelect={handleNodeSelect}
//             selectedTokenColor={colorState.contrastingColor}
//           />
//         </Box>
//       </ContentLayout>
//   );
// };


// export default NodeContentView;
