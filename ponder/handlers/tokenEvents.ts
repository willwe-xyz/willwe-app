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

/**
 * Handler for TransferSingle events
 * This event is emitted when tokens are transferred using ERC1155 standard
 * Used to determine Mint and Burn operations for nodes and users
 */
ponder.on('WillWe:TransferSingle', async ({ event, context }) => {
  const { operator, from, to, id, amount } = event.args;
  const { User, Node } = context.db;
  
  // Determine if this is a mint or burn operation
  const isMint = from === '0x0000000000000000000000000000000000000000';
  const isBurn = to === '0x0000000000000000000000000000000000000000';
  
  // Get or create operator
  let operatorUser = await User.findUnique({ id: operator.toLowerCase() });
  if (!operatorUser) {
    operatorUser = await User.create({
      id: operator.toLowerCase(),
      address: operator,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Handle sender (if not zero address)
  if (!isMint) {
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

  // Handle receiver (if not zero address)
  if (!isBurn) {
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
  let node = await Node.findUnique({ id: id.toString() });
  if (!node) {
    node = await Node.create({
      id: id.toString(),
      nodeId: id.toString(),
      totalSupply: isMint ? amount : 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update node total supply
    if (isMint) {
      await Node.update({
        id: id.toString(),
        data: {
          totalSupply: node.totalSupply + amount,
          updatedAt: new Date(),
        },
      });
    } else if (isBurn) {
      await Node.update({
        id: id.toString(),
        data: {
          totalSupply: node.totalSupply - amount,
          updatedAt: new Date(),
        },
      });
    }
  }

  // Create activity log entry with appropriate event type
  const eventType = isMint ? 'Mint' : isBurn ? 'Burn' : 'Transfer';
  const userAddress = isMint ? to : from;
  
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: id.toString(),
    userAddress: userAddress,
    eventType: eventType,
    data: JSON.stringify({ 
      nodeId: id.toString(), 
      operator,
      from, 
      to, 
      amount: amount.toString() 
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    id.toString(),
    userAddress,
    eventType,
    { 
      nodeId: id.toString(), 
      operator,
      from, 
      to, 
      amount: amount.toString() 
    }
  );
});
