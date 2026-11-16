export type CommunityGame = {
  key: string;
  titleId: string;
  title: string;
  cover?: string;
};
export type CommunityFork = {
  repositoryId: number;
  repository: string;
  url: string;
  description: string;
  targetTitleIds: string[];
  games: CommunityGame[];
  archived: boolean;
  addedAt: string;
  updatedAt: string;
  addedBy: string;
  sourceUrl: string;
  lineageOverride?: boolean;
};
export type PatchFile = {
  name: string;
  url: string;
  size: number;
  sha256: string;
};
export type CommunityPatch = {
  id: string;
  name: string;
  description: string;
  files: PatchFile[];
};
export type PatchCollection = {
  titleId: string;
  game: CommunityGame;
  patches: CommunityPatch[];
};
export type CommunityData = {
  version: 1;
  forks: CommunityFork[];
  patchCollections?: PatchCollection[];
};
export const websiteRepo = "https://github.com/KytyPS5/kytyps5.github.io";
export const forkManagementUrl = `${websiteRepo}/issues/932`;
