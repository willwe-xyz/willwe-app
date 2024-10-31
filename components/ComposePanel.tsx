import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { Coins, Users } from 'lucide-react';
import CreateToken from './CreateToken';
import DefineEntity from './DefineEntity';

interface ComposePanelProps {
  children: (onOpen: () => void) => React.ReactNode;
  chainId: string;
  userAddress?: string;
}

export default function ComposePanel({
  children,
  chainId,
  userAddress
}: ComposePanelProps) {
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const [activeTab, setActiveTab] = React.useState(0);
  const toast = useToast();

  const resetState = React.useCallback(() => {
    setActiveTab(0);
  }, []);

  const onClose = React.useCallback(() => {
    originalOnClose();
    setTimeout(resetState, 300);
  }, [originalOnClose, resetState]);

  return (
    <>
      {children(onOpen)}

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="4xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          w="1000px"
          maxW="90vw"
          maxH="90vh"
          bg="white"
          rounded="lg"
          shadow="xl"
          overflow="hidden"
          position="relative"
        >
          <ModalHeader 
            pt={6}
            px={6}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="white"
            position="absolute"
            top={0}
            left={0}
            right={0}
            zIndex={1}
          >
            Compose
            <ModalCloseButton 
              top={6}
              right={4}
            />
          </ModalHeader>

          <Box pt="60px" h="full">
            <Tabs
              isFitted
              variant="enclosed"
              colorScheme="purple"
              index={activeTab}
              onChange={setActiveTab}
              display="flex"
              flexDirection="column"
              h="full"
            >
              <TabList 
                borderBottomWidth="1px" 
                borderColor="gray.100"
                bg="gray.50"
                position="sticky"
                top={0}
                zIndex={1}
              >
                <Tab
                  py={4}
                  _selected={{
                    color: 'purple.600',
                    bg: 'white',
                    borderColor: 'gray.100',
                    borderBottom: 'none'
                  }}
                >
                  <HStack spacing={2}>
                    <Coins size={18} />
                    <span>Create Token</span>
                  </HStack>
                </Tab>
                <Tab
                  py={4}
                  _selected={{
                    color: 'purple.600',
                    bg: 'white',
                    borderColor: 'gray.100',
                    borderBottom: 'none'
                  }}
                >
                  <HStack spacing={2}>
                    <Users size={18} />
                    <span>Define Entity</span>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels flex={1} overflowY="hidden">
                <TabPanel p={0} h="full">
                  <Box 
                    height="80%"
                    overflowY="scroll"
                    px={6}
                    py={4}
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        width: '6px',
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'gray.200',
                        borderRadius: '24px',
                      },
                    }}
                  >
                    <CreateToken
                      chainId={chainId}
                      userAddress={userAddress}
                    />
                  </Box>
                </TabPanel>
                <TabPanel p={0} h="full">
                  <Box
                    height="600px"
                    overflowY="auto"
                    px={6}
                    py={4}
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        width: '6px',
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'gray.200',
                        borderRadius: '24px',
                      },
                    }}
                  >
                    <DefineEntity
                      chainId={chainId}
                      onSubmit={() => {
                        toast({
                          title: "Entity Created",
                          status: "success",
                          duration: 5000,
                        });
                        onClose();
                      }}
                    />
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}