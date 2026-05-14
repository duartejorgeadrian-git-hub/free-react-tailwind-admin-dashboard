import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://knyzuneqxikuevbvpvwi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueXp1bmVxeGlrdWV2YnZwdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzczMTMsImV4cCI6MjA4NDkxMzMxM30.0izEjGPXhcZNZ3gJt9mqtDcYODkQ8InyJ-lZGyv44uA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Haciendo login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'duartejorgeadrian@gmail.com',
    password: '123456789'
  });

  if (loginError) {
    console.error('Error al hacer login:', loginError.message);
    return;
  }
  
  console.log('Intentando crear un tenant...');
  const { error } = await supabase
    .from('tenants')
    .insert({
      name: 'TEST_TENANT',
      code: 'TEST',
      contact_email: 'test@test.com',
      contact_phone: '123',
      address: '123',
      primary_color: '#000000',
      is_active: true,
    });

  if (error) {
    console.error('ERROR EXACTO AL CREAR TENANT:', error);
  } else {
    console.log('¡TENANT CREADO CON ÉXITO! (RLS no está bloqueando)');
  }
}

testInsert();
