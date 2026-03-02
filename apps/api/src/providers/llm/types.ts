import type { Source } from '@indago/types'

export interface LLMProvider {
  chat(systemPrompt: string, userMessage: string): Promise<string>

  chatWithWebSearch(
    systemPrompt: string,
    userMessage: string,
  ): Promise<{ text: string; sources: Source[] }>

  parseDocument(
    systemPrompt: string,
    documentBase64: string,
    mimeType: string,
  ): Promise<string>
}
