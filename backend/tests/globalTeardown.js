export default async function globalTeardown() {
  console.log('\n🛑 Stopping global MongoMemoryServer...');
  const mongod = globalThis.__MONGOD__;
  if (mongod) {
    await mongod.stop();
    console.log('✅ Global MongoMemoryServer stopped successfully.\n');
  }
}
