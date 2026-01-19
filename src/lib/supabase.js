import { createClient } from '@supabase/supabase-js';

// Diese Variablen müssen in einer .env Datei gesetzt werden oder (für Demo) hier eingefügt werden.
// Da wir "Ready to use" sein wollen, bereiten wir alles vor.
// Der User muss später nur die Keys eintragen.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper um zu prüfen ob Supabase aktiv ist
export const isSupabaseConfigured = () => !!supabase;
