import { assert, test } from "vitest"
import { generateClientModule } from "./client-module"
import type { ComponentInfo } from "../scanner/types"

// 基本的なクライアントモジュール生成
test("island コンポーネントからクライアント仮想モジュールを生成する", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/Counter.tsx",
            tagName: "Counter",
            hydrateMode: "eager",
            customElementTagName: "ph-counter",
            propsSchema: { count: { type: "number" } },
        },
    ]

    const result = generateClientModule(islands)

    // ブート順
    // 1. @lit-labs/ssr-client/lit-element-hydrate-support.js
    // 2. restoreIslandProps()
    // 3. アイランドモジュール eager import
    const lines = result.split("\n")
    const hydrateIndex = lines.findIndex((l) =>
        l.includes("@lit-labs/ssr-client/lit-element-hydrate-support.js"),
    )
    const restoreIndex = lines.findIndex((l) => l.includes("restoreIslandProps"))
    const importIndex = lines.findIndex((l) => l.includes("Counter.tsx"))

    assert.isAbove(hydrateIndex, -1)
    assert.isAbove(restoreIndex, hydrateIndex)
    assert.isAbove(importIndex, restoreIndex)
})

// island マップの生成
test("island マップに tagName と customElementTagName のマッピングを含む", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/Counter.tsx",
            tagName: "Counter",
            hydrateMode: "eager",
            customElementTagName: "ph-counter",
            propsSchema: {},
        },
    ]

    const result = generateClientModule(islands)
    assert.include(result, '"Counter": "ph-counter"')
})

// customElementTagName が null の island
test("customElementTagName が null の island は islands マップに含めない", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/Widget.tsx",
            tagName: "Widget",
            hydrateMode: "eager",
            customElementTagName: null,
            propsSchema: {},
        },
    ]

    const result = generateClientModule(islands)
    assert.include(result, 'import "/project/src/components/Widget.tsx";')
    assert.notInclude(result, '"Widget"')
})

// lazy island のコード生成
test("lazy island は observeLazyIslands + dynamic import で生成される", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/Slider.tsx",
            tagName: "Slider",
            hydrateMode: "lazy",
            customElementTagName: "ph-slider",
            propsSchema: { index: { type: "number" } },
        },
    ]

    const result = generateClientModule(islands)

    // eager import がない
    assert.notInclude(result, 'import "/project/src/components/Slider.tsx";')
    // observeLazyIslands が使われている
    assert.include(result, "observeLazyIslands")
    assert.include(result, '"ph-slider": () => import("/project/src/components/Slider.tsx")')
    // island マップには含まれる
    assert.include(result, '"Slider": "ph-slider"')
})

// eager と lazy の混在
test("eager と lazy が混在する場合に正しく分離される", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/Counter.tsx",
            tagName: "Counter",
            hydrateMode: "eager",
            customElementTagName: "ph-counter",
            propsSchema: {},
        },
        {
            filePath: "/project/src/components/Slider.tsx",
            tagName: "Slider",
            hydrateMode: "lazy",
            customElementTagName: "ph-slider",
            propsSchema: {},
        },
    ]

    const result = generateClientModule(islands)

    // eager は通常 import
    assert.include(result, 'import "/project/src/components/Counter.tsx";')
    // lazy は dynamic import
    assert.include(result, '"ph-slider": () => import("/project/src/components/Slider.tsx")')
    // 両方 island マップに含まれる
    assert.include(result, '"Counter": "ph-counter"')
    assert.include(result, '"Slider": "ph-slider"')
})

// client-only island のコード生成
test("client-only island は即座 import で生成される", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/BrowserInfo.tsx",
            tagName: "BrowserInfo",
            hydrateMode: "client-only",
            customElementTagName: "ph-browser-info",
            propsSchema: { ua: { type: "string" } },
        },
    ]

    const result = generateClientModule(islands)

    // 即座 import が生成される
    assert.include(result, 'import "/project/src/components/BrowserInfo.tsx";')
    // observeLazyIslands に含まれない
    assert.notInclude(result, "observeLazyIslands")
    // island マップに含まれる
    assert.include(result, '"BrowserInfo": "ph-browser-info"')
})

// eager, lazy, client-only の混在
test("eager, lazy, client-only が混在する場合に正しく分離される", () => {
    const islands: ComponentInfo[] = [
        {
            filePath: "/project/src/components/Counter.tsx",
            tagName: "Counter",
            hydrateMode: "eager",
            customElementTagName: "ph-counter",
            propsSchema: {},
        },
        {
            filePath: "/project/src/components/Slider.tsx",
            tagName: "Slider",
            hydrateMode: "lazy",
            customElementTagName: "ph-slider",
            propsSchema: {},
        },
        {
            filePath: "/project/src/components/BrowserInfo.tsx",
            tagName: "BrowserInfo",
            hydrateMode: "client-only",
            customElementTagName: "ph-browser-info",
            propsSchema: {},
        },
    ]

    const result = generateClientModule(islands)

    // eager は通常 import
    assert.include(result, 'import "/project/src/components/Counter.tsx";')
    // client-only も通常 import
    assert.include(result, 'import "/project/src/components/BrowserInfo.tsx";')
    // lazy は dynamic import
    assert.include(result, '"ph-slider": () => import("/project/src/components/Slider.tsx")')
    // 全て island マップに含まれる
    assert.include(result, '"Counter": "ph-counter"')
    assert.include(result, '"Slider": "ph-slider"')
    assert.include(result, '"BrowserInfo": "ph-browser-info"')
})

// 空の island リスト
test("空の island リストでも基本構造を生成する", () => {
    const result = generateClientModule([])
    assert.include(result, "@lit-labs/ssr-client/lit-element-hydrate-support.js")
    assert.include(result, "restoreIslandProps")
    assert.include(result, "export const islands = {")
})
