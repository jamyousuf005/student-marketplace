const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log('Testing Supabase Auth signUp...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test-signup-error@example.com',
    password: 'Password123!',
  });
  
  if (error) {
    console.error('SUPABASE ERROR:', error);
    console.error('ERROR MESSAGE TYPE:', typeof error.message);
    console.error('ERROR MESSAGE:', error.message);
  } else {
    console.log('SIGNUP SUCCESS:', data);
  }
}

testSignup();
