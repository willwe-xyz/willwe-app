import { ActivityLogEntry, ActivityItem } from '../types/activity';

/**
 * Generate a description for an activity based on its type and data
 * @param eventType The type of event
 * @param data The event data
 * @returns A human-readable description of the activity
 */
function generateDescription(eventType: string, data: any): string {
  switch (eventType) {
    case 'mint':
    case 'InflationMinted':
      return `${data.amount || 'Unknown amount'} tokens minted`;
    
    case 'burn':
    case 'Burn':
      return `${data.amount || 'Unknown amount'} tokens burned`;
    
    case 'signal':
    case 'Signaled':
      return `Signal of ${data.amount || 'Unknown amount'}`;
    
    case 'resignal':
    case 'Resignal':
      return `Resignaled ${data.amount || 'Unknown amount'}`;
    
    case 'transfer':
    case 'Transfer':
      return `Transferred ${data.amount || 'Unknown amount'} tokens`;
    
    case 'inflationChange':
    case 'InflationRateChanged':
      return `Inflation rate changed to ${data.newRate || 'Unknown rate'}`;
    
    case 'membraneChange':
    case 'MembraneChanged':
      return `Membrane parameters changed`;
    
    case 'membership':
    case 'MembershipMinted':
      return `Membership minted`;
    
    case 'configSignal':
    case 'ConfigSignal':
      return `Configuration signal`;
    
    case 'endpoint':
    case 'CreatedEndpoint':
      return `Endpoint created`;
    
    case 'newMovement':
    case 'NewMovementCreated':
      return `New movement created`;
    
    case 'queueExecuted':
    case 'QueueExecuted':
    case 'MovementExecuted':
      return `Queue executed`;
    
    case 'TestEvent':
      return `Test activity: ${data.message || 'No message'}`;
    
    default:
      return `${eventType} event`;
  }
}

/**
 * Transform activity log entries into ActivityItem format
 * @param activities Array of activity log entries
 * @param isUserFocused Whether the activities are for a user-focused view
 * @returns Array of ActivityItem objects
 */
export function transformActivities(
  activities: ActivityLogEntry[],
  isUserFocused: boolean = false
): ActivityItem[] {
  // Log the activities being processed
  console.log(`Transforming ${activities?.length || 0} activities`);
  
  // Ensure activities is an array
  if (!activities || !Array.isArray(activities)) {
    console.warn('Transforming undefined activities');
    return [];
  }
  
  if (activities.length === 0) {
    console.log('No activities to transform');
    return [];
  }
  
  // Log the event types we're processing
  const eventTypes = activities.map(a => a.event_type || a.eventType);
  const eventTypeCounts = eventTypes.reduce((acc, type) => {
    if (type) {
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Activity event types:', eventTypeCounts);
  
  return activities.map((activity) => {
    let activityData;
    try {
      activityData = typeof activity.data === 'string' 
        ? JSON.parse(activity.data) 
        : activity.data;
    } catch (error) {
      console.error('Error parsing activity data:', error);
      activityData = {};
    }
      
    // Log each activity and its transformed data
    console.log(`Processing activity: ${activity.id}, type: ${activity.eventType}, node: ${activity.nodeId}`);
    
    // Get the event type - handle both camelCase and snake_case
    const eventType = activity.event_type || activity.eventType;
    
    // Get the timestamp
    const timestamp = activity.timestamp;
    
    // Get the node ID
    const nodeId = activity.node_id || activity.nodeId;
    
    // Get the user address
    const userAddress = activity.user_address || activity.userAddress;
    
    // Map event types to activity types
    const typeMap: Record<string, string> = {
      'MembershipMinted': 'membership',
      'InflationMinted': 'mint',
      'InflationRateChanged': 'inflationChange',
      'MembraneChanged': 'membraneChange',
      'Signaled': 'signal',
      'Resignal': 'resignal',
      'Transfer': 'transfer',
      'Burn': 'burn',
      'ConfigSignal': 'configSignal',
      'CreatedEndpoint': 'endpoint',
      'NewMovementCreated': 'newMovement',
      'WillWeSet': 'willWeSet',
      'MembraneCreated': 'membraneCreated',
      'NewSignaturesSubmitted': 'newSignatures',
      'QueueExecuted': 'queueExecuted',
      'SignatureRemoved': 'signatureRemoved',
      'LatentActionRemoved': 'latentActionRemoved',
      'MovementExecuted': 'queueExecuted',
      'TestEvent': 'signal' // For our test events
    };
    
    // Generate a description based on the event type and data
    const description = generateDescription(eventType, activityData);
    
    // Map to normalized activity type
    const activityType = typeMap[eventType] || 'unknown';
    
    return {
      id: activity.id,
      nodeId,
      userAddress,
      type: activityType,
      description,
      data: activityData,
      timestamp,
      isUserFocused
    };
  });
}
