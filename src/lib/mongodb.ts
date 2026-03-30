import { attachDatabasePool } from "@vercel/functions";
import { Collection, MongoClient } from "mongodb";

type WaitlistDocument = {
  email: string;
  status: "pending" | "verified";
  createdAt: Date;
  verificationTokenHash: string | null;
  verificationRequestedAt: Date | null;
  verifiedAt: Date | null;
};

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoPromise: Promise<MongoClient> | undefined;
  var _waitlistIndexPromise: Promise<void> | undefined;
}

function resolveMongoUri() {
  const uri =
    process.env.MONGODB_URI ??
    process.env.MONGODB_URL ??
    process.env.DATABASE_URL;

  if (!uri) {
    throw new Error(
      "Missing MongoDB connection string. Configure MONGODB_URI (or MONGODB_URL / DATABASE_URL).",
    );
  }

  return uri;
}

function resolveDatabaseName(uri: string) {
  try {
    const databaseFromUri = new URL(uri).pathname.replace(/^\//, "");
    return databaseFromUri || "ouncebook_waitlist";
  } catch {
    return "ouncebook_waitlist";
  }
}

function getMongoPromise() {
  if (!global._mongoPromise) {
    const uri = resolveMongoUri();
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
    });

    attachDatabasePool(client);

    global._mongoClient = client;
    global._mongoPromise = client.connect();
  }

  return global._mongoPromise;
}

async function ensureWaitlistIndexes(collection: Collection<WaitlistDocument>) {
  if (!global._waitlistIndexPromise) {
    global._waitlistIndexPromise = (async () => {
      await collection.createIndex({ email: 1 }, { unique: true, name: "email_uq" });
      await collection.createIndex(
        { verificationTokenHash: 1 },
        {
          name: "verification_token_lookup",
          sparse: true,
        },
      );

      // Best-effort cleanup for legacy indexes that are no longer needed.
      try {
        await collection.dropIndex("created_desc");
      } catch {
        // noop
      }

      try {
        await collection.dropIndex("status_idx");
      } catch {
        // noop
      }
    })();
  }

  await global._waitlistIndexPromise;
}

export async function getWaitlistCollection() {
  const uri = resolveMongoUri();
  const dbName = resolveDatabaseName(uri);
  const client = await getMongoPromise();
  const collection = client
    .db(dbName)
    .collection<WaitlistDocument>("waitlist_entries");

  await ensureWaitlistIndexes(collection);
  return collection;
}
