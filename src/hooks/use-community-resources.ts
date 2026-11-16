import { cachedJson } from "../lib/cache";
import type {
  CommunityData,
  CommunityGame,
  PatchFile,
} from "../data/community-types";
import { useRefreshingData } from "./use-refreshing-data";

function validGame(game: CommunityGame) {
  return Boolean(
    game &&
    /^PPSA\d{5}$/.test(game.key) &&
    /^PPSA\d{5}$/.test(game.titleId) &&
    typeof game.title === "string",
  );
}
function validFile(file: PatchFile) {
  if (
    !file ||
    typeof file.name !== "string" ||
    !Number.isFinite(file.size) ||
    file.size < 0 ||
    !/^[a-f0-9]{64}$/.test(file.sha256) ||
    !/^\/patch-files\/[^?#]+\.zip\?v=[a-f0-9]{16}$/i.test(file.url)
  )
    return false;
  try {
    return file.url
      .split("?")[0]
      .split("/")
      .slice(2)
      .every((segment) => {
        const decoded = decodeURIComponent(segment);
        return (
          decoded !== "." &&
          decoded !== ".." &&
          !/[\/\\\x00-\x1f]/.test(decoded)
        );
      });
  } catch {
    return false;
  }
}

async function loadCommunityResources(force = false) {
  return cachedJson<CommunityData>("/data/community.json", {
    maxAge: 300_000,
    force,
    parse: async (response) => {
      const data = await response.json();
      if (
        data?.version !== 1 ||
        !Array.isArray(data.forks) ||
        !data.forks.every(
          (fork: CommunityData["forks"][number]) =>
            fork &&
            typeof fork.repository === "string" &&
            typeof fork.description === "string" &&
            Number.isSafeInteger(fork.repositoryId) &&
            typeof fork.updatedAt === "string" &&
            Array.isArray(fork.games) &&
            fork.games.every(validGame) &&
            Array.isArray(fork.targetTitleIds) &&
            fork.targetTitleIds.every((id) => /^PPSA\d{5}$/.test(id)) &&
            /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/.test(fork.url),
        ) ||
        (data.patchCollections !== undefined &&
          (!Array.isArray(data.patchCollections) ||
            !data.patchCollections.every(
              (collection: NonNullable<CommunityData["patchCollections"]>[number]) =>
                collection &&
                validGame(collection.game) &&
                /^PPSA\d{5}$/.test(collection.titleId) &&
                Array.isArray(collection.patches) &&
                collection.patches.every(
                  (patch) =>
                    patch &&
                    typeof patch.id === "string" &&
                    typeof patch.name === "string" &&
                    typeof patch.description === "string" &&
                    Array.isArray(patch.files) &&
                    patch.files.length > 0 &&
                    patch.files.every(validFile),
                ),
            )))
      )
        throw new Error("Invalid community resources.");
      return data;
    },
  });
}
export function useCommunityResources() {
  return useRefreshingData<CommunityData | null>(null, loadCommunityResources);
}
