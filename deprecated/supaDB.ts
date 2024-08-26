
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../const/envconst'


export const SUPA = createClient(SUPABASE_URL, SUPABASE_KEY);



