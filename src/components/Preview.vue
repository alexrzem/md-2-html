<template>
  <div class="flex size-full flex-col bg-white">
    <!-- Preview toolbar -->
    <div
      class="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5"
    >
      <!-- Traffic-light dots for decoration -->
      <div class="flex items-center gap-1.5">
        <div class="size-2.5 rounded-full bg-red-400/80" />
        <div class="size-2.5 rounded-full bg-yellow-400/80" />
        <div class="size-2.5 rounded-full bg-green-400/80" />
      </div>

      <!-- Address bar mock -->
      <div
        class="flex flex-1 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-400"
      >
        <Globe class="size-3 shrink-0" />
        <span class="truncate">preview — standalone output.html</span>
      </div>

      <!-- Char / line count -->
      <span class="shrink-0 text-xs tabular-nums text-gray-400">
        {{ charCount }} chars
      </span>

      <!-- Refresh button -->
      <button
        title="Reload preview"
        class="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
        @click="refreshKey++"
      >
        <RefreshCw class="size-3" />
      </button>
    </div>

    <!-- iframe preview -->
    <iframe
      :key="refreshKey"
      :srcdoc="store.htmlOutput"
      class="flex-1 border-0 bg-white"
      title="Markdown Preview"
      sandbox="allow-scripts"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Globe, RefreshCw } from 'lucide-vue-next'
import { useEditorStore } from '../stores/editorStore'

const store = useEditorStore()
const refreshKey = ref(0)

const charCount = computed(() => store.htmlOutput.length.toLocaleString())
</script>
