import { ponder } from '@/generated';
import { storeActivityLog } from '../utils/database';

/**
 * Handler for Transfer events
 * This event is emitted when tokens are transferred between addresses
 */
ponder.on('WillWe:Transfer', async ({ event, context }) => {
  const { from, to, value, nodeId } = event.args;
  const { User, Node } = context.db;

  // Skip minting events (from zero address) as they're handled by InflationMinted
  if (from === '0x0000000000000000000000000000000000000000') {
    return;
  }

  // Skip burning events (to zero address) as they're handled by the Burn handler
  if (to === '0x0000000000000000000000000000000000000000') {
    return;
  }

  // Get or create sender
  if (from !== '0x0000000000000000000000000000000000000000') {
    let sender = await User.findUnique({ id: from.toLowerCase() });
    if (!sender) {
      sender = await User.create({
        id: from.toLowerCase(),
        address: from,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Get or create receiver
  if (to !== '0x0000000000000000000000000000000000000000') {
    let receiver = await User.findUnique({ id: to.toLowerCase() });
    if (!receiver) {
      receiver = await User.create({
        id: to.toLowerCase(),
        address: to,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Get or create node
  let node = await Node.findUnique({ id: nodeId.toString() });
  if (!node) {
    node = await Node.create({
      id: nodeId.toString(),
      nodeId: nodeId.toString(),
      totalSupply: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: from,
    eventType: 'Transfer',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      from, 
      to, 
      value: value.toString() 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    from,
    'Transfer',
    { 
      nodeId: nodeId.toString(), 
      from, 
      to, 
      value: value.toString() 
    }
  );
});

/**
 * Handler for Burn events
 * This event is emitted when tokens are burned
 */
ponder.on('WillWe:Burn', async ({ event, context }) => {
  const { from, value, nodeId } = event.args;
  const { User, Node } = context.db;

  // Get or create user
  let user = await User.findUnique({ id: from.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: from.toLowerCase(),
      address: from,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Get or create node
  let node = await Node.findUnique({ id: nodeId.toString() });
  if (!node) {
    node = await Node.create({
      id: nodeId.toString(),
      nodeId: nodeId.toString(),
      totalSupply: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update node total supply
    await Node.update({
      id: nodeId.toString(),
      data: {
        totalSupply: node.totalSupply - value,
        updatedAt: new Date(),
      },
    });
  }

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: from,
    eventType: 'Burn',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      from, 
      value: value.toString() 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    from,
    'Burn',
    { 
      nodeId: nodeId.toString(), 
      from, 
      value: value.toString() 
    }
  );
});

/**
 * Handler for Resignal events
 * This event is emitted when a user resignals their support for a node
 */
ponder.on('WillWe:Resignal', async ({ event, context }) => {
  const { nodeId, sender, amount } = event.args;
  const { User, Node } = context.db;

  // Get or create user
  let user = await User.findUnique({ id: sender.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: sender.toLowerCase(),
      address: sender,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Get or create node
  let node = await Node.findUnique({ id: nodeId.toString() });
  if (!node) {
    node = await Node.create({
      id: nodeId.toString(),
      nodeId: nodeId.toString(),
      totalSupply: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: sender,
    eventType: 'Resignal',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      sender, 
      amount: amount.toString() 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    sender,
    'Resignal',
    { 
      nodeId: nodeId.toString(), 
      sender, 
      amount: amount.toString() 
    }
  );
});
