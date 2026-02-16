import { defineConfig } from "@playwright/test"

export default defineConfig({
    webServer: {
        command: "pnpm dev",
        port: 5173,
        reuseExistingServer: !process.env.CI,
    },
    testDir: "e2e",
})
