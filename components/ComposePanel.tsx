import React, { useState } from 'react';
import {
  Button,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  useDisclosure
} from '@chakra-ui/react';
import { FaCoins, FaRegRegistered, FaUserPlus } from 'react-icons/fa';

export const ComposePanel = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  return (
    <>
      {children(onOpen)}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compose Panel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted variant="enclosed" index={tabIndex} onChange={handleTabsChange}>
              <TabList mb="1em">
                <Tab color="green.500"><Icon as={FaCoins} mr={2} />Create Token</Tab>
                <Tab color="blue.500"><Icon as={FaRegRegistered} mr={2} />Register Token</Tab>
                <Tab color="purple.500"><Icon as={FaUserPlus} mr={2} />Define Entity</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormControl>
                    <FormLabel>Token Name</FormLabel>
                    <Input placeholder="Enter token name" />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Token Symbol</FormLabel>
                    <Input placeholder="Enter token symbol" />
                  </FormControl>
                </TabPanel>
                <TabPanel>
                  <FormControl>
                    <FormLabel>Token Address</FormLabel>
                    <Input placeholder="Enter token address" />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Token Name</FormLabel>
                    <Input placeholder="Enter token name" />
                  </FormControl>
                </TabPanel>
                <TabPanel>
                  <FormControl>
                    <FormLabel>Entity Name</FormLabel>
                    <Input placeholder="Enter entity name" />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Entity Type</FormLabel>
                    <Input placeholder="Enter entity type" />
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="green">Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};