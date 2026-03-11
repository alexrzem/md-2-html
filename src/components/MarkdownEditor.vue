<template>
  <div class="flex size-full flex-col">
    <!-- Toolbar -->
    <div
      class="flex shrink-0 items-center gap-1 border-b border-gray-700/60 bg-gray-800/50 px-3 py-1.5"
    >
      <button
        v-for="action in toolbarActions"
        :key="action.label"
        :title="action.label"
        class="rounded px-2 py-1 text-xs font-mono font-semibold text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        @click="action.handler"
      >
        {{ action.symbol }}
      </button>

      <div class="mx-1 h-4 w-px bg-gray-600" />

      <button
        title="Format document (Shift+Alt+F)"
        class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        @click="monacoRef?.formatDocument()"
      >
        <WandSparkles class="size-3" />
        Format
      </button>
    </div>

    <!-- Monaco Editor -->
    <div class="min-h-0 flex-1">
      <MonacoEditor
        ref="monacoRef"
        v-model="store.markdownContent"
        language="markdown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WandSparkles } from 'lucide-vue-next'
import MonacoEditor from './MonacoEditor.vue'
import { useEditorStore } from '../stores/editorStore'

const store = useEditorStore()
const monacoRef = ref<InstanceType<typeof MonacoEditor> | null>(null)

// ─── Toolbar actions ──────────────────────────────────────────────────────────

// Simple helper: wrap selected text or insert at cursor via store value manipulation
// We trigger keyboard shortcuts via the Monaco action system
const toolbarActions = [
  {
    label: 'Bold (Ctrl+B)',
    symbol: 'B',
    handler: () => insertWrap('**', '**', 'bold text'),
  },
  {
    label: 'Italic (Ctrl+I)',
    symbol: 'I',
    handler: () => insertWrap('*', '*', 'italic text'),
  },
  {
    label: 'Strikethrough',
    symbol: 'S̶',
    handler: () => insertWrap('~~', '~~', 'strikethrough'),
  },
  {
    label: 'Inline Code',
    symbol: '</>',
    handler: () => insertWrap('`', '`', 'code'),
  },
  {
    label: 'Link',
    symbol: '🔗',
    handler: () => insertWrap('[', '](https://example.com)', 'link text'),
  },
  {
    label: 'Blockquote',
    symbol: '❝',
    handler: () => insertPrefix('> '),
  },
  {
    label: 'Unordered List',
    symbol: '•—',
    handler: () => insertPrefix('- '),
  },
  {
    label: 'Ordered List',
    symbol: '1.',
    handler: () => insertPrefix('1. '),
  },
  {
    label: 'Heading 1',
    symbol: 'H1',
    handler: () => insertPrefix('# '),
  },
  {
    label: 'Heading 2',
    symbol: 'H2',
    handler: () => insertPrefix('## '),
  },
  {
    label: 'Heading 3',
    symbol: 'H3',
    handler: () => insertPrefix('### '),
  },
]

function insertWrap(before: string, after: string, placeholder: string) {
  // Simple approach: append at end if no selection info available
  // Monaco handles this better via commands; here we manipulate the store value
  // as a fallback for the toolbar buttons
  const content = store.markdownContent
  store.markdownContent = content + `${before}${placeholder}${after}`
}

function insertPrefix(prefix: string) {
  const content = store.markdownContent
  store.markdownContent = content + `\n${prefix}`
}
</script>
