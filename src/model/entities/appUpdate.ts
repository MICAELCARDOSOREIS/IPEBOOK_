export type AppVersionPolicy = {
  platform: "android";
  latestVersion: string;
  minSupportedVersion: string;
  releaseNotes: string | null;
  storeUrl: string;
};

export type AppUpdateStatus = "up_to_date" | "optional" | "required";

export type AppUpdateResult = {
  status: AppUpdateStatus;
  policy: AppVersionPolicy | null;
};

function parseSemver(version: string): [number, number, number] | null {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareSemver(left: string, right: string): number {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a || !b) return 0;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

export function evaluateAppUpdateStatus(
  installedVersion: string,
  policy: AppVersionPolicy,
): AppUpdateStatus {
  if (
    !parseSemver(installedVersion) ||
    !parseSemver(policy.latestVersion) ||
    !parseSemver(policy.minSupportedVersion)
  ) {
    return "up_to_date";
  }
  if (compareSemver(installedVersion, policy.minSupportedVersion) < 0) return "required";
  if (compareSemver(installedVersion, policy.latestVersion) < 0) return "optional";
  return "up_to_date";
}
