import bcrypt from 'bcryptjs'
import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import User from '../models/user'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()

  passport.use(new GitHubStrategy({
    clientID: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackURL: config.githubCallbackUrl, // Use runtime config for callback URL
  }, (accessToken, refreshToken, profile, done) => {
    // Here you would find or create the user in your DB
    // For now, just pass the profile
    return done(null, profile)
  }))

  // Optionally register Google OAuth if credentials are provided
  if (config.googleClientId && config.googleClientSecret && config.googleCallbackUrl) {
    passport.use(new GoogleStrategy({
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl,
    }, (accessToken, refreshToken, profile, done) => {
      // find or create the user in DB; for now pass profile
      return done(null, profile)
    }))
  }

  // Local (username/email + password) strategy
  passport.use(new LocalStrategy({
    usernameField: 'identifier',
    passwordField: 'password',
    session: false,
  }, async (identifier: string, password: string, done) => {
    try {
      const isEmail = typeof identifier === 'string' && identifier.includes('@')
      const query: any = isEmail ? { email: identifier } : { username: identifier }
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

  passport.serializeUser((user, done) => {
    done(null, user)
  })
  passport.deserializeUser((obj, done) => {
    done(null, obj)
  })

  // Add passport to Nitro's event context
  nitroApp.hooks.hook('request', (event) => {
    event.context.passport = passport
  })
})
