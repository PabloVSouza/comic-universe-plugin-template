import * as cheerio from 'cheerio'

const UTOON_BASE_URL = (process.env.UTOON_BASE_URL || 'https://utoon.net').replace(/\/+$/, '')
const UTOON_SEARCH_PATH = process.env.UTOON_SEARCH_PATH || '/'
const DEFAULT_LANGUAGES = ['en']
const USER_AGENT =
  process.env.UTOON_USER_AGENT ||
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
const UTOON_COOKIE = process.env.UTOON_COOKIE || ''
const UTOON_CF_CLEARANCE = process.env.UTOON_CF_CLEARANCE || ''

export interface PluginMangaSummary {
  siteId: string
  name: string
  synopsis: string
  status: string
  cover: string
  chapterCount: number | null
  languageCodes: string[]
  contentType: 'manga' | 'comic'
}

export interface PluginChapterSummary {
  siteId: string
  siteLink?: string
  name: string
  number: string
  language: string
  languageCodes: string[]
  offline: boolean
  pages: Array<Record<string, unknown>>
}

export interface PluginPage {
  filename: string
  path: string
}

const normalizeLanguageCodes = (value?: string[]): string[] => {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_LANGUAGES
  const normalized = value
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  return normalized.length > 0 ? normalized : DEFAULT_LANGUAGES
}

const buildCookieHeader = (): string => {
  if (UTOON_COOKIE.trim()) return UTOON_COOKIE.trim()
  if (UTOON_CF_CLEARANCE.trim()) return `cf_clearance=${UTOON_CF_CLEARANCE.trim()}`
  return ''
}

const baseHeaders = (accept: string): HeadersInit => {
  const headers: Record<string, string> = {
    accept,
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': USER_AGENT,
    referer: `${UTOON_BASE_URL}/`
  }

  const cookie = buildCookieHeader()
  if (cookie) headers.cookie = cookie

  return headers
}

const isCloudflareBlock = (html: string): boolean => {
  return /attention required!\s*\|\s*cloudflare/i.test(html) || /sorry, you have been blocked/i.test(html)
}

const assertNotBlocked = (html: string): void => {
  if (!isCloudflareBlock(html)) return

  throw new Error(
    'UTOON request was blocked by Cloudflare. Set UTOON_COOKIE or UTOON_CF_CLEARANCE before deploying this plugin.'
  )
}

const toAbsolute = (value: string | null | undefined): string => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return `${UTOON_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

const toSiteId = (value: string | null | undefined): string => {
  const absolute = toAbsolute(value)
  if (!absolute.startsWith(UTOON_BASE_URL)) return absolute
  const relative = absolute.slice(UTOON_BASE_URL.length)
  return relative.startsWith('/') ? relative : `/${relative}`
}

const toMangaUrl = (siteId: string): string => toAbsolute(siteId)
const ensureListStyle = (url: string): string => {
  if (!url) return ''
  const next = new URL(url, `${UTOON_BASE_URL}/`)
  if (next.searchParams.get('style') !== 'list') {
    next.searchParams.set('style', 'list')
  }
  return next.toString()
}

const toChapterUrl = (siteId: string): string => ensureListStyle(toAbsolute(siteId))

const cleanText = (value: string | null | undefined): string => {
  return (value || '').replace(/\s+/g, ' ').trim()
}

const parseOptionalNumber = (value: string): number | null => {
  const match = cleanText(value).match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeStatus = (value: string): string => {
  const normalized = cleanText(value).toLowerCase()
  if (!normalized) return 'Unknown'
  if (normalized.includes('ongoing')) return 'OnGoing'
  if (normalized.includes('completed')) return 'Completed'
  if (normalized.includes('hiatus')) return 'Hiatus'
  if (normalized.includes('cancel')) return 'Cancelled'
  return cleanText(value)
}

const inferContentType = (value: string): 'manga' | 'comic' => {
  const normalized = cleanText(value).toLowerCase()
  if (normalized.includes('comic')) return 'comic'
  return 'manga'
}

const fetchHtml = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: baseHeaders('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
  })

  const html = await response.text()
  assertNotBlocked(html)

  if (!response.ok) {
    throw new Error(`UTOON request failed (${response.status}) at ${url}`)
  }

  return html
}

const fetchNewChapterEndpointHtml = async (mangaUrl: string): Promise<string> => {
  const response = await fetch(`${mangaUrl.replace(/\/+$/, '')}/ajax/chapters`, {
    method: 'POST',
    headers: {
      ...baseHeaders('text/html, */*; q=0.01'),
      'x-requested-with': 'XMLHttpRequest'
    }
  })

  const html = await response.text()
  assertNotBlocked(html)

  if (!response.ok) {
    throw new Error(`UTOON new chapter endpoint failed (${response.status})`)
  }

  return html
}

const fetchAjaxHtml = async (postId: string): Promise<string> => {
  const body = new URLSearchParams()
  body.set('action', 'manga_get_chapters')
  body.set('manga', postId)

  const response = await fetch(`${UTOON_BASE_URL}/wp-admin/admin-ajax.php`, {
    method: 'POST',
    headers: {
      ...baseHeaders('text/html, */*; q=0.01'),
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      origin: UTOON_BASE_URL
    },
    body
  })

  const html = await response.text()
  assertNotBlocked(html)

  if (!response.ok) {
    throw new Error(`UTOON chapter ajax failed (${response.status})`)
  }

  return html
}

const firstText = ($root: cheerio.CheerioAPI, selectors: string[]): string => {
  for (const selector of selectors) {
    const text = cleanText($root(selector).first().text())
    if (text) return text
  }
  return ''
}

const firstAttr = ($root: cheerio.CheerioAPI, selectors: string[], attr: string): string => {
  for (const selector of selectors) {
    const value = cleanText($root(selector).first().attr(attr))
    if (value) return value
  }
  return ''
}

const extractLabeledValue = ($root: cheerio.CheerioAPI, labels: string[]): string => {
  const labelSet = labels.map((label) => label.toLowerCase())
  const headingSelectors = [
    '.post-content_item',
    '.summary_content_wrap .post-content_item',
    '.summary-heading',
    '.summary-heading h5',
    '.summary-heading h4'
  ]

  for (const selector of headingSelectors) {
    const nodes = $root(selector)
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes.eq(index)
      const text = cleanText(node.text()).toLowerCase()
      if (!labelSet.some((label) => text.includes(label))) continue

      const structured =
        cleanText(node.find('.summary-content').first().text()) ||
        cleanText(node.next('.summary-content').first().text()) ||
        cleanText(node.parent().find('.summary-content').first().text()) ||
        cleanText(node.closest('.post-content_item').find('.summary-content').first().text())

      if (structured) return structured
    }
  }

  return ''
}

const parseSearchCards = (
  html: string,
  languageCodes?: string[],
  fallbackQuery?: string
): PluginMangaSummary[] => {
  const $ = cheerio.load(html)
  const items = new Map<string, PluginMangaSummary>()

  const containers = [
    '.c-tabs-item__content',
    '.page-item-detail',
    '.row.c-tabs-item__content',
    '.post-item',
    '.tab-thumb',
    '.search-wrap .item'
  ]

  for (const selector of containers) {
    $(selector).each((_, element) => {
      const root = $(element)
      const link =
        root.find('a[href*="/manga/"]').first().attr('href') ||
        root.closest('a[href*="/manga/"]').attr('href') ||
        ''
      const siteId = toSiteId(link)
      if (!siteId || items.has(siteId)) return

      const title =
        cleanText(root.find('.post-title a, .post-title h3 a, h3 a, h4 a, a').first().text()) ||
        cleanText(root.find('img').first().attr('alt')) ||
        cleanText(root.text())
      if (!title) return

      const synopsis = cleanText(root.find('.tab-summary, .summary, .content, .post-content').first().text())
      const cover = toAbsolute(
        root.find('img').first().attr('data-src') ||
          root.find('img').first().attr('data-lazy-src') ||
          root.find('img').first().attr('src') ||
          ''
      )

      items.set(siteId, {
        siteId,
        name: title,
        synopsis,
        status: 'Unknown',
        cover,
        chapterCount: null,
        languageCodes: normalizeLanguageCodes(languageCodes),
        contentType: 'manga'
      })
    })

    if (items.size > 0) break
  }

  if (items.size === 0) {
    const details = parseMangaDetails(html, fallbackQuery || '')
    if (details && details.siteId) {
      items.set(details.siteId, details)
    }
  }

  return [...items.values()]
}

const parseMangaDetails = (html: string, fallbackSiteId: string): PluginMangaSummary | null => {
  const $ = cheerio.load(html)
  const title = firstText($, ['.post-title h1', 'h1', '.summary__content h1'])
  if (!title) return null

  const canonical =
    firstAttr($, ['link[rel="canonical"]'], 'href') || firstAttr($, ['.post-title a[href*="/manga/"]'], 'href')

  const synopsis =
    cleanText(
      $('.summary__content, .description-summary .summary__content, .manga-summary, .description-summary')
        .first()
        .text()
    ) || firstText($, ['.summary__content p', '.description-summary p'])

  const status = normalizeStatus(extractLabeledValue($, ['status']))
  const type = extractLabeledValue($, ['type'])
  const cover = toAbsolute(
    firstAttr($, ['.summary_image img', '.summary_image a img', '.site-content img'], 'data-src') ||
      firstAttr($, ['.summary_image img', '.summary_image a img', '.site-content img'], 'src')
  )
  const chapterCount = parseOptionalNumber(extractLabeledValue($, ['chapters']))

  return {
    siteId: toSiteId(canonical || fallbackSiteId),
    name: title,
    synopsis,
    status,
    cover,
    chapterCount,
    languageCodes: DEFAULT_LANGUAGES,
    contentType: inferContentType(type)
  }
}

const extractPostId = (html: string, siteId: string): string => {
  const patterns = [
    /wp-manga-current-post-id["'][^>]*value=["'](\d+)["']/i,
    /data-id=["'](\d+)["']/i,
    /\bmanga_id["']?\s*[:=]\s*["']?(\d+)/i,
    /\bpost_id["']?\s*[:=]\s*["']?(\d+)/i,
    /\bpostID["']?\s*[:=]\s*["']?(\d+)/i
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }

  const slug = siteId.replace(/\/+$/, '').split('/').filter(Boolean).pop() || ''
  if (!slug) return ''

  const slugPattern = new RegExp(`["']${slug}["'][^\\d]{0,80}(\\d{2,})`, 'i')
  return slugPattern.exec(html)?.[1] || ''
}

const chapterSortValue = (value: string): number => {
  const match = cleanText(value).match(/\d+(?:\.\d+)?/)
  if (!match) return Number.MAX_SAFE_INTEGER
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

const buildChapterSummary = (href: string, label: string, languageCodes?: string[]): PluginChapterSummary => {
  const cleanLabel = cleanText(label) || 'Chapter'
  const chapterNumberMatch = cleanLabel.match(/chapter\s+([0-9]+(?:\.[0-9]+)?)/i)
  const chapterNumber = chapterNumberMatch?.[1] || cleanLabel

  return {
    siteId: toSiteId(href),
    siteLink: toAbsolute(href),
    name: cleanLabel,
    number: chapterNumber,
    language: 'en',
    languageCodes: normalizeLanguageCodes(languageCodes),
    offline: false,
    pages: []
  }
}

const parseChapterList = (html: string, languageCodes?: string[]): PluginChapterSummary[] => {
  const $ = cheerio.load(html)
  const seen = new Map<string, PluginChapterSummary>()

  const chapterSelector = 'li.wp-manga-chapter:not(.premium-block)'
  const scopes = ['.page-content-listing', '.listing-chapters_wrap', '.main.version-chap', '.version-chap']

  for (const selector of scopes) {
    $(selector)
      .find(`${chapterSelector} a[href*="/chapter"], ${chapterSelector} a[href*="/manga/"][href*="chapter"]`)
      .each((_, element) => {
        const href = $(element).attr('href') || ''
        const siteId = toSiteId(href)
        if (!siteId || seen.has(siteId)) return
        const label = $(element).text()
        if (!/chapter/i.test(label)) return
        seen.set(siteId, buildChapterSummary(href, label, languageCodes))
      })

    if (seen.size > 0) break
  }

  if (seen.size === 0) {
    $(`${chapterSelector} a[href*="/chapter"], ${chapterSelector} a[href*="/manga/"][href*="chapter"]`).each(
      (_, element) => {
        const href = $(element).attr('href') || ''
        const siteId = toSiteId(href)
        if (!siteId || seen.has(siteId)) return
        const label = $(element).text()
        if (!/chapter/i.test(label)) return
        seen.set(siteId, buildChapterSummary(href, label, languageCodes))
      }
    )
  }

  return [...seen.values()].sort((left, right) => {
    const leftValue = chapterSortValue(left.number)
    const rightValue = chapterSortValue(right.number)
    if (leftValue !== rightValue) return leftValue - rightValue
    return left.name.localeCompare(right.name)
  })
}

const parsePages = (html: string): PluginPage[] => {
  const $ = cheerio.load(html)
  const pages: string[] = []

  const selectors = [
    'div.page-break',
    'li.blocks-gallery-item',
    '.reading-content .text-left:not(:has(.blocks-gallery-item)) img',
    '.chapter-content img',
    '.entry-content img',
    'img[data-src]',
    'img[src]'
  ]

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const node = $(element)
      const image = node.is('img') ? node : node.find('img').first()
      const raw = image.attr('data-src') || image.attr('data-lazy-src') || image.attr('src') || ''
      const absolute = toAbsolute(raw)
      if (!absolute) return
      if (!/\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(absolute)) return
      if (!/\/wp-content\/uploads\/|\/cdn\//i.test(absolute)) return
      pages.push(absolute)
    })

    if (pages.length > 0) break
  }

  return Array.from(new Set(pages)).map((path, index) => {
    const fileName = path.split('/').pop()?.split('?')[0] || `page-${index + 1}.jpg`
    return {
      filename: fileName,
      path
    }
  })
}

export async function searchUtoonManga(
  query: string,
  _limit = 25,
  languageCodes?: string[]
): Promise<PluginMangaSummary[]> {
  void _limit
  const searchUrl = new URL(UTOON_SEARCH_PATH, `${UTOON_BASE_URL}/`)
  searchUrl.searchParams.set('s', query)
  searchUrl.searchParams.set('post_type', 'wp-manga')

  const html = await fetchHtml(searchUrl.toString())
  return parseSearchCards(html, languageCodes, searchUrl.toString())
}

export async function getUtoonMangaDetails(
  siteId: string,
  languageCodes?: string[]
): Promise<PluginMangaSummary | null> {
  const html = await fetchHtml(toMangaUrl(siteId))
  const details = parseMangaDetails(html, siteId)
  if (!details) return null

  const chapters = parseChapterList(html, languageCodes)
  return {
    ...details,
    chapterCount: details.chapterCount ?? chapters.length,
    languageCodes: normalizeLanguageCodes(languageCodes)
  }
}

export async function getUtoonList(languageCodes?: string[]): Promise<PluginMangaSummary[]> {
  const html = await fetchHtml(`${UTOON_BASE_URL}/manga/?m_orderby=latest`)
  return parseSearchCards(html, languageCodes)
}

export async function getUtoonChapters(
  siteId: string,
  languageCodes?: string[]
): Promise<PluginChapterSummary[]> {
  const detailHtml = await fetchHtml(toMangaUrl(siteId))
  let chapters = parseChapterList(detailHtml, languageCodes)

  if (chapters.length === 0) {
    try {
      const newEndpointHtml = await fetchNewChapterEndpointHtml(toMangaUrl(siteId))
      const newEndpointChapters = parseChapterList(newEndpointHtml, languageCodes)
      if (newEndpointChapters.length > 0) {
        chapters = newEndpointChapters
      }
    } catch (error) {
      console.warn('UTOON new chapter endpoint failed:', error)
    }
  }

  if (chapters.length === 0) {
    const postId = extractPostId(detailHtml, siteId)
    if (postId) {
      try {
        const ajaxHtml = await fetchAjaxHtml(postId)
        const ajaxChapters = parseChapterList(ajaxHtml, languageCodes)
        if (ajaxChapters.length > 0) {
          chapters = ajaxChapters
        }
      } catch (error) {
        console.warn('UTOON legacy chapter ajax fallback failed:', error)
      }
    }
  }

  return chapters
}

export async function getUtoonChapterPages(chapterSiteId: string): Promise<PluginPage[]> {
  const html = await fetchHtml(toChapterUrl(chapterSiteId))
  return parsePages(html)
}
