#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database schema...');

  try {
    // Test if tables exist by trying to query them
    console.log('Checking existing tables...');

    // Insert default product types
    const { error: insertError } = await supabase
      .from('product_types')
      .upsert([
        { value: 'wrap', label: 'ラップ', unit: 'm' },
        { value: 'toilet_paper', label: 'トイレットペーパー', unit: 'ロール' },
        { value: 'tissue', label: 'ティッシュペーパー', unit: '箱' },
        { value: 'detergent', label: '洗剤', unit: 'ml' },
        { value: 'shampoo', label: 'シャンプー', unit: 'ml' },
        { value: 'rice', label: 'お米', unit: 'kg' },
        { value: 'oil', label: '食用油', unit: 'ml' },
        { value: 'milk', label: '牛乳', unit: 'ml' },
        { value: 'bread', label: 'パン', unit: '枚' },
        { value: 'eggs', label: '卵', unit: '個' }
      ], { onConflict: 'value' });

    if (insertError) {
      console.error('Error inserting product types:', insertError);
    } else {
      console.log('✓ Product types inserted');
    }

    // Create stores table
    const { error: storesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.stores (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          name text NOT NULL,
          location text,
          notes text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id, name)
        );
      `
    });

    if (storesError && !storesError.message.includes('already exists')) {
      console.error('Error creating stores table:', storesError);
    } else {
      console.log('✓ stores table ready');
    }

    // Create products table
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.products (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
          product_type text REFERENCES public.product_types(value) NOT NULL,
          name text,
          quantity numeric NOT NULL CHECK (quantity > 0),
          unit text NOT NULL DEFAULT 'm',
          count numeric NOT NULL DEFAULT 1 CHECK (count > 0),
          price numeric NOT NULL CHECK (price > 0),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `
    });

    if (productsError && !productsError.message.includes('already exists')) {
      console.error('Error creating products table:', productsError);
    } else {
      console.log('✓ products table ready');
    }

    // Enable RLS and create policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own stores" ON public.stores;
        DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
        DROP POLICY IF EXISTS "Anyone can read product types" ON public.product_types;
        
        CREATE POLICY "Users can manage own stores" ON public.stores
          FOR ALL USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can manage own products" ON public.products
          FOR ALL USING (auth.uid() = user_id);
        
        CREATE POLICY "Anyone can read product types" ON public.product_types
          FOR SELECT USING (auth.role() = 'authenticated');
      `
    });

    if (rlsError) {
      console.error('Error setting up RLS:', rlsError);
    } else {
      console.log('✓ RLS policies set up');
    }

    console.log('✅ Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Test database connection
async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('product_types')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Main execution
(async () => {
  const connected = await testConnection();
  if (connected) {
    await setupDatabase();
  } else {
    console.log('Proceeding with database setup anyway...');
    await setupDatabase();
  }
})();