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
    components?: Record<string, ServerComponent>
    hydrateComponents?: Map<string, "eager" | "lazy" | "client-only">
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
 * Document のオプション
 */
export interface DocumentOptions {
    title?: string
    head?: string
    body: string
    hasIslands?: boolean
    lang?: string
}
