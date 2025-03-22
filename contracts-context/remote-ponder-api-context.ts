import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { eq, desc, and, like, or, sql, gte, lte, inArray, asc } from "drizzle-orm";
import { error } from "console";
import { randomUUID } from 'crypto';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Create a separate writable database connection
const pool = new Pool({
  connectionString: process.env.PONDER_DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ponder"
});

const writeDb = drizzle(pool);

const app = new Hono();



// Get a node by ID
app.get("/node/:nodeId", async (c) => {
  const nodeId = c.req.param("nodeId");
  
  try {
    // Fetch the node
    const nodeResult = await db
      .select()
      .from(schema.nodes)
      .where(eq(schema.nodes.nodeId, nodeId))
      .limit(1);
      
    if (nodeResult.length === 0) {
      return c.json({ error: "Node not found" }, 404);
    }
    
    const node = nodeResult[0];
    
    // Fetch related data
    const memberships = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.nodeId, nodeId));
      
    // Fetch node signals
    const signals = await db
      .select()
      .from(schema.nodeSignals)
      .where(eq(schema.nodeSignals.nodeId, nodeId))
      .orderBy(desc(schema.nodeSignals.when))
      .limit(100);
      
    // Fetch events
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.nodeId, nodeId))
      .orderBy(desc(schema.events.when))
      .limit(50);
      
    // Get parent node if in rootPath
    let parentNode = null;
    if (!node) return error("Node not found");
    if (node.rootPath && node.rootPath.length > 0) {
      // Last element in rootPath is the direct parent
      const parentId = node.rootPath[node.rootPath.length - 1];
      const parentResult = await db
        .select()
        .from(schema.nodes)
        .where(eq(schema.nodes.nodeId, parentId))
        .limit(1);
        
      if (parentResult.length > 0) {
        parentNode = parentResult[0];
      }
    }
    
    // Get child nodes
    const childNodes = node.childrenNodes && node.childrenNodes.length > 0 
      ? await db
          .select()
          .from(schema.nodes)
          .where(inArray(schema.nodes.nodeId, node.childrenNodes))
      : [];
      
    // Return combined data
    return c.json({
      node,
      parentNode,
      childNodes,
      memberships,
      signals,
      events
    });
  } catch (error) {
    console.error(`Error fetching node ${nodeId}:`, error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Submit signature event
app.post("/events/signature", async (c) => {
  try {
    const body = await c.req.json();
    const { nodeId, who, networkId, signature } = body;
    
    if (!nodeId || !who || !networkId || !signature) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const event = await db.execute<{ id: string }>(sql`
      INSERT INTO ${schema.events} (id, nodeId, who, networkId, eventType, eventName, when, createdBlockNumber, network)
      VALUES (${`sig-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`}, 
              ${nodeId}, 
              ${who.toLowerCase()}, 
              ${networkId.toString()}, 
              'configSignal', 
              'UserSignature', 
              ${Math.floor(Date.now() / 1000)}, 
              0, 
              ${(networkId === 11155420 || networkId === "11155420") ? "optimismsepolia" : "unknown"})
      RETURNING id`);

    return c.json({ success: true, eventId: event[0]?.id });
  } catch (error) {
    console.error("Error creating signature event:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all nodes with pagination and filtering
app.get("/nodes", async (c) => {
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");
  const networkId = c.req.query("networkId");
  const createdAfter = c.req.query("createdAfter") ? parseInt(c.req.query("createdAfter") || "0") : null;
  const hasMembraneId = c.req.query("hasMembraneId");
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortOrder = c.req.query("sortOrder") === "asc" ? "asc" : "desc";
  
  try {
    // Build filters
    let filters = [];
    
    if (networkId) {
      filters.push(eq(schema.nodes.networkId, networkId));
    }
    
    if (createdAfter) {
      filters.push(gte(schema.nodes.createdAt, createdAfter));
    }
    
    if (hasMembraneId) {
      // Only show nodes with a non-zero membrane ID
      filters.push(sql`${schema.nodes.membraneId} != '0'`);
    }
    
    // Execute query with built filters
    let query = db.select().from(schema.nodes);
    
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }
    
    // Apply sorting
    if (sortBy === "createdAt") {
      query = sortOrder === "asc" 
        ? query.orderBy(schema.nodes.createdAt)
        : query.orderBy(desc(schema.nodes.createdAt));
    } else if (sortBy === "updatedAt") {
      query = sortOrder === "asc"
        ? query.orderBy(schema.nodes.updatedAt)
        : query.orderBy(desc(schema.nodes.updatedAt)); 
    } else if (sortBy === "totalSupply") {
      // Convert string to numeric for sorting
      query = sortOrder === "asc"
        ? query.orderBy(sql`CAST(${schema.nodes.totalSupply} AS NUMERIC)`)
        : query.orderBy(sql`CAST(${schema.nodes.totalSupply} AS NUMERIC) DESC`);
    }
    
    // Apply pagination
    query = query.limit(limit).offset(offset);
    
    const nodes = await query;
    
    // Get total count with same filters but without pagination
    let countQuery = db.select({ count: sql`count(*)` }).from(schema.nodes);
    if (filters.length > 0) {
      countQuery = countQuery.where(and(...filters));
    }
    const totalCount = await countQuery;
    
    return c.json({
      nodes,
      meta: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        filters: {
          networkId,
          createdAfter,
          hasMembraneId
        }
      }
    });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get events with filtering and pagination
app.get("/events", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const nodeId = c.req.query("nodeId");
  const who = c.req.query("who");
  const eventType = c.req.query("eventType") as "redistribution" | "redistributionSignal" | "membraneSignal" | "mint" | "burn" | "transfer" | "approval" | "approvalForAll" | "configSignal" | "inflationMinted" | "inflationRateChanged" | "crosschainTransfer" | "newNode" | "newRoot" | undefined;
  const networkId = c.req.query("networkId");
  const fromTimestamp = c.req.query("from") ? parseInt(c.req.query("from") || "0") : null;
  const toTimestamp = c.req.query("to") ? parseInt(c.req.query("to") || "0") : null;
  
  try {
    // Build filters
    const filters = [];
    if (nodeId) filters.push(eq(schema.events.nodeId, nodeId));
    if (who) filters.push(eq(schema.events.who, who.toLowerCase()));
    if (eventType) filters.push(eq(schema.events.eventType, eventType));
    if (networkId) filters.push(eq(schema.events.networkId, networkId));
    if (fromTimestamp) filters.push(gte(schema.events.when, fromTimestamp.toString()));
    if (toTimestamp) filters.push(lte(schema.events.when, toTimestamp.toString()));
    
    // Build query conditionally
    const baseQuery = filters.length === 0
      ? db.select().from(schema.events)
      : filters.length === 1
        ? db.select().from(schema.events).where(filters[0])
        : db.select().from(schema.events).where(and(...filters));
    
    // Apply pagination and ordering
    const query = baseQuery
                 .orderBy(desc(schema.events.when))
                 .limit(limit)
                 .offset(offset);
    
    const events = await query;
    
    // Get total count for pagination
    let countQuery = db.select({ count: sql`count(*)`.as('count') }).from(schema.events);
    if (filters.length > 0) {
      countQuery = countQuery.where(and(...filters));
    }
    const totalCount = await countQuery;
    
    return c.json({
      events,
      meta: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        filters: {
          nodeId,
          who,
          eventType,
          networkId,
          fromTimestamp,
          toTimestamp
        }
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user activity
app.get("/user/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const limit = parseInt(c.req.query("limit") || "50");
  const includeNodes = c.req.query("includeNodes") === "true";
  
  try {
    // Get memberships
    const memberships = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.who, address))
      .limit(limit);
      
    // Get events
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.who, address))
      .orderBy(desc(schema.events.when))
      .limit(limit);
      
    // Get signals
    const signals = await db
      .select()
      .from(schema.nodeSignals)
      .where(eq(schema.nodeSignals.who, address))
      .orderBy(desc(schema.nodeSignals.when))
      .limit(limit);
    
    let nodes: typeof schema.nodes.$inferSelect[] = [];
    if (includeNodes && memberships.length > 0) {
      // Get all nodes this user is a member of
      const nodeIds = memberships.map(m => m.nodeId).filter((id): id is string => id !== null);
      nodes = await db
        .select()
        .from(schema.nodes)
        .where(inArray(schema.nodes.nodeId, nodeIds));
    }
    
    return c.json({
      address,
      memberships,
      events,
      signals,
      nodes: includeNodes ? nodes : undefined
    });
  } catch (error) {
    console.error(`Error fetching data for user ${address}:`, error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Search API with expanded capabilities
app.get("/search", async (c) => {
  const query = c.req.query("q");
  const type = c.req.query("type"); // 'nodes', 'users', 'all'
  const limit = parseInt(c.req.query("limit") || "20");
  
  if (!query || query.length < 2) {
    return c.json({ error: "Query must be at least 2 characters" }, 400);
  }
  
  try {
    let nodes: { nodeId: string; inflation: string | null; reserve: string | null; budget: string | null; rootValuationBudget: string | null; rootValuationReserve: string | null; membraneId: string | null; eligibilityPerSec: string | null; lastRedistributionTime: string | null; totalSupply: string | null; membraneMeta: string | null; membersOfNode: string[] | null; childrenNodes: string[] | null; movementEndpoints: string[] | null; rootPath: string[] | null; signals: string[] | null; createdAt: string | null; updatedAt: string | null; createdBlockNumber: string | null; network: string | null; networkId: string | null; }[] = [];
    let users: { address: string | null; }[] = [];
    let membranes: { id: string; membraneId: string | null; creator: string | null; metadataCID: string | null; data: string | null; tokens: string[] | null; balances: string[] | null; createdAt: string | null; createdBlockNumber: string | null; network: string | null; networkId: string | null; }[] = [];
    
    // Search nodes if requested
    if (!type || type === "all" || type === "nodes") {
      nodes = await db
        .select()
        .from(schema.nodes)
        .where(like(schema.nodes.membraneMeta, `%${query}%`))
        .limit(limit);
    }
    
    // Search users if requested
    if (!type || type === "all" || type === "users") {
      users = await db
        .select({ address: schema.events.who })
        .from(schema.events)
        .where(like(schema.events.who, `%${query}%`))
        .groupBy(schema.events.who)
        .limit(limit);
    }
    
    // Search membranes if requested
    if (!type || type === "all" || type === "membranes") {
      membranes = await db
        .select()
        .from(schema.membranes)
        .where(
          or(
            like(schema.membranes.metadataCID, `%${query}%`),
            like(schema.membranes.data, `%${query}%`)
          )
        )
        .limit(limit);
    }
    
    return c.json({
      nodes,
      users,
      membranes,
      query,
      type: type || "all"
    });
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get membranes with improved filters
app.get("/membranes", async (c) => {
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");
  const creator = c.req.query("createdBy");
  const networkId = c.req.query("networkId");
  
  try {
    // Build filters
    const filters = [];
    if (creator) filters.push(eq(schema.membranes.creator, creator.toLowerCase()));
    if (networkId) filters.push(eq(schema.membranes.networkId, networkId));
    
    // Apply filters and pagination in a single chain
    let query = db.select()
      .from(schema.membranes)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(schema.membranes.createdAt))
      .limit(limit)
      .offset(offset);
    
    const membranes = await query;
    
    // Get total count for pagination
    const totalCount = await db.select({ count: sql`count(*)`.as('count') })
      .from(schema.membranes)
      .where(filters.length > 0 ? and(...filters) : undefined);
      
    return c.json({
      membranes,
      meta: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        filters: {
          creator,
          networkId
        }
      }
    });
  } catch (error) {
    console.error("Error fetching membranes:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get movements with enhanced filtering
app.get("/movements", async (c) => {
  const nodeId = c.req.query("nodeId");
  const initiator = c.req.query("initiator");
  const category = c.req.query("category") as "Revert" | "AgentMajority" | "EnergeticMajority" | undefined;
  const networkId = c.req.query("networkId");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");
  
  try {
    // Build filters
    const filters = [];
    if (nodeId) filters.push(eq(schema.movements.nodeId, nodeId));
    if (initiator) filters.push(eq(schema.movements.initiator, initiator.toLowerCase()));
    if (category) filters.push(eq(schema.movements.category, category));
    if (networkId) filters.push(eq(schema.movements.networkId, networkId));
    
    // Apply filters and sorting in a single chain
    const query = db.select()
      .from(schema.movements)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(schema.movements.createdBlockNumber))
      .limit(limit)
      .offset(offset);
    
    const movements = await query;
    
    // For each movement, get its signature queue if it exists
    const movementsWithQueues = await Promise.all(
      movements.map(async (movement) => {
        const queues = await db
          .select()
          .from(schema.signatureQueues)
          .where(eq(schema.signatureQueues.movementId, movement.id));
          
        // Also get signatures for each queue
        const queuesWithSignatures = await Promise.all(
          queues.map(async (queue) => {
            const sigs = await db
              .select()
              .from(schema.signatures)
              .where(eq(schema.signatures.signatureQueueHash, queue.id));
              
            return {
              ...queue,
              signatures: sigs
            };
          })
        );
          
        return {
          ...movement,
          signatureQueues: queuesWithSignatures
        };
      })
    );
    
    // Get total count for pagination
    let countQuery = db.select({ count: sql`count(*)` }).from(schema.movements);
    if (filters.length > 0) {
      countQuery = countQuery.where(and(...filters));
    }
    const totalCount = await countQuery;
    
    return c.json({
      movements: movementsWithQueues,
      meta: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        filters: {
          nodeId,
          initiator,
          category,
          networkId
        }
      }
    });
  } catch (error) {
    console.error("Error fetching movements:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Add endpoint to fetch stats
app.get("/stats", async (c) => {
  const networkId = c.req.query("networkId");
  
  try {
    // Build filters
    let nodeFilters = [];
    let eventFilters = [];
    
    if (networkId) {
      nodeFilters.push(eq(schema.nodes.networkId, networkId));
      eventFilters.push(eq(schema.events.networkId, networkId));
    }
    
    // Count total nodes
    const nodeCountQuery = db.select({ count: sql`count(*)`.as('count') }).from(schema.nodes);
    if (nodeFilters.length > 0) {
      nodeCountQuery.where(and(...nodeFilters));
    }
    const nodeCount = await nodeCountQuery;
    
    // Count total events
    const eventCountQuery = db.select({ count: sql`count(*)`.as('count') }).from(schema.events);
    if (eventFilters.length > 0) {
      eventCountQuery.where(and(...eventFilters));
    }
    const eventCount = await eventCountQuery;
    
    // Count unique users (distinct 'who' from events)
    const userCountQuery = db.select({ count: sql`count(distinct ${schema.events.who})`.as('count') }).from(schema.events);
    if (eventFilters.length > 0) {
      userCountQuery.where(and(...eventFilters));
    }
    const userCount = await userCountQuery;
    
    // Count membranes
    let membraneFilters = [];
    if (networkId) {
      membraneFilters.push(eq(schema.membranes.networkId, networkId));
    }
    
    const membraneCountQuery = db.select({ count: sql`count(*)`.as('count') })
      .from(schema.membranes)
      .where(membraneFilters.length > 0 ? and(...membraneFilters) : undefined);
      
    const membraneCount = await membraneCountQuery;
    
    return c.json({
      stats: {
        nodesCount: nodeCount[0]?.count || 0,
        eventsCount: eventCount[0]?.count || 0,
        uniqueUsersCount: userCount[0]?.count || 0,
        membranesCount: membraneCount[0]?.count || 0,
      },
      networkId: networkId || "all"
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Chat Endpoints

// Get chat messages for a node
app.get("/chat/messages", async (c) => {
  const nodeId = c.req.query("nodeId");
  const limit = parseInt(c.req.query("limit") || "50");
  const before = c.req.query("before") ? parseInt(c.req.query("before") || "0") : null;
  
  if (!nodeId) {
    return c.json({ error: "nodeId is required" }, 400);
  }
  
  try {
    // Build the query using the schema
    let whereConditions = [eq(schema.chatMessages.nodeId, nodeId)];
    
    if (before) {
      whereConditions.push(lte(schema.chatMessages.timestamp, before.toString()));
    }
    
    // Apply filtering, sorting and limit
    const query = db.select().from(schema.chatMessages)
      .where(and(...whereConditions))
      .orderBy(asc(schema.chatMessages.timestamp))
      .limit(limit);
    
    const messages = await query;
    
    return c.json({
      messages,
      meta: {
        limit,
        nodeId
      }
    });
  } catch (error) {
    console.error(`Error fetching chat messages for node ${nodeId}:`, error);
    return c.json({ error: "Failed to fetch chat messages" }, 500);
  }
});

// Post a new chat message
app.post("/chat/messages", async (c) => {
  try {
    const { nodeId, sender, content, networkId } = await c.req.json();
    console.log("Chat message:", nodeId, sender, content);
    
    if (!nodeId || !sender || !content) {
      return c.json({ error: "nodeId, sender, and content are required" }, 400);
    }
    
    // Validate message length
    if (content.length > 1000) {
      return c.json({ error: "Message content is too long (max 1000 characters)" }, 400);
    }
    
    // Check if the node exists (using read-only db)
    const nodeExists = await db
      .select()
      .from(schema.nodes)
      .where(eq(schema.nodes.nodeId, nodeId))
      .limit(1);
      
    if (nodeExists.length === 0) {
      return c.json({ error: "Node not found" }, 404);
    }
    
    // Generate unique ID and timestamp
    const id = randomUUID();
    const timestamp = Date.now();
    const network = nodeExists[0]?.networkId || networkId || "11155420";
    
    // Insert the message using the writable database connection
    await writeDb.execute(sql`
      INSERT INTO ${schema.chatMessages} (id, node_id, sender, content, timestamp, network_id)
      VALUES (${id}, ${nodeId}, ${sender}, ${content}, ${timestamp}, ${network})
    `);
    
    return c.json({
      success: true,
      message: {
        id,
        nodeId,
        sender,
        content,
        timestamp,
        networkId: network
      }
    });
  } catch (error) {
    console.error("Error posting chat message:", error);
    return c.json({ error: "Failed to post chat message" }, 500);
  }
});

// Validate chat message (optional helper endpoint for client-side validation)
app.post("/chat/validate", async (c) => {
  try {
    const { content } = await c.req.json();
    
    // Create validation rules
    const validations = {
      tooLong: content.length > 1000,
      isEmpty: content.trim().length === 0,
      hasInvalidChars: /[\u0000-\u001F]/.test(content), // Control characters
    };
    
    const isValid = !validations.tooLong && !validations.isEmpty && !validations.hasInvalidChars;
    
    return c.json({
      isValid,
      validations,
      content
    });
  } catch (error) {
    console.error("Error validating chat message:", error);
    return c.json({ error: "Failed to validate message" }, 500);
  }
});

export default app;