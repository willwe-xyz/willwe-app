import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, getNodeActivityLogs, getUserActivityLogs } from '../../../lib/ponder-client';

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
      const { nodeId, userAddress, limit = '50', forceSync = 'false' } = req.query;
      const shouldForceSync = forceSync === 'true';
      
      // Handle user activities
      if (userAddress) {
        console.log(`[API] Fetching activities for user ${userAddress}, limit: ${limit}, forceSync: ${shouldForceSync}`);
        
        // If forceSync is true, sync from Ponder first
        if (shouldForceSync) {
          console.log(`[API] Force sync requested for user ${userAddress}`);
          await syncActivitiesFromPonder(userAddress as string);
        }
        
        // Get activities for the user
        const activities = await getUserActivityLogs(userAddress as string, parseInt(limit as string, 10));
        
        console.log(`[API] Found ${activities.length} activities for user ${userAddress}`);
        
        // If no activities found, try to sync from Ponder
        if (activities.length === 0) {
          console.log(`[API] No activities found for user ${userAddress}, attempting to sync from Ponder`);
          
          const syncResult = await syncActivitiesFromPonder(userAddress as string);
          
          if (syncResult.success) {
            // Try to get activities again
            const refreshedActivities = await getUserActivityLogs(userAddress as string, parseInt(limit as string, 10));
            
            if (refreshedActivities.length > 0) {
              console.log(`[API] After sync: Found ${refreshedActivities.length} activities for user ${userAddress}`);
              return res.status(200).json({
                activities: refreshedActivities,
                debug: {
                  source: 'after-sync',
                  syncResult,
                  count: refreshedActivities.length
                }
              });
            } else {
              console.log(`[API] After sync: Still no activities found for user ${userAddress}`);
              return res.status(200).json({
                activities: [],
                debug: {
                  source: 'after-sync-empty',
                  syncResult,
                  message: 'No activities found even after syncing'
                }
              });
            }
          } else {
            console.log(`[API] Sync failed for user ${userAddress}: ${syncResult.error}`);
            return res.status(200).json({
              activities: [],
              debug: {
                source: 'sync-failed',
                syncResult,
                message: 'Sync operation failed'
              }
            });
          }
        }
        
        return res.status(200).json({
          activities,
          debug: {
            source: 'database',
            count: activities.length
          }
        });
      }
      
      // Handle node activities
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID or User Address is required' });
      }
      
      console.log(`[API] Fetching activities for node ${nodeId}, limit: ${limit}, forceSync: ${shouldForceSync}`);
      
      // If forceSync is true, sync from Ponder first
      if (shouldForceSync) {
        console.log(`[API] Force sync requested for node ${nodeId}`);
        await syncActivitiesFromPonder(undefined, nodeId as string);
      }
      
      // Get activities for the node
      const activities = await getNodeActivityLogs(nodeId as string, parseInt(limit as string, 10));
      
      console.log(`[API] Found ${activities.length} activities for node ${nodeId}`);
      
      // If no activities found, try to sync from Ponder
      if (activities.length === 0) {
        console.log(`[API] No activities found for node ${nodeId}, attempting to sync from Ponder`);
        
        const syncResult = await syncActivitiesFromPonder(undefined, nodeId as string);
        
        if (syncResult.success) {
          // Try to get activities again
          const refreshedActivities = await getNodeActivityLogs(nodeId as string, parseInt(limit as string, 10));
          
          if (refreshedActivities.length > 0) {
            console.log(`[API] After sync: Found ${refreshedActivities.length} activities for node ${nodeId}`);
            return res.status(200).json({
              activities: refreshedActivities,
              debug: {
                source: 'after-sync',
                syncResult,
                count: refreshedActivities.length
              }
            });
          } else {
            console.log(`[API] After sync: Still no activities found for node ${nodeId}`);
            return res.status(200).json({
              activities: [],
              debug: {
                source: 'after-sync-empty',
                syncResult,
                message: 'No activities found even after syncing'
              }
            });
          }
        } else {
          console.log(`[API] Sync failed for node ${nodeId}: ${syncResult.error}`);
          return res.status(200).json({
            activities: [],
            debug: {
              source: 'sync-failed',
              syncResult,
              message: 'Sync operation failed'
            }
          });
        }
      }
      
      return res.status(200).json({
        activities,
        debug: {
          source: 'database',
          count: activities.length
        }
      });
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

/**
 * Helper function to sync activities from Ponder
 * @param userAddress - Optional user address to sync activities for
 * @param nodeId - Optional node ID to sync activities for
 * @returns Object with success flag and additional data
 */
async function syncActivitiesFromPonder(userAddress?: string, nodeId?: string): Promise<{ success: boolean, eventsStored?: number, error?: string }> {
  try {
    // Construct the sync URL
    let syncUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/ponder/sync-activities?limit=100`;
    
    if (userAddress) {
      syncUrl += `&userAddress=${encodeURIComponent(userAddress)}`;
    }
    
    if (nodeId) {
      syncUrl += `&nodeId=${encodeURIComponent(nodeId)}`;
    }
    
    console.log(`[API] Syncing activities from Ponder: ${syncUrl}`);
    
    // Call the sync-activities endpoint
    const syncResponse = await fetch(syncUrl);
    
    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log(`[API] Sync successful: ${JSON.stringify(syncData)}`);
      
      return {
        success: true,
        eventsStored: syncData.eventsStored
      };
    } else {
      const errorText = await syncResponse.text();
      console.warn(`[API] Sync response not OK (${syncResponse.status}):`, errorText);
      
      return {
        success: false,
        error: errorText
      };
    }
  } catch (error) {
    console.error('[API] Error syncing activities:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
