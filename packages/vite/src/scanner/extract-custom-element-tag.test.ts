import { assert, test } from "vitest"
import { extractCustomElementTag } from "./extract-custom-element-tag"

// @customElement デコレータからの抽出
test("ダブルクォートの @customElement からタグ名を抽出する", () => {
    const source = `
@customElement("ph-counter")
class CounterElement extends LitElement {}
`
    assert.equal(extractCustomElementTag(source), "ph-counter")
})

test("シングルクォートの @customElement からタグ名を抽出する", () => {
    const source = `
@customElement('ph-hero-banner')
class HeroBannerElement extends LitElement {}
`
    assert.equal(extractCustomElementTag(source), "ph-hero-banner")
})

test("@customElement が存在しない場合は null を返す", () => {
    const source = `
export function Card(props: CardProps, children: string): string {
    return "<div>" + children + "</div>";
}
`
    assert.isNull(extractCustomElementTag(source))
})

test("空文字列の場合は null を返す", () => {
    assert.isNull(extractCustomElementTag(""))
})

// customElements.define() からの抽出
test("ダブルクォートの customElements.define からタグ名を抽出する", () => {
    const source = `
export class CounterElement extends HTMLElement {}
customElements.define("ph-counter", CounterElement)
`
    assert.equal(extractCustomElementTag(source), "ph-counter")
})

test("シングルクォートの customElements.define からタグ名を抽出する", () => {
    const source = `
export class HeroElement extends HTMLElement {}
customElements.define('ph-hero', HeroElement)
`
    assert.equal(extractCustomElementTag(source), "ph-hero")
})

// @customElement が customElements.define より優先される
test("@customElement と customElements.define が両方ある場合はデコレータを優先する", () => {
    const source = `
@customElement("ph-from-decorator")
class MyElement extends LitElement {}
customElements.define("ph-from-define", MyElement)
`
    assert.equal(extractCustomElementTag(source), "ph-from-decorator")
})
