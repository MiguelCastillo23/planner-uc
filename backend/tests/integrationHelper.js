import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import fs from 'fs';

let mongoServer;

export async function setupIntegration() {
  // Disconnect any active connections
  await mongoose.disconnect();

  let mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;
  }

  // Generate a random port between 20000 and 30000
  const port = 20000 + Math.floor(Math.random() * 10000);

  process.env.PORT = port.toString();

  // Dynamically import server.js, triggering its connection to process.env.MONGO_URI and app.listen(process.env.PORT)
  await import('../server.js');

  return `http://localhost:${port}`;
}

export async function teardownIntegration() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export function logApiCall(method, path, status, body = null) {
  const logMsg = `[${new Date().toISOString()}] ${method} ${path} - Status: ${status} ${body ? `- Response: ${JSON.stringify(body)}` : ''}\n`;
  fs.appendFileSync('api-integration.log', logMsg);
}
