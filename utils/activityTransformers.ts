import { ActivityItem } from '../types/chainData';



export function transformActivities(activities: ActivityItem[], includeDebug: boolean): ActivityItem[] {
  return activities.map(activity => {
    try {
      // Ensure all required fields are present
      const {
        id,
        nodeId,
        who,
        eventName,
        eventType,
        when,
        createdBlockNumber,
        network,
        networkId,
        amount,
        tokenSymbol,
      } = activity;

      // Generate a description based on the activity type
      const description = generateDescription(activity);

      return {
        ...activity,
        description,
      };
    } catch (error) {
      console.error('Error transforming activity:', activity, error);
      return {
        ...activity,
        description: 'Error processing activity',
      };
    }
  });
}

function generateDescription(activity: ActivityItem): string {
  const { eventType, amount, tokenSymbol, who } = activity;

  switch (eventType) {
    case 'mint':
      return `${who} minted ${amount} ${tokenSymbol}`;
    case 'burn':
      return `${who} burned ${amount} ${tokenSymbol}`;
    case 'transfer':
      return `${who} transferred ${amount} ${tokenSymbol}`;
    default:
      return `${who} performed ${eventType}`;
  }
}
