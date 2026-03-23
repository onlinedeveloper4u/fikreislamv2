import { MongoClient, type MongoClientOptions } from 'mongodb';

// Use both environments to ensure we catch it in more runtimes
const rawUri = import.meta.env.MONGODB_URI || (typeof process !== 'undefined' ? process.env.MONGODB_URI : undefined);
const uri = rawUri?.trim(); // Trim any accidental whitespace

const options: MongoClientOptions = {
  tls: true,
  // Node.js v24+ uses OpenSSL 3.x which can be strict with Atlas TLS handshake
  tlsAllowInvalidCertificates: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // We return a rejected promise instead of throwing immediately at load time
  // This prevents the middleware from failing to load entirely.
  clientPromise = Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'));
} else {
  if (import.meta.env.DEV) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      console.log("Creating NEW MongoDB connection...");
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    } else {
      console.log("Reusing EXISTING MongoDB connection promise...");
      // Logic to catch and reset if the previous attempt failed
      globalWithMongo._mongoClientPromise.catch(() => {
        console.log("Detected FAILED connection promise. Resetting...");
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

