import { RouteRecordRaw } from "vue-router";

import { buildLocaleAlias, buildLocalePath, normalizeLocale } from '@/utils/locale-routing'

// Type definitions
export const ROUTE_PATHS = {
  Home: "/",
} as const;

type RoutePathKey = keyof typeof ROUTE_PATHS;
export type RoutePath = (typeof ROUTE_PATHS)[RoutePathKey];

export const ROUTE_NAMES = {
  Home: "Home",
} as const satisfies Record<RoutePathKey, string>;

type RouteNameKey = keyof typeof ROUTE_NAMES;
export type RouteName = (typeof ROUTE_NAMES)[RouteNameKey];

function resolveLocaleParam(localeParam: unknown) {
  return normalizeLocale(
    Array.isArray(localeParam) ? localeParam[0] : typeof localeParam === 'string' ? localeParam : null
  )
}

function buildRoutePath(path: string, localeParam: unknown) {
  return buildLocalePath(path, resolveLocaleParam(localeParam), {
    forcePrefix: Boolean(resolveLocaleParam(localeParam)),
  })
}

function withLocaleAlias(route: RouteRecordRaw): RouteRecordRaw {
  const aliases = Array.isArray(route.alias)
    ? route.alias
    : route.alias
      ? [route.alias]
      : []

  return {
    ...route,
    alias: Array.from(new Set([...aliases, buildLocaleAlias(route.path)])),
    ...(route.children ? { children: route.children.map(withLocaleAlias) } : {}),
  } as RouteRecordRaw
}

// Routes
const baseRoutes: Array<RouteRecordRaw> = [
  {
    path: ROUTE_PATHS.Home,
    name: ROUTE_NAMES.Home,
    component: () => import('@/views/Home.vue'),
    meta: {
      title: 'Home',
      titleKey: 'pages.home.title',
      description:
        'Read Quran online, explore Islamic guidance, daily reminders, Tasbeeh, holy names, and supportive tools on PEACE2074.',
      keywords: [
        'Quran online',
        'Islamic knowledge platform',
        'Tasbeeh app',
        'daily Islamic reminders',
      ],
      contentGroup: 'home',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/tasbeeh',
    name: 'Tasbeeh',
    component: () => import('@/pages/tasbeeh.vue'),
    meta: {
      title: 'Tasbeeh',
      titleKey: 'pages.tasbeeh',
      description:
        'Use digital Tasbeeh beads to keep dhikr counts and stay focused with a clean Islamic prayer counter.',
      keywords: ['Tasbeeh online', 'dhikr counter', 'Islamic prayer beads'],
      contentGroup: 'tasbeeh',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/holynames',
    name: 'HolyNames',
    component: () => import('@/views/holynames.vue'),
    meta: {
      title: 'Holy Names',
      titleKey: 'pages.titles.holynames',
      description:
        'Browse and reflect on the holy names with a calm, searchable PEACE2074 reading experience.',
      keywords: ['Holy names', '99 names', 'Islamic reflection'],
      contentGroup: 'holy_names',
      schemaType: 'CollectionPage',
    },
  },
  {
    path: '/quran',
    name: 'QuranList',
    component: () => import('@/pages/quran/index.vue'),
    meta: {
      title: 'Quran',
      titleKey: 'pages.quran.title',
      description:
        'Browse all 114 surahs and read Quran online with bookmarks, verse sharing, and multiple reading modes.',
      keywords: ['Read Quran online', 'surah list', 'Quran reader'],
      contentGroup: 'quran',
      schemaType: 'CollectionPage',
    },
  },
  {
    path: '/quran/:ref(\\d+:\\d+)',
    name: 'QuranVerseShare',
    beforeEnter: (to) => {
      const ref = String(to.params.ref || '')
      const [suraRaw, verseRaw] = ref.split(':')
      const sura = Number.parseInt(suraRaw, 10)
      const verse = Number.parseInt(verseRaw, 10)

      if (!Number.isInteger(sura) || sura < 1 || sura > 114 || !Number.isInteger(verse) || verse < 1) {
        return {
          path: buildRoutePath('/quran', to.params.locale),
          query: { invalidSura: '1' },
          replace: true,
        }
      }

      // Preserve query parameters (autoplay, mode, etc.)
      return {
        path: buildRoutePath(`/quran/${sura}`, to.params.locale),
        hash: `#${sura}_${verse}`,
        query: to.query,
        replace: true,
      }
    },
    component: () => import('@/pages/quran/[id].vue'),
    meta: {
      title: 'Quran',
      titleKey: 'pages.quran.detail',
      description:
        'Open a specific surah with recitation, verse sharing, bookmarks, and reading controls on PEACE2074.',
      keywords: ['Quran surah', 'Quran recitation', 'verse sharing'],
      contentGroup: 'quran',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/quran/:id(\\d+)/:mode(reader|mushaf|native)?',
    name: 'QuranDetail',
    component: () => import('@/pages/quran/[id].vue'),
    beforeEnter: (to) => {
      const id = Number.parseInt(String(to.params.id), 10)
      if (!Number.isInteger(id) || id < 1 || id > 114) {
        return {
          path: buildRoutePath('/quran', to.params.locale),
          query: { invalidSura: '1' },
          replace: true,
        }
      }
      return true
    },
    meta: {
      title: 'Quran',
      titleKey: 'pages.quran.detail',
      description:
        'Read Quran surahs with translation, recitation, bookmarks, and verse sharing on PEACE2074.',
      keywords: ['Quran detail', 'Quran translation', 'Quran bookmarks'],
      contentGroup: 'quran',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat.vue'),
    meta: {
      title: 'Chat',
      titleKey: 'pages.chat.title',
      description:
        'Join the live PEACE2074 community chat for support, reflections, and real-time conversation.',
      keywords: ['Islamic community chat', 'live support chat', 'PEACE2074 chat'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'chat',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/support.vue'),
    meta: {
      title: 'Support',
      titleKey: 'pages.support.title',
      description:
        'Get help with PEACE2074, including Quran reading, Tasbeeh, account support, and spiritual tools.',
      keywords: ['PEACE2074 support', 'Quran app help', 'Islamic support'],
      contentGroup: 'support',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings.vue'),
    meta: {
      title: 'Settings',
      titleKey: 'pages.settings.title',
      description: 'Manage app settings for PEACE2074.',
      keywords: ['app settings'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'settings',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: () => import('@/views/preferences.vue'),
    meta: {
      title: 'Preferences',
      titleKey: 'pages.preferences.title',
      description: 'Manage your personal reading and app defaults on PEACE2074.',
      keywords: ['reading preferences'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'preferences',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/preferences.vue'),
    meta: {
      title: 'Profile',
      titleKey: 'pages.preferences.profile.title',
      requiresAuth: true,
      description: 'Manage your PEACE2074 account profile.',
      keywords: ['account profile'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'profile',
      schemaType: 'ProfilePage',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: {
      title: 'Login',
      titleKey: 'appShell.nav.login',
      description:
        'Sign in to sync bookmarks, progress, and personalized PEACE2074 features.',
      keywords: ['PEACE2074 login'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'auth',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/signup.vue'),
    meta: {
      title: 'Sign Up',
      titleKey: 'auth.signUp',
      description:
        'Create a PEACE2074 account to save progress, bookmarks, and personalized preferences.',
      keywords: ['PEACE2074 signup'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'auth',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/contact.vue'),
    meta: {
      title: 'Contact',
      titleKey: 'contact.help',
      description:
        'Contact PEACE2074 for project questions, support requests, and collaboration inquiries.',
      keywords: ['contact PEACE2074', 'support request'],
      contentGroup: 'contact',
      schemaType: 'ContactPage',
    },
  },
  {
    path: '/deploy',
    redirect: (to) => buildRoutePath('/deploys', to.params.locale),
  },
  {
    path: '/depoy',
    redirect: (to) => buildRoutePath('/deploys', to.params.locale),
  },
  {
    path: '/deploys',
    name: 'Deploys',
    component: () => import('@/pages/deploys.vue'),
    meta: {
      title: 'Deploys',
      titleKey: 'pages.deploys.title',
      description:
        'Track PEACE2074 releases, deployment history, and feature updates over time.',
      keywords: ['release notes', 'deployment history', 'feature updates'],
      contentGroup: 'deploys',
      schemaType: 'CollectionPage',
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin.vue'),
    meta: {
      title: 'Admin Panel',
      description: 'Internal PEACE2074 administration area.',
      keywords: ['admin'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'admin',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('@/views/blog/index.vue'),
    meta: {
      title: 'Blog',
      titleKey: 'pages.blog.title',
      description:
        'Read updates, product notes, and reflections from the PEACE2074 blog.',
      keywords: ['Islamic blog', 'Quran reflections', 'PEACE2074 updates'],
      contentGroup: 'blog',
      schemaType: 'CollectionPage',
    },
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('@/views/blog/[slug].vue'),
    meta: {
      title: 'Blog',
      titleKey: 'pages.blog.title',
      description:
        'Read a PEACE2074 blog post with reflections, updates, and practical guidance.',
      keywords: ['blog post', 'Islamic reflections', 'PEACE2074 article'],
      contentGroup: 'blog',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/blog-editor',
    name: 'BlogEditor',
    component: () => import('@/views/blog/editor.vue'),
    meta: {
      title: 'Blog Editor',
      titleKey: 'pages.blog.editor.title',
      description: 'Create or edit PEACE2074 blog posts.',
      keywords: ['blog editor'],
      robots: 'noindex,nofollow,noarchive',
      contentGroup: 'blog_editor',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/miracles',
    name: 'Miracles',
    component: () => import('@/views/miracles.vue'),
    meta: {
      title: 'Quran Miracles',
      titleKey: 'pages.miracles.pageTitle',
      description:
        'Explore commonly cited numerical patterns and mathematical reflections in the Qur\'an.',
      keywords: ['Quran miracles', 'numerical patterns', 'mathematical reflections'],
      contentGroup: 'miracles',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/privacy.vue'),
    meta: {
      title: 'Privacy',
      titleKey: 'navigation.PrivacyPageTitle',
      description: 'Read the PEACE2074 privacy policy and data handling commitments.',
      keywords: ['privacy policy', 'data privacy'],
      contentGroup: 'legal',
      schemaType: 'WebPage',
    },
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/terms.vue'),
    meta: {
      title: 'Terms',
      titleKey: 'navigation.TermsPageTitle',
      description: 'Review the PEACE2074 terms of service and usage guidelines.',
      keywords: ['terms of service', 'usage guidelines'],
      contentGroup: 'legal',
      schemaType: 'WebPage',
    },
  },
]

export const routes: Array<RouteRecordRaw> = baseRoutes.map(withLocaleAlias)
