import User from '@server/models/user'
import { ensureDbConnection } from '@server/utils/database'
import bcrypt from 'bcryptjs'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  // Dynamically import passport and strategies so dev doesn't crash when packages are absent
  let passport: any
  let GitHubStrategy: any
  let GoogleStrategy: any
  let LocalStrategy: any
  try {
    const p = await import('passport')
    passport = (p as any).default || p
    const gh = await import('passport-github2')
    GitHubStrategy = (gh as any).Strategy || (gh as any).default?.Strategy
    const goog = await import('passport-google-oauth20')
    GoogleStrategy = (goog as any).Strategy || (goog as any).default?.Strategy
    const loc = await import('passport-local')
    LocalStrategy = (loc as any).Strategy || (loc as any).default?.Strategy
  }
  catch (e) {
    // If passport or strategies are not installed, skip setting up the plugin
    try { console.warn('[auth] passport packages not installed; skipping passport plugin setup.') } catch {}
    return
  }

  passport.use(new GitHubStrategy({
    clientID: (config as any).githubClientId,
    clientSecret: (config as any).githubClientSecret,
    callbackURL: (config as any).githubCallbackUrl,
  },
  (accessToken: any, refreshToken: any, profile: any, done: any) => {
    // Here you would find or create the user in your DB
    // For now, just pass the profile
    return done(null, profile)
  }))

  // Optionally register Google OAuth if credentials are provided
  if ((config as any).googleClientId && (config as any).googleClientSecret && (config as any).googleCallbackUrl) {
    passport.use(new GoogleStrategy({
      clientID: (config as any).googleClientId,
      clientSecret: (config as any).googleClientSecret,
      callbackURL: (config as any).googleCallbackUrl,
    }, (accessToken: any, refreshToken: any, profile: any, done: any) => {
      // find or create the user in DB; for now pass profile
      return done(null, profile)
    }))
  }

  // Local (username/email + password) strategy
  passport.use(new LocalStrategy({
    usernameField: 'identifier',
    passwordField: 'password',
    passReqToCallback: true,
  }, async (req: any, identifier: string, password: string, done: any) => {
    try {
      // Be flexible about incoming credentials: accept `identifier`, `username`, or `email`
      const incoming = identifier || req?.body?.username || req?.body?.email
      if (!incoming || !password)
        return done(null, false, { message: 'Missing credentials' })

  // Ensure database connection (handles bufferCommands=false)
  await ensureDbConnection()

  const isEmail = typeof incoming === 'string' && incoming.includes('@')
      const query: any = isEmail ? { email: incoming } : { username: incoming }
      const user = await User.findOne(query)
      if (!user)
        return done(null, false, { message: 'Invalid credentials' })

      // Only enforce verification in production
      if (!user.verified && config.nodeEnv === 'production')
        return done(null, false, { message: 'Please verify your email before logging in.' })

      const valid = await bcrypt.compare(password, user.password)
      if (!valid)
        return done(null, false, { message: 'Invalid credentials' })

      // Return a normalized, minimal user object
      return done(null, {
        id: user._id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      })
    }
    catch (err) {
      return done(err)
    }
  }))

  passport.serializeUser((user: any, done: any) => {
    done(null, user)
  })
  passport.deserializeUser((obj: any, done: any) => {
    done(null, obj)
  })

  // Add passport to Nitro's event context
  nitroApp.hooks.hook('request', (event) => {
    event.context.passport = passport
  })
})
