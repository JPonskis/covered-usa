// Lets the proof harness import the real source modules directly:
//  - resolves extensionless relative imports to .ts / .tsx
//  - tells Node to type-strip .tsx the same way it does .ts
// The email builder is .tsx by convention but contains no JSX.
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = new URL('../src/', import.meta.url)

export async function resolve(specifier, context, next) {
  // The project's "@/*" path alias maps to ./src/*
  if (specifier.startsWith('@/')) {
    const base = new URL(specifier.slice(2), ROOT).href
    for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
      if (existsSync(fileURLToPath(base + ext))) {
        return { url: base + ext, format: undefined, shortCircuit: true }
      }
    }
  }
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      try {
        const url = new URL(specifier + ext, context.parentURL)
        if (existsSync(fileURLToPath(url))) return next(specifier + ext, context)
      } catch {}
    }
  }
  return next(specifier, context)
}

export async function load(url, context, next) {
  if (url.endsWith('.tsx')) {
    return {
      format: 'module-typescript',
      shortCircuit: true,
      source: readFileSync(fileURLToPath(url), 'utf8'),
    }
  }
  return next(url, context)
}
