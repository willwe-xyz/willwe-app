import { ponder } from '@/generated';
import { storeActivityLog } from '../utils/database';

/**
 * Handler for MembraneCreated events
 * This event is emitted when a new membrane is created
 */
ponder.on('Membranes:MembraneCreated', async ({ event, context }) => {
  const { creator, membraneId, CID } = event.args;
  const { Membrane, User } = context.db;

  // Get membrane details from contract
  const membraneContract = context.contracts.Membranes.contract;
  const membrane = await membraneContract.read.membraneById([membraneId]);

  // Get or create user
  let user = await User.findUnique({ id: creator.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: creator.toLowerCase(),
      address: creator,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create membrane
  await Membrane.create({
    id: membraneId.toString(),
    membraneId: membraneId.toString(),
    tokens: membrane.tokens,
    balances: membrane.balances,
    meta: CID,
    createdAt: new Date(Number(membrane.createdAt) * 1000),
    updatedAt: new Date(),
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    userAddress: creator,
    eventType: 'MembraneCreated',
    data: JSON.stringify({ 
      membraneId: membraneId.toString(), 
      creator,
      CID,
      tokens: membrane.tokens,
      balances: membrane.balances.map(b => b.toString())
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    null,
    creator,
    'MembraneCreated',
    { 
      membraneId: membraneId.toString(), 
      creator,
      CID,
      tokens: membrane.tokens,
      balances: membrane.balances.map(b => b.toString())
    }
  );
});
