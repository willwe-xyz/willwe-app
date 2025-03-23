// Note: ponder:api import will be resolved at runtime
// @ts-ignore - These imports are resolved by Ponder at runtime
import { db } from "ponder:api";
// @ts-ignore - These imports are resolved by Ponder at runtime
import schema from "ponder:schema";
import { Hono } from "hono";
// @ts-ignore - Import from ponder is resolved at runtime
import { graphql } from "ponder";

const app = new Hono();

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
