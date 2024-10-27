import React, { useState, useCallback } from 'react';
import {
  HStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Portal,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  LogOut, 
  Puzzle, 
  LogIn, 
  FileText, 
  Shapes 
} from 'lucide-react';
import CreateToken from './CreateToken';
import DefineEntity from './DefineEntity';
import NotificationToast from './NotificationToast';
import { useTransaction } from '../contexts/TransactionContext';
import { useNode } from '../contexts/NodeContext';

interface HeaderButtonsProps {
  userAddress: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  userAddress,
  chainId,
  logout,
  login,
  selectedNodeId,
  onNodeSelect,
  isTransacting
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const { error: txError } = useTransaction();

  const modalBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleClose = useCallback(() => {
    onClose();
    setActiveTab(0);
  }, [onClose]);

  const tabs = [
    {
      label: 'Create Token',
      icon: <FileText size={16} />,
      content: (
        <CreateToken
          chainId={chainId}
          userAddress={userAddress}
          onSuccess={handleClose}
        />
      )
    },
    {
      label: 'Define Entity',
      icon: <Shapes size={16} />,
      content: (
        <DefineEntity
          chainId={chainId}
          onSubmit={handleClose}
        />
      )
    }
  ];

  return (
    <>
      <HStack spacing={2}>
        <Button
          leftIcon={<Puzzle size={18} />}
          onClick={onOpen}
          size="sm"
          variant="outline"
          colorScheme="purple"
          isDisabled={isTransacting}
          _hover={{ bg: 'purple.50' }}
        >
          Compose
        </Button>

        {userAddress ? (
          <Button
            leftIcon={<LogOut size={18} />}
            onClick={logout}
            size="sm"
            variant="outline"
            colorScheme="purple"
            _hover={{ bg: 'purple.50' }}
          >
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </Button>
        ) : (
          <Button
            leftIcon={<LogIn size={18} />}
            onClick={login}
            size="sm"
            variant="outline"
            colorScheme="purple"
            _hover={{ bg: 'purple.50' }}
          >
            Connect
          </Button>
        )}
      </HStack>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="4xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg={modalBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
        >
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            Compose
            <ModalCloseButton />
          </ModalHeader>
          
          <ModalBody p={0}>
            <Tabs
              isFitted
              index={activeTab}
              onChange={setActiveTab}
              colorScheme="purple"
              isLazy
            >
              <TabList borderBottom="1px solid" borderColor={borderColor}>
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    py={4}
                    _selected={{
                      color: 'purple.600',
                      borderBottom: '2px solid',
                      borderColor: 'purple.600'
                    }}
                  >
                    <HStack spacing={2}>
                      {tab.icon}
                      <span>{tab.label}</span>
                    </HStack>
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {tabs.map((tab, index) => (
                  <TabPanel key={index} p={6}>
                    {tab.content}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Transaction Notifications */}
      <Portal>
        <Box
          position="fixed"
          top={4}
          right={4}
          zIndex={9999}
        >
          {txError && (
            <NotificationToast
              status="error"
              title="Transaction Failed"
              description={txError.message}
              onClose={() => {/* clear error */}}
            />
          )}
          {isTransacting && (
            <NotificationToast
              status="pending"
              title="Transaction Pending"
              description="Your transaction is being processed"
              onClose={() => {}}
            />
          )}
        </Box>
      </Portal>
    </>
  );
};

export default React.memo(HeaderButtons, (prevProps, nextProps) => {
  return (
    prevProps.userAddress === nextProps.userAddress &&
    prevProps.chainId === nextProps.chainId &&
    prevProps.selectedNodeId === nextProps.selectedNodeId &&
    prevProps.isTransacting === nextProps.isTransacting
  );
});