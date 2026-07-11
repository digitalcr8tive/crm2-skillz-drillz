import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
const isUserOrOrgPages = repoName.slice(-10) === '.github.io'

export default defineConfig({
  base: isGitHubPages && repoName && !isUserOrOrgPages ? `/${repoName}/` : '/',
  plugins: [react()],
})
