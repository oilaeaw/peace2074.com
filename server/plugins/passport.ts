import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

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
