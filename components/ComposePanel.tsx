import React, { useState, useCallback } from 'react';
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
import { CreateToken } from './CreateToken';
import { DefineEntity } from './DefineEntity';

interface ComposePanelProps {
  children: (onOpen: () => void) => React.ReactNode;
  chainId: string;
  userAddress?: string;
}

interface EntityData {
  entityName: string;
  characteristics: {
    title: string;
    link: string;
  }[];
  membershipConditions: {
    tokenAddress: string;
    requiredBalance: string;
    symbol?: string;
  }[];
  membraneId?: string;
}

export const ComposePanel: React.FC<ComposePanelProps> = ({
  children,
  chainId,
  userAddress
}) => {
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  const resetState = useCallback(() => {
    setActiveTab(0);
  }, []);

  const onClose = useCallback(() => {
    originalOnClose();
    // Small delay to reset state after animation
    setTimeout(resetState, 300);
  }, [originalOnClose, resetState]);

  const handleEntitySubmit = useCallback((entityData: EntityData) => {
    toast({
      title: "Entity Created",
      description: `Entity "${entityData.entityName}" has been created successfully`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onClose();
  }, [onClose, toast]);

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
          mx={4}
          bg="white"
          rounded="lg"
          shadow="xl"
          overflow="hidden"
        >
          <ModalHeader 
            pt={6}
            px={6}
            pb={0}
          >
            Compose
          </ModalHeader>
          <ModalCloseButton 
            size="lg"
            top={4}
            right={4}
          />
          
          <ModalBody p={6}>
            <Tabs
              isFitted
              variant="enclosed"
              colorScheme="purple"
              index={activeTab}
              onChange={setActiveTab}
            >
              <TabList mb="1em">
                <Tab
                  py={3}
                  _selected={{
                    color: 'purple.600',
                    borderColor: 'purple.600',
                    borderBottomColor: 'white'
                  }}
                >
                  <HStack spacing={2}>
                    <Coins size={18} />
                    <span>Create Token</span>
                  </HStack>
                </Tab>
                <Tab
                  py={3}
                  _selected={{
                    color: 'purple.600',
                    borderColor: 'purple.600',
                    borderBottomColor: 'white'
                  }}
                >
                  <HStack spacing={2}>
                    <Users size={18} />
                    <span>Define Entity</span>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <CreateToken
                    chainId={chainId}
                    userAddress={userAddress}
                  />
                </TabPanel>
                <TabPanel px={0}>
                  <DefineEntity
                    chainId={chainId}
                    onSubmit={handleEntitySubmit}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Utility function to inject modals into components
export const withComposePanel = (
  WrappedComponent: React.ComponentType<any>,
  props: Omit<ComposePanelProps, 'children'>
) => {
  return function WithComposePanelComponent(componentProps: any) {
    const composePanelProps = {
      ...props,
      children: (onOpen: () => void) => (
        <WrappedComponent {...componentProps} openComposePanel={onOpen} />
      ),
    };
    
    return <ComposePanel {...composePanelProps} />;
  };
};

export default ComposePanel;