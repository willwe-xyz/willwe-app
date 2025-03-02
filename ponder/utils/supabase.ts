import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client instance
 * @returns Supabase client
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Initialize Supabase tables if they don't exist
 */
export async function initializeSupabaseTables() {
  const supabase = createSupabaseClient();

  // Create tables if they don't exist
  const tables = [
    {
      name: 'users',
      columns: `
        id uuid primary key,
        address text not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    },
    {
      name: 'nodes',
      columns: `
        id uuid primary key,
        node_id text not null,
        parent_id text,
        total_supply numeric,
        inflation_rate numeric,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    },
    {
      name: 'membranes',
      columns: `
        id uuid primary key,
        membrane_id text not null,
        node_id text,
        tokens jsonb,
        balances jsonb,
        meta text,
        creator text,
        cid text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    },
    {
      name: 'movements',
      columns: `
        id uuid primary key,
        movement_hash text not null,
        category integer,
        type text,
        initiator text,
        node_id text,
        expires_at timestamp with time zone,
        description text,
        payload text,
        state text,
        required_signatures integer,
        current_signatures integer,
        executed boolean default false,
        executed_at timestamp with time zone,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    },
    {
      name: 'signatures',
      columns: `
        id uuid primary key,
        movement_hash text not null,
        signer text not null,
        signed_at timestamp with time zone default now()
      `
    },
    {
      name: 'chat_messages',
      columns: `
        id uuid primary key,
        node_id text not null,
        sender text not null,
        content text not null,
        timestamp timestamp with time zone default now()
      `
    },
    {
      name: 'movement_signatures',
      columns: `
        id uuid primary key,
        movement_hash text not null,
        signature_data jsonb,
        user_address text not null,
        node_id text not null,
        created_at timestamp with time zone default now()
      `
    },
    {
      name: 'activity_logs',
      columns: `
        id uuid primary key,
        node_id text,
        user_address text,
        event_type text not null,
        data jsonb,
        timestamp timestamp with time zone default now()
      `
    },
    {
      name: 'user_preferences',
      columns: `
        id uuid primary key,
        user_address text not null,
        redistributive_preferences jsonb,
        supported_movements jsonb,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    }
  ];

  for (const table of tables) {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: table.name,
      columns_definition: table.columns
    });

    if (error) {
      console.error(`Error creating table ${table.name}:`, error);
    } else {
      console.log(`Table ${table.name} created or already exists`);
    }
  }
}
