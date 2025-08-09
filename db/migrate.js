#!/usr/bin/env node
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'analytics_db',
  user: process.env.DB_USER || 'saurabkshaah',
  password: process.env.DB_PASSWORD || '',
};

async function runMigrations() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get applied migrations
    const appliedResult = await client.query('SELECT version FROM schema_migrations');
    const appliedMigrations = new Set(appliedResult.rows.map(row => row.version));
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    console.log(`✓ ${appliedMigrations.size} migrations already applied`);
    
    // Run pending migrations
    let migrationsRun = 0;
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      if (appliedMigrations.has(version)) {
        console.log(`⏭️  Skipping ${version} (already applied)`);
        continue;
      }
      
      console.log(`🚀 Running migration: ${version}`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Applied ${version}`);
        migrationsRun++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to apply ${version}:`, error.message);
        throw error;
      }
    }
    
    if (migrationsRun === 0) {
      console.log('✅ Database is up to date');
    } else {
      console.log(`✅ Applied ${migrationsRun} migrations`);
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };