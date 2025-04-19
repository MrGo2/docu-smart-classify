import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Supabase configuration
const supabaseUrl = 'https://hshepgzbhetelxqzmvvb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ Missing Supabase anon key. Please provide it as SUPABASE_ANON_KEY environment variable.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    // Test the connection by getting the current user session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase Connection Error:', error.message);
      return;
    }

    // Test a simple query to verify database access
    const { data: testData, error: testError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database Query Error:', testError.message);
      return;
    }

    console.log('✅ Supabase Connection Successful!');
    console.log('Session Status:', data.session ? 'Active' : 'No active session');
    console.log('Database Access:', testData ? 'Working' : 'No documents found');
  } catch (error) {
    console.error('❌ Unexpected Error:', error);
  }
}

// Run the test
testSupabaseConnection(); 