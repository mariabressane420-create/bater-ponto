import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://vndjbcjgcqeeyowyuagl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Jo7_t82NNEBJB8RaCChezg_Z1D8oa29';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
