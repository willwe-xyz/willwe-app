import { ActivityItem } from '@/types/chainData';
import { resolveENS } from './ensUtils';

export function transformActivities(activities: any[]): ActivityItem[] {
  if (!activities || !Array.isArray(activities)) {
    return [];
  }

  return activities.map((activity, index) => ({
    id: activity.id || `activity-${index}`,
    nodeId: activity.nodeId || '',
    who: activity.who || '',
    eventName: activity.eventName || 'Unknown Activity',
    eventType: activity.eventType || 'unknown',
    when: activity.when || new Date().toISOString(),
    createdBlockNumber: activity.createdBlockNumber || 0,
    network: activity.network || 'unknown',
    networkId: activity.networkId || '',
    description: activity.description || `Activity related to node ${activity.nodeId}`
  }));
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
    case 'verified':
      return `${resolvedActor} verified ${resolvedObject}`;
    case 'unverified':
      return `${resolvedActor} unverified ${resolvedObject}`;
    case 'featured':
      return `${resolvedActor} featured ${resolvedObject}`;
    case 'unfeatured':
      return `${resolvedActor} unfeatured ${resolvedObject}`;
    case 'pinned':
      return `${resolvedActor} pinned ${resolvedObject}`;
    case 'unpinned':
      return `${resolvedActor} unpinned ${resolvedObject}`;
    case 'locked':
      return `${resolvedActor} locked ${resolvedObject}`;
    case 'unlocked':
      return `${resolvedActor} unlocked ${resolvedObject}`;
    case 'hidden':
      return `${resolvedActor} hidden ${resolvedObject}`;
    case 'unhidden':
      return `${resolvedActor} unhidden ${resolvedObject}`;
    case 'delegated':
      return `${resolvedActor} delegated ${resolvedObject}`;
    case 'undelegated':
      return `${resolvedActor} undelegated ${resolvedObject}`;
    case 'transferred':
      return `${resolvedActor} transferred ${resolvedObject}`;
    case 'received':
      return `${resolvedActor} received ${resolvedObject}`;
    case 'sent':
      return `${resolvedActor} sent ${resolvedObject}`;
    case 'withdrawn':
      return `${resolvedActor} withdrawn ${resolvedObject}`;
    case 'deposited':
      return `${resolvedActor} deposited ${resolvedObject}`;
    case 'staked':
      return `${resolvedActor} staked ${resolvedObject}`;
    case 'unstaked':
      return `${resolvedActor} unstaked ${resolvedObject}`;
    case 'claimed':
      return `${resolvedActor} claimed ${resolvedObject}`;
    case 'burned':
      return `${resolvedActor} burned ${resolvedObject}`;
    case 'minted':
      return `${resolvedActor} minted ${resolvedObject}`;
    case 'swapped':
      return `${resolvedActor} swapped ${resolvedObject}`;
    case 'provided':
      return `${resolvedActor} provided ${resolvedObject}`;
    case 'removed':
      return `${resolvedActor} removed ${resolvedObject}`;
    case 'added':
      return `${resolvedActor} added ${resolvedObject}`;
    case 'modified':
      return `${resolvedActor} modified ${resolvedObject}`;
    case 'configured':
      return `${resolvedActor} configured ${resolvedObject}`;
    case 'initialized':
      return `${resolvedActor} initialized ${resolvedObject}`;
    case 'finalized':
      return `${resolvedActor} finalized ${resolvedObject}`;
    case 'cancelled':
      return `${resolvedActor} cancelled ${resolvedObject}`;
    case 'expired':
      return `${resolvedActor} expired ${resolvedObject}`;
    case 'renewed':
      return `${resolvedActor} renewed ${resolvedObject}`;
    case 'revoked':
      return `${resolvedActor} revoked ${resolvedObject}`;
    case 'granted':
      return `${resolvedActor} granted ${resolvedObject}`;
    case 'withdrawn':
      return `${resolvedActor} withdrawn ${resolvedObject}`;
    case 'executed':
      return `${resolvedActor} executed ${resolvedObject}`;
    case 'failed':
      return `${resolvedActor} failed ${resolvedObject}`;
    case 'succeeded':
      return `${resolvedActor} succeeded ${resolvedObject}`;
    default:
      return `${resolvedActor} ${verb} ${resolvedObject}`;
  }
}
