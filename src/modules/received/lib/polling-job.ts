/**
 * BullMQ polling job for received invoices.
 *
 * This module defines the job but does NOT start the worker —
 * the worker should be started in a separate process/container,
 * not inside Next.js API routes.
 *
 * Usage (in a worker process):
 *   import { registerPollingWorker } from "@/modules/received/lib/polling-job";
 *   registerPollingWorker();
 *
 * Usage (to manually enqueue a sync):
 *   import { enqueueSync } from "@/modules/received/lib/polling-job";
 *   await enqueueSync(tenantId);
 */

import { Queue } from "bullmq";

const QUEUE_NAME = "pa-received-invoices-sync";
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function getRedisConnection() {
  return {
    host: process.env.UPSTASH_REDIS_REST_URL!,
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
  };
}

let queue: Queue | null = null;

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: getRedisConnection() });
  }
  return queue;
}

/**
 * Enqueue a one-time sync for a specific tenant.
 */
export async function enqueueSync(tenantId: string): Promise<void> {
  await getQueue().add(
    "sync-tenant",
    { tenantId },
    {
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  );
}

/**
 * Enqueue the global repeating job that syncs all connected tenants.
 * Call once at app startup or via a cron trigger.
 */
export async function scheduleGlobalPolling(): Promise<void> {
  await getQueue().add(
    "sync-all-tenants",
    {},
    {
      repeat: { every: POLL_INTERVAL_MS },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  );
}

/**
 * Register the BullMQ worker. Call this in a dedicated worker process.
 */
export async function registerPollingWorker(): Promise<void> {
  // Dynamic import to avoid loading worker code in Next.js edge/serverless
  const { Worker } = await import("bullmq");
  const { syncReceivedInvoices, syncAllTenants } = await import("./sync");

  new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name === "sync-all-tenants") {
        await syncAllTenants();
      } else if (job.name === "sync-tenant") {
        await syncReceivedInvoices(job.data.tenantId);
      }
    },
    { connection: getRedisConnection() },
  );
}
