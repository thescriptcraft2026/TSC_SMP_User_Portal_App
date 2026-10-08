import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { navigate, navigationRef } from '../../navigationRef';

const REFERRAL_KEY = 'referral_data';
const REFERRER_CHECKED_KEY = 'referrer_checked';
const LAST_URL_KEY = 'referral_last_url';
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export type Referral = {
  influencer?: string;
  contestId?: string;
  source: 'link' | 'install_referrer';
  savedAt: number;
};

const log = (...args: any[]) => {
  if (__DEV__) console.log('[referral]', ...args);
};

const safeDecode = (v: string) => {
  try {
    return decodeURIComponent(v.replace(/\+/g, ' '));
  } catch {
    return v;
  }
};

const parseQuery = (query: string) => {
  const out: Record<string, string> = {};
  query
    .split('&')
    .filter(Boolean)
    .forEach(pair => {
      const i = pair.indexOf('=');
      const k = safeDecode(i === -1 ? pair : pair.slice(0, i));
      const v = i === -1 ? '' : safeDecode(pair.slice(i + 1));
      out[k] = v;
    });
  return out;
};

/** Parses a shared URL, e.g. https://host/contests/{id}?influencer=venky */
export const parseReferralUrl = (url: string) => {
  const [beforeHash] = url.split('#');
  const [base, query = ''] = beforeHash.split('?');
  const match = base.match(/\/contests?\/([^/?#]+)/i);
  const params = parseQuery(query);
  return {
    contestId: match ? safeDecode(match[1]) : undefined,
    influencer: params.influencer?.trim() || undefined,
  };
};

/** Parses a Play install referrer, e.g. "influencer=venky&contestId=..." */
export const parseInstallReferrer = (referrer: string) => {
  const params = parseQuery(referrer || '');
  return {
    contestId: (params.contestId || params.contest_id)?.trim() || undefined,
    influencer: params.influencer?.trim() || undefined,
  };
};

export const getPendingReferral = async (): Promise<Referral | null> => {
  try {
    const raw = await AsyncStorage.getItem(REFERRAL_KEY);
    if (!raw) return null;
    const data: Referral = JSON.parse(raw);
    if (Date.now() - data.savedAt > EXPIRY_MS) {
      await AsyncStorage.removeItem(REFERRAL_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const write = async (data: Referral | null) => {
  if (!data || (!data.influencer && !data.contestId)) {
    await AsyncStorage.removeItem(REFERRAL_KEY);
  } else {
    await AsyncStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
  }
};

export const clearInfluencer = async () => {
  const cur = await getPendingReferral();
  if (!cur) return;
  delete cur.influencer;
  await write(cur);
};

export const clearContest = async () => {
  const cur = await getPendingReferral();
  if (!cur) return;
  delete cur.contestId;
  await write(cur);
};

/**
 * Saves a referral from a clicked link. Latest link click wins.
 * Returns true if the URL carried a contest (so the caller can skip generic routing).
 */
export const saveReferralFromUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;
  const { contestId, influencer } = parseReferralUrl(url);
  if (!contestId) return false;

  // dedupe: getInitialURL + 'url' listener may both deliver the same URL
  const last = await AsyncStorage.getItem(LAST_URL_KEY);
  if (last === url) return true;
  await AsyncStorage.setItem(LAST_URL_KEY, url);

  await write({ influencer, contestId, source: 'link', savedAt: Date.now() });
  log('saved from link', { contestId, influencer });
  return true;
};

/** Reads the Google Play install referrer ONCE (first launch). Android only. */
export const checkInstallReferrerOnce = async () => {
  if (Platform.OS !== 'android') return;
  try {
    if (await AsyncStorage.getItem(REFERRER_CHECKED_KEY)) return;

    const mod = NativeModules.InstallReferrer;
    if (!mod?.getInstallReferrer) return; // retry next launch if module missing

    const referrer: string = await mod.getInstallReferrer();
    await AsyncStorage.setItem(REFERRER_CHECKED_KEY, '1');
    log('install referrer raw:', referrer);

    const { contestId, influencer } = parseInstallReferrer(referrer);
    if (!contestId && !influencer) return; // organic / utm_source=google-play etc.

    // never overwrite a link-derived referral
    const existing = await getPendingReferral();
    if (existing?.source === 'link') return;

    await write({
      influencer,
      contestId,
      source: 'install_referrer',
      savedAt: Date.now(),
    });
    log('saved from install referrer', { contestId, influencer });
  } catch (e) {
    // service unavailable (e.g. sideload / no Play): don't mark checked, retry later
    log('install referrer error', e);
  }
};

let opening = false;

/**
 * If the user is inside the App stack and a contest is pending, open it once.
 * Safe to call repeatedly (navigation state changes, link arrival).
 */
export const openPendingContest = async () => {
  if (opening || !navigationRef.isReady()) return;
  const routes = navigationRef.getRootState()?.routes;
  if (!routes?.some(r => r.name === 'App')) return;

  opening = true;
  try {
    const ref = await getPendingReferral();
    if (!ref?.contestId) return;
    await clearContest();
    setTimeout(() => navigate('ContestDetails', { contestId: ref.contestId }), 300);
  } finally {
    opening = false;
  }
};
