<template>
  <div class="flex size-full flex-col">
    <!-- Toolbar -->
    <div
      class="flex shrink-0 items-center gap-2 border-b border-gray-700/60 bg-gray-800/50 px-3 py-1.5"
    >
      <span class="text-xs text-gray-400">
        Edit CSS to style your preview. Changes apply instantly.
      </span>

      <div class="flex-1" />

      <button
        title="Format CSS (Shift+Alt+F)"
        class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        @click="monacoRef?.formatDocument()"
      >
        <WandSparkles class="size-3" />
        Format
      </button>

      <button
        title="Reset to default CSS"
        class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-red-900/50 hover:text-red-300"
        @click="resetCSS"
      >
        <RotateCcw class="size-3" />
        Reset
      </button>
    </div>

    <!-- Monaco Editor -->
    <div class="min-h-0 flex-1">
      <MonacoEditor
        ref="monacoRef"
        v-model="store.cssContent"
        language="css"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WandSparkles, RotateCcw } from 'lucide-vue-next'
import MonacoEditor from './MonacoEditor.vue'
import { useEditorStore } from '../stores/editorStore'

const store = useEditorStore()
const monacoRef = ref<InstanceType<typeof MonacoEditor> | null>(null)

function resetCSS() {
  // Re-import default CSS by resetting via store
  store.cssContent = `/* Reset CSS */
body {
  font-family: system-ui, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.7;
  color: #333;
}

h1, h2, h3 { color: #111; margin-top: 1.5rem; }
a { color: #4f46e5; }
code { background: #f1f5f9; padding: 0.1em 0.4em; border-radius: 4px; font-family: monospace; }
pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #6366f1; padding: 0.5rem 1rem; background: #eef2ff; margin: 1rem 0; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
th { background: #f1f5f9; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
`
}
</script>
