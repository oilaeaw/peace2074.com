import { NuxtAuthHandler } from '#auth'
import GoogleProvider from '@auth/core/providers/google'
import GithubProvider from '@auth/core/providers/github'
import CredentialsProvider from '@auth/core/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import User from '~/server/models/user.model'

const runtimeConfig = useRuntimeConfig()

export default NuxtAuthHandler({
  // A secret string you define to sign tokens.
  // It's recommended to set this to a random string of at least 32 characters.
  // You can generate one with `openssl rand -base64 32`
  secret: runtimeConfig.auth.secret,

  // Use Mongoose adapter to store users, sessions, etc. in MongoDB
  adapter: MongoDBAdapter(
    MongoClient.connect(process.env.MONGODB_URI as string),
  ),

  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GoogleProvider.default({
      clientId: runtimeConfig.auth.google.clientId,
      clientSecret: runtimeConfig.auth.google.clientSecret,
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.identifier || !credentials.password)
          return null

        const isEmail = credentials.identifier.includes('@')
        const user = await User.findOne(
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
        }
      },
    }),
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
        token.id = user.id
      }
      return token
    },
    // This callback is called whenever a session is checked.
    // We want to add the role from the token to the session object.
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        (session.user as any).id = token.sub
      }
      return session
    },
  },
})