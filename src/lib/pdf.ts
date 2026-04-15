import * as pdfjs from 'pdfjs-dist'
// @ts-expect-error · vite url import for worker
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export async function extractTextFromPDF(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const chunks: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const text = content.items
      .map((it) => ('str' in it ? it.str : ''))
      .join(' ')
    chunks.push(text)
  }
  return chunks.join('\n\n')
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPDF(file)
  }
  // Plain text / markdown
  return await file.text()
}

/**
 * IA cleaning · placeholder client-side heuristic.
 * Backend IA (OpenAI/Groq/etc) a brancher plus tard via /api/clean.
 * Pour l'instant : strip pages numbers, multiple spaces, hyphenation, headers.
 */
export function basicClean(text: string): string {
  return text
    .replace(/-\n/g, '') // de-hyphenate
    .replace(/\n{3,}/g, '\n\n')
    .replace(/Page \d+( sur \d+)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Naive Q&A extraction · splits on question marks + takes following sentence as answer candidate.
 * Le user pourra corriger avant publication.
 */
export interface ExtractedQA {
  question: string
  answer: string
}

export function extractQAs(text: string, max = 20): ExtractedQA[] {
  const cleaned = basicClean(text)
  const qas: ExtractedQA[] = []
  const lines = cleaned.split(/(?<=\?)\s+/)
  for (let i = 0; i < lines.length - 1 && qas.length < max; i++) {
    const line = lines[i].trim()
    if (!line.endsWith('?')) continue
    if (line.length < 10 || line.length > 200) continue
    const next = lines[i + 1]?.split(/[.!\n]/)[0]?.trim() ?? ''
    if (next.length < 2 || next.length > 120) continue
    qas.push({ question: line, answer: next })
  }
  return qas
}
