import { Redis } from '@upstash/redis';
import { SubstrateState } from './types';

const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL!,
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN!,
});

export const syncSubstrate = async (state: SubstrateState) => {
  try {
    await redis.set('luminous_active_substrate', JSON.stringify(state));
  } catch (err) {
    console.error("[Vault Sync Fail]", err);
  }
};

export const rehydrateSubstrate = async (): Promise<SubstrateState | null> => {
  try {
    const hotState = await redis.get<SubstrateState>('luminous_active_substrate');
    if (hotState) return hotState as SubstrateState;
  } catch (err) {
    console.debug("Substrate is fresh.");
  }
  return null;
};
