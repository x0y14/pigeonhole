import { test, expect } from "@playwright/test"

let counter = 0
function uniqueUser() {
    counter++
    return { username: `suggest_${Date.now()}_${counter}`, password: "testpass123" }
}

test.describe("Suggested Posts", () => {
    test("sns-suggested-posts is visible on timeline", async ({ page }) => {
        const { username, password } = uniqueUser()

        await page.goto("/signup")
        await page.locator("sns-signup-form input[name=username]").fill(username)
        await page.locator("sns-signup-form input[name=password]").fill(password)
        await page.locator("sns-signup-form button[type=submit]").click()
        await page.waitForURL("/")

        await expect(page.locator("sns-suggested-posts")).toBeVisible()
    })

    test("suggested posts are displayed when posts exist", async ({ page, request }) => {
        const { username, password } = uniqueUser()

        // Sign up via API
        await request.post("/api/users", {
            data: { username, password },
        })
        const loginRes = await request.post("/api/sessions", {
            data: { username, password },
        })
        const { token } = await loginRes.json()

        // Create multiple posts via API
        for (let i = 0; i < 4; i++) {
            await request.post("/api/posts", {
                data: { content: `Suggested post ${i} - ${Date.now()}` },
                headers: { Authorization: `Bearer ${token}` },
            })
        }

        // Load page with auth
        await page.goto("/")
        await page.evaluate(
            ([t, u]) => {
                localStorage.setItem("token", t)
                localStorage.setItem("username", u)
            },
            [token, username],
        )
        await page.reload()

        // Scroll suggested-posts into view to trigger lazy hydration
        await page.locator("sns-suggested-posts").scrollIntoViewIfNeeded()

        // Wait for suggested posts to render inside Shadow DOM
        await expect(async () => {
            const count = await page.evaluate(() => {
                const el = document.querySelector("sns-suggested-posts")
                return el?.shadowRoot?.querySelectorAll("li").length ?? 0
            })
            expect(count).toBeGreaterThan(0)
        }).toPass()
    })

    test("posts with more likes appear first in suggestions", async ({ page, request }) => {
        const { username, password } = uniqueUser()

        // Sign up main user via API
        await request.post("/api/users", {
            data: { username, password },
        })
        const loginRes = await request.post("/api/sessions", {
            data: { username, password },
        })
        const { token } = await loginRes.json()

        // Create posts via API — create many to ensure they appear in the limit=5 window
        // even if other parallel tests create posts
        const postRes1 = await request.post("/api/posts", {
            data: { content: `Unpopular post ${Date.now()}` },
            headers: { Authorization: `Bearer ${token}` },
        })
        await postRes1.json()

        const postRes2 = await request.post("/api/posts", {
            data: { content: `Popular post ${Date.now()}` },
            headers: { Authorization: `Bearer ${token}` },
        })
        const { id: popularId } = await postRes2.json()

        // Create additional users to like the popular post
        for (let i = 0; i < 3; i++) {
            const liker = uniqueUser()
            await request.post("/api/users", {
                data: { username: liker.username, password: liker.password },
            })
            const likerLogin = await request.post("/api/sessions", {
                data: { username: liker.username, password: liker.password },
            })
            const { token: likerToken } = await likerLogin.json()

            await request.put(`/api/posts/${popularId}/like`, {
                headers: { Authorization: `Bearer ${likerToken}` },
            })
        }

        // Load page with auth
        await page.goto("/")
        await page.evaluate(
            ([t, u]) => {
                localStorage.setItem("token", t)
                localStorage.setItem("username", u)
            },
            [token, username],
        )
        await page.reload()

        // Scroll suggested-posts into view to trigger lazy hydration
        await page.locator("sns-suggested-posts").scrollIntoViewIfNeeded()

        // The popular post (3 likes) should appear first after sorting by likes
        await expect(async () => {
            const firstContent = await page.evaluate(() => {
                const el = document.querySelector("sns-suggested-posts")
                const first = el?.shadowRoot?.querySelector("li .content")
                return first?.textContent ?? ""
            })
            expect(firstContent).toContain("Popular post")
        }).toPass()
    })
})
