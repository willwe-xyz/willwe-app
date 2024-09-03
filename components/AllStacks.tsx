// import React, { useState, useMemo, useCallback } from 'react';
// import { VStack, Box, Spinner, Text, Flex, useBreakpointValue, Alert, AlertIcon } from "@chakra-ui/react";
// import { BalanceItem } from "@covalenthq/client-sdk";
// import { sortChainBalances, NodeState } from "../lib/chainData";
// import { User } from "@privy-io/react-auth";
// import { useFetchUserData } from '../hooks/useFetchUserData';
// import HeaderButtons from './HeaderButtons';
// import { useRouter } from 'next/router';
// import NodeDetails from './NodeDetails';
// import BalanceList from './BalanceList';
// import { ActivityLogs, PaletteButton } from './AllStackComponents';
// import { RootNodeDetails } from './RootNodeDetails';
// import { invertColor, adjustBrightness } from '../utils/colors';

// interface RootStack {
//   privyData: User | null;
//   ready: boolean;
//   authenticated: boolean;
//   logout: () => Promise<void>;
//   login: () => Promise<void>;
// }

// interface TokenColorSet {
//   contrastingColor: string;
//   reverseColor: string;
//   hoverColor: string;
// }

// export const AllStacks: React.FC<RootStack> = ({ privyData, ready, authenticated, logout, login }) => {
//   const router = useRouter();
//   const { userData, isLoading, error } = useFetchUserData(ready, authenticated, privyData);

//   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
//   const [selectedToken, setSelectedToken] = useState('');
//   const [tokenColors, setTokenColors] = useState<Record<string, TokenColorSet>>({});
//   const [globalColor, setGlobalColor] = useState<string | null>(null);

//   const chainId = useMemo(() => {
//     return privyData?.wallet?.chainId?.toString() || '';
//   }, [privyData]);

//   const sortedUniqueBalances = useMemo(() => {
//     if (userData?.balanceItems) {
//       const balanceMap = new Map<string, BalanceItem>();
//       userData.balanceItems.forEach(item => {
//         if (item?.contract_address) {
//           balanceMap.set(item.contract_address, item);
//         }
//       });
//       return sortChainBalances(Array.from(balanceMap.values()), []);
//     }
//     return [];
//   }, [userData?.balanceItems]);

//   const getTokenColor = useCallback((tokenAddress: string) => {
//     if (globalColor) return {
//       contrastingColor: globalColor,
//       reverseColor: invertColor(globalColor),
//       hoverColor: adjustBrightness(globalColor, 20)
//     };
//     if (!tokenAddress) return {
//       contrastingColor: '#000000',
//       reverseColor: '#FFFFFF',
//       hoverColor: '#333333'
//     };
//     if (!tokenColors[tokenAddress]) {
//       const newColor = `#${tokenAddress.slice(-6)}`;
//       const newColorSet: TokenColorSet = {
//         contrastingColor: newColor,
//         reverseColor: invertColor(newColor),
//         hoverColor: adjustBrightness(newColor, 20)
//       };
//       setTokenColors(prev => ({ ...prev, [tokenAddress]: newColorSet }));
//       return newColorSet;
//     }
//     return tokenColors[tokenAddress];
//   }, [tokenColors, globalColor]);

//   const handleNodeClick = useCallback((nodeId: string) => {
//     console.log("Node clicked:", nodeId);
//     setSelectedNodeId(nodeId);
//   }, []);

//   const handleTokenSelect = useCallback((tokenAddress: string) => {
//     setSelectedToken(tokenAddress);
//     setSelectedNodeId(null);
//     getTokenColor(tokenAddress);
//     console.log("Selected token:", tokenAddress, "Chain ID:", chainId);
//   }, [chainId, getTokenColor]);

//   const cycleColors = useCallback(() => {
//     const newColor = '#' + Math.floor(Math.random()*16777215).toString(16);
//     setGlobalColor(newColor);
//   }, []);

//   const isMobile = useBreakpointValue({ base: true, md: false });

//   if (isLoading) return <Spinner />;
//   if (error) return <Text>Error: {error.message}</Text>;

//   return (
//     <VStack spacing={4} align="stretch" height="100vh">
//       <Flex justifyContent="space-between" alignItems="center" p={2}>
//         <PaletteButton 
//           cycleColors={cycleColors} 
//           color={globalColor || '#000000'}
//         />
//         <HeaderButtons 
//           logout={logout} 
//           login={login}
//           userAddress={privyData?.wallet?.address || ''} 
//           nodes={userData?.userContext?.nodes || []}
//           onNodeSelect={handleNodeClick}
//           color={globalColor || '#000000'}
//         />
//       </Flex>
//       <Box height="2px" bg={globalColor || '#000000'} transition="background-color 0.3s" />
//       <Flex direction={isMobile ? "column" : "row"} align="stretch" flex={1} overflow="hidden">
//         <Box 
//           width={isMobile ? "100%" : "auto"}
//           minWidth={isMobile ? "100%" : "80px"}
//           maxHeight={isMobile ? "200px" : "auto"}
//           padding={0}
//           borderRight={isMobile ? "none" : "1px solid"}
//           borderBottom={isMobile ? "1px solid" : "none"}
//           borderColor={globalColor || '#000000'}
//           position="relative"
//           overflowY="auto"
//         >
//           <BalanceList 
//             balances={sortedUniqueBalances} 
//             selectedToken={selectedToken} 
//             handleTokenSelect={handleTokenSelect} 
//             willBalanceItems={userData?.WillBalanceItems || []}
//             getTokenColor={getTokenColor}
//           />
//         </Box>
//         <Box flex={1} overflowY="auto" marginLeft={isMobile ? 0 : 2} marginTop={isMobile ? 2 : 0}>
//           {selectedNodeId ? (
//             <NodeDetails
//               nodes={userData?.userContext?.nodes || []}
//               selectedNodeId={selectedNodeId}
//               onNodeSelect={handleNodeClick}
//               color={globalColor || getTokenColor(selectedToken)}
//             />
//           ) : selectedToken && chainId ? (
//             <RootNodeDetails 
//             chainId={chainId} 
//             rootToken={selectedToken} 
//             onNodeSelect={handleNodeClick}
//             tokenColors={getTokenColor(selectedToken)}
//           />
//           ) : selectedToken ? (
//             <Alert status="warning">
//               <AlertIcon />
//               No chain ID available. Please ensure you're connected to a supported network.
//             </Alert>
//           ) : (
//             <ActivityLogs color={globalColor || '#000000'} />
//           )}
//         </Box>
//       </Flex>
//     </VStack>
//   );
// };


// export default AllStacks;