import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://knyzuneqxikuevbvpvwi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueXp1bmVxeGlrdWV2YnZwdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzczMTMsImV4cCI6MjA4NDkxMzMxM30.0izEjGPXhcZNZ3gJt9mqtDcYODkQ8InyJ-lZGyv44uA";

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperAdmin() {
  console.log('Creando usuario superadmin...');
  
  // 1. Crear el usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'duartejorgeadrian@gmail.com',
    password: '123456789',
  });

  if (authError) {
    console.error('Error al crear usuario en Auth:', authError.message);
    // Si el usuario ya existe, continuamos para intentar forzar el rol
    if (!authError.message.includes('already registered')) {
      return;
    }
  } else {
    console.log('Usuario creado exitosamente en Auth.');
  }

  // Hacer login para tener una sesión válida y poder insertar
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'duartejorgeadrian@gmail.com',
    password: '123456789'
  });

  if (loginError) {
    console.error('Error al hacer login:', loginError.message);
    return;
  }

  const userId = loginData.user.id;
  console.log('Usuario autenticado. ID:', userId);

  // 2. Intentar crear el perfil (si la tabla se llama profiles)
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: userId,
    nombre: 'Adrian',
    apellido: 'Duarte',
    dni: '11111111',
  });

  if (profileError) {
    console.error('No se pudo insertar profiles:', profileError.message);
  } else {
    console.log('Perfil insertado.');
  }

  // 3. Intentar asignar el rol superadmin en user_roles
  const { error: roleError } = await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'admin'
  });

  if (roleError) {
    console.error('No se pudo asignar el rol en user_roles (quizás por RLS):', roleError.message);
    console.log('\nIMPORTANTE: Debido a las políticas de seguridad (RLS) de Supabase, es posible que no se pueda asignar el rol de superadmin desde el cliente.');
    console.log('Si la asignación falló, por favor ejecuta el siguiente script SQL directamente en el SQL Editor de Supabase:');
    console.log('\n----------------------------------------');
    console.log(`INSERT INTO public.user_roles (user_id, role) VALUES ('${userId}', 'superadmin') ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';`);
    console.log('----------------------------------------\n');
  } else {
    console.log('¡ÉXITO! Rol superadmin asignado correctamente.');
  }
}

createSuperAdmin();
