export function isMockMode(): boolean {
  return (process.env.USE_MOCK_API ?? "true").toLowerCase() !== "false";
}
