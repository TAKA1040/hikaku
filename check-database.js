#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Read environment variables manually
const supabaseUrl = 'https://lkrndvcoyvvycyybuncp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrcm5kdmNveXZ2eWN5eWJ1bmNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIxODAyNiwiZXhwIjoyMDcwNzk0MDI2fQ.HO1cGiaqCzjs8JQrv4hEa-wDv7euCQpca7I3uKAVOqs';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

console.log('Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('\n=== Checking Database Tables ===\n');

  // Check product_types table
  console.log('Checking product_types table...');
  try {
    const { data: productTypes, error: ptError } = await supabase
      .from('product_types')
      .select('*')
      .limit(5);

    if (ptError) {
      console.error('❌ product_types table error:', ptError.message);
    } else {
      console.log('✅ product_types table exists, found', productTypes.length, 'rows');
      if (productTypes.length > 0) {
        console.log('Sample data:', productTypes[0]);
      }
    }
  } catch (error) {
    console.error('❌ product_types table error:', error.message);
  }

  // Check stores table
  console.log('\nChecking stores table...');
  try {
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(5);

    if (storesError) {
      console.error('❌ stores table error:', storesError.message);
    } else {
      console.log('✅ stores table exists, found', stores.length, 'rows');
      if (stores.length > 0) {
        console.log('Sample data:', stores[0]);
      }
    }
  } catch (error) {
    console.error('❌ stores table error:', error.message);
  }

  // Check products table
  console.log('\nChecking products table...');
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.error('❌ products table error:', productsError.message);
    } else {
      console.log('✅ products table exists, found', products.length, 'rows');
      if (products.length > 0) {
        console.log('Sample data:', products[0]);
      }
    }
  } catch (error) {
    console.error('❌ products table error:', error.message);
  }

  // Test authentication
  console.log('\n=== Testing Authentication ===\n');
  try {
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('No authenticated user (this is expected for service role)');
    } else {
      console.log('Current user:', user);
    }
  } catch (error) {
    console.log('Auth check (service role context):', error.message);
  }
}

checkTables().catch(console.error);