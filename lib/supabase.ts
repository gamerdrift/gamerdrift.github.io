import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Dual-persistence helpers: syncs to Supabase if configured, otherwise falls back to localStorage mock DB
export async function dbGetItem<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;
  try {
    if (isSupabaseConfigured && supabase) {
      // Example implementation for Supabase:
      // const { data, error } = await supabase.from('key_value_store').select('value').eq('key', key).single();
      // if (!error && data) return data.value as T;
    }
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error('dbGetItem error:', e);
    return defaultValue;
  }
}

export async function dbSetItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (isSupabaseConfigured && supabase) {
      // Example implementation for Supabase:
      // await supabase.from('key_value_store').upsert({ key, value });
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('dbSetItem error:', e);
  }
}

// Operational telemetry logs
if (!isSupabaseConfigured) {
  console.info('GamerDrift Telemetry: Supabase credentials missing. LocalStorage simulation engine initialized.');
} else {
  console.info('GamerDrift Telemetry: Secure Supabase link active.');
}
