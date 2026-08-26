import { defineConfig, devices } from "@playwright/test";

// e2e tests run against the same SQLite dev DB as `npm run dev` (there's no
// separate test database in this project — see the vitest suite, which uses
// the same integration-style convention). They create real rows (a post, a
// comment) via the admin UI and the public site, so:
//   - reuseExistingServer lets them run against an already-running `npm run
//     dev` (e.g. one started via the Claude Preview MCP) instead of spawning
//     a second server on the same port.
//   - workers: 1 keeps runs serialized, since login/comment submission are
//     IP-based rate limited (see src/lib/rateLimit.ts) and parallel runs
//     would trip those limits against each other.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
