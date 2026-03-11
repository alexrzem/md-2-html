<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-950 text-gray-100">
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2.5"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="flex size-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold"
        >
          M↓
        </div>
        <h1 class="text-sm font-semibold tracking-wide text-gray-100">
          MD-2-HTML
        </h1>
        <span
          class="rounded-full border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
        >
          Monaco · Vite · Vue
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- HTML size badge -->
        <span class="text-xs tabular-nums text-gray-500">
          {{ htmlKb }} KB output
        </span>

        <!-- Copy HTML button -->
        <button
          class="flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-700 hover:text-white"
          title="Copy generated HTML to clipboard"
          @click="copyHtml"
        >
          <component :is="copied ? Check : Copy" class="size-3.5" />
          {{ copied ? 'Copied!' : 'Copy HTML' }}
        </button>

        <!-- Download button -->
        <button
          class="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
          title="Download as standalone HTML file"
          @click="store.downloadHtml"
        >
          <Download class="size-3.5" />
          Download HTML
        </button>
      </div>
    </header>

    <!-- ── Main two-column layout ─────────────────────────────────────────── -->
    <main class="flex min-h-0 flex-1 overflow-hidden">
      <!-- ── Left column: tabbed editors ──────────────────────────────────── -->
      <div
        class="flex w-1/2 min-w-0 flex-col border-r border-gray-800"
        :style="{ width: leftWidth + '%' }"
      >
        <!-- Tab bar -->
        <div
          class="flex shrink-0 items-center border-b border-gray-800 bg-gray-900"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.id
                ? 'border-b-2 border-indigo-500 text-white'
                : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200'
            "
            @click="switchTab(tab.id)"
          >
            <component :is="tab.icon" class="size-3.5" />
            {{ tab.label }}
          </button>

          <div class="flex-1" />

          <!-- Word / char counter -->
          <span class="pr-3 text-xs tabular-nums text-gray-600">
            <template v-if="activeTab === 'markdown'">
              {{ wordCount }} words
            </template>
            <template v-else>
              {{ cssLineCount }} lines
            </template>
          </span>
        </div>

        <!-- Editor panes — both mounted, shown/hidden via v-show for perf -->
        <div class="relative min-h-0 flex-1">
          <div
            v-show="activeTab === 'markdown'"
            class="absolute inset-0"
            @vue:mounted="onEditorPaneMounted('markdown')"
          >
            <MarkdownEditor ref="markdownEditorRef" />
          </div>
          <div
            v-show="activeTab === 'css'"
            class="absolute inset-0"
            @vue:mounted="onEditorPaneMounted('css')"
          >
            <CSSEditor ref="cssEditorRef" />
          </div>
        </div>
      </div>

      <!-- ── Resize handle ──────────────────────────────────────────────────── -->
      <div
        class="group relative z-10 flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-gray-800 transition-colors hover:bg-indigo-500/60 active:bg-indigo-500"
        @mousedown="startResize"
      >
        <div
          class="h-12 w-px rounded-full bg-gray-600 transition-colors group-hover:bg-indigo-400"
        />
      </div>

      <!-- ── Right column: preview ──────────────────────────────────────────── -->
      <div class="min-w-0 flex-1 overflow-hidden">
        <Preview />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import {
  FileText,
  Palette,
  Download,
  Copy,
  Check,
} from 'lucide-vue-next'
import MarkdownEditor from './components/MarkdownEditor.vue'
import CSSEditor from './components/CSSEditor.vue'
import Preview from './components/Preview.vue'
import { useEditorStore } from './stores/editorStore'

const store = useEditorStore()

// ── Tabs ──────────────────────────────────────────────────────────────────────

type TabId = 'markdown' | 'css'

const tabs = [
  { id: 'markdown' as TabId, label: 'Markdown', icon: FileText },
  { id: 'css' as TabId, label: 'CSS Styles', icon: Palette },
]

const activeTab = ref<TabId>('markdown')

const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const cssEditorRef = ref<InstanceType<typeof CSSEditor> | null>(null)

function switchTab(id: TabId) {
  activeTab.value = id
  // Allow DOM to update, then trigger Monaco layout recalculation
  nextTick(() => {
    if (id === 'markdown') {
      // @ts-expect-error — accessing exposed method via template ref chain
      markdownEditorRef.value?.monacoRef?.layout()
    } else {
      // @ts-expect-error — accessing exposed method via template ref chain
      cssEditorRef.value?.monacoRef?.layout()
    }
  })
}

function onEditorPaneMounted(tab: TabId) {
  if (activeTab.value === tab) {
    nextTick(() => switchTab(tab))
  }
}

// ── Statistics ────────────────────────────────────────────────────────────────

const wordCount = computed(() => {
  const words = store.markdownContent.trim().split(/\s+/)
  return words.filter(Boolean).length
})

const cssLineCount = computed(
  () => store.cssContent.split('\n').length,
)

const htmlKb = computed(() =>
  (store.htmlOutput.length / 1024).toFixed(1),
)

// ── Copy HTML ─────────────────────────────────────────────────────────────────

const copied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null

async function copyHtml() {
  try {
    await navigator.clipboard.writeText(store.htmlOutput)
    copied.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard API not available — silently ignore
  }
}

// ── Resize ────────────────────────────────────────────────────────────────────

const leftWidth = ref(50)

function startResize(event: MouseEvent) {
  event.preventDefault()
  const startX = event.clientX
  const startWidth = leftWidth.value
  const containerWidth = document.documentElement.clientWidth

  function onMove(e: MouseEvent) {
    const delta = e.clientX - startX
    const pct = startWidth + (delta / containerWidth) * 100
    leftWidth.value = Math.min(Math.max(pct, 20), 80)
  }

  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    // Trigger layout recalculation after resize
    nextTick(() => switchTab(activeTab.value))
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// Keep Monaco in sync when left width changes (debounced via rAF)
let rafId: number | null = null
watch(leftWidth, () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    // @ts-expect-error — accessing exposed method
    markdownEditorRef.value?.monacoRef?.layout()
    // @ts-expect-error — accessing exposed method
    cssEditorRef.value?.monacoRef?.layout()
  })
})
</script>
