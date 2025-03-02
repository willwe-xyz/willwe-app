import { ponder } from '@/generated';
import { storeActivityLog } from '../utils/database';

/**
 * Handler for MembershipMinted events
 * This event is emitted when a new membership is minted for a node
 */
ponder.on('WillWe:MembershipMinted', async ({ event, context }) => {
  const { branchId, member } = event.args;
  const { User, Node } = context.db;

  // Get or create user
  let user = await User.findUnique({ id: member.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: member.toLowerCase(),
      address: member,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Get or create node
  let node = await Node.findUnique({ id: branchId.toString() });
  if (!node) {
    node = await Node.create({
      id: branchId.toString(),
      nodeId: branchId.toString(),
      totalSupply: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Update node members
  await Node.update({
    id: branchId.toString(),
    data: {
      members: [...(node.members || []), user.id],
      updatedAt: new Date(),
    },
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: branchId.toString(),
    userAddress: member,
    eventType: 'MembershipMinted',
    data: JSON.stringify({ branchId: branchId.toString(), member }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    branchId.toString(),
    member,
    'MembershipMinted',
    { branchId: branchId.toString(), member }
  );
});

/**
 * Handler for InflationMinted events
 * This event is emitted when inflation is minted for a node
 */
ponder.on('WillWe:InflationMinted', async ({ event, context }) => {
  const { branchId, amount } = event.args;
  const { Node } = context.db;

  // Get or create node
  let node = await Node.findUnique({ id: branchId.toString() });
  if (!node) {
    node = await Node.create({
      id: branchId.toString(),
      nodeId: branchId.toString(),
      totalSupply: amount,
      inflationRate: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update node total supply
    await Node.update({
      id: branchId.toString(),
      data: {
        totalSupply: node.totalSupply + amount,
        updatedAt: new Date(),
      },
    });
  }

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: branchId.toString(),
    eventType: 'InflationMinted',
    data: JSON.stringify({ branchId: branchId.toString(), amount: amount.toString() }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    branchId.toString(),
    null,
    'InflationMinted',
    { branchId: branchId.toString(), amount: amount.toString() }
  );
});
