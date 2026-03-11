<template>
  <div
    class="flex h-screen flex-col overflow-hidden bg-gray-950 text-gray-100"
  >
    <!-- ── Drop overlay ──────────────────────────────────────────────────────── -->
    <Transition name="drop-fade">
      <div
        v-if="isDragging"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        :class="overlayBg"
      >
        <!-- Dashed border card -->
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-16 py-12 text-center shadow-2xl transition-all"
          :class="overlayCard"
        >
          <component :is="overlayIcon" class="size-14 opacity-90" />
          <div>
            <p class="text-2xl font-bold tracking-tight">{{ overlayTitle }}</p>
            <p class="mt-1 text-sm opacity-60">{{ overlaySubtitle }}</p>
          </div>
          <!-- File-type badge -->
          <div
            v-if="dragFileType !== 'unknown'"
            class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
            :class="overlayBadge"
          >
            <component :is="overlayIcon" class="size-3" />
            {{ dragFileType === 'markdown' ? '.md / .markdown' : '.css' }}
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Drop toast ────────────────────────────────────────────────────────── -->
    <Transition name="toast-slide">
      <div
        v-if="toast"
        class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-xl"
        :class="
          toast.type === 'md'
            ? 'border-indigo-500/40 bg-indigo-950 text-indigo-200'
            : 'border-violet-500/40 bg-violet-950 text-violet-200'
        "
      >
        <div class="flex items-center gap-2">
          <CheckCircle2 class="size-4 shrink-0" />
          {{ toast.message }}
        </div>
      </div>
    </Transition>
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

<style scoped>
/* Drop overlay fade */
.drop-fade-enter-active,
.drop-fade-leave-active {
  transition:
    opacity 0.15s ease,
    backdrop-filter 0.15s ease;
}
.drop-fade-enter-from,
.drop-fade-leave-to {
  opacity: 0;
}

/* Toast slide-up */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 0.75rem);
}
</style>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import {
  FileText,
  Palette,
  Download,
  Copy,
  Check,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
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

// ── Drag & Drop ───────────────────────────────────────────────────────────────

type DragFileType = 'markdown' | 'css' | 'unknown' | null

const dragDepth = ref(0)
const dragFileType = ref<DragFileType>(null)
const isDragging = computed(() => dragDepth.value > 0)

/** Sniff the file extension during dragenter via webkitGetAsEntry (pre-drop) */
function detectDragType(e: DragEvent): DragFileType {
  const item = e.dataTransfer?.items[0]
  if (!item || item.kind !== 'file') return null
  const entry = item.webkitGetAsEntry?.()
  if (!entry?.isFile) return null
  const ext = entry.name.split('.').pop()?.toLowerCase()
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  if (ext === 'css') return 'css'
  return 'unknown'
}

function onDragEnter(e: DragEvent) {
  dragDepth.value++
  if (dragDepth.value === 1) {
    dragFileType.value = detectDragType(e)
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect =
      dragFileType.value && dragFileType.value !== 'unknown' ? 'copy' : 'none'
  }
}

function onDragLeave() {
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (dragDepth.value === 0) dragFileType.value = null
}

async function onDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragDepth.value = 0
  dragFileType.value = null

  const file = e.dataTransfer?.files[0]
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase()
  const text = await file.text()

  if (ext === 'md' || ext === 'markdown') {
    store.markdownContent = text
    switchTab('markdown')
    showToast(`Loaded "${file.name}" into Markdown editor`, 'md')
  } else if (ext === 'css') {
    store.cssContent = text
    switchTab('css')
    showToast(`Loaded "${file.name}" into CSS editor`, 'css')
  }
  // Unknown extensions are silently ignored (overlay showed warning already)
}

// Attach drag listeners on window in capture phase so they fire before
// Monaco's internal handlers, guaranteeing preventDefault() is called
// on dragover (without which browsers refuse to fire the drop event).
onMounted(() => {
  window.addEventListener('dragenter', onDragEnter, true)
  window.addEventListener('dragover', onDragOver, true)
  window.addEventListener('dragleave', onDragLeave, true)
  window.addEventListener('drop', onDrop, true)
})

onUnmounted(() => {
  window.removeEventListener('dragenter', onDragEnter, true)
  window.removeEventListener('dragover', onDragOver, true)
  window.removeEventListener('dragleave', onDragLeave, true)
  window.removeEventListener('drop', onDrop, true)
})

// Overlay appearance driven by dragFileType
const overlayBg = computed(() => {
  if (dragFileType.value === 'markdown') return 'bg-indigo-950/80'
  if (dragFileType.value === 'css') return 'bg-violet-950/80'
  if (dragFileType.value === 'unknown') return 'bg-red-950/80'
  return 'bg-gray-950/80'
})

const overlayCard = computed(() => {
  if (dragFileType.value === 'markdown')
    return 'border-indigo-400 bg-indigo-900/60 text-indigo-100'
  if (dragFileType.value === 'css')
    return 'border-violet-400 bg-violet-900/60 text-violet-100'
  if (dragFileType.value === 'unknown')
    return 'border-red-400 bg-red-900/60 text-red-100'
  return 'border-gray-500 bg-gray-900/60 text-gray-100'
})

const overlayBadge = computed(() => {
  if (dragFileType.value === 'markdown')
    return 'border-indigo-400/50 bg-indigo-800/60 text-indigo-200'
  return 'border-violet-400/50 bg-violet-800/60 text-violet-200'
})

const overlayIcon = computed(() => {
  if (dragFileType.value === 'markdown') return FileText
  if (dragFileType.value === 'css') return Palette
  if (dragFileType.value === 'unknown') return AlertCircle
  return UploadCloud
})

const overlayTitle = computed(() => {
  if (dragFileType.value === 'markdown') return 'Drop to load Markdown'
  if (dragFileType.value === 'css') return 'Drop to load CSS styles'
  if (dragFileType.value === 'unknown') return 'Unsupported file type'
  return 'Drop a file to load it'
})

const overlaySubtitle = computed(() => {
  if (dragFileType.value === 'markdown')
    return 'Replaces the current Markdown editor content'
  if (dragFileType.value === 'css')
    return 'Replaces the current CSS editor content'
  if (dragFileType.value === 'unknown')
    return 'Only .md, .markdown, and .css files are supported'
  return 'Accepts .md / .markdown files and .css files'
})

// ── Toast ─────────────────────────────────────────────────────────────────────

const toast = ref<{ message: string; type: 'md' | 'css' } | null>(null)
let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'md' | 'css') {
  toast.value = { message, type }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => (toast.value = null), 3000)
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
