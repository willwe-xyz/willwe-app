import { ponder } from '@/generated';
import { Movement, ActivityLog } from 'ponder:schema';

ponder.on('Execution:MovementExecuted', async ({ event, context }) => {
  const { nodeId, movementHash } = event.args;
  const { db } = context;
  
  // Update movement record to mark as executed
  await db.update(Movement, { id: movementHash.toString() })
    .set({
      executed: true,
      executedAt: new Date(Number(event.block.timestamp) * 1000).toISOString(),
      state: 'executed',
    });

  // Create activity log entry
  await db.insert(ActivityLog).values({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: event.transaction.from.toLowerCase(),
    eventType: 'MovementExecuted',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(),
      movementHash: movementHash.toString()
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });
});
