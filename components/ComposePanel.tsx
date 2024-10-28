// import React, { useState, useCallback } from 'react';
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   Tabs,
//   TabList,
//   TabPanels,
//   Tab,
//   TabPanel,
//   Box,
//   useToast,
//   HStack,
// } from '@chakra-ui/react';
// import { Coins, Users } from 'lucide-react';
// import { CreateToken } from './CreateToken';
// import { DefineEntity } from './DefineEntity';

// interface ComposePanelProps {
//   children: (onOpen: () => void) => React.ReactNode;
//   chainId: string;
//   userAddress?: string;
// }

// export const ComposePanel: React.FC<ComposePanelProps> = ({
//   children,
//   chainId,
//   userAddress
// }) => {
//   const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
//   const [activeTab, setActiveTab] = useState(0);
//   const toast = useToast();

//   const resetState = useCallback(() => {
//     setActiveTab(0);
//   }, []);

//   const onClose = useCallback(() => {
//     originalOnClose();
//     setTimeout(resetState, 300);
//   }, [originalOnClose, resetState]);

//   // Common styles for tab content
//   const tabContentStyles = {
//     height: '600px', // Fixed height for content area
//     overflowY: 'auto',
//     px: '6',
//     py: '4',
//   };

//   return (
//     <>
//       {children(onOpen)}

//       <Modal 
//         isOpen={isOpen} 
//         onClose={onClose}
//         size="4xl"
//         isCentered
//         motionPreset="slideInBottom"
//       >
//         <ModalOverlay 
//           bg="blackAlpha.300"
//           backdropFilter="blur(10px)"
//         />
//         <ModalContent 
//           w="1000px" // Fixed width
//           h="700px"  // Fixed height
//           maxW="90vw"
//           maxH="90vh"
//           bg="white"
//           rounded="lg"
//           shadow="xl"
//           overflow="hidden"
//           position="relative"
//         >
//           <ModalHeader 
//             pt={6}
//             px={6}
//             borderBottom="1px solid"
//             borderColor="gray.100"
//             bg="white"
//             position="absolute"
//             top={0}
//             left={0}
//             right={0}
//             zIndex={1}
//           >
//             Compose
//             <ModalCloseButton 
//               top={6}
//               right={4}
//             />
//           </ModalHeader>

//           <Box pt="60px" h="full"> {/* Add padding top to account for header */}
//             <Tabs
//               isFitted
//               variant="enclosed"
//               colorScheme="purple"
//               index={activeTab}
//               onChange={setActiveTab}
//               display="flex"
//               flexDirection="column"
//               h="full"
//             >
//               <TabList 
//                 borderBottomWidth="1px" 
//                 borderColor="gray.100"
//                 bg="gray.50"
//                 position="sticky"
//                 top={0}
//                 zIndex={1}
//               >
//                 <Tab
//                   py={4}
//                   _selected={{
//                     color: 'purple.600',
//                     bg: 'white',
//                     borderColor: 'gray.100',
//                     borderBottom: 'none'
//                   }}
//                 >
//                   <HStack spacing={2}>
//                     <Coins size={18} />
//                     <span>Create Token</span>
//                   </HStack>
//                 </Tab>
//                 <Tab
//                   py={4}
//                   _selected={{
//                     color: 'purple.600',
//                     bg: 'white',
//                     borderColor: 'gray.100',
//                     borderBottom: 'none'
//                   }}
//                 >
//                   <HStack spacing={2}>
//                     <Users size={18} />
//                     <span>Define Entity</span>
//                   </HStack>
//                 </Tab>
//               </TabList>

//               <TabPanels flex="1" overflowY="hidden">
//                 <TabPanel p={0} h="full">
//                   <Box {...tabContentStyles} bg="white">
//                     <CreateToken
//                       chainId={chainId}
//                       userAddress={userAddress}
//                     />
//                   </Box>
//                 </TabPanel>
//                 <TabPanel p={0} h="full">
//                   <Box {...tabContentStyles} bg="white">
//                     <DefineEntity
//                       chainId={chainId}
//                       onSubmit={() => {
//                         toast({
//                           title: "Entity Created",
//                           status: "success",
//                           duration: 5000,
//                         });
//                         onClose();
//                       }}
//                     />
//                   </Box>
//                 </TabPanel>
//               </TabPanels>
//             </Tabs>
//           </Box>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default ComposePanel;