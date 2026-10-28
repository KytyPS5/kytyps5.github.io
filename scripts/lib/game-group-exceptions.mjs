// Deliberate product exception to concept-based grouping. All other titles,
// translations, editions and demos retain the original grouping policy.
// Sony concept 235235 includes both Village and this separate visual demo.
const MAIDEN_IDS = new Set([
  "PPSA01856",
  "PPSA01857",
  "PPSA01858",
  "PPSA01859",
]);

export function catalogGroupKey(game) {
  const id = String(game.titleId ?? "")
    .replace(/_\d{2}$/, "")
    .toUpperCase();
  return Number(game.conceptId) === 235235 && MAIDEN_IDS.has(id)
    ? "235235:maiden"
    : game.conceptId;
}

export function withGroupMetadata(game) {
  if (catalogGroupKey(game) !== "235235:maiden") return game;
  // Product metadata, rather than the concept's default full-game metadata.
  // https://store.playstation.com/en-us/product/UP0102-PPSA01858_00-DEMOVILLAGE00001
  return {
    ...game,
    name: "MAIDEN",
    cover:
      "https://image.api.playstation.com/vulcan/ap/rnd/202101/0813/mjtDBltmb4XyEjR599l1pRFa.png",
    publisher: "Capcom U.S.A., Inc.",
    releaseDate: "2021-01-21T23:00:00Z",
    genres: ["Action", "Horror"],
    enriched: true,
  };
}
