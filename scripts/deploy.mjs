#!/usr/bin/env node
/**
 * 通过 GitHub Git Data API 提交并推送（适用于 git 传输被拦截的环境）。
 *
 * 用法：
 *   node scripts/deploy.mjs main    # 提交源码（取 git ls-files）
 *   node scripts/deploy.mjs pages   # 提交 dist/ 到 gh-pages
 *
 * 凭据：优先读环境变量 GH_TOKEN，没有则读项目根目录的 .deploy.env（已 gitignore）
 *   GH_REPO   默认 x13502239474-oss/microeconomics-lab
 *   GH_MSG    可选，提交信息
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

// 读取 .deploy.env（简单 KEY=VALUE，忽略注释与空行）
function loadEnvFile() {
  const file = path.resolve('.deploy.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const s = line.trim()
    if (!s || s.startsWith('#')) continue
    const eq = s.indexOf('=')
    if (eq < 0) continue
    const key = s.slice(0, eq).trim()
    const val = s.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnvFile()

const TOKEN = process.env.GH_TOKEN
const REPO = process.env.GH_REPO || 'x13502239474-oss/microeconomics-lab'
const TARGET = process.argv[2] || 'main'

if (!TOKEN) {
  console.error('缺少 GH_TOKEN：请设置环境变量，或写入 .deploy.env')
  process.exit(1)
}

const API = 'https://api.github.com'

async function call(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'microlab-deploy',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`${method} ${url} → ${res.status} ${data?.message || text.slice(0, 200)}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/** 收集待提交文件：返回 [{ path, abs }] */
function collect() {
  if (TARGET === 'pages') {
    const root = path.resolve('dist')
    if (!fs.existsSync(root)) throw new Error('dist/ 不存在，请先 npm run build')
    const out = []
    const walk = (dir, prefix) => {
      for (const name of fs.readdirSync(dir)) {
        const abs = path.join(dir, name)
        const rel = prefix ? `${prefix}/${name}` : name
        if (fs.statSync(abs).isDirectory()) walk(abs, rel)
        else out.push({ path: rel, abs })
      }
    }
    walk(root, '')
    // 关掉 Jekyll，避免下划线开头的资源被吞
    out.push({ path: '.nojekyll', abs: null, content: '' })
    return out
  }
  const list = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.map((rel) => ({ path: rel, abs: path.resolve(rel) }))
}

async function pool(tasks, size = 6) {
  const results = new Array(tasks.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < tasks.length) {
      const i = cursor++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, tasks.length) }, worker))
  return results
}

async function headSha(branch) {
  try {
    const ref = await call('GET', `/repos/${REPO}/git/ref/heads/${branch}`)
    return ref.object.sha
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

async function main() {
  const branch = TARGET === 'pages' ? 'gh-pages' : 'main'
  const files = collect()
  const totalKB = files.reduce((n, f) => n + (f.abs ? fs.statSync(f.abs).size : 0), 0) / 1024
  console.log(`目标分支 ${branch}：${files.length} 个文件，${totalKB.toFixed(0)} KB`)

  // 1. 建 blob
  let done = 0
  const shas = await pool(
    files.map((f) => async () => {
      const buf = f.abs ? fs.readFileSync(f.abs) : Buffer.from(f.content || '', 'utf8')
      const blob = await call('POST', `/repos/${REPO}/git/blobs`, {
        content: buf.toString('base64'),
        encoding: 'base64',
      })
      done++
      if (done % 20 === 0 || done === files.length) process.stdout.write(`  blob ${done}/${files.length}\n`)
      return blob.sha
    }),
  )

  // 2. 建 tree
  const tree = await call('POST', `/repos/${REPO}/git/trees`, {
    tree: files.map((f, i) => ({
      path: f.path,
      mode: '100644',
      type: 'blob',
      sha: shas[i],
    })),
  })
  console.log(`  tree ${tree.sha.slice(0, 8)}`)

  // 3. 建 commit
  const parent = await headSha(branch)
  const message = process.env.GH_MSG || (TARGET === 'pages' ? 'deploy: 构建产物' : 'update: 源码')
  const commit = await call('POST', `/repos/${REPO}/git/commits`, {
    message,
    tree: tree.sha,
    parents: parent ? [parent] : [],
    author: { name: 'x13502239474-oss', email: 'x13502239474@gmail.com' },
  })
  console.log(`  commit ${commit.sha.slice(0, 8)}${parent ? ` (parent ${parent.slice(0, 8)})` : ' (root)'}`)

  // 4. 更新或创建 ref
  if (parent) {
    await call('PATCH', `/repos/${REPO}/git/refs/heads/${branch}`, { sha: commit.sha, force: true })
  } else {
    await call('POST', `/repos/${REPO}/git/refs`, { ref: `refs/heads/${branch}`, sha: commit.sha })
  }
  console.log(`✓ ${branch} → ${commit.sha}`)
  console.log(`  https://github.com/${REPO}/tree/${branch}`)
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
