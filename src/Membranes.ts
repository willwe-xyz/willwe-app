// Note: ponder:registry import will be resolved at runtime
// @ts-ignore - These imports are resolved by Ponder at runtime
import { ponder } from "ponder:registry";
// @ts-ignore - These imports are resolved by Ponder at runtime
import { Membrane, ActivityLog } from "ponder:schema";

ponder.on('Membranes:MembraneCreated', async ({ event, context }: { event: any, context: any }) => {
  const { membraneId, creator, CID } = event.args;
  const { db } = context;

  // Create membrane record
  await db.insert(Membrane).values({
    id: membraneId.toString(),
    membraneId: membraneId.toString(),
    creator: creator.toLowerCase(),
    tokens: [], // We'll need to get this from the contract
    balances: [], // We'll need to get this from the contract
    nodeId: "0", // We'll need to determine this
    cid: CID,
    createdAt: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });

  // Create activity log entry
  await db.insert(ActivityLog).values({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: "0", // We'll need to determine this
    userAddress: creator.toLowerCase(),
    eventType: 'MembraneCreated',
    data: JSON.stringify({ 
      membraneId: membraneId.toString(),
      creator: creator.toLowerCase(),
      CID
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });
});
