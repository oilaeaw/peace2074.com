
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/store/auth.pinia'
import LoginPage from '~/app/pages/auth/login.vue'
import { ref as vueRef } from 'vue'

// Mock Quasar
const mockNotify = vi.fn()
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
  }),
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key, // Simple translation mock
    locale: vueRef('en'),
  }),
}))

// Mock vue-router
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

// Use vi.hoisted to declare mockUseFetch safely for hoisted factory
const mockUseFetch = vi.hoisted(() => vi.fn())
vi.mock('#imports', () => ({
  reactive: (obj: any) => obj,
  ref: (val: any) => vueRef(val),
  watch: vi.fn(),
  definePageMeta: vi.fn(),
  useFetch: mockUseFetch,
  useHead: vi.fn(),
}))

// Helper to find buttons by text content
function findButtonByText(wrapper: any, text: string): DOMWrapper<HTMLButtonElement> | undefined {
  return wrapper.findAll('button').find((btn: DOMWrapper<HTMLButtonElement>) => btn.text() === text)
}

// Quasar component stubs
const quasarStubs = {
  QPage: { template: '<div><slot /></div>' },
  QCard: { template: '<div><slot /></div>' },
  QCardSection: { template: '<div><slot /></div>' },
  QForm: { template: '<form @submit.prevent><slot /></form>' },
  QInput: { template: '<input />', props: ['modelValue', 'type', 'label'] },
  QBtn: { template: '<button><slot /></button>', props: ['label', 'loading', 'disable'] },
  QIcon: { template: '<i></i>', props: ['name'] },
  QBanner: { template: '<div><slot /></div>' },
}

const mountOptions = {
  global: {
    stubs: quasarStubs,
  },
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    global.fetch = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  it('renders login form by default', () => {
    const wrapper = mount(LoginPage, mountOptions)
    expect(wrapper.find('h1').text()).toBe('login')
    expect(wrapper.find('input[label="Email or Username"]').exists()).toBe(true)
    expect(wrapper.find('input[label="password"]').exists()).toBe(true)
  })

  it('switches to signup form and back', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    const createAccountButton = findButtonByText(wrapper, 'create_account')
    await createAccountButton?.trigger('click')
    
    expect(wrapper.find('h1').text()).toBe('sign_up')
    expect(wrapper.find('input[label="username"]').exists()).toBe(true)
    expect(wrapper.find('input[label="email"]').exists()).toBe(true)

    const backToLoginButton = findButtonByText(wrapper, 'back_to_login')
    await backToLoginButton?.trigger('click')
    expect(wrapper.find('h1').text()).toBe('login')
  })

  it('handles successful login', async () => {
    const auth = useAuthStore()
    const setUserInfoSpy = vi.spyOn(auth, 'setUserInfo')

    mockUseFetch.mockResolvedValue({
      data: vueRef({ user: { id: 1, username: 'test' } }),
      error: vueRef(null),
    })

    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[label="Email or Username"]').setValue('testuser')
    await wrapper.find('input[label="password"]').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')

  expect(mockUseFetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object))
    expect(setUserInfoSpy).toHaveBeenCalledWith({ id: 1, username: 'test' })
    expect(mockNotify).toHaveBeenCalledWith({ message: 'login_success', type: 'positive' })
    expect(mockRouterPush).toHaveBeenCalledWith('/')
  })

  it('handles failed login and shows resend verification button', async () => {
    mockUseFetch.mockResolvedValue({
      data: vueRef(null),
      error: vueRef({ statusCode: 403, message: 'Account not verified' }),
    })

    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[label="Email or Username"]').setValue('unverified@example.com')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockNotify).toHaveBeenCalledWith({ message: 'Account not verified', type: 'negative' })
    expect(findButtonByText(wrapper, 'resend_verification_email')?.exists()).toBe(true)
  })

  it('resends verification email successfully', async () => {
    // First, fail login to show the button
    mockUseFetch.mockResolvedValue({
      data: vueRef(null),
      error: vueRef({ statusCode: 403, message: 'Account not verified' }),
    })
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[label="Email or Username"]').setValue('unverified@example.com')
    await wrapper.find('form').trigger('submit.prevent')

    // Now, mock the resend API call
    global.fetch.mockResolvedValue({ ok: true })
    const resendButton = findButtonByText(wrapper, 'resend_verification_email')
    await resendButton?.trigger('click')

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/resend-verification', expect.any(Object))
    expect(mockNotify).toHaveBeenCalledWith({ message: 'verification_email_resent', type: 'positive' })
  })

  it('handles successful signup', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const wrapper = mount(LoginPage, mountOptions)
    await findButtonByText(wrapper, 'create_account')?.trigger('click')

    await wrapper.find('input[label="username"]').setValue('newuser')
    await wrapper.find('input[label="email"]').setValue('new@example.com')
    await wrapper.find('input[label="password"]').setValue('password123')
    await wrapper.find('input[label="confirm_password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', expect.any(Object))
    expect(mockNotify).toHaveBeenCalledWith({ message: 'signup_success', type: 'positive' })
    expect(wrapper.find('h1').text()).toBe('login') // Switches back to login
  })

  it('handles signup with mismatched passwords', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    await findButtonByText(wrapper, 'create_account')?.trigger('click')

    await wrapper.find('input[label="username"]').setValue('newuser')
    await wrapper.find('input[label="email"]').setValue('new@example.com')
    await wrapper.find('input[label="password"]').setValue('password123')
    await wrapper.find('input[label="confirm_password"]').setValue('password456')
    await wrapper.find('form').trigger('submit.prevent')

    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockNotify).toHaveBeenCalledWith({ message: 'passwords_do_not_match', type: 'negative' })
  })

  it('handles social login for Google', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    await findButtonByText(wrapper, 'Login with Google')?.trigger('click')
    expect(window.location.href).toBe('/api/auth/google')
  })

  it('handles social login for GitHub', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    await findButtonByText(wrapper, 'Login with GitHub')?.trigger('click')
    expect(window.location.href).toBe('/api/auth/github')
  })
})
