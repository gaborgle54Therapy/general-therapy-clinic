import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kltefhanksholrxhbgck.supabase.co";

const supabaseAnonKey = "sb_publishable_qXtjteR7vcrwiLfPyrfb0w_Ppfzu9z2";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);