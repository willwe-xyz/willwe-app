import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, getNodeActivityLogs, getUserActivityLogs } from '../../../ponder/utils/database';

/**
 * API endpoint to get activities for a node or user
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize the database if it's not already initialized
    await getDatabase();
    
    if (req.method === 'GET') {
      const { nodeId, userAddress, limit = '50' } = req.query;
      
      // Handle user activities
      if (userAddress) {
        console.log(`[API] Fetching activities for user ${userAddress}, limit: ${limit}`);
        
        // Get activities for the user
        const activities = await getUserActivityLogs(userAddress as string, parseInt(limit as string, 10));
        
        console.log(`[API] Found ${activities.length} activities for user ${userAddress}`);
        
        return res.status(200).json(activities);
      }
      
      // Handle node activities
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID or User Address is required' });
      }
      
      console.log(`[API] Fetching activities for node ${nodeId}, limit: ${limit}`);
      
      // Get activities for the node
      const activities = await getNodeActivityLogs(nodeId as string, parseInt(limit as string, 10));
      
      console.log(`[API] Found ${activities.length} activities for node ${nodeId}`);
      
      // If no activities found, try to sync from Ponder
      if (activities.length === 0) {
        console.log(`[API] No activities found for node ${nodeId}, attempting to sync from Ponder`);
        
        try {
          // Call the sync-activities endpoint
          const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/ponder/sync-activities?nodeId=${nodeId}&limit=100`);
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log(`[API] Synced ${syncData.synced} activities from Ponder`);
            
            // Try to get activities again
            const refreshedActivities = await getNodeActivityLogs(nodeId as string, parseInt(limit as string, 10));
            
            if (refreshedActivities.length > 0) {
              console.log(`[API] After sync: Found ${refreshedActivities.length} activities for node ${nodeId}`);
              return res.status(200).json(refreshedActivities);
            }
          }
        } catch (syncError) {
          console.error('[API] Error syncing activities from Ponder:', syncError);
        }
      }
      
      return res.status(200).json(activities);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API] Error in activities endpoint:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch activities', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
