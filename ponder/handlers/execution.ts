import { ponder } from '@/generated';
import { storeActivityLog, getDatabase } from '../utils/database';

/**
 * Handler for MovementCreated events
 * This event is emitted when a new movement is created
 */
ponder.on('Execution:MovementCreated', async ({ event, context }) => {
  const { movementHash, initiator, nodeId, category, description } = event.args;
  const { Movement, User, Node } = context.db;
  const db = await getDatabase();

  // Get movement details from contract
  const executionContract = context.contracts.Execution.contract;
  const movementDetails = await executionContract.read.getSigQueueByHash([movementHash]);

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

  // Map movement type
  const typeMap = {
    0: 'Unknown',
    1: 'Revert',
    2: 'AgentMajority',
    3: 'EnergeticMajority'
  };

  // Create movement
  await Movement.create({
    id: movementHash,
    movementHash: movementHash,
    category: Number(category),
    type: typeMap[Number(category)] || 'Unknown',
    initiator: user.id,
    node: node.id,
    expiresAt: new Date(Number(movementDetails.Action.expiresAt) * 1000),
    description: description,
    payload: movementDetails.Action.executedPayload,
    state: movementDetails.state.toString(),
    requiredSignatures: Number(movementDetails.requiredSigs),
    currentSignatures: Number(movementDetails.sigCount),
    executed: false,
    createdAt: new Date(Number(event.block.timestamp) * 1000),
    updatedAt: new Date(),
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: initiator,
    eventType: 'MovementCreated',
    data: JSON.stringify({ 
      movementHash, 
      initiator,
      nodeId: nodeId.toString(),
      category: Number(category),
      type: typeMap[Number(category)] || 'Unknown',
      description
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();
  
  await db.run(
    `INSERT INTO movements (
      movement_hash, category, type, initiator, node_id, expires_at, 
      description, payload, state, required_signatures, current_signatures, 
      executed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      movementHash,
      Number(category),
      typeMap[Number(category)] || 'Unknown',
      initiator,
      nodeId.toString(),
      new Date(Number(movementDetails.Action.expiresAt) * 1000).toISOString(),
      description,
      movementDetails.Action.executedPayload,
      movementDetails.state.toString(),
      Number(movementDetails.requiredSigs),
      Number(movementDetails.sigCount),
      0, // false
      timestamp
    ]
  );
  
  // Store activity log
  await storeActivityLog(
    nodeId.toString(),
    initiator,
    'MovementCreated',
    { 
      movementHash, 
      initiator,
      nodeId: nodeId.toString(),
      category: Number(category),
      type: typeMap[Number(category)] || 'Unknown',
      description
    }
  );
});

/**
 * Handler for MovementSigned events
 * This event is emitted when a movement is signed
 */
ponder.on('Execution:MovementSigned', async ({ event, context }) => {
  const { movementHash, signer } = event.args;
  const { Movement, Signature, User } = context.db;
  const db = await getDatabase();

  // Get movement
  const movement = await Movement.findUnique({ id: movementHash });
  if (!movement) {
    console.error(`Movement ${movementHash} not found`);
    return;
  }

  // Get or create user
  let user = await User.findUnique({ id: signer.toLowerCase() });
  if (!user) {
    user = await User.create({
      id: signer.toLowerCase(),
      address: signer,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create signature
  await Signature.create({
    id: `${movementHash}-${signer.toLowerCase()}`,
    signer: user.id,
    movement: movement.id,
    signedAt: new Date(Number(event.block.timestamp) * 1000),
  });

  // Update movement signature count
  await Movement.update({
    id: movementHash,
    data: {
      currentSignatures: movement.currentSignatures + 1,
      updatedAt: new Date(),
    },
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: movement.node,
    userAddress: signer,
    eventType: 'MovementSigned',
    data: JSON.stringify({ movementHash, signer }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();
  
  // Store signature
  await db.run(
    `INSERT INTO signatures (movement_hash, signer, signed_at) VALUES (?, ?, ?)`,
    [movementHash, signer, timestamp]
  );
  
  // Update movement signature count
  await db.run(
    `UPDATE movements SET current_signatures = current_signatures + 1 WHERE movement_hash = ?`,
    [movementHash]
  );
  
  // Store movement signature data
  await db.run(
    `INSERT INTO movement_signatures (
      movement_hash, signature_data, user_address, node_id, created_at
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      movementHash,
      JSON.stringify({
        signer,
        timestamp
      }),
      signer,
      movement.node,
      timestamp
    ]
  );
  
  // Store activity log
  await storeActivityLog(
    movement.node,
    signer,
    'MovementSigned',
    { movementHash, signer }
  );
});

/**
 * Handler for MovementExecuted events
 * This event is emitted when a movement is executed
 */
ponder.on('Execution:MovementExecuted', async ({ event, context }) => {
  const { movementHash, executor } = event.args;
  const { Movement } = context.db;
  const db = await getDatabase();

  // Get movement
  const movement = await Movement.findUnique({ id: movementHash });
  if (!movement) {
    console.error(`Movement ${movementHash} not found`);
    return;
  }

  // Update movement
  await Movement.update({
    id: movementHash,
    data: {
      executed: true,
      executedAt: new Date(Number(event.block.timestamp) * 1000),
      state: 'Executed',
      updatedAt: new Date(),
    },
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: movement.node,
    userAddress: executor,
    eventType: 'MovementExecuted',
    data: JSON.stringify({ movementHash, executor }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also update in SQLite for real-time access
  const timestamp = new Date(Number(event.block.timestamp) * 1000).toISOString();
  
  await db.run(
    `UPDATE movements SET 
      executed = 1, 
      executed_at = ?, 
      state = 'Executed' 
    WHERE movement_hash = ?`,
    [timestamp, movementHash]
  );
  
  // Store activity log
  await storeActivityLog(
    movement.node,
    executor,
    'MovementExecuted',
    { movementHash, executor }
  );
});
