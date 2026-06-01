// Helper: get a Supabase magic link token for Playwright tests
// Usage: node tests/get-test-token.mjs
const SUPABASE_URL = 'https://bancodedados.institutobelem.com';
const SERVICE_ROLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3ODk1Mzc0MCwiZXhwIjo0OTM0NjI3MzQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.A_qxjhvNBYROjpT8Pwu7lOxGyZtN-ByU18n-WZRxjG4';
const EMAIL = process.env.TEST_EMAIL || 'sobreira342@gmail.com';

const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
  },
  body: JSON.stringify({ type: 'magiclink', email: EMAIL, options: { shouldCreateUser: false } }),
});

const data = await res.json();
if (data.action_link) {
  console.log('ACTION_LINK=' + data.action_link);
  console.log('HASHED_TOKEN=' + data.hashed_token);
} else {
  console.error('Failed:', JSON.stringify(data));
  process.exit(1);
}
