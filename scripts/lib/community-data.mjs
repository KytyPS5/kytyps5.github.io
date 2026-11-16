import {
  lstat,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { titleId, validateForkRegistry } from "./forks.mjs";

export function gameResolver(catalog) {
  const games = new Map();
  for (const game of catalog)
    for (const id of [game.titleId, ...(game.allTitleIds ?? [])])
      games.set(titleId(id), game);
  return (id) => {
    const key = titleId(id),
      game = games.get(key);
    return {
      key: game?.titleId ?? key,
      titleId: key,
      title: game?.name ?? key,
      ...(game?.cover ? { cover: game.cover } : {}),
    };
  };
}

/** Fork associations have their own source; reports never enter here. */
export async function buildCommunityData({
  root = process.cwd(),
  catalog,
  registry,
}) {
  validateForkRegistry(registry);
  const game = gameResolver(catalog);
  return {
    data: {
      version: 1,
      forks: registry.forks.map((fork) => ({
        ...fork,
        games: [
          ...new Map(
            fork.targetTitleIds.map((id) => {
              const target = game(id);
              return [target.key, target];
            }),
          ).values(),
        ],
      })),
      patchCollections: [],
    },
    copies: [],
  };
}

export async function exportCommunityData(root = process.cwd()) {
  root = await realpath(path.resolve(root));
  const catalog = JSON.parse(
    await readFile(path.join(root, "src/data/games.json"), "utf8"),
  );
  const registry = JSON.parse(
    await readFile(path.join(root, "src/data/forks.json"), "utf8"),
  );
  const { data } = await buildCommunityData({
    root,
    catalog,
    registry,
  });
  const publicRoot = path.join(root, "public");
  await mkdir(publicRoot, { recursive: true });
  if ((await realpath(publicRoot)) !== publicRoot)
    throw new Error(
      "The generated public directory must be inside the project.",
    );
  const legacyPatchOutput = path.join(publicRoot, "patch-files");
  try {
    const info = await lstat(legacyPatchOutput);
    if (!info.isSymbolicLink()) {
      await rm(legacyPatchOutput, { recursive: true, force: true });
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await mkdir(path.join(publicRoot, "data"), { recursive: true });
  await writeFile(
    path.join(publicRoot, "data/community.json"),
    JSON.stringify(data) + "\n",
  );
  return data;
}
