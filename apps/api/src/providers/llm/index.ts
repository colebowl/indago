import { env } from '../../config/env'
import { AnthropicProvider } from './anthropic'
import type { LLMProvider } from './types'

export type { LLMProvider } from './types'

let provider: LLMProvider | null = null

export function getLLMProvider(): LLMProvider {
  if (!provider) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is required to use the LLM provider. ' +
        'Set it in your .env file.',
      )
    }
    provider = new AnthropicProvider(env.ANTHROPIC_API_KEY)
  }
  return provider
}
