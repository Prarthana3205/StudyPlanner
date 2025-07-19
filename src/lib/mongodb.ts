import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      retryWrites: true,
      maxPoolSize: 10,
    }).then((mongooseInstance: typeof mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      cached.promise = null; // Reset promise on failure
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
