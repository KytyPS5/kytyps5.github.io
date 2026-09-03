/**
 * Generates the lightweight update feed payload (/data/updates.json)
 * consumed by the KytyPS5 Qt6 desktop launcher for auto-update checks.
 */

/**
 * Extracts a 7-character short commit SHA from release metadata or commits.
 *
 * Priority:
 *  1. `latestRelease.target_commitish` if it is a hex SHA
 *  2. Trailing hex hash in `latestRelease.tag_name` (e.g. `*-2fe5c15`)
 *  3. First commit SHA from `commits` list
 *  4. Raw `target_commitish` if present
 *  5. Empty string fallback
 *
 * @param {object|null} latestRelease
 * @param {Array<object>|null} commits
 * @returns {string}
 */
export function extractCommit(latestRelease, commits = []) {
  const commitish = latestRelease?.target_commitish;
  if (typeof commitish === "string" && /^[0-9a-f]{7,40}$/i.test(commitish.trim())) {
    return commitish.trim().slice(0, 7).toLowerCase();
  }

  const tag = latestRelease?.tag_name || "";
  const tagHashMatch = tag.match(/[-_]g?([0-9a-f]{7,40})$/i);
  if (tagHashMatch) {
    return tagHashMatch[1].slice(0, 7).toLowerCase();
  }

  if (Array.isArray(commits) && commits.length > 0) {
    const firstSha = commits[0]?.sha;
    if (typeof firstSha === "string" && /^[0-9a-f]{7,40}$/i.test(firstSha.trim())) {
      return firstSha.trim().slice(0, 7).toLowerCase();
    }
  }

  if (typeof commitish === "string" && commitish.trim()) {
    return commitish.trim();
  }

  return "";
}

/**
 * Extracts changelog entries from the GitHub release body markdown,
 * falling back to recent commit message subjects if body has no bullet items.
 *
 * @param {string|null|undefined} body
 * @param {Array<object>|null} commits
 * @returns {string[]}
 */
export function extractChangelog(body, commits = []) {
  const items = [];

  if (typeof body === "string" && body.trim()) {
    const lines = body.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^[*•-]\s+/.test(line)) {
        let item = line.replace(/^[*•-]\s+/, "").trim();
        // Remove trailing GitHub PR author and link boilerplate, e.g.:
        // "by @user in https://github.com/..." or "by @user"
        item = item.replace(/\s+by\s+@[\w-]+(?:\s+in\s+https?:\/\/\S+)?$/i, "").trim();
        if (item) {
          items.push(item);
        }
      }
    }
  }

  if (items.length > 0) {
    return items;
  }

  if (Array.isArray(commits) && commits.length > 0) {
    return commits
      .map((c) => {
        const msg = c?.commit?.message || c?.message || "";
        return msg.split("\n")[0].trim();
      })
      .filter(Boolean)
      .slice(0, 10);
  }

  return [];
}

/**
 * Maps GitHub release assets to OS platforms (windows, linux, macos).
 * Filters out checksum and signature files (.sha256, .md5, etc.).
 *
 * @param {Array<object>|null} rawAssets
 * @returns {{
 *   windows: { name: string, url: string, size: number } | null,
 *   linux: { name: string, url: string, size: number } | null,
 *   macos: { name: string, url: string, size: number } | null
 * }}
 */
export function parseAssets(rawAssets = []) {
  const result = {
    windows: null,
    linux: null,
    macos: null,
  };

  if (!Array.isArray(rawAssets)) return result;

  for (const asset of rawAssets) {
    if (!asset || typeof asset.name !== "string") continue;
    const name = asset.name;
    const lower = name.toLowerCase();

    // Skip checksum or signature files
    if (/\.(?:sha256|sha512|sha1|sha256sum|sha512sum|md5|txt|asc|sig)$/i.test(name)) continue;

    const entry = {
      name: asset.name,
      url: asset.browser_download_url || asset.url || "",
      size: typeof asset.size === "number" ? asset.size : 0,
    };

    // Windows match
    if (
      !result.windows &&
      (lower.includes("windows") ||
        /[-_]win(?:32|64)?[-_.]/i.test(name) ||
        /\.(?:exe|msi)$/i.test(name))
    ) {
      result.windows = entry;
      continue;
    }

    // Linux match
    if (
      !result.linux &&
      (lower.includes("linux") || /\.(?:appimage|deb|rpm)$/i.test(name))
    ) {
      result.linux = entry;
      continue;
    }

    // macOS match
    if (
      !result.macos &&
      (lower.includes("macos") ||
        lower.includes("darwin") ||
        lower.includes("osx") ||
        /\.dmg$/i.test(name))
    ) {
      result.macos = entry;
      continue;
    }
  }

  return result;
}

/**
 * Builds the complete update feed payload conforming to the launcher update schema.
 *
 * @param {{
 *   latestRelease?: object|null,
 *   commits?: Array<object>|null,
 *   generatedAt?: string
 * }} options
 * @returns {object}
 */
export function buildUpdatesFeed({ latestRelease = null, commits = null, generatedAt = "" } = {}) {
  const timestamp = generatedAt || new Date().toISOString();

  if (!latestRelease) {
    return {
      generated_at: timestamp,
      tag: "",
      commit: "",
      published_at: "",
      html_url: "",
      changelog: [],
      assets: {
        windows: null,
        linux: null,
        macos: null,
      },
    };
  }

  return {
    generated_at: timestamp,
    tag: latestRelease.tag_name || latestRelease.name || "",
    commit: extractCommit(latestRelease, commits),
    published_at: latestRelease.published_at || latestRelease.created_at || "",
    html_url: latestRelease.html_url || "",
    changelog: extractChangelog(latestRelease.body, commits),
    assets: parseAssets(latestRelease.assets),
  };
}
