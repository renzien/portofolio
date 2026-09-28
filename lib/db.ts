import { MongoClient, type Db } from "mongodb";
const globalDb = globalThis as typeof globalThis & {
  mongoConnection?: Promise<MongoClient>;
};
export function databaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}
export async function db(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!globalDb.mongoConnection) {
    globalDb.mongoConnection = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 7000,
      connectTimeoutMS: 7000,
    })
      .connect()
      .catch((error) => {
        globalDb.mongoConnection = undefined;
        throw error;
      });
  }
  return (await globalDb.mongoConnection).db(
    process.env.MONGODB_DB || "alif_portfolio",
  );
}
