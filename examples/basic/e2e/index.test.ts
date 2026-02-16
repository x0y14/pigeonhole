import { test, expect } from "@playwright/test"

test("トップページが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toHaveText("Hello")
})

test("Greeting コンポーネントに name が注入される", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("p")).toHaveText("Hello, World!")
})

test("レスポンスが有効な HTML ドキュメントである", async ({ page }) => {
    await page.goto("/")
    const html = await page.content()
    expect(html).toMatch(/<!doctype html>/i)
    expect(html).toContain("<html")
    expect(html).toContain("</html>")
})
