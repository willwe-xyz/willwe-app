import { NextApiRequest, NextApiResponse } from 'next';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;
  const { limit = '50', offset = '0', networkId } = req.query;

  if (!address || !networkId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Validate network ID
    const cleanNetworkId = networkId as string;
    if (!deployments.WillWe[cleanNetworkId]) {
      return res.status(400).json({ error: `Unsupported network ID: ${cleanNetworkId}` });
    }

    // Initialize provider with error handling
    let provider;
    try {
      provider = new ethers.JsonRpcProvider(getRPCUrl(cleanNetworkId));
    } catch (error) {
      console.error('Error initializing provider:', error);
      return res.status(500).json({ error: 'Failed to initialize blockchain provider' });
    }

    // Initialize contract with error handling
    let contract;
    try {
      contract = new ethers.Contract(
        deployments.WillWe[cleanNetworkId],
        ABIs.WillWe,
        provider
      );
    } catch (error) {
      console.error('Error initializing contract:', error);
      return res.status(500).json({ error: 'Failed to initialize contract' });
    }

    // Get user's nodes using getAllNodesForRoot
    let userNodes;
    try {
      // Convert address to node ID (uint160)
      const nodeId = BigInt(address as string).toString();
      userNodes = await contract.getAllNodesForRoot(address as string, address as string);
      if (!Array.isArray(userNodes)) {
        throw new Error('Invalid response from getAllNodesForRoot');
      }
    } catch (error) {
      console.error('Error fetching user nodes:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch user nodes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Get activity logs for each node
    const activities = await Promise.all(
      userNodes.map(async (nodeData: any) => {
        try {
          const nodeId = nodeData.basicInfo[0]; // Node ID is in the first position of basicInfo
          if (!nodeId) return null;

          // Get node events with error handling
          let events;
          try {
            // Get events from the last 10000 blocks
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000);
            
            events = await contract.queryFilter(
              contract.filters.NodeEvent(nodeId),
              fromBlock,
              currentBlock
            );
          } catch (error) {
            console.error(`Error fetching events for node ${nodeId}:`, error);
            return null;
          }

          return Promise.all(events.map(async event => {
            try {
              const eventLog = event as ethers.EventLog;
              const block = await provider.getBlock(eventLog.blockNumber);
              
              // Extract event data
              const eventData = {
                id: `${eventLog.transactionHash}-${eventLog.index}`,
                nodeId: nodeId,
                who: address,
                eventType: eventLog.eventName || 'NodeEvent',
                eventName: eventLog.eventName || 'Node Event',
                description: `Activity in node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`,
                when: block?.timestamp ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
                networkId: cleanNetworkId,
                transactionHash: eventLog.transactionHash,
                blockNumber: eventLog.blockNumber,
                args: eventLog.args || {}
              };

              return eventData;
            } catch (error) {
              console.error('Error processing event:', error);
              return null;
            }
          }));
        } catch (error) {
          console.error(`Error processing node data:`, error);
          return null;
        }
      })
    );

    // Flatten and filter activities
    const flattenedActivities = activities
      .flat()
      .filter((activity): activity is NonNullable<typeof activity> => activity !== null)
      .sort((a, b) => {
        const timeA = new Date(a.when).getTime();
        const timeB = new Date(b.when).getTime();
        return timeB - timeA;
      });

    // Apply pagination
    const start = Number(offset);
    const end = start + Number(limit);
    const paginatedActivities = flattenedActivities.slice(start, end);

    res.status(200).json({
      events: paginatedActivities,
      meta: {
        total: flattenedActivities.length,
        limit: Number(limit),
        offset: Number(offset),
        nodeCount: userNodes.length
      }
    });
  } catch (error) {
    console.error('Error in userFeed handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 