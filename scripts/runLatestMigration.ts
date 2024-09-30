import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { parse } from 'toml';

const migrationDir = path.join(process.cwd(), 'migrations');

// Get all SQL files in the migration directory
const migrationFiles = fs.readdirSync(migrationDir)
  .filter(file => file.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.split('_')[0]);
    const numB = parseInt(b.split('_')[0]);
    return numB - numA;
  });

if (migrationFiles.length === 0) {
  console.log('No migration files found.');
  process.exit(1);
}

const latestMigration = migrationFiles[0];
const migrationPath = path.join(migrationDir, latestMigration);

// Check if the --remote flag is provided
const isRemote = process.argv.includes('--remote');

console.log(`Executing latest migration: ${latestMigration}`);
console.log(`Environment: ${isRemote ? 'Remote' : 'Local'}`);

try {
  // Read and parse wrangler.toml file
  const wranglerConfig = parse(fs.readFileSync('wrangler.toml', 'utf-8'));
  
  // Extract the database name from the wrangler.toml configuration
  const databaseName = wranglerConfig.d1_databases[0].database_name;
  
  if (!databaseName) {
    throw new Error('Database name not found in wrangler.toml');
  }

  const baseCommand = `bunx wrangler d1 execute ${databaseName}`;
  const command = isRemote
    ? `${baseCommand} --remote --file=${migrationPath}`
    : `${baseCommand} --local --file=${migrationPath}`;
  
  execSync(command, { stdio: 'inherit' });
  console.log('Migration executed successfully.');
} catch (error) {
  console.error('Error executing migration:', error);
  process.exit(1);
}