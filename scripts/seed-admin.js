import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      acc[key] = value;
    }
    return acc;
  }, {});

const uri = envConfig.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI not found in .env file");
  process.exit(1);
}

const adminUser = {
  email: "onlinedeveloper4u@gmail.com",
  password: "03227221032@Ma", // New password requested by user
  role: "admin",
  name: "Super Admin"
};

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    const db = client.db('fikreislam');
    const collection = db.collection('users');

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Prepare document
    const userDoc = {
      ...adminUser,
      password: hashedPassword,
      updatedAt: new Date()
    };

    // Check if user exists
    const existing = await collection.findOne({ email: adminUser.email });
    if (existing) {
      console.log("User already exists. Updating credentials...");
      await collection.updateOne(
        { email: adminUser.email },
        { $set: { password: hashedPassword, role: "admin", updatedAt: new Date() } }
      );
    } else {
      console.log("Creating new admin user...");
      await collection.insertOne({ ...userDoc, createdAt: new Date() });
    }

    console.log("SUCCESS: Admin user password updated!");
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await client.close();
  }
}

seed();
