import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("sns-form-page-layout")
export class FormPageLayout extends LitElement {
    static hydrate = "none" as const
    static styles = css`
        :host {
            display: block;
            max-width: 24rem;
            margin: 2rem auto;
            padding: 0 1rem;
        }
    `

    render() {
        return html`<slot></slot>`
    }
}
