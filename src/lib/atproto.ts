import { site } from '../site';

const S32 = '234567abcdefghijklmnopqrstuvwxyz';

// A record key in atproto's TID format, made from a date (and a seed for the clock bits) so that the same post
// always gets the same key and pages can link to their records without asking the PDS.
export function tid(date: Date, seed = '') {
  const clock = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1024, 0);
  let value = ((BigInt(date.getTime()) * 1000n) << 10n) | BigInt(clock);
  let key = '';
  for (let i = 0; i < 13; i++) {
    key = S32[Number(value & 31n)] + key;
    value >>= 5n;
  }
  return key;
}

const uri = (collection: string, rkey: string) => `at://${site.atproto.did}/${collection}/${rkey}`;

export const publication = uri('site.standard.publication', site.atproto.publication);

export const documentKey = (date: Date, path: string) => tid(date, path);

export const documentUri = (date: Date, path: string) => uri('site.standard.document', documentKey(date, path));
