import { z } from "zod"

export const configSchema = z.object({
    componentsDir: z.string().default("src/components"),
    pagesDir: z.string().default("src/pages"),
    denyPatterns: z.array(z.string()).default([]),
})

export type PigeonholeConfig = z.infer<typeof configSchema>
export type PigeonholeUserConfig = z.input<typeof configSchema>

export function defineConfig(config: PigeonholeUserConfig): PigeonholeUserConfig {
    return config
}
