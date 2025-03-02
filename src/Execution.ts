import { ponder } from "ponder:registry";
import { Movement, ActivityLog } from "ponder:schema";

ponder.on('Execution:QueueExecuted', async ({ event, context }) => {
  const { nodeId, queueHash } = event.args;
  const { db } = context;
  
  // Create activity log entry for the queue execution
  await db.insert(ActivityLog).values({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: event.transaction.from.toLowerCase(),
    eventType: 'QueueExecuted',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(),
      queueHash: queueHash.toString()
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });
});
