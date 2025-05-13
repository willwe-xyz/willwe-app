import { ActivityItem } from '@/types/chainData';
import { resolveENS } from './ensUtils';

function splitCamelCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function transformEventType(eventType: string, activity: any): string {
  // Handle both MembershipMinted and generic mint of a membership
  if (
    eventType === 'MembershipMinted' ||
    (eventType.toLowerCase() === 'mint' && (
      activity?.membershipId ||
      activity?.membership ||
      (activity?.amount === '1' && activity?.tokenSymbol?.toLowerCase() === 'membership')
    ))
  ) {
    return 'Joined';
  }
  if (eventType === 'InflationMinted') {
    return 'Shares Generated';
  }
  switch (eventType) {
    case 'MembraneCreated':
      return 'Membrane Created';
    case 'MovementCreated':
      return 'Movement Created';
    case 'MovementSigned':
      return 'Movement Signed';
    case 'MovementExecuted':
      return 'Movement Executed';
    default:
      return splitCamelCase(eventType);
  }
}

function generateDescription(activity: ActivityItem): string {
  const shortAddress = `${activity.who.slice(0, 6)}...${activity.who.slice(-4)}`;
  
  switch (activity.eventType) {
    case 'MembershipMinted':
      return `${shortAddress} joined node ${activity.nodeId}`;
    case 'InflationMinted':
      return `Inflation of ${activity.amount || '0'} tokens minted for node ${activity.nodeId}`;
    case 'MembraneCreated':
      return `${shortAddress} created a new membrane for node ${activity.nodeId}`;
    case 'MovementCreated':
      return `${shortAddress} created a new movement in node ${activity.nodeId}`;
    case 'MovementSigned':
      return `${shortAddress} signed a movement in node ${activity.nodeId}`;
    case 'MovementExecuted':
      return `${shortAddress} executed a movement in node ${activity.nodeId}`;
    default:
      return `${shortAddress} performed ${splitCamelCase(activity.eventType)} in node ${activity.nodeId}`;
  }
}

export async function transformActivities(activities: any[]): Promise<ActivityItem[]> {
  if (!Array.isArray(activities)) {
    console.warn('transformActivities received non-array input:', activities);
    return [];
  }

  const transformedActivities = await Promise.all(
    activities.map(async (activity) => {
      try {
        // Ensure all required fields are present with defaults
        const transformed: ActivityItem = {
          id: activity.id || `activity-${Date.now()}-${Math.random()}`,
          nodeId: activity.nodeId || activity.node_id || '0',
          who: activity.who || activity.userAddress || activity.user_address || 'unknown',
          eventName: activity.eventName || activity.eventName || 'Unknown Activity',
          eventType: transformEventType(activity.eventType || activity.event_type || 'unknown', activity),
          when: activity.when || activity.timestamp || new Date().toISOString(),
          createdBlockNumber: activity.createdBlockNumber || activity.blockNumber || 0,
          network: activity.network || 'unknown',
          networkId: activity.networkId || activity.chainId || '0',
          description: activity.description || generateDescription({
            ...activity,
            eventType: activity.eventType || activity.event_type || 'unknown',
            nodeId: activity.nodeId || activity.node_id || '0',
            who: activity.who || activity.userAddress || activity.user_address || 'unknown'
          })
        };

        // Add optional fields if present
        if (activity.amount) transformed.amount = activity.amount;
        if (activity.tokenSymbol) transformed.tokenSymbol = activity.tokenSymbol;

        return transformed;
      } catch (error) {
        console.error('Error transforming activity:', error);
        return null;
      }
    })
  );

  // Filter out any null values from failed transformations
  return transformedActivities.filter((activity): activity is ActivityItem => activity !== null);
}

async function generateActivityDescription(
  activity: ActivityItem,
  resolvedActor: string,
  resolvedObject: string
): Promise<string> {
  const { verb, target, context } = activity;
  
  switch (verb) {
    case 'joined':
      return `${resolvedActor} joined the network`;
    case 'left':
      return `${resolvedActor} left the network`;
    case 'created':
      return `${resolvedActor} created ${resolvedObject}`;
    case 'updated':
      return `${resolvedActor} updated ${resolvedObject}`;
    case 'deleted':
      return `${resolvedActor} deleted ${resolvedObject}`;
    case 'commented':
      return `${resolvedActor} commented on ${resolvedObject}`;
    case 'liked':
      return `${resolvedActor} liked ${resolvedObject}`;
    case 'shared':
      return `${resolvedActor} shared ${resolvedObject}`;
    case 'followed':
      return `${resolvedActor} followed ${resolvedObject}`;
    case 'unfollowed':
      return `${resolvedActor} unfollowed ${resolvedObject}`;
    case 'mentioned':
      return `${resolvedActor} mentioned ${resolvedObject}`;
    case 'tagged':
      return `${resolvedActor} tagged ${resolvedObject}`;
    case 'replied':
      return `${resolvedActor} replied to ${resolvedObject}`;
    case 'reacted':
      return `${resolvedActor} reacted to ${resolvedObject}`;
    case 'invited':
      return `${resolvedActor} invited ${resolvedObject}`;
    case 'accepted':
      return `${resolvedActor} accepted ${resolvedObject}`;
    case 'rejected':
      return `${resolvedActor} rejected ${resolvedObject}`;
    case 'requested':
      return `${resolvedActor} requested ${resolvedObject}`;
    case 'approved':
      return `${resolvedActor} approved ${resolvedObject}`;
    case 'denied':
      return `${resolvedActor} denied ${resolvedObject}`;
    case 'completed':
      return `${resolvedActor} completed ${resolvedObject}`;
    case 'started':
      return `${resolvedActor} started ${resolvedObject}`;
    case 'stopped':
      return `${resolvedActor} stopped ${resolvedObject}`;
    case 'paused':
      return `${resolvedActor} paused ${resolvedObject}`;
    case 'resumed':
      return `${resolvedActor} resumed ${resolvedObject}`;
    case 'archived':
      return `${resolvedActor} archived ${resolvedObject}`;
    case 'restored':
      return `${resolvedActor} restored ${resolvedObject}`;
    case 'moved':
      return `${resolvedActor} moved ${resolvedObject}`;
    case 'copied':
      return `${resolvedActor} copied ${resolvedObject}`;
    case 'renamed':
      return `${resolvedActor} renamed ${resolvedObject}`;
    case 'assigned':
      return `${resolvedActor} assigned ${resolvedObject}`;
    case 'unassigned':
      return `${resolvedActor} unassigned ${resolvedObject}`;
    case 'scheduled':
      return `${resolvedActor} scheduled ${resolvedObject}`;
    case 'unscheduled':
      return `${resolvedActor} unscheduled ${resolvedObject}`;
    case 'published':
      return `${resolvedActor} published ${resolvedObject}`;
    case 'unpublished':
      return `${resolvedActor} unpublished ${resolvedObject}`;
    case 'subscribed':
      return `${resolvedActor} subscribed to ${resolvedObject}`;
    case 'unsubscribed':
      return `${resolvedActor} unsubscribed from ${resolvedObject}`;
    case 'bookmarked':
      return `${resolvedActor} bookmarked ${resolvedObject}`;
    case 'unbookmarked':
      return `${resolvedActor} unbookmarked ${resolvedObject}`;
    case 'voted':
      return `${resolvedActor} voted on ${resolvedObject}`;
    case 'rated':
      return `${resolvedActor} rated ${resolvedObject}`;
    case 'reviewed':
      return `${resolvedActor} reviewed ${resolvedObject}`;
    case 'reported':
      return `${resolvedActor} reported ${resolvedObject}`;
    case 'blocked':
      return `${resolvedActor} blocked ${resolvedObject}`;
    case 'unblocked':
      return `${resolvedActor} unblocked ${resolvedObject}`;
    case 'muted':
      return `${resolvedActor} muted ${resolvedObject}`;
    case 'unmuted':
      return `${resolvedActor} unmuted ${resolvedObject}`;
    default:
      return `${resolvedActor} performed ${activity.eventType} on ${resolvedObject}`;
  }
}