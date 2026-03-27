export function publicLinkTo(endpoint: string) {
  return `${process.env.HOST}${endpoint}`;
}

export function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min) + 1);
}

export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}
