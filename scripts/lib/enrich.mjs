// Adapted from 's scripts/lib/enrich.mjs (MIT, © 2026  contributors).
// https://github.com//

// Persisted-query hash for the store's metGetConceptById operation.
// If the import fails with "persisted-query hash rejected (HTTP 400)": open a
// PS5 game page on store.playstation.com with devtools → Network, filter
// `metGetConceptById`, copy extensions.persistedQuery.sha256Hash, and update
// this constant. [maintainer input]
const PSN_HASH = "cc90404ac049d935afbd9968aef523da2b6723abfb9d586e5f77ebf7c5289006";

/** Merge a PSN concept's metadata into a game entry. */
export function applyEnrichment(game, concept) {
  // A missing/stale concept is NOT a permanent state: mark the game noStore but
  // leave it unenriched so a later run retries it (the US concept for Neptunia
  // ReVerse returned null for months, which used to lock it out of ever getting
  // its cover). enrich.mjs only processes unenriched games, so these re-enter
  // the pending pool automatically.
  if (!concept) return { ...game, noStore: true };
  const media = concept.media ?? [];
  const cover =
    media.find((m) => m.role === "GAMEHUB_COVER_ART")?.url ??
    media.find((m) => m.role === "MASTER")?.url;
  return {
    ...game,
    name: concept.invariantName || concept.name || game.name,
    cover,
    publisher: concept.publisherName ?? undefined,
    releaseDate: concept.releaseDate?.value ?? undefined,
    genres: (concept.combinedLocalizedGenres ?? []).map((g) => g.value),
    enriched: true,
  };
}

/** Refuse to silently truncate the database on an upstream change. */
export function guardShrink(freshLen, existingLen, force) {
  if (force || existingLen === 0) return;
  if (freshLen < existingLen * 0.95) {
    throw new Error(
      `games list shrank ${existingLen} → ${freshLen}; upstream truncation? Re-run with --force to accept.`,
    );
  }
}

/** Fetch a concept from the public PlayStation Store GraphQL endpoint. */
export async function fetchConcept(conceptId, { retries = 2 } = {}) {
  const variables = encodeURIComponent(JSON.stringify({ conceptId: String(conceptId) }));
  const extensions = encodeURIComponent(
    JSON.stringify({ persistedQuery: { version: 1, sha256Hash: PSN_HASH } }),
  );
  const url = `https://web.np.playstation.com/api/graphql/v1/op?operationName=metGetConceptById&variables=${variables}&extensions=${extensions}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "content-type": "application/json" } });
      if (res.status === 400) {
        throw new Error(
          "PSN persisted-query hash rejected (HTTP 400). Refresh PSN_HASH from the live store — see README \"Refreshing the PSN query hash\".",
        );
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      return body.data?.conceptRetrieve ?? null;
    } catch (err) {
      if (attempt >= retries || String(err).includes("hash rejected")) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
}
