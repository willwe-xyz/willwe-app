import { ponder } from "ponder:registry";
import { User, Node, ActivityLog } from "ponder:schema";

ponder.on('WillWe:MembershipMinted', async ({ event, context }) => {
  const { branchId, member } = event.args;
  const { db } = context;

  // Get or create user
  let user = await db.find(User, { id: member.toLowerCase() });
  if (!user) {
    user = await db.insert(User).values({
      id: member.toLowerCase(),
      address: member,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Get or create node
  let node = await db.find(Node, { id: branchId.toString() });
  if (!node) {
    node = await db.insert(Node).values({
      id: branchId.toString(),
      nodeId: branchId.toString(),
      totalSupply: "0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Update node members
  await db.update(Node, { id: branchId.toString() })
    .set({
      members: [...(node.members || []), user.id],
      updatedAt: new Date().toISOString(),
    });

  // Create activity log entry
  await db.insert(ActivityLog).values({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: branchId.toString(),
    userAddress: member,
    eventType: 'MembershipMinted',
    data: JSON.stringify({ branchId: branchId.toString(), member }),
    timestamp: new Date(Number(event.block.timestamp) * 1000).toISOString(),
  });
});
