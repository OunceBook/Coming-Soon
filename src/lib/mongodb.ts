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

/**
 * One row per (inviter, invitee) pair. Rows are written at signup but only
 * acted on once the inviter has verified their own address — that gate is what
 * stops the endpoint from becoming a way to mail arbitrary strangers.
 */
type InvitationDocument = {
  inviterEmail: string;
  inviteeEmail: string;
  createdAt: Date;
  /** pending -> inviter unverified; sent -> notified; skipped -> suppressed or capped. */
  status: "pending" | "sent" | "skipped";
  notifiedAt: Date | null;
  mutual: boolean;
};

/** Addresses that asked never to be contacted again. Checked before every send. */
type SuppressionDocument = {
  email: string;
  createdAt: Date;
  reason: "unsubscribed" | "complaint" | "manual";
};

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoPromise: Promise<MongoClient> | undefined;
  var _waitlistIndexPromise: Promise<void> | undefined;
  var _invitationIndexPromise: Promise<void> | undefined;
  var _suppressionIndexPromise: Promise<void> | undefined;
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
    })().catch((error) => {
      // Never memoize a failure: a cached rejected promise would make
      // every later call fail for the life of the process.
      global._waitlistIndexPromise = undefined;
      throw error;
    });
  }

  await global._waitlistIndexPromise;
}

async function ensureInvitationIndexes(collection: Collection<InvitationDocument>) {
  if (!global._invitationIndexPromise) {
    global._invitationIndexPromise = (async () => {
      // One invitation per pair, ever — the dedupe that stops repeat mailings.
      await collection.createIndex(
        { inviterEmail: 1, inviteeEmail: 1 },
        { unique: true, name: "invite_pair_uq" },
      );
      await collection.createIndex({ inviteeEmail: 1 }, { name: "invitee_lookup" });
      await collection.createIndex(
        { inviterEmail: 1, status: 1 },
        { name: "inviter_status_lookup" },
      );
    })().catch((error) => {
      // Never memoize a failure: a cached rejected promise would make
      // every later call fail for the life of the process.
      global._invitationIndexPromise = undefined;
      throw error;
    });
  }

  await global._invitationIndexPromise;
}

async function ensureSuppressionIndexes(collection: Collection<SuppressionDocument>) {
  if (!global._suppressionIndexPromise) {
    global._suppressionIndexPromise = (async () => {
      await collection.createIndex({ email: 1 }, { unique: true, name: "suppression_email_uq" });
    })().catch((error) => {
      // Never memoize a failure: a cached rejected promise would make
      // every later call fail for the life of the process.
      global._suppressionIndexPromise = undefined;
      throw error;
    });
  }

  await global._suppressionIndexPromise;
}

export async function getInvitationCollection() {
  const uri = resolveMongoUri();
  const dbName = resolveDatabaseName(uri);
  const client = await getMongoPromise();
  const collection = client
    .db(dbName)
    .collection<InvitationDocument>("waitlist_invitations");

  await ensureInvitationIndexes(collection);
  return collection;
}

export async function getSuppressionCollection() {
  const uri = resolveMongoUri();
  const dbName = resolveDatabaseName(uri);
  const client = await getMongoPromise();
  const collection = client
    .db(dbName)
    .collection<SuppressionDocument>("email_suppressions");

  await ensureSuppressionIndexes(collection);
  return collection;
}

export async function isSuppressed(email: string) {
  const suppressions = await getSuppressionCollection();
  return Boolean(await suppressions.findOne({ email: email.toLowerCase() }));
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
