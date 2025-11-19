import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, connection } from './index';

async function main() {
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  
  console.log('Migrations completed!');
  
  await connection.end();
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});
