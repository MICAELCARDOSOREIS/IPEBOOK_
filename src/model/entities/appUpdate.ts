export type AppVersionPolicy = {
  platform: "android";
  latestVersion: string;
  minSupportedVersion: string;
  latestVersionCode?: number;
  minSupportedVersionCode?: number;
  releaseNotes: string | null;
  storeUrl: string;
};

export type AppUpdateStatus = "up_to_date" | "optional" | "required";

export type AppUpdateResult = {
  status: AppUpdateStatus;
  policy: AppVersionPolicy | null;
};

function parseSemver(version: string): [number, number, number] | null {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+\d+)?$/.exec(version.trim());
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
  installedVersionCode?: number,
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
  if (typeof installedVersionCode === "number" && installedVersionCode > 0) {
    if (
      typeof policy.minSupportedVersionCode === "number" &&
      installedVersionCode < policy.minSupportedVersionCode
    ) {
      return "required";
    }
    if (
      typeof policy.latestVersionCode === "number" &&
      installedVersionCode < policy.latestVersionCode
    ) {
      return "optional";
    }
  }
  return "up_to_date";
}

export function formatPolicyVersionKey(policy: AppVersionPolicy): string {
  if (
    typeof policy.latestVersionCode === "number" &&
    policy.latestVersionCode > 1 &&
    !policy.latestVersion.includes("+")
  ) {
    return `${policy.latestVersion}+${policy.latestVersionCode}`;
  }
  return policy.latestVersion;
}
