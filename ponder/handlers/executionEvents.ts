import { ponder } from '@/generated';
import { storeActivityLog } from '../utils/database';

/**
 * Handler for NewSignaturesSubmitted events
 * This event is emitted when new signatures are submitted for a movement
 */
ponder.on('Execution:NewSignaturesSubmitted', async ({ event, context }) => {
  const { queueHash } = event.args;
  const { Movement } = context.db;

  // Find the movement by hash
  const movement = await Movement.findUnique({ id: queueHash });
  if (!movement) {
    console.warn(`Movement with hash ${queueHash} not found for NewSignaturesSubmitted event`);
    return;
  }

  // Get movement details from contract to update signature count
  const executionContract = context.contracts.Execution.contract;
  const movementDetails = await executionContract.read.getSigQueueByHash([queueHash]);

  // Update movement signature count
  await Movement.update({
    id: queueHash,
    data: {
      currentSignatures: Number(movementDetails.sigCount),
      updatedAt: new Date(),
    },
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: movement.nodeId,
    userAddress: event.transaction.from,
    eventType: 'NewSignaturesSubmitted',
    data: JSON.stringify({ 
      queueHash,
      nodeId: movement.nodeId,
      signer: event.transaction.from
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    movement.nodeId,
    event.transaction.from,
    'NewSignaturesSubmitted',
    { 
      queueHash,
      nodeId: movement.nodeId,
      signer: event.transaction.from
    }
  );
});

/**
 * Handler for QueueExecuted events
 * This event is emitted when a movement is executed
 */
ponder.on('Execution:QueueExecuted', async ({ event, context }) => {
  const { nodeId, queueHash } = event.args;
  const { Movement } = context.db;

  // Update movement record to mark as executed
  await Movement.update({
    id: queueHash,
    data: {
      executed: true,
      executedAt: new Date(Number(event.block.timestamp) * 1000),
      state: 'executed',
    },
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: event.transaction.from,
    eventType: 'QueueExecuted',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(),
      queueHash
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    event.transaction.from,
    'QueueExecuted',
    { 
      nodeId: nodeId.toString(),
      queueHash
    }
  );
});

/**
 * Handler for SignatureRemoved events
 * This event is emitted when a signature is removed from a movement
 */
ponder.on('Execution:SignatureRemoved', async ({ event, context }) => {
  const { nodeId, queueHash, signer } = event.args;
  const { Movement } = context.db;

  // Find the movement by hash
  const movement = await Movement.findUnique({ id: queueHash });
  if (!movement) {
    console.warn(`Movement with hash ${queueHash} not found for SignatureRemoved event`);
    return;
  }

  // Get movement details from contract to update signature count
  const executionContract = context.contracts.Execution.contract;
  const movementDetails = await executionContract.read.getSigQueueByHash([queueHash]);

  // Update movement signature count
  await Movement.update({
    id: queueHash,
    data: {
      currentSignatures: Number(movementDetails.sigCount),
      updatedAt: new Date(),
    },
  });

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: signer,
    eventType: 'SignatureRemoved',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(),
      queueHash,
      signer
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    signer,
    'SignatureRemoved',
    { 
      nodeId: nodeId.toString(),
      queueHash,
      signer
    }
  );
});

/**
 * Handler for LatentActionRemoved events
 * This event is emitted when a latent action is removed
 */
ponder.on('Execution:LatentActionRemoved', async ({ event, context }) => {
  const { nodeId, actionHash, index } = event.args;

  // Create activity log entry
  await context.db.ActivityLog.create({
    id: `${event.transaction.hash}-${event.logIndex}`,
    nodeId: nodeId.toString(),
    userAddress: event.transaction.from,
    eventType: 'LatentActionRemoved',
    data: JSON.stringify({ 
      nodeId: nodeId.toString(),
      actionHash,
      index: index.toString()
    }),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
  });

  // Also store in SQLite for real-time access
  await storeActivityLog(
    nodeId.toString(),
    event.transaction.from,
    'LatentActionRemoved',
    { 
      nodeId: nodeId.toString(),
      actionHash,
      index: index.toString()
    }
  );
});
