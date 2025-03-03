import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Heading,
  Code,
  Input,
  HStack,
  useToast,
  Spinner,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider
} from '@chakra-ui/react';

export const ActivityDebug: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [nodeId, setNodeId] = useState('797898110080466983124851806630655532019600802472');
  const [directQueryResults, setDirectQueryResults] = useState<any>(null);
  const [syncResults, setSyncResults] = useState<any>(null);
  const toast = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ponder/debug-database?action=tables');
      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }
      const data = await response.json();
      setTables(data.tables);
      toast({
        title: 'Tables fetched',
        description: `Found ${data.tables.length} tables`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch tables',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ponder/debug-database?action=activity-logs');
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }
      const data = await response.json();
      setActivities(data.logs);
      toast({
        title: 'Activities fetched',
        description: `Found ${data.logs.length} activities`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch activities',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const insertTestActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ponder/debug-database?action=test-insert&nodeId=${nodeId}`);
      if (!response.ok) {
        throw new Error(`Failed to insert test activity: ${response.statusText}`);
      }
      const data = await response.json();
      toast({
        title: 'Test activity inserted',
        description: 'Successfully inserted a test activity',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error('Error inserting test activity:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to insert test activity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkDatabaseSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ponder/sync-check');
      if (!response.ok) {
        throw new Error(`Failed to check database sync: ${response.statusText}`);
      }
      const data = await response.json();
      setSyncStatus(data);
      toast({
        title: 'Database sync checked',
        description: `Ponder: ${data.ponderDatabase.activityCount} activities, Our DB: ${data.ourDatabase.activityCount} activities`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error checking database sync:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check database sync',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const directQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ponder/direct-query?nodeId=${nodeId}`);
      if (!response.ok) {
        throw new Error(`Failed to query database: ${response.statusText}`);
      }
      const data = await response.json();
      setDirectQueryResults(data);
      toast({
        title: 'Direct query executed',
        description: `Found ${data.activities.length} activities in Ponder DB`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error executing direct query:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute direct query',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const syncActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ponder/sync-activities?nodeId=${nodeId}&limit=100`);
      if (!response.ok) {
        throw new Error(`Failed to sync activities: ${response.statusText}`);
      }
      const data = await response.json();
      setSyncResults(data);
      toast({
        title: 'Activities synced',
        description: `Synced ${data.synced} of ${data.total} activities`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh activities after sync
      fetchActivities();
    } catch (error) {
      console.error('Error syncing activities:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync activities',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Heading mb={4}>Activity Debug Panel</Heading>
      
      <VStack spacing={4} align="stretch">
        <HStack>
          <Button colorScheme="blue" onClick={fetchTables} isLoading={loading}>
            List Database Tables
          </Button>
          <Button colorScheme="green" onClick={fetchActivities} isLoading={loading}>
            Fetch Activities
          </Button>
          <Button colorScheme="purple" onClick={checkDatabaseSync} isLoading={loading}>
            Check DB Sync
          </Button>
          <Button colorScheme="pink" onClick={directQuery} isLoading={loading}>
            Direct Query
          </Button>
          <Button colorScheme="teal" onClick={syncActivities} isLoading={loading}>
            Sync Activities
          </Button>
        </HStack>
        
        <HStack>
          <Input 
            placeholder="Node ID" 
            value={nodeId} 
            onChange={(e) => setNodeId(e.target.value)} 
            width="400px"
          />
          <Button colorScheme="orange" onClick={insertTestActivity} isLoading={loading}>
            Insert Test Activity
          </Button>
        </HStack>
        
        {tables.length > 0 && (
          <Box>
            <Heading size="md" mb={2}>Database Tables</Heading>
            <Code p={2} borderRadius="md">
              {tables.join(', ')}
            </Code>
          </Box>
        )}
        
        {syncStatus && (
          <Box>
            <Heading size="md" mb={2}>Database Sync Status</Heading>
            <Text>
              <strong>Ponder DB:</strong> {syncStatus.ponderDatabase.activityCount} activities
            </Text>
            <Text>
              <strong>Our DB:</strong> {syncStatus.ourDatabase.activityCount} activities
            </Text>
            
            {syncStatus.ponderSampleActivities && syncStatus.ponderSampleActivities.length > 0 && (
              <>
                <Heading size="sm" mt={2} mb={1}>Sample Activities from Ponder</Heading>
                <Accordion allowMultiple>
                  {syncStatus.ponderSampleActivities.map((activity: any, index: number) => (
                    <AccordionItem key={activity.id || index}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Badge colorScheme="blue" mr={2}>{activity.eventType}</Badge>
                            Node: {activity.nodeId} - {new Date(activity.timestamp).toLocaleString()}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Text><strong>ID:</strong> {activity.id}</Text>
                        <Text><strong>Node ID:</strong> {activity.nodeId}</Text>
                        <Text><strong>Event Type:</strong> {activity.eventType}</Text>
                        <Text><strong>Timestamp:</strong> {new Date(activity.timestamp).toLocaleString()}</Text>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
            
            {syncStatus.syncStatus && syncStatus.syncStatus.length > 0 && (
              <>
                <Heading size="sm" mt={3} mb={1}>Sync Status</Heading>
                <Accordion allowMultiple>
                  {syncStatus.syncStatus.map((status: any, index: number) => (
                    <AccordionItem key={index}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Badge colorScheme={status.foundInOurDb ? "green" : "red"} mr={2}>
                              {status.foundInOurDb ? "Synced" : "Not Synced"}
                            </Badge>
                            {status.ponderActivity.eventType} - Node: {status.ponderActivity.nodeId}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Text><strong>Ponder Activity ID:</strong> {status.ponderActivity.id}</Text>
                        <Text><strong>Ponder Node ID:</strong> {status.ponderActivity.nodeId}</Text>
                        <Text><strong>Ponder Event Type:</strong> {status.ponderActivity.eventType}</Text>
                        {status.error && (
                          <Text color="red.500"><strong>Error:</strong> {status.error}</Text>
                        )}
                        {status.ourActivity && (
                          <>
                            <Divider my={2} />
                            <Text><strong>Our Activity ID:</strong> {status.ourActivity.id}</Text>
                            <Text><strong>Our Node ID:</strong> {status.ourActivity.node_id}</Text>
                            <Text><strong>Our Event Type:</strong> {status.ourActivity.event_type}</Text>
                          </>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
          </Box>
        )}
        
        {directQueryResults && (
          <Box>
            <Heading size="md" mb={2}>Direct Query Results</Heading>
            <Accordion allowMultiple>
              {directQueryResults.activities.map((activity: any, index: number) => (
                <AccordionItem key={activity.id || index}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Badge colorScheme="blue" mr={2}>{activity.eventType}</Badge>
                        Node: {activity.nodeId} - {new Date(activity.timestamp).toLocaleString()}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text><strong>ID:</strong> {activity.id}</Text>
                    <Text><strong>Node ID:</strong> {activity.nodeId}</Text>
                    <Text><strong>Event Type:</strong> {activity.eventType}</Text>
                    <Text><strong>Timestamp:</strong> {new Date(activity.timestamp).toLocaleString()}</Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        )}
        
        {syncResults && (
          <Box>
            <Heading size="md" mb={2}>Sync Results</Heading>
            <Text>
              <strong>Synced:</strong> {syncResults.synced} activities
            </Text>
            <Text>
              <strong>Total:</strong> {syncResults.total} activities
            </Text>
          </Box>
        )}
        
        {activities.length > 0 ? (
          <Box>
            <Heading size="md" mb={2}>Activities ({activities.length})</Heading>
            <Accordion allowMultiple>
              {activities.map((activity, index) => (
                <AccordionItem key={activity.id || index}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Badge colorScheme="blue" mr={2}>{activity.event_type}</Badge>
                        Node: {activity.node_id} - {new Date(activity.timestamp).toLocaleString()}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text><strong>ID:</strong> {activity.id}</Text>
                    <Text><strong>Node ID:</strong> {activity.node_id}</Text>
                    <Text><strong>User:</strong> {activity.user_address}</Text>
                    <Text><strong>Data:</strong></Text>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
                      {JSON.stringify(JSON.parse(activity.data || '{}'), null, 2)}
                    </Code>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        ) : (
          <Text>No activities found. Try inserting a test activity.</Text>
        )}
      </VStack>
    </Box>
  );
};

export default ActivityDebug;
