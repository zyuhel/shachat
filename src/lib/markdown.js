import { marked } from 'marked'
import DOMPurify from 'dompurify'


// The U+2028 character (LINE SEPARATOR) is sometimes used as a line break, but it is treated as a space in some web environments,
// causing unexpected rendering issues. To avoid this, it's recommended to replace it with a standard line break character such as `\n`.
const LINE_SEPARATOR = /\u2028/g

// LINE_BREAK_VISUAL is used for formatting when the message is displayed as a single line in a preview.
// It replaces line breaks with a visual symbol (↵) to indicate where new lines exist in the original text.
const LINE_BREAK_VISUAL =  '↵ '

marked.setOptions({
  // marked sanitize is deprecated, using DOMPurify
  // sanitize: true,
  gfm: true,
  breaks: true
})

const renderer = new marked.Renderer()

renderer.image = function ({ _href, _title, _text }) {
  return ''
}

renderer.link = function ({ href, _title, text }) {
  const linkPattern = /^(eth|bch|bitcoin|https?|s?ftp|magnet|tor|onion|tg):(.*)$/i
  const emailPattern = /^(mailto):[^@]+@[^@]+\.[^@]+$/i

  if (linkPattern.test(href)) {
    return `<a onClick="window.open('${href}', '_blank', 'resizable,scrollbars,status,noopener'); return false;">${href}</a>`
  } else if (emailPattern.test(href)) {
    return `<a href="${href}">${text}</a>`
  }

  return text
}

renderer.heading = function ({ text }) {
  return `<p>${text}</p>`
}

marked.use({ renderer })

/**
 * Sanitizes text to show HTML
 * @param {string} text text to sanitize
 * @returns {string} sanitized HTML
 */
export function sanitizeHTML(text = '') {
  return DOMPurify.sanitize(text)
}

/**
 * Renders markdown-formatted input to HTML, and sanitizes it
 * @param {string} text text to render
 * @returns {string} resulting sanitized HTML
 */
export function renderMarkdown(text = '') {
  return marked.parse(sanitizeHTML(text.replace(LINE_SEPARATOR,  "\n")))
}

/**
 * Gets the first line of a message, sanitizes it, and returns back
 * Used in ChatPreview and Notifications
 * @param {string} text text to process
 * @returns {string} resulting clear text of the first line
 */
export function removeFormats(text = '') {
  const node = document.createElement('div')
  const textWithSymbol = text.replace(/\n/g, '↵ ')
  node.innerHTML = marked.parse(sanitizeHTML(textWithSymbol))

  return node.textContent || node.innerText || ''
}

export function formatMessage(text = '') {
  const node = document.createElement('div')

  const textWithSymbol = text.replace(/\n/g, LINE_BREAK_VISUAL)
  node.innerHTML = marked.parse(sanitizeHTML(textWithSymbol))

  const textWithoutHtml = node.textContent || node.innerText || ''

  return textWithoutHtml
    .replace(LINE_SEPARATOR, LINE_BREAK_VISUAL)
    .replace(/↵/g, '<span class="arrow-return">↵</span>')
}
