import { css, unsafeCSS } from "lit"
import picoCSS from "@picocss/pico/css/pico.min.css?inline"

export const picoStyles = css`
    ${unsafeCSS(picoCSS)}
`
