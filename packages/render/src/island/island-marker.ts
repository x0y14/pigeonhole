import { PH_ISLAND_ID_ATTR, PH_ISLAND_PROPS_PREFIX } from "./constants"

// ID 生成用カウンター（リクエストごとにリセット）
let islandCounter = 0

// レンダリング中フラグ（並行レンダリング検出用）
let isRendering = false

/** 一意なアイランド ID を生成する */
export function generateIslandId(): string {
    islandCounter += 1
    return `ph-${islandCounter.toString(10)}`
}

/** JSON 内の < を \u003c にエスケープする */
function escapeJsonForScript(json: string): string {
    return json.replaceAll("<", "\\u003c")
}

/**
 * アイランドの props を JSON script タグとしてシリアライズする
 *
 * children を除外し、シリアライズ失敗時はエラーをスローする。
 */
export function serializeIslandProps(islandId: string, props: Record<string, unknown>): string {
    // children を除外
    const filteredProps: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
        if (key !== "children") {
            filteredProps[key] = value
        }
    }

    // シリアライズ失敗はサーバーエラーにする
    let json: string
    try {
        json = JSON.stringify(filteredProps)
    } catch (error) {
        throw new Error(
            `failed to serialize island props for island "${islandId}": ${error instanceof Error ? error.message : "unknown error"}`,
        )
    }

    const escaped = escapeJsonForScript(json)
    return `<script type="application/json" id="${PH_ISLAND_PROPS_PREFIX}${islandId}">${escaped}</script>`
}

/** アイランドの HTML をマーカーでラップする */
export function wrapIslandHtml(
    islandId: string,
    tagName: string,
    innerHtml: string,
    props: Record<string, unknown>,
): string {
    const propsScript = serializeIslandProps(islandId, props)
    return `<${tagName} ${PH_ISLAND_ID_ATTR}="${islandId}">${innerHtml}</${tagName}>${propsScript}`
}

/**
 * レンダリング開始を宣言し、アイランド ID カウンターをリセットする
 *
 * 並行レンダリングが検出された場合は警告を出力する。
 */
export function beginRendering(): void {
    if (isRendering) {
        console.warn(
            "[pigeonhole] concurrent rendering detected: island counter may produce duplicate IDs",
        )
    }
    isRendering = true
    islandCounter = 0
}

/** レンダリング終了を宣言する */
export function endRendering(): void {
    isRendering = false
}
