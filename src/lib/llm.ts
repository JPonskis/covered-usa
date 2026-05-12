// Provider-agnostic LLM calls with automatic failover
// Primary: Gemini (cheaper), Fallback: Claude (proven)
// No extra dependencies — Gemini uses fetch, Claude uses @anthropic-ai/sdk

import Anthropic from '@anthropic-ai/sdk'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  maxTokens: number
  image?: { base64: string; mediaType: string }
  document?: { base64: string; mediaType: string }
}

export interface LLMConfig {
  provider: 'gemini' | 'claude'
  model: string
}

// ── Gemini (REST API — no extra dependency) ──────────────────────────

async function callGemini(model: string, req: LLMRequest): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY not set')

  const parts: Record<string, unknown>[] = []

  if (req.image) {
    parts.push({
      inline_data: { mime_type: req.image.mediaType, data: req.image.base64 },
    })
  }
  if (req.document) {
    parts.push({
      inline_data: { mime_type: req.document.mediaType, data: req.document.base64 },
    })
  }
  parts.push({ text: req.prompt })

  const body: Record<string, unknown> = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: req.maxTokens },
  }

  if (req.systemPrompt) {
    body.systemInstruction = { parts: [{ text: req.systemPrompt }] }
  }

  const res = await fetch(
    `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini ${model} HTTP ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error(`Gemini ${model}: empty response`)
  return text
}

// ── Claude (Anthropic SDK) ───────────────────────────────────────────

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

async function callClaude(model: string, req: LLMRequest): Promise<string> {
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = []

  if (req.image) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: req.image.mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        data: req.image.base64,
      },
    })
  }
  if (req.document) {
    content.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: req.document.base64,
      },
    })
  }
  content.push({ type: 'text', text: req.prompt })

  const params: Anthropic.MessageCreateParams = {
    model,
    max_tokens: req.maxTokens,
    messages: [{ role: 'user', content }],
  }
  if (req.systemPrompt) {
    params.system = req.systemPrompt
  }

  const message = await getAnthropic().messages.create(params)
  const block = message.content[0]
  return block.type === 'text' ? block.text : ''
}

// ── Public: call with automatic failover ─────────────────────────────

export async function llm(
  primary: LLMConfig,
  fallback: LLMConfig,
  request: LLMRequest
): Promise<string> {
  const call = (cfg: LLMConfig) =>
    cfg.provider === 'gemini'
      ? callGemini(cfg.model, request)
      : callClaude(cfg.model, request)

  try {
    return await call(primary)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[LLM] ${primary.provider}/${primary.model} failed: ${msg}`)
    console.log(`[LLM] Falling back to ${fallback.provider}/${fallback.model}`)
    return await call(fallback)
  }
}

// ── Pre-configured chains for each task ──────────────────────────────

export const OCR_PRIMARY: LLMConfig = { provider: 'gemini', model: 'gemini-3-flash-preview' }
export const OCR_FALLBACK: LLMConfig = { provider: 'claude', model: 'claude-sonnet-4-6' }

export const CODE_ID_PRIMARY: LLMConfig = { provider: 'gemini', model: 'gemini-3.1-flash-lite' }
export const CODE_ID_FALLBACK: LLMConfig = { provider: 'claude', model: 'claude-haiku-4-5-20251001' }

export const LETTER_PRIMARY: LLMConfig = { provider: 'claude', model: 'claude-haiku-4-5-20251001' }
export const LETTER_FALLBACK: LLMConfig = { provider: 'gemini', model: 'gemini-3-flash-preview' }
