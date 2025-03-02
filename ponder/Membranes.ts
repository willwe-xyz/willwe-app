import { ponder } from '@/generated';
import { Membrane, ActivityLog } from 'ponder:schema';

ponder.on('Membranes:MembraneCreated', async ({ event, context }) => {
  const { creator, membraneId, nodeId, tokens, balances } = event.args;
  const { db } = context;
  
  // Create membrane record
  await db.insert(Membrane).values({
    id: membraneId.toString(),
    membraneId: membraneId.toString(),
    creator: creator.toLowerCase(),
    tokens: tokens.map(token => token.toString()),
    balances: balances.map(balance => balance.toString()),
    nodeId: nodeId.toString(),
    createdAt: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });

  // Create activity log entry
  await db.insert(ActivityLog).values({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: creator.toLowerCase(),
    eventType: 'MembraneCreated',
    data: JSON.stringify({ 
      membraneId: membraneId.toString(),
      tokens: tokens.map(token => token.toString()),
      balances: balances.map(balance => balance.toString())
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });
});
