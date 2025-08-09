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

async function runSeeds() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Get seed files
    const seedsDir = path.join(__dirname, 'seeds');
    const files = await fs.readdir(seedsDir);
    const seedFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${seedFiles.length} seed files`);
    
    // Run seed files
    for (const file of seedFiles) {
      console.log(`🌱 Running seed: ${file}`);
      const sql = await fs.readFile(path.join(seedsDir, file), 'utf8');
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to apply ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log(`✅ Seeding complete`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run seeds
if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };