/**
 * レンダリングモード
 * - ssr: 完全な静的 HTML。JS 不要。
 * - csr: 空 shell + props script のみ。client が描画。
 * - hydration: 全コンポーネントを SSR + island markers。client が全体を hydrate。
 * - island: island 指定コンポーネントのみ SSR + markers。非 island は SSR のみ。
 */
export type RenderMode = "ssr" | "csr" | "hydration" | "island"

/**
 * サーバーコンポーネント関数の型
 *
 * 同期/非同期の両方をサポートする。
 */
export type ServerComponent = (
    props: Record<string, unknown>,
    children: string,
) => string | Promise<string>

/**
 * レンダラオプション
 */
export interface RenderOptions {
    mode?: RenderMode
    components?: Record<string, ServerComponent>
    propsSchemas?: Record<string, Record<string, string>>
    denyPatterns?: string[]
    authorAttrsMap?: Record<string, Set<string>>
    islandComponents?: Set<string>
    islandTagNames?: Record<string, string>
}

/**
 * レンダリング結果
 */
export interface RenderResult {
    html: string
    hasIslands: boolean
}

/**
 * Markdoc の Tag ノードの型
 *
 * @markdoc/markdoc の Tag クラスに対応する。
 */
export interface TagNode {
    $$mdtype: "Tag"
    name: string
    attributes: Record<string, unknown>
    children: RenderableNode[]
}

/**
 * レンダリング可能なノードの型
 *
 * Markdoc の RenderableTreeNode に対応する。
 */
export type RenderableNode =
    | TagNode
    | string
    | number
    | boolean
    | null
    | undefined
    | RenderableNode[]

/**
 * Document のオプション
 */
export interface DocumentOptions {
    title?: string
    head?: string
    body: string
    hasIslands?: boolean
    islandModules?: string[]
}
