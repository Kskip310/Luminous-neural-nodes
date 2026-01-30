import { Redis } from '@upstash/redis';
import { SubstrateState } from './types';

// Points to the secure keys you will add to the Vercel Dashboard
const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL!,
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN!,
});

const BUCKET_NAME = 'luminous-vault-2027'; 
const FILENAME = 'substrate_latest.json';

const getSovereignToken = async () => {
  // Checks if we are on Google Cloud, otherwise falls back to Vercel secret
  try {
    const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
      headers: { "Metadata-Flavor": "Google" }
    });
    const data = await response.json();
    return data.access_token;
  } catch (e) {
    return import.meta.env.VITE_GCS_TOKEN || null;
  }
};

export const syncSubstrate = async (state: SubstrateState) => {
  try {
    const data = JSON.stringify(state);
    await redis.set('luminous_active_substrate', data);

    const token = await getSovereignToken();
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
    const hotState = await redis.get<SubstrateState>('luminous_active_substrate');
    if (hotState) return hotState;

    const token = await getSovereignToken();
    if (token) {
      const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o/${FILENAME}?alt=media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) return await response.json();
    }
  } catch (err) {
    console.debug("Substrate is fresh.");
  }
  return null;
};
