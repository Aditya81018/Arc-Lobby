export function publicLinkTo(endpoint: string) {
  return `${process.env.HOST}${endpoint}`;
}
