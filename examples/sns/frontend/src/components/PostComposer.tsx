import { LitElement, html } from "lit"
import { customElement, state } from "lit/decorators.js"
import { picoStyles } from "../styles/shared-styles.js"
import { postComposerStyles } from "../styles/sns-styles.js"
import "playful-avatars"

const DRAFT_KEY = "sns:draft:post"

@customElement("sns-post-composer")
export class PostComposer extends LitElement {
    static hydrate = "eager"
    static styles = [picoStyles, postComposerStyles]

    @state() private _content = ""
    @state() private _loading = false
    @state() private _loggedIn = false
    @state() private _username = ""

    firstUpdated() {
        this._loggedIn = !!localStorage.getItem("token")
        this._username = localStorage.getItem("username") ?? ""
        if (this._loggedIn) {
            this._content = localStorage.getItem(DRAFT_KEY) ?? ""
        }
    }

    render() {
        if (!this._loggedIn) return html``

        return html`
            <form class="post-composer" @submit=${this._handleSubmit}>
                <div class="composer-avatar">
                    <playful-avatar name=${this._username} variant="beam"></playful-avatar>
                </div>
                <div class="composer-body">
                    <textarea
                        placeholder="What's on your mind?"
                        .value=${this._content}
                        @input=${this._handleInput}
                        required
                    ></textarea>
                    <button type="submit" ?disabled=${this._loading || !this._content.trim()}>
                        ${this._loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </form>
        `
    }

    private async _handleSubmit(e: Event) {
        e.preventDefault()
        this._loading = true

        const token = localStorage.getItem("token")
        if (!token) {
            this._loading = false
            return
        }

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: this._content }),
            })

            if (res.ok) {
                const post = await res.json()
                this._content = ""
                localStorage.removeItem(DRAFT_KEY)
                document.dispatchEvent(new CustomEvent("post-created", { detail: post }))
            }
        } finally {
            this._loading = false
        }
    }

    private _handleInput(e: Event) {
        const value = (e.target as HTMLTextAreaElement).value
        this._content = value
        this._syncDraft(value)
    }

    private _syncDraft(value: string) {
        if (value.trim().length === 0) {
            localStorage.removeItem(DRAFT_KEY)
            return
        }
        localStorage.setItem(DRAFT_KEY, value)
    }
}
