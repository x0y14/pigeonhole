import { transformMarkdoc } from "@pigeonhole/markdoc"
import { renderToHtml } from "@pigeonhole/render"
import type { RenderOptions } from "@pigeonhole/render"
import type { RenderMdocOptions, RenderPageResult } from "./types"

/**
 * Markdoc ソース文字列を HTML にレンダリングする
 *
 * @param source - Markdoc ソース文字列
 * @param variables - テンプレート変数
 * @param options - レンダリングオプション
 * @returns レンダリング結果（html, hasIslands）
 */
export async function renderMdoc(
    source: string,
    variables: Record<string, unknown>,
    options: RenderMdocOptions = {},
): Promise<RenderPageResult> {
    const tree = transformMarkdoc(source, {}, {}, variables)

    const renderOptions: RenderOptions = {
        components: options.components,
        mode: options.mode,
        propsSchemas: options.propsSchemas,
        authorAttrsMap: options.authorAttrsMap,
        denyPatterns: options.denyPatterns,
        islandComponents: options.islandComponents,
        islandTagNames: options.islandTagNames,
    }

    const result = await renderToHtml(tree, renderOptions)

    return {
        html: result.html,
        hasIslands: result.hasIslands,
    }
}
