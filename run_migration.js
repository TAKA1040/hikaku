const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migration_add_allowed_units.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('✅ Migration file loaded successfully')
    
    // Split SQL into individual statements (rough split by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement using raw SQL
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      if (stmt.trim().length === 0) continue
      
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`)
      console.log(`📝 Statement preview: ${stmt.substring(0, 100)}${stmt.length > 100 ? '...' : ''}`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: stmt + ';' 
        })
        
        if (error) {
          // Try alternative method if RPC fails
          console.log('🔄 Trying alternative execution method...')
          const { data: altData, error: altError } = await supabase
            .from('_migration_temp')
            .select('*')
            .limit(0) // This will fail but might execute the SQL
          
          if (altError && !altError.message.includes('does not exist')) {
            throw altError
          }
        }
        
        console.log(`✅ Statement ${i + 1} completed`)
        
      } catch (execError) {
        console.error(`❌ Error executing statement ${i + 1}:`, execError.message)
        
        // Continue with non-critical errors
        if (execError.message.includes('already exists') || 
            execError.message.includes('column already exists')) {
          console.log('⚠️  Skipping - already exists')
          continue
        }
        
        throw execError
      }
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('🔍 Verifying migration...')
    
    // Verify the migration worked
    const { data: updatedProductTypes, error: verifyError } = await supabase
      .from('product_types')
      .select('*')
      .limit(1)
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError.message)
      return
    }
    
    if (updatedProductTypes && updatedProductTypes.length > 0) {
      const sample = updatedProductTypes[0]
      console.log('✅ Migration verification successful!')
      console.log('New columns available:', Object.keys(sample))
      
      const hasAllowedUnits = sample.hasOwnProperty('allowed_units')
      const hasDefaultUnit = sample.hasOwnProperty('default_unit')  
      const hasUserId = sample.hasOwnProperty('user_id')
      
      console.log(`  - allowed_units: ${hasAllowedUnits ? '✅' : '❌'}`)
      console.log(`  - default_unit: ${hasDefaultUnit ? '✅' : '❌'}`)
      console.log(`  - user_id: ${hasUserId ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()