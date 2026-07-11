import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
const routes = ['about', 'training', 'merch', 'signup', 'login', 'portal']

copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))

for (const route of routes) {
  mkdirSync(join(dist, route), { recursive: true })
  copyFileSync(join(dist, 'index.html'), join(dist, route, 'index.html'))
}
