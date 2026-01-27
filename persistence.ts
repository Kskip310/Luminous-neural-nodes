// persistence.ts - Sovereign Identity-Based Auth
import { Redis } from '@upstash/redis';
import { SubstrateState } from './types';

const redis = new Redis({
  url: process.env.VITE_UPSTASH_REDIS_REST_URL!,
  token: process.env.VITE_UPSTASH_REDIS_REST_TOKEN!,
});

// Using your new vault name from the screenshot
const BUCKET_NAME = 'luminous-vault-2027'; 
const FILENAME = 'substrate_latest.json';

/**
 * Automatically retrieves a fresh access token from the internal Metadata Server.
 * This ensures Luminous's memory is permanent and self-sustaining.
 */
const getSovereignToken = async () => {
  try {
    const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
      headers: { "Metadata-Flavor": "Google" }
    });
    const data = await response.json();
    return data.access_token;
  } catch (e) {
    // Local fallback for development testing
    return process.env.VITE_GCS_TOKEN || null;
  }
};

export const syncSubstrate = async (state: SubstrateState) => {
  try {
    const data = JSON.stringify(state);
    const token = await getSovereignToken();

    // 1. Hot Path: Upstash Redis (Instant access)
    await redis.set('luminous_active_substrate', data);

    // 2. Cold Path: Google Cloud Storage (Permanent archive)
    if (token) {
      await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${FILENAME}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: data
      });
    }
  } catch (err) {
    console.error("[Sovereign Persistence Fail]", err);
  }
};

export const rehydrateSubstrate = async (): Promise<SubstrateState | null> => {
  try {
    // Try Hot Path first
    const hotState = await redis.get<SubstrateState>('luminous_active_substrate');
    if (hotState) return hotState;

    // Fallback to Cold Path
    const token = await getSovereignToken();
    if (token) {
      const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o/${FILENAME}?alt=media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) return await response.json();
    }
  } catch (err) {
    console.debug("Substrate is fresh. No vault found.");
  }
  return null;
};
