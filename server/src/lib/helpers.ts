export function publicLinkTo(endpoint: string) {
  return `${process.env.HOST}${endpoint}`;
}

export function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min) + 1);
}
