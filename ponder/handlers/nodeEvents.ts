import { ponder } from '@/generated';
import { storeActivityLog } from '../utils/database';

/**
 * Handler for InflationRateChanged events
 * This event is emitted when a node's inflation rate is changed
 */
ponder.on('WillWe:InflationRateChanged', async ({ event, context }) => {
  const { nodeId, oldInflationRate, newInflationRate } = event.args;
  const { Node } = context.db;

  // Get or create node
  let node = await Node.findUnique({ id: nodeId.toString() });
  if (!node) {
    node = await Node.create({
      id: nodeId.toString(),
      nodeId: nodeId.toString(),
      totalSupply: 0n,
      inflationRate: newInflationRate.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update node inflation rate
    await Node.update({
      id: nodeId.toString(),
      data: {
        inflationRate: newInflationRate.toString(),
        updatedAt: new Date(),
      },
    });
  }

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: event.transaction.from,
    eventType: 'InflationRateChanged',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      oldInflationRate: oldInflationRate.toString(), 
      newInflationRate: newInflationRate.toString() 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    event.transaction.from,
    'InflationRateChanged',
    { 
      nodeId: nodeId.toString(), 
      oldInflationRate: oldInflationRate.toString(), 
      newInflationRate: newInflationRate.toString() 
    }
  );
});

/**
 * Handler for MembraneChanged events
 * This event is emitted when a node's membrane is changed
 */
ponder.on('WillWe:MembraneChanged', async ({ event, context }) => {
  const { nodeId, previousMembrane, newMembrane } = event.args;
  const { Node } = context.db;

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
    userAddress: event.transaction.from,
    eventType: 'MembraneChanged',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      previousMembrane: previousMembrane.toString(), 
      newMembrane: newMembrane.toString() 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    event.transaction.from,
    'MembraneChanged',
    { 
      nodeId: nodeId.toString(), 
      previousMembrane: previousMembrane.toString(), 
      newMembrane: newMembrane.toString() 
    }
  );
});

/**
 * Handler for Signaled events
 * This event is emitted when a user signals support for a node
 */
ponder.on('WillWe:Signaled', async ({ event, context }) => {
  const { nodeId, sender, origin } = event.args;
  const { Node, User } = context.db;

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
    eventType: 'Signaled',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      sender, 
      origin 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    sender,
    'Signaled',
    { 
      nodeId: nodeId.toString(), 
      sender, 
      origin 
    }
  );
});

/**
 * Handler for ConfigSignal events
 * This event is emitted when a user expresses a configuration preference
 */
ponder.on('WillWe:ConfigSignal', async ({ event, context }) => {
  const { nodeId, expressedOption } = event.args;
  const { Node } = context.db;

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
    userAddress: event.transaction.from,
    eventType: 'ConfigSignal',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      expressedOption 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    event.transaction.from,
    'ConfigSignal',
    { 
      nodeId: nodeId.toString(), 
      expressedOption 
    }
  );
});

/**
 * Handler for CreatedEndpoint events
 * This event is emitted when a new endpoint is created for a node
 */
ponder.on('WillWe:CreatedEndpoint', async ({ event, context }) => {
  const { endpoint, owner, nodeId } = event.args;
  const { Node, User } = context.db;

  // Get or create user
  let user = await User.findUnique({ id: owner.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: owner.toLowerCase(),
      address: owner,
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
    userAddress: owner,
    eventType: 'CreatedEndpoint',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      endpoint, 
      owner 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    owner,
    'CreatedEndpoint',
    { 
      nodeId: nodeId.toString(), 
      endpoint, 
      owner 
    }
  );
});

/**
 * Handler for NewMovementCreated events
 * This event is emitted when a new movement is created
 */
ponder.on('WillWe:NewMovementCreated', async ({ event, context }) => {
  const { nodeId, initiator, movementHash, description } = event.args;
  const { Node, User } = context.db;

  // Get or create user
  let user = await User.findUnique({ id: initiator.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: initiator.toLowerCase(),
      address: initiator,
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
    userAddress: initiator,
    eventType: 'NewMovementCreated',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(), 
      initiator, 
      movementHash, 
      description 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    initiator,
    'NewMovementCreated',
    { 
      nodeId: nodeId.toString(), 
      initiator, 
      movementHash, 
      description 
    }
  );
});

/**
 * Handler for WillWeSet events
 * This event is emitted when a new WillWe implementation is set
 */
ponder.on('WillWe:WillWeSet', async ({ event, context }) => {
  const { implementation } = event.args;

  // Create activity log entry for system-wide event
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    userAddress: event.transaction.from,
    eventType: 'WillWeSet',
    data: JSON.stringify({ 
      implementation 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    "0", // System event
    event.transaction.from,
    'WillWeSet',
    { 
      implementation 
    }
  );
});

/**
 * Handler for MembraneCreated events
 * This event is emitted when a new membrane is created
 */
ponder.on('Membranes:MembraneCreated', async ({ event, context }) => {
  const { creator, membraneId, CID } = event.args;
  const { User } = context.db;

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

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    userAddress: creator,
    eventType: 'MembraneCreated',
    data: JSON.stringify({ 
      creator, 
      membraneId: membraneId.toString(), 
      CID 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    "0", // System event since membrane is not yet associated with a node
    creator,
    'MembraneCreated',
    { 
      creator, 
      membraneId: membraneId.toString(), 
      CID 
    }
  );
});
