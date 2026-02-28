const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET;

// Safe verification — never print full keys
if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL in environment variables');
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}
if (!BUCKET) {
  console.error('❌ Missing SUPABASE_BUCKET in environment variables');
  process.exit(1);
}

console.log('✅ SUPABASE_URL loaded:', SUPABASE_URL.substring(0, 30) + '...');
console.log('✅ SUPABASE_SERVICE_ROLE_KEY loaded: [REDACTED, length=' + SUPABASE_SERVICE_ROLE_KEY.length + ']');
console.log('✅ SUPABASE_BUCKET loaded:', BUCKET);

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin, BUCKET };
