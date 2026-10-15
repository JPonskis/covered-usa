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
  /* A `.json` specifier needs `with { type: 'json' }` under Node's ESM resolver, and the
     TypeScript that imports it does not write one (tsc's resolveJsonModule does not need it).
     The 51 state data files in src/lib/states/stateData.ts are imported that way, so without
     this branch no harness can reach the eligibility engine at all: it dies with
     ERR_IMPORT_ATTRIBUTE_MISSING on ak.json. Supplying the attribute here rather than editing
     51 import lines keeps the source as tsc wants it. */
  if (specifier.endsWith('.json')) {
    const resolved = await next(specifier, context)
    return { ...resolved, importAttributes: { ...(resolved.importAttributes ?? {}), type: 'json' } }
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
