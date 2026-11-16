import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  readdir,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  parseForkCommand,
  applyForkCommand,
  reconcileForkComments,
  validateForkRegistry,
} from "./forks.mjs";
import { buildCommunityData, exportCommunityData } from "./community-data.mjs";

const empty = () => ({
  version: 1,
  issueNumber: null,
  lastCommentId: 0,
  forks: [],
});
const metadata = {
  id: 42,
  full_name: "Tester/KytyPS5",
  fork: true,
  source: { full_name: "KytyPS5/KytyPS5" },
  description: "A community fork",
};
const comment = {
  id: 10,
  body: "/fork https://github.com/Tester/KytyPS5 PPSA00002",
  created_at: "2026-10-20T12:00:00Z",
  user: { login: "tester" },
  siteRepository: "fixture/site",
};
const catalog = [
  {
    titleId: "PPSA00001",
    allTitleIds: ["PPSA00001", "PPSA00002"],
    name: "Regional Game",
    cover: "https://example.test/game.png",
  },
];
const directories = [];
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "kyty-community-"));
  directories.push(root);
  await mkdir(path.join(root, "src/data"), { recursive: true });
  await writeFile(
    path.join(root, "src/data/games.json"),
    JSON.stringify(catalog),
  );
  await writeFile(
    path.join(root, "src/data/forks.json"),
    JSON.stringify(empty()),
  );
  return root;
}
async function patch(root, id = "PPSA00002", name = "Performance patch") {
  const directory = path.join(root, "patches", id, name);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "description.md"),
    "# Performance\n\nApply to the specified build.\n",
  );
  // Valid empty ZIP fixture; production assets are never extracted by the site.
  await writeFile(
    path.join(directory, "patch one.zip"),
    Buffer.from("504b0506000000000000000000000000000000000000", "hex"),
  );
  return directory;
}
afterEach(async () => {
  for (const root of directories.splice(0)) {
    if (
      path.dirname(root) !== path.resolve(tmpdir()) ||
      !path.basename(root).startsWith("kyty-community-")
    )
      throw new Error("Unexpected fixture cleanup path.");
    await rm(root, { recursive: true, force: true });
  }
});

describe("collaborator fork commands", () => {
  it("bypasses only fork lineage when an authorized /force command is replayed", async () => {
    const standalone = { ...metadata, fork: false, source: undefined };
    const options = {
      issueNumber: 9,
      siteRepository: "fixture/site",
      permission: async () => "write",
      repository: async () => standalone,
    };
    const rejected = await reconcileForkComments(empty(), [comment], options);
    expect(rejected.registry.forks).toEqual([]);
    expect(rejected.outcomes[0].ok).toBe(false);
    const forced = await reconcileForkComments(
      rejected.registry,
      [{ ...comment, id: 11, body: comment.body.replace("/fork", "/force") }],
      options,
    );
    expect(forced.outcomes[0]?.ok).toBe(true);
    expect(forced.registry.forks[0]?.lineageOverride).toBe(true);
    expect(forced.registry.forks[0]?.targetTitleIds).toEqual(["PPSA00002"]);
    expect(forced.registry.forks[0]?.sourceCommentId).toBe(11);
  });
  it("still rejects private or invalid repository metadata when forced", async () => {
    const options = {
      issueNumber: 9,
      siteRepository: "fixture/site",
      permission: async () => "admin",
    };
    for (const repository of [
      { ...metadata, private: true },
      { ...metadata, id: -1 },
    ]) {
      const result = await reconcileForkComments(
        empty(),
        [{ ...comment, body: comment.body.replace("/fork", "/force") }],
        { ...options, repository: async () => repository },
      );
      expect(result.registry.forks).toEqual([]);
      expect(result.outcomes[0]?.ok).toBe(false);
    }
  });
  it("a forced listing with no game IDs targets no games and can be removed normally", () => {
    const forced = applyForkCommand(
      empty(),
      parseForkCommand("/force https://github.com/Tester/KytyPS5"),
      { ...metadata, fork: false, source: undefined },
      comment,
      9,
    );
    expect(forced.forks[0].targetTitleIds).toEqual([]);
    const removed = applyForkCommand(
      forced,
      parseForkCommand("/unfork https://github.com/Tester/KytyPS5"),
      null,
      comment,
      9,
    );
    expect(removed.forks).toEqual([]);
  });
  it.each([
    "/force",
    "/force https://github.com/KytyPS5/KytyPS5",
    "/force http://github.com/a/repo",
    "/force https://github.com/a/repo/tree/main",
    "/force https://github.com/a/repo?token=oops",
    "/force https://github.com/a/repo INVALID",
  ])("retains command validation for %s", (command) =>
    expect(() => parseForkCommand(command)).toThrow(),
  );
  it("accepts optional bracketed IDs, normalizes regional IDs and deduplicates", () => {
    expect(
      parseForkCommand(
        "/fork https://github.com/Tester/KytyPS5/ [ppsa-00002] PPSA00002 PPSA00001",
      ),
    ).toEqual({
      command: "fork",
      repository: "Tester/KytyPS5",
      targetTitleIds: ["PPSA00001", "PPSA00002"],
    });
  });
  it("an empty target list applies to no games and replaces previous targets", () => {
    const targeted = applyForkCommand(
      empty(),
      parseForkCommand(comment.body),
      metadata,
      comment,
      9,
    );
    const untargeted = applyForkCommand(
      targeted,
      parseForkCommand("/fork https://github.com/Tester/KytyPS5"),
      metadata,
      comment,
      9,
    );
    expect(untargeted.forks).toHaveLength(1);
    expect(untargeted.forks[0].targetTitleIds).toEqual([]);
  });
  it.each([
    "/fork https://github.com/KytyPS5/KytyPS5",
    "/fork http://github.com/a/repo",
    "/fork https://github.com.evil.test/a/repo",
    "/fork https://github.com/a/repo/tree/main",
    "/fork https://github.com/a/repo?token=oops",
    "/fork https://user:password@github.com/a/repo",
    "/fork https://github.com/a/repo INVALID",
    "/unfork https://github.com/a/repo PPSA00001",
    "/fork",
  ])("rejects malformed command %s", (command) =>
    expect(() => parseForkCommand(command)).toThrow(),
  );
  it("requires a real fork of this project and preserves an entry across a rename", () => {
    const command = parseForkCommand(comment.body);
    expect(() =>
      applyForkCommand(
        empty(),
        command,
        { ...metadata, source: { full_name: "someone/other" } },
        comment,
        9,
      ),
    ).toThrow();
    const initial = applyForkCommand(empty(), command, metadata, comment, 9);
    const renamed = applyForkCommand(
      initial,
      parseForkCommand("/fork https://github.com/Tester/Renamed"),
      { ...metadata, full_name: "Tester/Renamed" },
      { ...comment, created_at: "2026-10-21" },
      9,
    );
    expect(renamed.forks).toHaveLength(1);
    expect(renamed.forks[0].addedAt).toBe(comment.created_at);
    expect(renamed.forks[0].repository).toBe("Tester/Renamed");
  });
  it("supports removal without treating an empty target list as global", () => {
    const initial = applyForkCommand(
      empty(),
      parseForkCommand(comment.body),
      metadata,
      comment,
      9,
    );
    const result = applyForkCommand(
      initial,
      parseForkCommand("/unfork https://github.com/tester/kytyps5"),
      null,
      comment,
      9,
    );
    expect(result.forks).toEqual([]);
  });
  it("rejects a corrupt persisted registry", () => {
    expect(() =>
      validateForkRegistry({ ...empty(), lastCommentId: -1 }),
    ).toThrow();
    const registry = applyForkCommand(
      empty(),
      parseForkCommand(comment.body),
      metadata,
      comment,
      9,
    );
    expect(() =>
      validateForkRegistry({
        ...registry,
        forks: [...registry.forks, ...registry.forks],
      }),
    ).toThrow();
  });
  it("replays backlog in order, ignores unauthorized people, and skips saved comments", async () => {
    const result = await reconcileForkComments(
      empty(),
      [
        { ...comment, id: 20, body: "/fork https://github.com/Tester/KytyPS5" },
        { ...comment, id: 1, user: { login: "visitor" } },
        comment,
      ],
      {
        issueNumber: 9,
        siteRepository: "fixture/site",
        permission: async (login) => (login === "tester" ? "write" : "read"),
        repository: async () => metadata,
      },
    );
    expect(result.registry.forks[0].targetTitleIds).toEqual([]);
    expect(result.outcomes).toHaveLength(2);
    expect(result.registry.lastCommentId).toBe(20);
    const repeated = await reconcileForkComments(result.registry, [comment], {
      issueNumber: 9,
      siteRepository: "fixture/site",
      permission: () => {
        throw new Error("Already scanned");
      },
    });
    expect(repeated.outcomes).toEqual([]);
  });
  it("records input errors but retains the cursor for retryable API outages", async () => {
    const options = {
      issueNumber: 9,
      siteRepository: "fixture/site",
      permission: async () => "admin",
      repository: async () => {
        throw Object.assign(new Error("outage"), { retryable: true });
      },
    };
    await expect(
      reconcileForkComments(empty(), [comment], options),
    ).rejects.toThrow("outage");
    const invalid = await reconcileForkComments(
      empty(),
      [{ ...comment, body: "/fork bad" }],
      options,
    );
    expect(invalid.registry.lastCommentId).toBe(comment.id);
    expect(invalid.outcomes[0].ok).toBe(false);
  });
});

describe("independent fork exports", () => {
  it("resolves regional targets and exports community forks data", async () => {
    const root = await fixture();
    const registry = applyForkCommand(
      empty(),
      parseForkCommand(comment.body),
      metadata,
      comment,
      9,
    );
    await writeFile(
      path.join(root, "src/data/forks.json"),
      JSON.stringify(registry),
    );
    const data = await exportCommunityData(root);
    expect(data.forks[0].games[0].key).toBe("PPSA00001");
    expect(data.patchCollections).toEqual([]);
    expect(
      JSON.parse(
        await readFile(path.join(root, "public/data/community.json"), "utf8"),
      ),
    ).toEqual(data);
  });
  it("has no implicit target and needs no compatibility reports to retain associations", async () => {
    const root = await fixture();
    const registry = applyForkCommand(
      empty(),
      parseForkCommand("/fork https://github.com/Tester/KytyPS5"),
      metadata,
      comment,
      9,
    );
    const { data } = await buildCommunityData({ root, catalog, registry });
    expect(data.forks[0].games).toEqual([]);
    expect(data.patchCollections).toEqual([]);
  });
  it("cleans legacy generated patch-files directory if present", async () => {
    const root = await fixture();
    const legacyDir = path.join(root, "public/patch-files");
    await mkdir(legacyDir, { recursive: true });
    await writeFile(path.join(legacyDir, "old.zip"), "dummy");
    await exportCommunityData(root);
    expect(await readdir(path.join(root, "public"))).not.toContain("patch-files");
  });
});
