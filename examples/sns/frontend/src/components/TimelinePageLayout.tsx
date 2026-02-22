import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("sns-timeline-page-layout")
export class TimelinePageLayout extends LitElement {
    static hydrate = "none" as const
    static styles = css`
        :host {
            display: grid;
            grid-template-columns: 1fr;
            max-width: 960px;
            margin: 0 auto;
            padding: 0;
            gap: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        ::slotted(sns-app-header) {
            grid-column: 1 / -1;
        }

        @media (min-width: 768px) {
            :host {
                grid-template-columns: 2fr 1fr;
            }

            ::slotted(sns-post-composer),
            ::slotted(sns-timeline) {
                grid-column: 1;
            }

            ::slotted(sns-suggested-posts),
            ::slotted(sns-client-status-panel) {
                grid-column: 2;
                border-left: 1px solid var(--pico-muted-border-color);
            }

            ::slotted(sns-suggested-posts) {
                grid-row: 2 / 4;
            }
        }
    `

    render() {
        return html`<slot></slot>`
    }
}
