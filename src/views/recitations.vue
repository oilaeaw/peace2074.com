<template>
  <q-page class="recitations-page">
    <div class="sections-wrap">
      <section
        v-for="section in sections"
        :key="section.key"
        class="recite-section"
      >
        <div class="section-heading">
          <h2 class="section-title">{{ t(section.titleKey) }}</h2>
          <p class="section-subtitle">{{ t(section.subtitleKey) }}</p>
        </div>

        <q-card
          v-for="item in section.items"
          :key="item.key"
          flat
          class="recite-card"
        >
          <p class="item-detail">{{ t(item.detailKey) }}</p>

          <div class="item-links">
            <q-btn
              v-for="link in item.links"
              :key="`${item.key}-${link.id}-${link.ayah ?? ''}`"
              no-caps
              unelevated
              color="primary"
              icon="play_arrow"
              class="sura-link"
              :to="{ path: `/quran/${link.id}`, query: { autoplay: 'true' } }"
              :aria-label="suraLinkLabel(link)"
              :label="suraLinkLabel(link)"
            />
          </div>

          <div class="item-source">{{ t(item.sourceKey) }}</div>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface SuraLink {
  id: number
  nameKey: string
  ayah?: string
}

interface ReciteItem {
  key: string
  detailKey: string
  sourceKey: string
  links: SuraLink[]
}

interface ReciteSection {
  key: string
  titleKey: string
  subtitleKey: string
  items: ReciteItem[]
}

const NAME = {
  kahf: 'pages.recitations.suraNames.kahf',
  mulk: 'pages.recitations.suraNames.mulk',
  sajdah: 'pages.recitations.suraNames.sajdah',
  baqarah: 'pages.recitations.suraNames.baqarah',
  ikhlas: 'pages.recitations.suraNames.ikhlas',
  falaq: 'pages.recitations.suraNames.falaq',
  nas: 'pages.recitations.suraNames.nas',
} as const

function suraLinkLabel(link: SuraLink) {
  const name = t(link.nameKey)
  const ref = link.ayah ? `${link.id}:${link.ayah}` : String(link.id)
  return `${name} · ${ref}`
}

const sections: ReciteSection[] = [
  {
    key: 'friday',
    titleKey: 'pages.recitations.sections.friday.title',
    subtitleKey: 'pages.recitations.sections.friday.subtitle',
    items: [
      {
        key: 'kahf',
        detailKey: 'pages.recitations.items.kahf.detail',
        sourceKey: 'pages.recitations.items.kahf.source',
        links: [{ id: 18, nameKey: NAME.kahf }],
      },
    ],
  },
  {
    key: 'sleep',
    titleKey: 'pages.recitations.sections.sleep.title',
    subtitleKey: 'pages.recitations.sections.sleep.subtitle',
    items: [
      {
        key: 'mulk',
        detailKey: 'pages.recitations.items.mulk.detail',
        sourceKey: 'pages.recitations.items.mulk.source',
        links: [{ id: 67, nameKey: NAME.mulk }],
      },
      {
        key: 'sajdahMulk',
        detailKey: 'pages.recitations.items.sajdahMulk.detail',
        sourceKey: 'pages.recitations.items.sajdahMulk.source',
        links: [
          { id: 32, nameKey: NAME.sajdah },
          { id: 67, nameKey: NAME.mulk },
        ],
      },
      {
        key: 'baqarahLast',
        detailKey: 'pages.recitations.items.baqarahLast.detail',
        sourceKey: 'pages.recitations.items.baqarahLast.source',
        links: [{ id: 2, nameKey: NAME.baqarah, ayah: '285-286' }],
      },
      {
        key: 'quls',
        detailKey: 'pages.recitations.items.quls.detail',
        sourceKey: 'pages.recitations.items.quls.source',
        links: [
          { id: 112, nameKey: NAME.ikhlas },
          { id: 113, nameKey: NAME.falaq },
          { id: 114, nameKey: NAME.nas },
        ],
      },
      {
        key: 'ayatAlKursiSleep',
        detailKey: 'pages.recitations.items.ayatAlKursiSleep.detail',
        sourceKey: 'pages.recitations.items.ayatAlKursiSleep.source',
        links: [{ id: 2, nameKey: NAME.baqarah, ayah: '255' }],
      },
    ],
  },
  {
    key: 'morningEvening',
    titleKey: 'pages.recitations.sections.morningEvening.title',
    subtitleKey: 'pages.recitations.sections.morningEvening.subtitle',
    items: [
      {
        key: 'ayatAlKursiPrayer',
        detailKey: 'pages.recitations.items.ayatAlKursiPrayer.detail',
        sourceKey: 'pages.recitations.items.ayatAlKursiPrayer.source',
        links: [{ id: 2, nameKey: NAME.baqarah, ayah: '255' }],
      },
      {
        key: 'qulsMorningEvening',
        detailKey: 'pages.recitations.items.qulsMorningEvening.detail',
        sourceKey: 'pages.recitations.items.qulsMorningEvening.source',
        links: [
          { id: 112, nameKey: NAME.ikhlas },
          { id: 113, nameKey: NAME.falaq },
          { id: 114, nameKey: NAME.nas },
        ],
      },
    ],
  },
]
</script>

<style scoped lang="scss">
.recitations-page {
  min-height: 100dvh;
  padding: 0;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 48%, #f9fbff 100%);
  color: #0f172a;
}

.sections-wrap {
  padding: 16px 12px 80px;
}

/* ── Section ──────────────────────────────────────────── */

.recite-section {
  margin-top: 24px;

  &:first-child {
    margin-top: 8px;
  }
}

.section-heading {
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: clamp(1.25rem, 4vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.section-subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
}

/* ── Card ─────────────────────────────────────────────── */

.recite-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
}

.recite-card + .recite-card {
  margin-top: 10px;
}

.item-detail {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #0f172a;
}

.item-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.sura-link {
  border-radius: 999px;
  font-weight: 600;
  flex: 1 1 auto;
}

.item-source {
  margin-top: 10px;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #64748b;
}

/* ── Dark mode ────────────────────────────────────────── */

:global(body.body--dark) .recitations-page {
  background: linear-gradient(180deg, #020617 0%, #020b18 48%, #01050f 100%);
  color: #e2e8f0;
}

:global(body.body--dark) .section-subtitle {
  color: #94a3b8;
}

:global(body.body--dark) .recite-card {
  background: rgba(7, 15, 28, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 8px 32px rgba(2, 6, 23, 0.48);
}

:global(body.body--dark) .item-detail {
  color: #f1f5f9;
}

:global(body.body--dark) .item-source {
  color: #94a3b8;
}
</style>
