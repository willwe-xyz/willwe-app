// import React, { useState, useEffect } from 'react';
// import { Box, HStack, Button, Icon, Text, VStack } from '@chakra-ui/react';
// import { RiLogoutCircleRFill } from "react-icons/ri";
// import { TokenBalance } from './TokenBalance';
// import { NodeHierarchy } from './NodeHierarchy';
// import HeaderButtons from './HeaderButtons';

// import { BalanceItem, NodeState } from '../lib/chainData';
// import { cols } from "../const/colors";
// import HeaderButtons from './HeaderButtons';

// interface TokenHierarchyProps {
//   chainBalances: BalanceItem[];
//   willBals: BalanceItem[];
//   userNodes: NodeState[];
//   chainID: string;
//   userAddress: string;
//   onTokenClick: (tokenAddress: string) => void;
//   logout: () => void;
// }

// export const TokenHierarchy: React.FC<TokenHierarchyProps> = ({
//   chainBalances,
//   willBals,
//   userNodes,
//   chainID,
//   userAddress,
//   onTokenClick,
//   logout,
// }) => {
//   const [selectedToken, setSelectedToken] = useState<string | null>(null);
//   const [rootNode, setRootNode] = useState<NodeState | null>(null);

//   const handleTokenClick = (tokenAddress: string) => {
//     console.log("Selected token address:", tokenAddress);
//     setSelectedToken(tokenAddress);
//     if (onTokenClick) {
//       onTokenClick(tokenAddress);
//     }
//   };

//   useEffect(() => {
//     if (selectedToken) {
//       console.log("Looking for node with ID:", selectedToken);
      
//       const validNodes = userNodes.filter(node => node.nodeId !== '');
//       console.log("Valid nodes:", validNodes);

//       const foundNode = validNodes.find(node => {
//         const nodeIdBigInt = BigInt(node.nodeId);
//         const tokenBigInt = BigInt('0x' + selectedToken.slice(2).padStart(64, '0'));
        
//         return nodeIdBigInt % (1n << 160n) === tokenBigInt % (1n << 160n);
//       });

//       console.log("Found node:", foundNode);
//       setRootNode(foundNode || null);
//     } else {
//       setRootNode(null);
//     }
//   }, [selectedToken, userNodes]);

//   return (
//     <>
    
    
//     <HeaderButtons logout={logout} userAddress={userAddress} cols={cols} />

//     <VStack align="stretch" spacing={2}>
//       <Box
//         width="100%"
//         overflowX="auto"
//         overflowY="hidden"
//         css={{
//           '&::-webkit-scrollbar': {
//             height: '6px',
//           },
//           '&::-webkit-scrollbar-track': {
//             background: 'rgba(0, 0, 0, 0.1)',
//           },
//           '&::-webkit-scrollbar-thumb': {
//             background: 'rgba(0, 0, 0, 0.3)',
//             borderRadius: '3px',
//           },
//           '&::-webkit-scrollbar-thumb:hover': {
//             background: 'rgba(0, 0, 0, 0.4)',
//           },
//         }}
//       >
//         <HStack spacing={1} py={1} px={1}>
//           {chainBalances.map((balance, index) => (
//             <TokenBalance
//               key={index}
//               balanceItem={balance}
//               chainID={chainID}
//               protocolDeposit={willBals.find(
//                 willBal => willBal.contract_address === balance.contract_address
//               )}
//               isSelected={selectedToken === balance.contract_address}
//               onClick={() => handleTokenClick(balance.contract_address)}
//             />
//           ))}
//         </HStack>
//       </Box>zz

//       {selectedToken ? (
//         rootNode ? (
//           <Box mt={4}>
//             <NodeHierarchy
//               node={rootNode}
//               allNodes={userNodes.filter(node => node.nodeId !== '')}
//               userAddress={userAddress}
//               chainID={chainID}
//             />
//           </Box>
//         ) : (
//           <Text mt={4}>No data available for the selected token. (Token: {selectedToken})</Text>
//         )
//       ) : (
//         <Text mt={4}>Please select a token to view its hierarchy.</Text>
//       )}
//     </VStack>
//     </>
//   );
// };