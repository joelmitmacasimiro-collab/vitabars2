// Estos datos son públicos y están protegidos por las reglas de seguridad de Supabase.
const SUPABASE_URL = 'https://etobhgfgrhkabhugmaox.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_aOBrnfoTp7hx_i-Y2YjSow_kHhO16_Q';

if (!window.supabase) {
  console.error('No se pudo cargar la librería de Supabase.');
} else {
  window.vitabarsSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
}
