import { NuxtAuthHandler } from '#auth'
import GoogleProvider from '@auth/core/providers/google'
import GithubProvider from '@auth/core/providers/github'
import CredentialsProvider from '@auth/core/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import User from '@server/models/user'

const runtimeConfig = useRuntimeConfig()

// The MongoDBAdapter needs a promise that resolves to a MongoClient instance.
const mongoClientPromise = MongoClient.connect(runtimeConfig.mongodbUri)

export default NuxtAuthHandler({
  // A secret string you define to sign tokens.
  // It's recommended to set this to a random string of at least 32 characters.
  // You can generate one with `openssl rand -base64 32`
  secret: runtimeConfig.auth.secret,

  // Use MongoDB adapter to store users, sessions, etc.
  // The promise must resolve to a MongoClient instance.
  // Cast to any to accommodate adapter typings
  adapter: MongoDBAdapter(mongoClientPromise as any) as any,

  // Cast each provider to any to satisfy mismatched typings between @auth/core and next-auth Provider.
  // (Runtime behavior remains correct; this silences TS structural incompatibility about `type`.)
  providers: [
    GoogleProvider({
      clientId: runtimeConfig.auth.google.clientId,
      clientSecret: runtimeConfig.auth.google.clientSecret,
    }) as any,
    GithubProvider({
      clientId: runtimeConfig.auth.github.clientId,
      clientSecret: runtimeConfig.auth.github.clientSecret,
    }) as any,
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.identifier || !credentials.password)
          return null

        const isEmail = credentials.identifier.includes('@')
        const U: any = User as any
        const user = await U.findOne(
          isEmail
            ? { email: credentials.identifier }
            : { username: credentials.identifier },
        ).lean()

        if (!user)
          return null

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch)
          return null

        // Return a user object that will be encoded in the JWT
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
        }
      },
    }) as any,
  ],

  session: {
    // Use JSON Web Tokens for session management
    strategy: 'jwt',
  },

  callbacks: {
    // This callback is called whenever a JWT is created or updated.
    // We want to add the user's role to the token.
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        // The 'sub' property is the standard for the user's ID in JWT.
        token.sub = user.id
        token.first_name = (user as any).first_name
        token.last_name = (user as any).last_name
      }
      return token
    },
    // This callback is called whenever a session is checked.
    // We want to add the role from the token to the session object.
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.sub
        ;(session.user as any).first_name = token.first_name
        ;(session.user as any).last_name = token.last_name
      }
      return session
    },
  },
})