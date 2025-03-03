import React from 'react';
import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import ActivityDebug from '../components/ActivityDebug';
import { usePrivy } from '@privy-io/react-auth';

const DebugPage: React.FC = () => {
  const { ready, authenticated, user } = usePrivy();

  if (!ready) {
    return <Box p={5}>Loading...</Box>;
  }

  if (!authenticated) {
    return <Box p={5}>Please sign in to access the debug page.</Box>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Debug Tools</Heading>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Activity Debug</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <ActivityDebug />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default DebugPage;
