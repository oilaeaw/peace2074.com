import crypto from 'node:crypto'

import { createError, getHeader, type H3Event } from 'h3'
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
  type WebAuthnCredential,
} from '@simplewebauthn/server'

import { createDatabaseRequiredError, isFallbackAuthStorageAllowed } from './database-mode'
import { createProfile, getProfile, updateProfile } from './profile'
import {
  findUserById,
  findUserByUsername,
  getAllUsers,
  type User,
} from './users'

const PASSKEY_RP_NAME = 'Peace2074'
const PASSKEYS_KEY_PREFIX = 'db:passkeys:'
const PASSKEY_CHALLENGE_KEY_PREFIX = 'db:passkey-challenge:'
const PASSKEY_CHALLENGE_TTL_MS = 5 * 60 * 1000

export interface StoredPasskey {
  id: string
  publicKey: string
  counter: number
  transports?: AuthenticatorTransportFuture[]
  deviceType?: 'singleDevice' | 'multiDevice'
  backedUp?: boolean
  createdAt: string
  lastUsedAt?: string
}

interface StoredPasskeyChallenge {
  requestId: string
  type: 'registration' | 'authentication'
  challenge: string
  expectedOrigin: string
  rpID: string
  userId?: string
  username?: string
  createdAt: string
}

interface WebAuthnRequestContext {
  expectedOrigin: string
  rpID: string
}

function getStorage() {
  return useStorage('data')
}

function getPasskeysKey(userId: string) {
  return `${PASSKEYS_KEY_PREFIX}${userId}`
}

function getChallengeKey(requestId: string) {
  return `${PASSKEY_CHALLENGE_KEY_PREFIX}${requestId}`
}

function normalizePasskeys(input: unknown): StoredPasskey[] {
  if (!Array.isArray(input)) return []

  return input
    .map((item) => {
      const value = item as Partial<StoredPasskey>
      if (!value?.id || !value?.publicKey) return null

      return {
        id: String(value.id),
        publicKey: String(value.publicKey),
        counter: Number.isFinite(value.counter) ? Number(value.counter) : 0,
        transports: Array.isArray(value.transports)
          ? (value.transports.filter(Boolean) as AuthenticatorTransportFuture[])
          : undefined,
        deviceType:
          value.deviceType === 'singleDevice' ||
            value.deviceType === 'multiDevice'
            ? value.deviceType
            : undefined,
        backedUp: Boolean(value.backedUp),
        createdAt:
          typeof value.createdAt === 'string'
            ? value.createdAt
            : new Date().toISOString(),
        lastUsedAt:
          typeof value.lastUsedAt === 'string' ? value.lastUsedAt : undefined,
      }
    })
    .filter((item): item is StoredPasskey => Boolean(item))
}

async function readLegacyPasskeysFromStorage(
  userId: string
): Promise<StoredPasskey[]> {
  try {
    const storage = getStorage()
    const stored = await storage.getItem<StoredPasskey[]>(getPasskeysKey(userId))
    return normalizePasskeys(stored)
  } catch {
    return []
  }
}

async function syncPasskeysToProfile(
  userId: string,
  passkeys: StoredPasskey[],
  existingProfile: Awaited<ReturnType<typeof getProfile>>
) {
  const settings = {
    ...(existingProfile?.settings || {}),
    passkeys,
  }

  if (!existingProfile) {
    const created = await createProfile({
      userId,
      settings,
      tasbeeh_summary: { total: 0, sessions: 0 },
    })

    if (!created) {
      throw createDatabaseRequiredError(
        'Profile not found for passkey persistence'
      )
    }

    return created
  }

  const updated = await updateProfile(userId, { settings })
  if (!updated) {
    throw createDatabaseRequiredError(
      'Failed to persist passkeys to the database'
    )
  }

  return updated
}

async function loadFallbackPasskeys(userId: string): Promise<StoredPasskey[]> {
  if (!isFallbackAuthStorageAllowed()) {
    return []
  }

  return readLegacyPasskeysFromStorage(userId)
}

async function saveFallbackPasskeys(userId: string, passkeys: StoredPasskey[]) {
  if (!isFallbackAuthStorageAllowed()) {
    throw createDatabaseRequiredError()
  }

  const storage = getStorage()
  await storage.setItem(getPasskeysKey(userId), normalizePasskeys(passkeys))
}

export async function getUserPasskeys(
  userId: string
): Promise<StoredPasskey[]> {
  const profile = await getProfile(userId)
  const profilePasskeys = normalizePasskeys(profile?.settings?.passkeys)

  if (profilePasskeys.length > 0) {
    if (isFallbackAuthStorageAllowed()) {
      await saveFallbackPasskeys(userId, profilePasskeys)
    }
    return profilePasskeys
  }

  const legacyPasskeys = await readLegacyPasskeysFromStorage(userId)
  if (legacyPasskeys.length > 0) {
    await syncPasskeysToProfile(userId, legacyPasskeys, profile)

    if (isFallbackAuthStorageAllowed()) {
      await saveFallbackPasskeys(userId, legacyPasskeys)
    }

    return legacyPasskeys
  }

  if (!isFallbackAuthStorageAllowed()) {
    return []
  }

  return []
}

export async function saveUserPasskeys(
  userId: string,
  passkeys: StoredPasskey[]
): Promise<void> {
  const normalized = normalizePasskeys(passkeys)

  if (!isFallbackAuthStorageAllowed()) {
    await syncPasskeysToProfile(userId, normalized, await getProfile(userId))
    return
  }

  await saveFallbackPasskeys(userId, normalized)

  const profile = await getProfile(userId)
  if (!profile) return

  const settings = {
    ...(profile.settings || {}),
    passkeys: normalized,
  }

  await updateProfile(userId, { settings })
}

export async function findPasskeyOwnerByCredentialId(
  credentialId: string
): Promise<{
  user: User
  passkey: StoredPasskey
} | null> {
  const users = await getAllUsers()

  for (const user of users) {
    const passkeys = await getUserPasskeys(user.id)
    const passkey = passkeys.find((candidate) => candidate.id === credentialId)
    if (passkey) {
      return { user, passkey }
    }
  }

  return null
}

function parseWebAuthnOrigin(event: H3Event): WebAuthnRequestContext {
  const originHeader = (getHeader(event, 'origin') || '').trim()
  if (!originHeader) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkeys require a browser origin header',
    })
  }

  let origin: URL
  try {
    origin = new URL(originHeader)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid passkey origin',
    })
  }

  if (!['https:', 'http:'].includes(origin.protocol)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkeys require an HTTPS or localhost browser context',
    })
  }

  if (
    origin.protocol !== 'https:' &&
    !['localhost', '127.0.0.1'].includes(origin.hostname)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkeys require HTTPS outside localhost',
    })
  }

  return {
    expectedOrigin: origin.origin,
    rpID: origin.hostname,
  }
}

async function storeChallenge(challenge: StoredPasskeyChallenge) {
  const storage = getStorage()
  await storage.setItem(getChallengeKey(challenge.requestId), challenge)
}

async function takeChallenge(
  requestId: string,
  type: StoredPasskeyChallenge['type']
) {
  const storage = getStorage()
  const key = getChallengeKey(requestId)
  const stored = await storage.getItem<StoredPasskeyChallenge>(key)
  await storage.removeItem(key)

  if (!stored || stored.type !== type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkey request expired or invalid',
    })
  }

  if (
    Date.now() - new Date(stored.createdAt).getTime() >
    PASSKEY_CHALLENGE_TTL_MS
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkey request expired or invalid',
    })
  }

  return stored
}

function toPasskeyCredential(passkey: StoredPasskey): WebAuthnCredential {
  return {
    id: passkey.id,
    publicKey: Buffer.from(passkey.publicKey, 'base64url'),
    counter: passkey.counter,
    transports: passkey.transports,
  }
}

async function getDisplayName(user: User) {
  const profile = await getProfile(user.id)
  const name = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : ''

  return {
    profile,
    displayName: name || user.username,
  }
}

export async function buildAuthenticatedUser(user: User) {
  const { profile, displayName } = await getDisplayName(user)

  return {
    sessionUser: {
      id: user.id,
      role: user.role,
      name: displayName,
    },
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: profile?.first_name || user.username,
      last_name: profile?.last_name || '',
      avatar_url: profile?.avatar_url || null,
      permissions: user.permissions || [],
    },
  }
}

export async function beginPasskeyRegistration(
  event: H3Event,
  userId: string
): Promise<{
  requestId: string
  options: PublicKeyCredentialCreationOptionsJSON
  hasExistingPasskeys: boolean
}> {
  const user = await findUserById(userId)
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const { expectedOrigin, rpID } = parseWebAuthnOrigin(event)
  const existingPasskeys = await getUserPasskeys(user.id)
  const { displayName } = await getDisplayName(user)

  const options = await generateRegistrationOptions({
    rpName: PASSKEY_RP_NAME,
    rpID,
    userName: user.username,
    userID: Buffer.from(user.id, 'utf8'),
    userDisplayName: displayName,
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports,
    })),
    timeout: 60_000,
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
    preferredAuthenticatorType: 'localDevice',
  })

  const requestId = crypto.randomUUID()
  await storeChallenge({
    requestId,
    type: 'registration',
    challenge: options.challenge,
    expectedOrigin,
    rpID,
    userId: user.id,
    createdAt: new Date().toISOString(),
  })

  return {
    requestId,
    options,
    hasExistingPasskeys: existingPasskeys.length > 0,
  }
}

export async function finishPasskeyRegistration(
  userId: string,
  requestId: string,
  registrationResponse: RegistrationResponseJSON
): Promise<StoredPasskey> {
  const challenge = await takeChallenge(requestId, 'registration')

  if (challenge.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Passkey registration does not match the current session',
    })
  }

  const verification = await verifyRegistrationResponse({
    response: registrationResponse,
    expectedChallenge: challenge.challenge,
    expectedOrigin: challenge.expectedOrigin,
    expectedRPID: challenge.rpID,
    requireUserVerification: true,
  })

  if (!verification.verified || !verification.registrationInfo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkey registration could not be verified',
    })
  }

  const registrationInfo = verification.registrationInfo
  const newPasskey: StoredPasskey = {
    id: registrationInfo.credential.id,
    publicKey: Buffer.from(registrationInfo.credential.publicKey).toString(
      'base64url'
    ),
    counter: registrationInfo.credential.counter,
    transports: registrationResponse.response.transports,
    deviceType: registrationInfo.credentialDeviceType,
    backedUp: registrationInfo.credentialBackedUp,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  }

  const passkeys = await getUserPasskeys(userId)
  const deduped = passkeys.filter((passkey) => passkey.id !== newPasskey.id)
  deduped.push(newPasskey)
  await saveUserPasskeys(userId, deduped)

  return newPasskey
}

async function hasAnyRegisteredPasskeys() {
  const users = await getAllUsers()

  for (const user of users) {
    const passkeys = await getUserPasskeys(user.id)
    if (passkeys.length > 0) return true
  }

  return false
}

export async function beginPasskeyAuthentication(
  event: H3Event,
  username?: string
): Promise<{
  requestId: string
  options: PublicKeyCredentialRequestOptionsJSON
}> {
  const { expectedOrigin, rpID } = parseWebAuthnOrigin(event)
  const normalizedUsername = (username || '').trim()

  let userId: string | undefined
  let allowCredentials:
    | { id: string; transports?: AuthenticatorTransportFuture[] }[]
    | undefined

  if (normalizedUsername) {
    const user = await findUserByUsername(normalizedUsername)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No passkeys registered for this account yet',
      })
    }

    const passkeys = await getUserPasskeys(user.id)
    if (!passkeys.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No passkeys registered for this account yet',
      })
    }

    userId = user.id
    allowCredentials = passkeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports,
    }))
  } else if (!(await hasAnyRegisteredPasskeys())) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No passkeys are registered yet',
    })
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    timeout: 60_000,
    userVerification: 'preferred',
  })

  const requestId = crypto.randomUUID()
  await storeChallenge({
    requestId,
    type: 'authentication',
    challenge: options.challenge,
    expectedOrigin,
    rpID,
    userId,
    username: normalizedUsername || undefined,
    createdAt: new Date().toISOString(),
  })

  return {
    requestId,
    options,
  }
}

export async function finishPasskeyAuthentication(
  requestId: string,
  authenticationResponse: AuthenticationResponseJSON
): Promise<User> {
  const challenge = await takeChallenge(requestId, 'authentication')
  const credentialOwner = await findPasskeyOwnerByCredentialId(
    authenticationResponse.id
  )

  if (!credentialOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Passkey not recognized',
    })
  }

  if (challenge.userId && challenge.userId !== credentialOwner.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Passkey does not belong to the requested account',
    })
  }

  const verification = await verifyAuthenticationResponse({
    response: authenticationResponse,
    expectedChallenge: challenge.challenge,
    expectedOrigin: challenge.expectedOrigin,
    expectedRPID: challenge.rpID,
    credential: toPasskeyCredential(credentialOwner.passkey),
    requireUserVerification: true,
  })

  if (!verification.verified) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Passkey authentication failed',
    })
  }

  const passkeys = await getUserPasskeys(credentialOwner.user.id)
  const updated = passkeys.map((passkey) => {
    if (passkey.id !== credentialOwner.passkey.id) return passkey

    return {
      ...passkey,
      counter: verification.authenticationInfo.newCounter,
      deviceType: verification.authenticationInfo.credentialDeviceType,
      backedUp: verification.authenticationInfo.credentialBackedUp,
      lastUsedAt: new Date().toISOString(),
    }
  })

  await saveUserPasskeys(credentialOwner.user.id, updated)

  return credentialOwner.user
}
