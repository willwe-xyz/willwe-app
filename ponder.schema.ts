import { GraphQLSchema } from 'graphql';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSchema } from 'graphql';
import { onchainTable, relations } from "ponder";

// Define User table
export const User = onchainTable("User", (t) => ({
  id: t.text().primaryKey(),
  address: t.hex().notNull(),
  createdAt: t.text().notNull(),
  updatedAt: t.text().notNull(),
}));

// Define Node table
export const Node = onchainTable("Node", (t) => ({
  id: t.text().primaryKey(),
  nodeId: t.text().notNull(),
  parentId: t.text(),
  totalSupply: t.text().notNull(),
  inflationRate: t.text(),
  members: t.text().array(),
  createdAt: t.text().notNull(),
  updatedAt: t.text().notNull(),
}));

// Define Membrane table
export const Membrane = onchainTable("Membrane", (t) => ({
  id: t.text().primaryKey(),
  membraneId: t.text().notNull(),
  creator: t.hex().notNull(),
  tokens: t.text().array().notNull(),
  balances: t.text().array().notNull(),
  nodeId: t.text().notNull(),
  cid: t.text(),
  createdAt: t.text().notNull(),
}));

// Define Movement table
export const Movement = onchainTable("Movement", (t) => ({
  id: t.text().primaryKey(),
  movementHash: t.hex().notNull(),
  category: t.integer().notNull(),
  type: t.text().notNull(),
  initiator: t.hex().notNull(),
  nodeId: t.text().notNull(),
  expiresAt: t.text(),
  description: t.text(),
  payload: t.text(),
  state: t.text(),
  requiredSignatures: t.integer(),
  currentSignatures: t.integer(),
  executed: t.boolean().notNull(),
  executedAt: t.text(),
  createdAt: t.text().notNull(),
}));

// Define Signature table
export const Signature = onchainTable("Signature", (t) => ({
  id: t.text().primaryKey(),
  movementHash: t.hex().notNull(),
  signer: t.hex().notNull(),
  signedAt: t.text().notNull(),
}));

// Define MovementSignature table (join table)
export const MovementSignature = onchainTable("MovementSignature", (t) => ({
  id: t.text().primaryKey(),
  movementId: t.text().notNull(),
  signatureId: t.text().notNull(),
}));

// Define ActivityLog table
export const ActivityLog = onchainTable("ActivityLog", (t) => ({
  id: t.text().primaryKey(),
  nodeId: t.text().notNull(),
  userAddress: t.hex().notNull(),
  eventType: t.text().notNull(),
  data: t.text().notNull(),
  timestamp: t.text().notNull(),
}));

// Define ChatMessage table
export const ChatMessage = onchainTable("ChatMessage", (t) => ({
  id: t.text().primaryKey(),
  nodeId: t.text().notNull(),
  sender: t.hex().notNull(),
  content: t.text().notNull(),
  timestamp: t.text().notNull(),
}));

// Define UserPreference table
export const UserPreference = onchainTable("UserPreference", (t) => ({
  id: t.text().primaryKey(),
  userId: t.text().notNull(),
  key: t.text().notNull(),
  value: t.text().notNull(),
}));

// Define relationships
export const NodeRelations = relations(Node, ({ many }) => ({
  membranes: many(Membrane),
  movements: many(Movement),
  activityLogs: many(ActivityLog),
  chatMessages: many(ChatMessage),
}));

export const MembraneRelations = relations(Membrane, ({ one }) => ({
  node: one(Node, { fields: [Membrane.nodeId], references: [Node.id] }),
}));

export const MovementRelations = relations(Movement, ({ many, one }) => ({
  signatures: many(MovementSignature),
  node: one(Node, { fields: [Movement.nodeId], references: [Node.id] }),
}));

export const MovementSignatureRelations = relations(MovementSignature, ({ one }) => ({
  movement: one(Movement, { fields: [MovementSignature.movementId], references: [Movement.id] }),
  signature: one(Signature, { fields: [MovementSignature.signatureId], references: [Signature.id] }),
}));

export const UserRelations = relations(User, ({ many }) => ({
  preferences: many(UserPreference),
}));

export const ActivityLogRelations = relations(ActivityLog, ({ one }) => ({
  node: one(Node, { fields: [ActivityLog.nodeId], references: [Node.id] }),
}));

export const ChatMessageRelations = relations(ChatMessage, ({ one }) => ({
  node: one(Node, { fields: [ChatMessage.nodeId], references: [Node.id] }),
}));

export const UserPreferenceRelations = relations(UserPreference, ({ one }) => ({
  user: one(User, { fields: [UserPreference.userId], references: [User.id] }),
}));

// Read the schema.graphql file
const schemaPath = join(__dirname, 'schema.graphql');
const schemaString = readFileSync(schemaPath, 'utf-8');

// Build the schema
const schema = buildSchema(schemaString);

export default schema;
