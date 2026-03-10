
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otceyeuhyxrwjbyfwbwl.supabase.co';
const supabaseAnonKey = 'sb_publishable_tmmqhQn_-UBzKMLsd6XNeA_N6D_e1lL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
