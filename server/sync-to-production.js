/**
 * Sync local MongoDB data → Railway production MongoDB
 * Usage: node sync-to-production.js
 * WARNING: This will OVERWRITE all production data.
 */

const { MongoClient } = require('mongoose').mongo;

const LOCAL_URI = 'mongodb://localhost:27017/spark-org-chart';
const PRODUCTION_URI = 'mongodb://mongo:srWpOiJjJtFeelAXyRXnKipdamSfNWPI@crossover.proxy.rlwy.net:17313';

const collections = ['people', 'accounts', 'assignments', 'capabilities', 'regions', 'senioritylevels', 'roles', 'freelancepools', 'activitylogs'];

async function sync() {
  const local = new MongoClient(LOCAL_URI);
  const prod = new MongoClient(PRODUCTION_URI);

  await local.connect();
  console.log('Connected to local DB');
  await prod.connect();
  console.log('Connected to production DB');

  const localDb = local.db();
  const prodDb = prod.db();

  for (const name of collections) {
    const docs = await localDb.collection(name).find({}).toArray();

    await prodDb.collection(name).deleteMany({});

    if (docs.length > 0) {
      await prodDb.collection(name).insertMany(docs);
    }

    console.log(`  ${name}: ${docs.length} docs synced`);
  }

  console.log('\nSync complete! Production now matches local.');
  await local.close();
  await prod.close();
}

sync().catch(err => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});
