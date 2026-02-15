import { test, assert } from "vitest"
import { vi } from "vitest"
import {
    generateIslandId,
    serializeIslandProps,
    wrapIslandHtml,
    beginRendering,
    endRendering,
} from "./island-marker"

test("generateIslandId: 連番 ID を生成する", () => {
    beginRendering()
    assert.equal(generateIslandId(), "ph-1")
    assert.equal(generateIslandId(), "ph-2")
    assert.equal(generateIslandId(), "ph-3")
    endRendering()
})

test("beginRendering: カウンターをリセットする", () => {
    beginRendering()
    generateIslandId()
    generateIslandId()
    endRendering()

    beginRendering()
    assert.equal(generateIslandId(), "ph-1")
    endRendering()
})

test("beginRendering: 並行レンダリングで警告を出力する", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    beginRendering()
    beginRendering()

    assert.equal(warnSpy.mock.calls.length, 1)
    assert.include(warnSpy.mock.calls[0]?.[0] as string, "concurrent rendering detected")

    endRendering()
    endRendering()
    warnSpy.mockRestore()
})

test("serializeIslandProps: JSON script タグを生成する", () => {
    beginRendering()
    const result = serializeIslandProps("ph-1", { title: "hello" })
    assert.equal(
        result,
        '<script type="application/json" id="ph-props-ph-1">{"title":"hello"}</script>',
    )
    endRendering()
})

test("serializeIslandProps: children を除外する", () => {
    beginRendering()
    const result = serializeIslandProps("ph-1", { title: "hello", children: "<p>child</p>" })
    assert.equal(
        result,
        '<script type="application/json" id="ph-props-ph-1">{"title":"hello"}</script>',
    )
    endRendering()
})

test("serializeIslandProps: < を \\u003c にエスケープする", () => {
    beginRendering()
    const result = serializeIslandProps("ph-1", { content: "<script>" })
    assert.include(result, "\\u003cscript>")
    assert.notInclude(result, '"<script>"')
    endRendering()
})

test("serializeIslandProps: シリアライズ不可な props でエラーを投げる", () => {
    beginRendering()
    const circular: Record<string, unknown> = {}
    circular.self = circular
    assert.throws(() => serializeIslandProps("ph-1", circular), /failed to serialize island props/)
    endRendering()
})

test("wrapIslandHtml: island HTML をラップする", () => {
    beginRendering()
    const result = wrapIslandHtml("ph-1", "my-counter", "<span>0</span>", { count: 0 })
    assert.equal(
        result,
        '<my-counter data-ph-island-id="ph-1"><span>0</span></my-counter><script type="application/json" id="ph-props-ph-1">{"count":0}</script>',
    )
    endRendering()
})
