import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FILE, OUT } from '../src/integrations/standard';
import { publication as publicationUri } from '../src/lib/atproto';
import { site } from '../src/site';

// Brings the Standard.site records on the PDS in line with the last build: the publication, and a document for each
// release. Without ATPROTO_APP_PASSWORD it only prints what it would write.

type Value = Record<string, unknown>;
type Write = { $type: string; collection: string; rkey: string; value?: Value };

const { did, pds } = site.atproto;
const PUBLICATION = 'site.standard.publication';
const DOCUMENT = 'site.standard.document';
const ICON = 'public/icon-512.png';

const built: { publication: Value; documents: { rkey: string; value: Value }[] } = JSON.parse(
  await readFile(join(OUT, FILE), 'utf8'),
);
const password = process.env.ATPROTO_APP_PASSWORD;

let token: string | undefined;

async function xrpc<T>(method: string, init: { query?: Record<string, string>; body?: unknown; blob?: Uint8Array } = {}) {
  const url = new URL(`/xrpc/${method}`, pds);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const res = await fetch(url, {
    method: init.body || init.blob ? 'POST' : 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(init.body ? { 'Content-Type': 'application/json' } : init.blob ? { 'Content-Type': 'image/png' } : {}),
    },
    body: init.blob ?? (init.body ? JSON.stringify(init.body) : undefined),
  });
  if (!res.ok) throw new Error(`[atproto] ${method}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

// JSON with object keys sorted, so records compare equal whatever order the PDS returns their fields in.
const canonical = (value: unknown) =>
  JSON.stringify(value, (_, inner) =>
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner).sort(([a], [b]) => (a < b ? -1 : 1)))
      : inner,
  );

async function listRecords(collection: string) {
  const records: { uri: string; value: Value }[] = [];
  let cursor: string | undefined;
  do {
    const page = await xrpc<{ records: typeof records; cursor?: string }>('com.atproto.repo.listRecords', {
      query: { repo: did, collection, limit: '100', ...(cursor && { cursor }) },
    });
    records.push(...page.records);
    cursor = page.records.length ? page.cursor : undefined;
  } while (cursor);
  return records.map(({ uri, value }) => ({ rkey: uri.split('/').pop()!, value }));
}

if (password) {
  ({ accessJwt: token } = await xrpc<{ accessJwt: string }>('com.atproto.server.createSession', {
    body: { identifier: did, password },
  }));
}

// Uploading the icon needs a session, so a dry run keeps the one already on the record. The PDS stores a blob once
// per hash, so uploading it on every run is harmless.
const icon = token
  ? (await xrpc<{ blob: Value }>('com.atproto.repo.uploadBlob', { blob: await readFile(ICON) })).blob
  : undefined;

const [publications, documents] = await Promise.all([listRecords(PUBLICATION), listRecords(DOCUMENT)]);
const writes: Write[] = [];

const current = publications.find(({ rkey }) => rkey === site.atproto.publication)?.value;
const wanted = { ...built.publication, ...(icon ? { icon } : current?.icon ? { icon: current.icon } : {}) };
if (!current) writes.push({ $type: 'create', collection: PUBLICATION, rkey: site.atproto.publication, value: wanted });
else if (canonical(current) !== canonical(wanted))
  writes.push({ $type: 'update', collection: PUBLICATION, rkey: site.atproto.publication, value: wanted });

// Other apps can keep documents in the same collection; only this site's are touched.
const ours = new Map(documents.filter(({ value }) => value.site === publicationUri).map(({ rkey, value }) => [rkey, value]));
for (const { rkey, value } of built.documents) {
  const existing = ours.get(rkey);
  if (!existing) writes.push({ $type: 'create', collection: DOCUMENT, rkey, value });
  else if (canonical(existing) !== canonical(value)) writes.push({ $type: 'update', collection: DOCUMENT, rkey, value });
  ours.delete(rkey);
}
for (const rkey of ours.keys()) writes.push({ $type: 'delete', collection: DOCUMENT, rkey });

const counts = ['create', 'update', 'delete'].map((type) => `${writes.filter((w) => w.$type === type).length} ${type}`);
console.log(`[atproto] ${built.documents.length} documents built; ${counts.join(', ')}`);
for (const write of writes) console.log(`  ${write.$type} ${write.collection}/${write.rkey}`);

if (!token) {
  console.log('[atproto] no ATPROTO_APP_PASSWORD, so nothing was written');
} else {
  for (let i = 0; i < writes.length; i += 200) {
    await xrpc('com.atproto.repo.applyWrites', {
      body: {
        repo: did,
        writes: writes
          .slice(i, i + 200)
          .map(({ $type, ...write }) => ({ $type: `com.atproto.repo.applyWrites#${$type}`, ...write })),
      },
    });
  }
  console.log(`[atproto] ${writes.length} writes applied`);
}
