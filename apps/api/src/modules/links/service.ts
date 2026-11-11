import { randomInt } from 'node:crypto'
import { Prisma, prisma } from '@repo/database'
import {
  type ClickInput,
  CODE_LENGTH,
  type CreateLinkBody,
  type LinkResponse,
} from '@/modules/links/schemas.js'
import { env } from '@/utils/environment.js'
import { NotFoundError } from '@/utils/errors.js'

// Sem 0, O, 1 e l para não confundir quem digita o link
const ALPHABET = '23456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const MAX_ATTEMPTS = 5

const linkWithClickCount = {
  _count: { select: { clicks: true } },
} satisfies Prisma.LinkInclude

type LinkWithClickCount = Prisma.LinkGetPayload<{ include: typeof linkWithClickCount }>

function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return code
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

function toResponse(link: LinkWithClickCount): LinkResponse {
  return {
    id: link.id,
    code: link.code,
    url: link.url,
    title: link.title,
    shortUrl: `${env.PUBLIC_URL}/r/${link.code}`,
    clicks: link._count.clicks,
    createdAt: link.createdAt.toISOString(),
  }
}

export class LinksService {
  async create({ url }: CreateLinkBody): Promise<LinkResponse> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const link = await prisma.link.create({
          data: { code: generateCode(), url },
          include: linkWithClickCount,
        })
        return toResponse(link)
      } catch (error) {
        // Colisão no code (@unique): tenta outro; qualquer outro erro sobe
        if (!isUniqueViolation(error)) throw error
      }
    }

    throw new Error(`Não foi possível gerar um código único após ${MAX_ATTEMPTS} tentativas`)
  }

  async list(): Promise<LinkResponse[]> {
    const links = await prisma.link.findMany({
      include: linkWithClickCount,
      orderBy: { createdAt: 'desc' },
    })
    return links.map(toResponse)
  }

  async findByCode(code: string): Promise<LinkResponse> {
    const link = await prisma.link.findUnique({
      where: { code },
      include: linkWithClickCount,
    })
    if (!link) throw new NotFoundError('Link não encontrado')
    return toResponse(link)
  }

  // Registra o clique e devolve a URL de destino
  async resolve(code: string, click: ClickInput): Promise<string> {
    const link = await prisma.link.findUnique({
      where: { code },
      select: { id: true, url: true },
    })
    if (!link) throw new NotFoundError('Link não encontrado')

    await prisma.click.create({
      data: { linkId: link.id, userAgent: click.userAgent, referer: click.referer },
    })

    return link.url
  }
}
