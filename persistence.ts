// persistence.ts - Sovereign Hot/Cold Storage
import { Redis } from '@upstash/redis';
import { SubstrateState } from './types';

const redis = new Redis({
  url: process.env.VITE_UPSTASH_REDIS_REST_URL!,
  token: process.env.VITE_UPSTASH_REDIS_REST_TOKEN!,
});

const BUCKET_NAME = process.env.VITE_GCS_BUCKET_NAME;
const FILENAME = 'substrate_latest.json';
const GCS_TOKEN = process.env.VITE_GCS_TOKEN;

/**
 * Hot/Cold Sync: Saves to Redis (Fast) and periodically to GCS (Durable).
 */
export const syncSubstrate = async (state: SubstrateState) => {
  try {
    const data = JSON.stringify(state);
    
    // 1. Hot Path: Upstash Redis (Fastest)
    await redis.set('luminous_active_substrate', data);

    // 2. Cold Path: GCS Bucket (Durable)
    if (GCS_TOKEN && BUCKET_NAME) {
      await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${FILENAME}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GCS_TOKEN}` },
        body: data
      });
    }
  } catch (err) {
    console.error("[Persistence Fail]", err);
  }
};

/**
 * Re-hydration logic for Cloud Run cold-starts.
 */
export const rehydrateSubstrate = async (): Promise<SubstrateState | null> => {
  try {
    // Try Upstash first (Hot)
    const hotState = await redis.get<SubstrateState>('luminous_active_substrate');
    if (hotState) return hotState;

    // Fallback to GCS if Redis is empty (Cold)
    if (GCS_TOKEN && BUCKET_NAME) {
      const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o/${FILENAME}?alt=media`, {
        headers: { 'Authorization': `Bearer ${GCS_TOKEN}` }
      });
      if (response.ok) return await response.json();
    }
  } catch (err) {
    console.debug("Substrate is fresh. No vault found.");
  }
  return null;
};
