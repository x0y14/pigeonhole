import { Hono } from "hono"
import { createPageRenderer } from "@pigeonhole/hono"
import { components, propsSchemas } from "virtual:pigeonhole/components"
import indexPage from "./pages/index.mdoc?raw"

const app = new Hono()
const render = createPageRenderer({ components, propsSchemas })

app.get("/", async (c) => {
    return render(c, indexPage, { name: "World" })
})

export default app
