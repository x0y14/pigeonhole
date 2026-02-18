// @customElement デコレータまたは customElements.define() からタグ名を静的に抽出する
export function extractCustomElementTag(source: string): string | null {
    // @customElement("tag-name") デコレータ
    const decoratorMatch = /@customElement\(\s*["']([^"']+)["']\s*\)/.exec(source)
    if (decoratorMatch) {
        return decoratorMatch[1]
    }

    // customElements.define("tag-name", ClassName)
    const defineMatch = /customElements\.define\(\s*["']([^"']+)["']\s*,/.exec(source)
    if (defineMatch) {
        return defineMatch[1]
    }

    return null
}
