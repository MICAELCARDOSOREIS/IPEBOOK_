export function createURL(path: string): string {
  return `ipebook://${path}`;
}

export async function openURL(_url: string): Promise<true> {
  return true;
}
