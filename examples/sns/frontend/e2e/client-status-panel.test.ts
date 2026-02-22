import { test, expect } from "@playwright/test"

let counter = 0
function uniqueUser() {
    counter++
    return { username: `status_${Date.now()}_${counter}`, password: "testpass123" }
}

async function signupAndLogin(page: import("@playwright/test").Page) {
    const { username, password } = uniqueUser()
    await page.goto("/signup")
    await page.locator("sns-signup-form input[name=username]").fill(username)
    await page.locator("sns-signup-form input[name=password]").fill(password)
    await page.locator("sns-signup-form button[type=submit]").click()
    await page.waitForURL("/")
    return username
}

test.describe("Client Status Panel", () => {
    test("sns-client-status-panel is visible on timeline", async ({ page }) => {
        await signupAndLogin(page)

        await expect(page.locator("sns-client-status-panel")).toBeVisible()
    })

    test("connection status shows Online", async ({ page }) => {
        await signupAndLogin(page)

        // client-only component: wait for hydration and Shadow DOM render
        await expect(async () => {
            const text = await page.evaluate(() => {
                const el = document.querySelector("sns-client-status-panel")
                return el?.shadowRoot?.querySelector(".client-status-panel")?.textContent ?? ""
            })
            expect(text).toContain("Online")
        }).toPass()
    })

    test("timezone is displayed", async ({ page }) => {
        await signupAndLogin(page)

        await expect(async () => {
            const text = await page.evaluate(() => {
                const el = document.querySelector("sns-client-status-panel")
                return el?.shadowRoot?.querySelector(".client-status-panel")?.textContent ?? ""
            })
            expect(text).toContain("Timezone:")
            expect(text).not.toContain("Timezone: unknown")
        }).toPass()
    })
})
