import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { marked } from 'marked'

const DEFAULT_MARKDOWN = `# Markdown to HTML Converter

Welcome to **MD-2-HTML** — a live markdown editor powered by Monaco.

## Features

- Real-time markdown preview
- Custom CSS styling
- Standalone HTML export with embedded styles
- Syntax highlighting & autocomplete

## Code Example

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

## Table

| Feature        | Status  | Notes                     |
|----------------|---------|---------------------------|
| Monaco Editor  | ✅ Done | Markdown & CSS support    |
| Live Preview   | ✅ Done | Iframe with srcdoc        |
| HTML Export    | ✅ Done | Fully standalone output   |
| Custom CSS     | ✅ Done | Applied to preview        |

## Blockquote

> "Any sufficiently advanced technology is indistinguishable from magic."
> — Arthur C. Clarke

## Lists

### Unordered
- Item one
  - Nested item
  - Another nested item
- Item two
- Item three

### Ordered
1. First step
2. Second step
3. Third step

---

*Italic*, **Bold**, ***Bold Italic***, ~~Strikethrough~~

[Visit Example](https://example.com)
`

const DEFAULT_CSS = `/* ========================================
   Custom styles for your markdown preview
   ======================================== */

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, sans-serif;
  max-width: 860px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  line-height: 1.8;
  color: #1e293b;
  background: #f8fafc;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: #0f172a;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

h1 {
  font-size: 2.25rem;
  border-bottom: 3px solid #6366f1;
  padding-bottom: 0.5rem;
  margin-top: 0;
}

h2 {
  font-size: 1.625rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.25rem;
}

h3 { font-size: 1.25rem; }
h4 { font-size: 1.125rem; }

/* Links */
a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* Paragraphs */
p {
  margin: 0 0 1.25rem;
}

/* Inline code */
code {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.1em 0.4em;
  border-radius: 0.3em;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;
  font-size: 0.875em;
  color: #7c3aed;
}

/* Code blocks */
pre {
  background: #0f172a;
  border-radius: 0.625rem;
  padding: 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

pre code {
  background: none;
  border: none;
  color: #e2e8f0;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.7;
}

/* Blockquote */
blockquote {
  border-left: 4px solid #6366f1;
  margin: 1.5rem 0;
  padding: 0.75rem 1.5rem;
  background: #eef2ff;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #374151;
  font-style: italic;
}

blockquote p:last-child {
  margin-bottom: 0;
}

/* Tables */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  font-size: 0.9375rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

th {
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: left;
  letter-spacing: 0.025em;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #374151;
}

tr:last-child td {
  border-bottom: none;
}

tr:nth-child(even) td {
  background: #f8fafc;
}

/* Lists */
ul, ol {
  padding-left: 1.75rem;
  margin: 0.75rem 0 1.25rem;
}

li {
  margin: 0.4rem 0;
}

li > ul, li > ol {
  margin: 0.25rem 0;
}

/* Horizontal rule */
hr {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 2rem 0;
}

/* Images */
img {
  max-width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  margin: 1rem 0;
}

/* Strong & Em */
strong { color: #0f172a; }
em { color: #475569; }

/* Del (strikethrough) */
del { color: #94a3b8; }
`

function buildStandaloneHtml(bodyHtml: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Markdown Preview</title>
  <style>
${css}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

export const useEditorStore = defineStore('editor', () => {
  const markdownContent = ref(DEFAULT_MARKDOWN)
  const cssContent = ref(DEFAULT_CSS)
  const htmlOutput = ref('')

  async function updateHtml() {
    const result = marked.parse(markdownContent.value)
    const bodyHtml = result instanceof Promise ? await result : result
    htmlOutput.value = buildStandaloneHtml(bodyHtml, cssContent.value)
  }

  watch([markdownContent, cssContent], updateHtml, { immediate: true })

  function downloadHtml() {
    const blob = new Blob([htmlOutput.value], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    markdownContent,
    cssContent,
    htmlOutput,
    downloadHtml,
  }
})
