import type { Context } from "hono"
import { renderMdoc } from "@pigeonhole/server"
import type { ServerComponent } from "@pigeonhole/server"
import { createDocument } from "@pigeonhole/render"

export interface PageRendererOptions {
    components?: Record<string, ServerComponent>
}

export function createPageRenderer(options: PageRendererOptions = {}) {
    return async function render(
        c: Context,
        source: string,
        variables: Record<string, unknown> = {},
    ): Promise<Response> {
        const result = await renderMdoc(source, variables, {
            components: options.components,
        })
        return c.html(
            createDocument({
                body: result.html,
                hasIslands: result.hasIslands,
            }),
        )
    }
}
