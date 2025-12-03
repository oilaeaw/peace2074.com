<script lang="ts" setup>
const props = defineProps({
  /**
   * The list of items to display.
   */
  items: {
    type: Array as () => string[],
    default: () => [],
  },
  /**
   * The currently active index (1-based).
   */
  activeIndex: {
    type: Number,
    default: -1,
  },
  /**
   * A flag to determine if data is available to render.
   */
  hasData: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['item-click'])

function onItemClick(index: number) {
  emit('item-click', index)
}
</script>

<template>
  <div>
    <ol v-if="hasData && items.length > 0" class="column q-mt-xl q-pt-lg text-center">
      <li v-for="(item, index) in items" :key="index">
        <!-- Use a scoped slot to allow for custom rendering, with a default -->
        <slot name="item" :item="item" :index="index" :is-active="activeIndex === index + 1">
          <a
            class="q-mx-xs cursor-pointer text-center"
            :class="{ 'active-sura': activeIndex === index + 1 }"
            @click.prevent="onItemClick(index)"
          >
            {{ index + 1 }}-{{ item }}
          </a>
        </slot>
      </li>
    </ol>
    <div v-else class="q-mt-xl q-pt-lg text-center">
      <p>No data available</p>
    </div>
  </div>
</template>

<style scoped>
/* Add list-style-none to remove default bullet points */
ol {
  list-style-type: none;
  padding: 0;
}
.active-sura {
  /* No background! */
  color: var(--active-sura-color, #1a5e1a) !important;
  border: 2px solid var(--active-sura-border, #28ff7a);
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(40, 167, 69, 0.08);
  outline: none;
}

.nuxt-link, a {
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}

:root {
  --active-sura-color: #1a5e1a;
  --active-sura-border: #28a745;
}

@media (prefers-color-scheme: dark) {
  :root {
    --active-sura-color: #eaffd6;
    --active-sura-border: #28ff7a;
  }
}
</style>
