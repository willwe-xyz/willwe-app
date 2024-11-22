// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { usePrivy } from '@privy-io/react-auth';
// import { Spinner, Box, useToast } from '@chakra-ui/react';
// import { ethers } from 'ethers';
// import { deployments, ABIs } from '../../config/contracts';
// import { useNode } from '../../contexts/NodeContext';
// import MainLayout from '../Layout/MainLayout';
// import ContentLayout from '../Layout/ContentLayout';
// import RootNodeDetails from '../RootNodeDetails';
// import NodeDetails from '../NodeDetails';
// import ActivityLogs from '../ActivityLogs';

// const NodeViewContainer = ({
//   chainId: initialChainId,
//   nodeId: initialNodeId,
//   colorState,
//   cycleColors
// }) => {
//   const router = useRouter();
//   const { user, authenticated, logout, login, getEthersProvider } = usePrivy();
//   const { selectedToken, selectToken, selectedNodeId, selectNode } = useNode();
//   const [derivedNodes, setDerivedNodes] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const toast = useToast();

//   const chainId = router.query.chainId || initialChainId || user?.wallet?.chainId;
//   const cleanChainId = chainId?.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
//   const userAddress = user?.wallet?.address;
//   const currentToken = selectedToken || router.query.tokenAddress || '';

//   // Fetch all derived nodes
//   const fetchDerivedNodes = useCallback(async () => {
//     if (!cleanChainId || !currentToken || !userAddress) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const provider = await getEthersProvider();
//       const willWeAddress = deployments.WillWe[cleanChainId];
      
//       if (!willWeAddress) {
//         throw new Error(`No WillWe contract found for chain ${cleanChainId}`);
//       }

//       const contract = new ethers.Contract(
//         willWeAddress,
//         ABIs.WillWe,
//         provider
//       );

//       console.log('Fetching nodes for:', {
//         rootAddress: currentToken,
//         userAddress,
//         contract: willWeAddress
//       });

//       // Get all nodes for this root token
//       const nodes = await contract.getAllNodesForRoot(currentToken, userAddress);
//       console.log('Received nodes:', nodes);

//       // Transform nodes into proper structure
//       const transformedNodes = nodes.map(node => ({
//         basicInfo: node.basicInfo.map(String),
//         membersOfNode: node.membersOfNode || [],
//         childrenNodes: node.childrenNodes || [],
//         rootPath: node.rootPath || [],
//         signals: (node.signals || []).map(signal => ({
//           MembraneInflation: signal.MembraneInflation || [],
//           lastRedistSignal: signal.lastRedistSignal || []
//         }))
//       }));

//       console.log('Transformed nodes:', transformedNodes);
//       setDerivedNodes(transformedNodes);
//     } catch (error) {
//       console.error('Error fetching derived nodes:', error);
//       toast({
//         title: "Error fetching nodes",
//         description: error.message,
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [cleanChainId, currentToken, userAddress, getEthersProvider, toast]);

//   // Initial fetch
//   useEffect(() => {
//     fetchDerivedNodes();
//   }, [fetchDerivedNodes]);

//   // Calculate total value and organize nodes
//   const { totalValue, organizedNodes } = useMemo(() => {
//     const total = derivedNodes.reduce((sum, node) => {
//       const nodeValue = node.basicInfo[4] ? BigInt(node.basicInfo[4]) : BigInt(0);
//       return sum + nodeValue;
//     }, BigInt(0));

//     // Create a map for quick node lookup
//     const nodeMap = new Map(
//       derivedNodes.map(node => [node.basicInfo[0], node])
//     );

//     // Build parent-child relationships
//     const relationships = new Map();
//     derivedNodes.forEach(node => {
//       const path = node.rootPath;
//       if (path.length > 1) {
//         const parentId = path[path.length - 2];
//         if (!relationships.has(parentId)) {
//           relationships.set(parentId, []);
//         }
//         relationships.get(parentId).push(node.basicInfo[0]);
//       }
//     });

//     console.log('Node relationships:', {
//       nodeMap,
//       relationships,
//       totalValue: total.toString()
//     });

//     return {
//       totalValue: total,
//       organizedNodes: derivedNodes,
//       relationships,
//     };
//   }, [derivedNodes]);

//   const handleNodeSelect = useCallback((nodeId) => {
//     if (cleanChainId) {
//       selectNode(nodeId, cleanChainId);
//       router.push(`/nodes/${cleanChainId}/${nodeId}`);
//     }
//   }, [cleanChainId, router, selectNode]);

//   const handleSpawnNode = useCallback(async () => {
//     try {
//       if (!user?.wallet?.address) throw new Error('Please connect your wallet');
//       if (!cleanChainId) throw new Error('Invalid chain ID');
      
//       const provider = await getEthersProvider();
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(
//         deployments.WillWe[cleanChainId],
//         ABIs.WillWe,
//         signer
//       );

//       const tx = await contract.spawnRootBranch(currentToken);
//       await tx.wait();
      
//       toast({
//         title: "Node spawned",
//         description: "New root node created successfully",
//         status: "success",
//         duration: 5000,
//       });

//       // Refresh nodes
//       await fetchDerivedNodes();
//     } catch (error) {
//       console.error('Failed to spawn node:', error);
//       toast({
//         title: "Failed to spawn node",
//         description: error.message,
//         status: "error",
//         duration: 5000,
//       });
//     }
//   }, [user?.wallet?.address, cleanChainId, currentToken, getEthersProvider, toast, fetchDerivedNodes]);

//   const renderContent = useCallback(() => {
//     if (isLoading) {
//       return <Spinner size="xl" />;
//     }

//     // If there's a selected node, show its details
//     if (selectedNodeId || initialNodeId) {
//       return (
//         <NodeDetails 
//           chainId={cleanChainId}
//           nodeId={selectedNodeId || initialNodeId}
//           onNodeSelect={handleNodeSelect}
//           selectedTokenColor={colorState.contrastingColor}
//         />
//       );
//     }

//     // If we have a current token, show the root node details
//     if (currentToken) {
//       return (
//         <RootNodeDetails
//           nodes={organizedNodes}
//           totalValue={totalValue}
//           selectedTokenColor={colorState.contrastingColor}
//           onNodeSelect={handleNodeSelect}
//           onSpawnNode={handleSpawnNode}
//         />
//       );
//     }

//     // Fallback to activity logs
//     return <ActivityLogs />;
//   }, [
//     isLoading,
//     selectedNodeId,
//     initialNodeId,
//     currentToken,
//     organizedNodes,
//     totalValue,
//     cleanChainId,
//     colorState.contrastingColor,
//     handleNodeSelect,
//     handleSpawnNode
//   ]);

//   return (

//       <ContentLayout
//         sidebarProps={{
//           selectedToken: currentToken,
//           handleTokenSelect: selectToken,
//           ...colorState,
//           userAddress: userAddress || '',
//           chainId: chainId || '',
//           isLoading
//         }}
//       >
//         {renderContent()}
//       </ContentLayout>

//   );
// };

// export default NodeViewContainer;