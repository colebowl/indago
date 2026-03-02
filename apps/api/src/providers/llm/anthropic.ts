import Anthropic from '@anthropic-ai/sdk'
import type { Messages } from '@anthropic-ai/sdk/resources/messages/messages'
import type { Source } from '@indago/types'
import type { LLMProvider } from './types'
import { env } from '../../config/env'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model = env.ANTHROPIC_MODEL) {
    this.client = new Anthropic({ apiKey })
    this.model = model
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = extractText(response.content)
    console.log('[Anthropic] chat response:', { length: text.length, text })
    return text
  }

  async chatWithWebSearch(
    systemPrompt: string,
    userMessage: string,
  ): Promise<{ text: string; sources: Source[] }> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 15, // Allow 1–2 searches; 1 was too restrictive (model returned "need more searches" instead of JSON)
      }],
    })

    const text = extractText(response.content)
    const sources = extractSources(response.content)

    console.log('[Anthropic] chatWithWebSearch response:', { length: text.length, text })
    return { text, sources }
  }

  async parseDocument(
    systemPrompt: string,
    documentBase64: string,
    mimeType: string,
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mimeType as 'application/pdf',
                data: documentBase64,
              },
            },
            {
              type: 'text',
              text: 'Please analyze this document according to your instructions.',
            },
          ],
        },
      ],
    })

    const text = extractText(response.content)
    console.log('[Anthropic] parseDocument response:', { length: text.length, text })
    return text
  }
}

function extractText(content: Messages.ContentBlock[]): string {
  const parts: string[] = []

  for (const block of content) {
    if (block.type === 'text') {
      parts.push(block.text)
    }
  }

  return parts.join('\n\n')
}

function extractSources(content: Messages.ContentBlock[]): Source[] {
  const seen = new Set<string>()
  const sources: Source[] = []

  for (const block of content) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const result of block.content) {
        if (result.type === 'web_search_result' && !seen.has(result.url)) {
          seen.add(result.url)
          sources.push({
            name: result.title,
            url: result.url,
            retrievedAt: new Date().toISOString(),
            type: 'data',
          })
        }
      }
    }

    if (block.type === 'text' && block.citations) {
      for (const citation of block.citations) {
        if (citation.type === 'web_search_result_location' && !seen.has(citation.url)) {
          seen.add(citation.url)
          sources.push({
            name: citation.title ?? citation.url,
            url: citation.url,
            retrievedAt: new Date().toISOString(),
            type: 'data',
          })
        }
      }
    }
  }

  return sources
}
