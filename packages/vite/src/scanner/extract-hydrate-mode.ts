export type HydrateMode = "none" | "eager" | "lazy" | "client-only"

export function extractHydrateMode(source: string): HydrateMode {
    if (/static\s+hydrate\s*=\s*["']eager["']/.test(source)) {
        return "eager"
    }
    if (/static\s+hydrate\s*=\s*["']lazy["']/.test(source)) {
        return "lazy"
    }
    if (/static\s+hydrate\s*=\s*["']client-only["']/.test(source)) {
        return "client-only"
    }
    return "none"
}
