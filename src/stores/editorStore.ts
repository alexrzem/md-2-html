import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { marked } from 'marked'
import DEFAULT_MARKDOWN from '../defaults/default.md?raw'
import DEFAULT_CSS from '../defaults/default.css?raw'

function buildStandaloneHtml(bodyHtml: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Markdown Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style type="text/tailwindcss">
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
