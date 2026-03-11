<template>
  <div ref="containerRef" class="size-full" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'

// Set up Monaco environment once at module evaluation time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string): Worker {
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CSSWorker()
    }
    return new EditorWorker()
  },
}

// ─── Props & Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: string
  language: 'markdown' | 'css'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ─── Refs ─────────────────────────────────────────────────────────────────────

const containerRef = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// ─── Markdown completion provider ────────────────────────────────────────────

function registerMarkdownCompletions() {
  monaco.languages.registerCompletionItemProvider('markdown', {
    provideCompletionItems(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
    ) {
      const word = model.getWordUntilPosition(position)
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions: monaco.languages.CompletionItem[] = [
        {
          label: 'h1',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '# ${1:Heading 1}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Heading level 1',
          range,
        },
        {
          label: 'h2',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '## ${1:Heading 2}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Heading level 2',
          range,
        },
        {
          label: 'h3',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '### ${1:Heading 3}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Heading level 3',
          range,
        },
        {
          label: 'bold',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '**${1:bold text}**',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Bold text',
          range,
        },
        {
          label: 'italic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '*${1:italic text}*',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Italic text',
          range,
        },
        {
          label: 'strikethrough',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '~~${1:strikethrough text}~~',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Strikethrough text',
          range,
        },
        {
          label: 'link',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '[${1:link text}](${2:https://example.com})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Hyperlink',
          range,
        },
        {
          label: 'image',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '![${1:alt text}](${2:image-url.png})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Image',
          range,
        },
        {
          label: 'code',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '`${1:code}`',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Inline code',
          range,
        },
        {
          label: 'codeblock',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '```${1:language}\n${2:code}\n```',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Fenced code block',
          range,
        },
        {
          label: 'blockquote',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '> ${1:quote text}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Blockquote',
          range,
        },
        {
          label: 'ul',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '- ${1:Item 1}\n- ${2:Item 2}\n- ${3:Item 3}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Unordered list',
          range,
        },
        {
          label: 'ol',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            '1. ${1:First item}\n2. ${2:Second item}\n3. ${3:Third item}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Ordered list',
          range,
        },
        {
          label: 'table',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            '| ${1:Column 1} | ${2:Column 2} | ${3:Column 3} |\n|------------|------------|------------|\n| Cell 1     | Cell 2     | Cell 3     |\n| Cell 4     | Cell 5     | Cell 6     |',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'GFM Table',
          range,
        },
        {
          label: 'hr',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '---',
          documentation: 'Horizontal rule',
          range,
        },
        {
          label: 'task',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '- [ ] ${1:Task item}',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Task list item',
          range,
        },
        {
          label: 'frontmatter',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            '---\ntitle: ${1:Title}\ndate: ${2:2024-01-01}\nauthor: ${3:Author}\n---',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'YAML front matter',
          range,
        },
      ]

      return { suggestions }
    },
  })
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

let completionDisposable: monaco.IDisposable | null = null

onMounted(() => {
  if (!containerRef.value) return

  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'gutter',
    bracketPairColorization: { enabled: true },
    formatOnPaste: props.language === 'css',
    formatOnType: props.language === 'css',
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: props.language === 'css',
    },
    padding: { top: 12, bottom: 12 },
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  })

  editor.onDidChangeModelContent(() => {
    const value = editor!.getValue()
    emit('update:modelValue', value)
  })

  if (props.language === 'markdown') {
    completionDisposable = {
      dispose: () => {
        // Completion providers cannot be individually disposed in Monaco —
        // they are automatically cleaned up with the editor model
      },
    }
    registerMarkdownCompletions()
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (editor && editor.getValue() !== newVal) {
      // Preserve cursor position when updating from outside
      const position = editor.getPosition()
      editor.setValue(newVal)
      if (position) editor.setPosition(position)
    }
  },
)

onBeforeUnmount(() => {
  completionDisposable?.dispose()
  editor?.dispose()
})

// ─── Exposed API ──────────────────────────────────────────────────────────────

defineExpose({
  layout() {
    editor?.layout()
  },
  focus() {
    editor?.focus()
  },
  formatDocument() {
    editor?.getAction('editor.action.formatDocument')?.run()
  },
})
</script>
