import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('documents').select('id').limit(1);
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    }

    testConnection();
  }, []);

  if (status === 'testing') {
    return <div>Testing Supabase connection...</div>;
  }

  if (status === 'error') {
    return (
      <div style={{ color: 'red' }}>
        Supabase connection error: {error}
      </div>
    );
  }

  return <div style={{ color: 'green' }}>Successfully connected to Supabase!</div>;
} 