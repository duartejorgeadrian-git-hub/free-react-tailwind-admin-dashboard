import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://knyzuneqxikuevbvpvwi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueXp1bmVxeGlrdWV2YnZwdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzczMTMsImV4cCI6MjA4NDkxMzMxM30.0izEjGPXhcZNZ3gJt9mqtDcYODkQ8InyJ-lZGyv44uA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase
    .rpc('get_tables'); // This might not exist

  if (error) {
    console.log("No se pudo usar RPC. Intentando queries comunes...");
    
    // Check common tables
    const tablesToCheck = ['profiles', 'citizens', 'alerts', 'user_roles', 'municipalities', 'tenants', 'cameras', 'user_points'];
    
    for (const table of tablesToCheck) {
      const { error: tError } = await supabase.from(table).select('id').limit(1);
      if (tError) {
        console.log(`Tabla ${table} NO existe o da error:`, tError.message);
      } else {
        console.log(`Tabla ${table} EXISTE.`);
      }
    }
  }
}

listTables();
