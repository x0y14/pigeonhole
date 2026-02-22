import { test, expect } from "@playwright/test"

let counter = 0
function uniqueUser() {
    counter++
    return { username: `layout_${Date.now()}_${counter}`, password: "testpass123" }
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

test.describe("Timeline page layout", () => {
    test("sns-timeline-page-layout exists on timeline", async ({ page }) => {
        await signupAndLogin(page)

        await expect(page.locator("sns-timeline-page-layout")).toBeVisible()
    })

    test("desktop: 2-column grid layout", async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await signupAndLogin(page)

        const columns = await page.evaluate(() => {
            const el = document.querySelector("sns-timeline-page-layout")
            if (!el?.shadowRoot) return ""
            return getComputedStyle(el).gridTemplateColumns
        })
        // 2fr 1fr resolves to two pixel values
        const parts = columns.split(" ").filter((s) => s.length > 0)
        expect(parts.length).toBe(2)
    })

    test("mobile: 1-column grid layout", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await signupAndLogin(page)

        const columns = await page.evaluate(() => {
            const el = document.querySelector("sns-timeline-page-layout")
            return getComputedStyle(el!).gridTemplateColumns
        })
        const parts = columns.split(" ").filter((s) => s.length > 0)
        expect(parts.length).toBe(1)
    })

    test("all child components are present", async ({ page }) => {
        await signupAndLogin(page)

        await expect(page.locator("sns-app-header")).toBeVisible()
        await expect(page.locator("sns-post-composer")).toBeVisible()
        await expect(page.locator("sns-timeline")).toBeVisible()
        await expect(page.locator("sns-suggested-posts")).toBeVisible()
        await expect(page.locator("sns-client-status-panel")).toBeVisible()
    })
})

test.describe("Form page layout", () => {
    test("login: sns-form-page-layout exists with max-width", async ({ page }) => {
        await page.goto("/login")

        await expect(page.locator("sns-form-page-layout")).toBeVisible()

        const maxWidth = await page.evaluate(() => {
            const el = document.querySelector("sns-form-page-layout")
            return getComputedStyle(el!).maxWidth
        })
        // 24rem = 384px at default 16px font-size
        expect(maxWidth).toBe("384px")
    })

    test("signup: sns-form-page-layout exists with max-width", async ({ page }) => {
        await page.goto("/signup")

        await expect(page.locator("sns-form-page-layout")).toBeVisible()

        const maxWidth = await page.evaluate(() => {
            const el = document.querySelector("sns-form-page-layout")
            return getComputedStyle(el!).maxWidth
        })
        expect(maxWidth).toBe("384px")
    })
})

test.describe("Server-only components (hydrate=none)", () => {
    test("timeline layout has Declarative Shadow DOM", async ({ page }) => {
        await signupAndLogin(page)

        const hasShadowRoot = await page.evaluate(() => {
            const el = document.querySelector("sns-timeline-page-layout")
            return el?.shadowRoot !== null
        })
        expect(hasShadowRoot).toBe(true)
    })

    test("form layout has Declarative Shadow DOM", async ({ page }) => {
        await page.goto("/login")

        const hasShadowRoot = await page.evaluate(() => {
            const el = document.querySelector("sns-form-page-layout")
            return el?.shadowRoot !== null
        })
        expect(hasShadowRoot).toBe(true)
    })

    test("layout components are not registered as custom elements on client", async ({ page }) => {
        await signupAndLogin(page)

        const registered = await page.evaluate(() => {
            return {
                timeline: customElements.get("sns-timeline-page-layout") !== undefined,
                form: customElements.get("sns-form-page-layout") !== undefined,
            }
        })
        expect(registered.timeline).toBe(false)
        expect(registered.form).toBe(false)
    })
})
