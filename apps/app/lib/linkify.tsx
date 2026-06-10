import type { ReactNode } from 'react'
import { decodeHtml } from './html'

const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/g

/**
 * Detecta se o texto contém marcação HTML (de um editor rico).
 */
export function looksLikeHtml(str: string): boolean {
  return /<\/?(p|br|div|h[1-6]|ul|ol|li|strong|em|b|i|u|a|img|blockquote|s|mark|span)\b/i.test(str)
}

/**
 * Converte texto puro em parágrafos com URLs clicáveis.
 * Mantém quebras de parágrafo (linha em branco) e quebras simples (<br>).
 */
export function linkifyPlainText(raw: string, linkClass: string): ReactNode {
  const text = decodeHtml(raw)
  const paragraphs = text.split(/\n{2,}/)

  return paragraphs.map((para, pi) => {
    const lines = para.split(/\n/)
    return (
      <p key={pi} className="mb-4 last:mb-0">
        {lines.map((line, li) => (
          <span key={li}>
            {linkifyLine(line, linkClass)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    )
  })
}

function linkifyLine(line: string, linkClass: string): ReactNode {
  const parts = line.split(URL_REGEX)
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      // reset lastIndex porque o regex é global
      URL_REGEX.lastIndex = 0
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {part}
        </a>
      )
    }
    return part
  })
}
