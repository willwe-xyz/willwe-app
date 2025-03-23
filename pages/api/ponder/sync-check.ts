import { NextApiRequest, NextApiResponse } from 'next';
import { ponderConfig } from '../../../lib/config';

/**
 * API endpoint to check Ponder server status
 * @param req The request object
 * @param res The response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nodeId } = req.query;
    
    if (!nodeId) {
      return res.status(400).json({ error: 'Node ID is required' });
    }
    
    console.log(`[API] Checking Ponder server status for node ${nodeId}`);
    
    // Build URL to remote Ponder server health check
    const endpoint = `${ponderConfig.serverUrl}/api/health`;
    
    try {
      // Check if Ponder server is online
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        return res.status(503).json({
          error: 'Ponder server is not available',
          serverUrl: ponderConfig.serverUrl,
          status: response.status,
          statusText: response.statusText
        });
      }
      
      // If we get here, the server is online
      // Now fetch some data about the node to verify we can access it
      const nodeDataEndpoint = `${ponderConfig.serverUrl}/api/node/${nodeId}`;
      const nodeResponse = await fetch(nodeDataEndpoint);
      
      if (!nodeResponse.ok) {
        return res.status(200).json({
          serverStatus: 'online',
          nodeStatus: 'not_found',
          message: `Ponder server is available but node ${nodeId} was not found`
        });
      }
      
      // Node exists and server is online
      return res.status(200).json({
        serverStatus: 'online',
        nodeStatus: 'found',
        message: 'Ponder server is available and node data is accessible',
        nodeId
      });
    } catch (error) {
      console.error(`[API] Error connecting to Ponder server:`, error);
      return res.status(503).json({
        error: 'Failed to connect to Ponder server',
        serverUrl: ponderConfig.serverUrl,
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('[API] Error in sync-check:', error);
    return res.status(500).json({ 
      error: 'Sync check operation failed', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}