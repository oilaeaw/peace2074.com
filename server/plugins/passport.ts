import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'

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
