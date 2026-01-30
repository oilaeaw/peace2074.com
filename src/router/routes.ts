import Home from "@/views/Home.vue";
import { RouteRecordRaw } from "vue-router";

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

// Routes
export const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTE_PATHS.Home,
    name: ROUTE_NAMES.Home,
    component: Home,
    meta: {
      title: 'Home',
      titleKey: 'pages.home.title',
    },
  },
  {
    path: '/tasbeeh',
    name: 'Tasbeeh',
    component: () => import('@/pages/tasbeeh.vue'),
    meta: {
      title: 'Tasbeeh',
      titleKey: 'pages.tasbeeh',
    },
  },
  {
    path: '/quran',
    name: 'QuranList',
    component: () => import('@/pages/quran/index.vue'),
    meta: {
      title: 'Quran',
      titleKey: 'pages.quran.title',
    },
  },
  {
    path: '/quran/:id',
    name: 'QuranDetail',
    component: () => import('@/pages/quran/[id].vue'),
    meta: {
      title: 'Quran',
      titleKey: 'pages.quran.detail',
    },
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat.vue'),
    meta: {
      title: 'Chat',
      titleKey: 'pages.chat.title',
    },
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/support.vue'),
    meta: {
      title: 'Support',
      titleKey: 'pages.support.title',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings.vue'),
    meta: {
      title: 'Settings',
      titleKey: 'pages.settings.title',
    },
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: () => import('@/views/preferences.vue'),
    meta: {
      title: 'Preferences',
      titleKey: 'pages.preferences.title',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: {
      title: 'Login',
      titleKey: 'navigation.Login',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/contact.vue'),
    meta: {
      title: 'Contact',
      titleKey: 'contact.help',
    },
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('@/views/blog/index.vue'),
    meta: {
      title: 'Blog',
      titleKey: 'pages.blog.title',
    },
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('@/views/blog/[slug].vue'),
    meta: {
      title: 'Blog',
      titleKey: 'pages.blog.title',
    },
  },
];
