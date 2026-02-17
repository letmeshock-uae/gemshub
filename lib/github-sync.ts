
import { type Gem } from "./gems-store"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = process.env.NEXT_PUBLIC_REPO_OWNER || "letmeshock-uae"
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "gemshub"
const FILE_PATH = "data/gems.json" // Path in the repository

export async function syncToGithub(gems: Gem[]) {
    if (!GITHUB_TOKEN) {
        console.warn("Skipping GitHub sync: GITHUB_TOKEN not found")
        return
    }

    try {
        // 1. Get the current file's SHA (required for updates)
        const getRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
                cache: "no-store",
            }
        )

        let sha: string | undefined
        if (getRes.ok) {
            const data = await getRes.json()
            sha = data.sha
        } else if (getRes.status !== 404) {
            console.error("Failed to fetch current file SHA from GitHub", await getRes.text())
        }

        // 2. Upload the new content
        const content = Buffer.from(JSON.stringify(gems, null, 2)).toString("base64")

        const putRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
                body: JSON.stringify({
                    message: "Update gems via Admin Panel",
                    content,
                    sha, // Include SHA if file existed
                }),
            }
        )

        if (!putRes.ok) {
            const errorText = await putRes.text()
            console.error("Failed to sync to GitHub:", errorText)
        } else {
            console.log("Successfully synced gems to GitHub")
        }
    } catch (error) {
        console.error("GitHub sync error:", error)
    }
}
