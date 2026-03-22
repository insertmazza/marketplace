// ─────────────────────────────────────────────
//  Cliente de Supabase — usa las vars de config.js
// ─────────────────────────────────────────────

function getSupabaseClient() {
  const { createClient } = supabase; // viene del CDN en index.html
  return createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
}

const db = getSupabaseClient();
