import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  console.log('\n🚀 Starting global MongoMemoryServer for coverage execution...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGO_URI = uri;
  console.log(`📡 Ephemeral database listening at: ${uri}\n`);
}
