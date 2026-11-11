import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@repo/database'
import { type GenerateTitleResponse, TITLE_MAX_LENGTH } from '@/modules/ia/schemas.js'
import { env } from '@/utils/environment.js'
import { NotFoundError, ServiceUnavailableError } from '@/utils/errors.js'

const MODEL = 'claude-haiku-5-5'
const MAX_TOKENS = 60

const SYSTEM_PROMPT =
  'Você recebe uma URL e sugere um título curto em português do Brasil para ela, ' +
  'com no máximo 8 palavras. Responda somente com o título: sem aspas, sem ponto final, ' +
  'sem explicações e sem nenhum texto além do título.'

// Remove aspas e pontuação final que o modelo às vezes devolve mesmo instruído
function cleanTitle(raw: string): string {
  const [firstLine = ''] = raw.trim().split('\n')
  return firstLine
    .replace(/^["'“”«»]+|["'“”«»]+$/g, '')
    .replace(/[.]+$/, '')
    .trim()
    .slice(0, TITLE_MAX_LENGTH)
}

export class IaService {
  // Sem ANTHROPIC_API_KEY o client fica null e as rotas de IA respondem 503
  private readonly client = env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    : null

  private requireClient(): Anthropic {
    if (!this.client) {
      throw new ServiceUnavailableError('IA indisponível: ANTHROPIC_API_KEY não configurada')
    }
    return this.client
  }

  async suggestTitle(url: string): Promise<string> {
    const response = await this.requireClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Com só 60 tokens, o raciocínio consumiria o orçamento antes do título
      thinking: { type: 'disabled' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: url }],
    })

    if (response.stop_reason === 'refusal') {
      throw new Error(
        `Modelo recusou sugerir título (${response.stop_details?.category ?? 'sem categoria'})`,
      )
    }

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
    const title = cleanTitle(text)

    if (!title) throw new Error(`Modelo não devolveu título (stop_reason: ${response.stop_reason})`)
    return title
  }

  async generateLinkTitle(code: string): Promise<GenerateTitleResponse> {
    // Falha antes de tocar no banco se a IA não estiver configurada
    this.requireClient()

    const link = await prisma.link.findUnique({ where: { code }, select: { id: true, url: true } })
    if (!link) throw new NotFoundError('Link não encontrado')

    const title = await this.suggestTitle(link.url)
    await prisma.link.update({ where: { id: link.id }, data: { title } })

    return { code, title }
  }
}
