import { LitElement, html } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { picoStyles } from "../styles/shared-styles.js"
import { postCardStyles } from "../styles/sns-styles.js"
import "playful-avatars"

@customElement("sns-post-card")
export class PostCard extends LitElement {
    static hydrate = "eager"
    static styles = [picoStyles, postCardStyles]

    @property({ type: String, attribute: "post-id" }) postId = ""
    @property({ type: String }) content = ""
    @property({ type: String }) username = ""
    @property({ type: String, attribute: "created-at" }) createdAt = ""
    @property({ type: Number }) likes = 0
    @property({ type: Boolean, attribute: "liked-by-me" }) likedByMe = false

    @state() private _likeLoading = false

    render() {
        return html`
            <article class="post-card">
                <div class="post-avatar">
                    <playful-avatar name=${this.username} variant="beam"></playful-avatar>
                </div>
                <div class="post-body">
                    <div class="post-header">
                        <strong class="post-username">${this.username}</strong>
                        <time class="post-time">${this._formatTime(this.createdAt)}</time>
                    </div>
                    <p class="post-content">${this.content}</p>
                    <div class="post-actions">
                        <button
                            class="like-button ${this.likedByMe ? "liked" : ""}"
                            @click=${this._toggleLike}
                            ?disabled=${this._likeLoading}
                        >
                            <svg class="heart-icon" viewBox="0 0 24 24" width="18" height="18">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span class="like-count">${this.likes}</span>
                        </button>
                    </div>
                </div>
            </article>
        `
    }

    private _formatTime(iso: string): string {
        if (!iso) return ""
        const date = new Date(iso)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        if (seconds < 60) return "just now"
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    private async _toggleLike() {
        const token = localStorage.getItem("token")
        if (!token) return

        this._likeLoading = true
        const method = this.likedByMe ? "DELETE" : "PUT"

        try {
            const res = await fetch(`/api/posts/${this.postId}/like`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                this.likes = data.likes
                this.likedByMe = data.liked
            }
        } finally {
            this._likeLoading = false
        }
    }
}
