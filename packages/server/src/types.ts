export type { ServerComponent } from "@pigeonhole/render"
import type { PropsSchema } from "@pigeonhole/render"

/**
 * renderMdoc に渡すオプション
 */
export interface RenderMdocOptions {
    /** コンポーネント map */
    components?: Record<string, import("@pigeonhole/render").ServerComponent>
    /** propsSchemas（markdecl config 構築に使用） */
    propsSchemas?: Record<string, PropsSchema>
    /** deny パターン（markdecl config 構築時に render: false を設定） */
    denyPatterns?: string[]
    /** ハイドレーション対象コンポーネント名とモードの Map */
    hydrateComponents?: Map<string, "eager" | "lazy" | "client-only">
    /** island タグ名マッピング */
    islandTagNames?: Record<string, string>
}

/**
 * レンダリング結果
 */
export interface RenderPageResult {
    html: string
    hasIslands: boolean
}
