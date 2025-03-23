import { NextApiRequest, NextApiResponse } from 'next';
import { ponderConfig } from '../../../lib/config';

/**
 * API endpoint to forward activity requests to the Ponder server
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get query parameters
    const { nodeId, userAddress, limit = '50' } = req.query;
    
    console.log(`[API] Fetching activities for ${nodeId ? `nodeId ${nodeId}` : userAddress ? `userAddress ${userAddress}` : 'all'}`);

    // Build URL to remote Ponder server
    const endpoint = `${ponderConfig.serverUrl}/api/activities`;
    const params = new URLSearchParams();
    
    if (nodeId) params.append('nodeId', nodeId as string);
    if (userAddress) params.append('userAddress', userAddress as string);
    if (limit) params.append('limit', limit as string);
    
    const url = `${endpoint}?${params.toString()}`;
    console.log(`[API] Forwarding request to Ponder server: ${url}`);
    
    try {
      // Fetch data from remote Ponder server
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ponder server returned status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Return the data directly from the Ponder server
      return res.status(200).json(data);
    } catch (error) {
      console.error(`[API] Error fetching from Ponder server:`, error);
      return res.status(503).json({ 
        error: 'Failed to connect to Ponder server',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error(`[API] Error in sync-activities endpoint:`, error);
    return res.status(500).json({ 
      error: 'Failed to process activities request', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}